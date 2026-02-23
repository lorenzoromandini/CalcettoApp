'use server'

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Player Participation Server Actions
 * 
 * Manages player participation tracking - marking which players actually
 * played in a match. Only played players can be rated.
 */

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { isTeamAdmin } from '@/lib/db/clubs'
import type { MatchPlayer } from '@/types/database'
import type { RSVPStatus } from './rsvps'

// ============================================================================
// Types
// ============================================================================

/**
 * Match player with player details and team info
 */
export interface MatchPlayerWithPlayer {
  id: string
  match_id: string
  player_id: string
  player_name: string
  player_surname?: string
  player_nickname?: string
  player_avatar?: string
  jersey_number: number
  rsvp_status: RSVPStatus
  rsvp_at: string
  played: boolean
}

/**
 * Bulk update item for participation
 */
export interface ParticipationUpdate {
  playerId: string
  played: boolean
}

// ============================================================================
// Error Messages (Italian)
// ============================================================================

const ERRORS = {
  UNAUTHORIZED: 'Devi essere autenticato per eseguire questa azione',
  NOT_ADMIN: 'Solo gli amministratori possono gestire la partecipazione',
  MATCH_NOT_FOUND: 'Partita non trovata',
  PLAYER_NOT_IN_MATCH: 'Il giocatore non fa parte di questa partita',
}

// ============================================================================
// Helper: Convert Prisma MatchPlayer to app type
// ============================================================================

function toMatchPlayerWithPlayer(dbMatchPlayer: any): MatchPlayerWithPlayer {
  return {
    id: dbMatchPlayer.id,
    match_id: dbMatchPlayer.matchId,
    player_id: dbMatchPlayer.playerId,
    player_name: dbMatchPlayer.player?.name || 'Unknown',
    player_surname: dbMatchPlayer.player?.surname ?? undefined,
    player_nickname: dbMatchPlayer.player?.nickname ?? undefined,
    player_avatar: dbMatchPlayer.player?.avatarUrl ?? undefined,
    jersey_number: dbMatchPlayer.playerClub?.jerseyNumber || 0,
    rsvp_status: dbMatchPlayer.rsvpStatus as RSVPStatus,
    rsvp_at: dbMatchPlayer.rsvpAt?.toISOString() || new Date().toISOString(),
    played: dbMatchPlayer.played ?? false,
  }
}

// ============================================================================
// Update Single Player's Played Status
// ============================================================================

/**
 * Update a single player's played status
 * 
 * @param matchId - Match ID
 * @param playerId - Player ID
 * @param played - Whether the player played
 * @returns Updated MatchPlayer
 */
export async function updatePlayerParticipation(
  matchId: string,
  playerId: string,
  played: boolean
): Promise<MatchPlayer> {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  // Get match with team info
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { club: true },
  })

  if (!match) {
    throw new Error(ERRORS.MATCH_NOT_FOUND)
  }

  // Check if user is team admin
  const isAdmin = await isTeamAdmin(match.clubId, session.user.id)
  if (!isAdmin) {
    throw new Error(ERRORS.NOT_ADMIN)
  }

  // Update the player's played status
  const updatedMatchPlayer = await prisma.matchPlayer.update({
    where: {
      matchId_playerId: {
        matchId,
        playerId,
      },
    },
    data: {
      played,
    },
  })

  console.log('[Participation] Updated participation:', matchId, playerId, played)

  return {
    id: updatedMatchPlayer.id,
    match_id: updatedMatchPlayer.matchId,
    player_id: updatedMatchPlayer.playerId,
    rsvp_status: updatedMatchPlayer.rsvpStatus as RSVPStatus,
    rsvp_at: updatedMatchPlayer.rsvpAt?.toISOString() || new Date().toISOString(),
    position_on_pitch: updatedMatchPlayer.positionOnPitch ?? null,
    played: updatedMatchPlayer.played ?? false,
    sync_status: updatedMatchPlayer.syncStatus ?? 'synced',
  }
}

// ============================================================================
// Get All Match Participants
// ============================================================================

/**
 * Get all match participants with their played status and player details
 * Includes jersey number from player_teams table
 * 
 * @param matchId - Match ID
 * @returns Array of match players with player details
 */
export async function getMatchParticipants(matchId: string): Promise<MatchPlayerWithPlayer[]> {
  // Get match to find team
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { clubId: true },
  })

  if (!match) {
    return []
  }

  // Get all match players with player details and jersey numbers
  const matchPlayers = await prisma.matchPlayer.findMany({
    where: { matchId },
    include: {
      player: true,
    },
  })

  // Get jersey numbers for all players in this team
  const playerIds = matchPlayers.map(mp => mp.playerId)
  const playerClubs = await prisma.playerClub.findMany({
    where: {
      playerId: { in: playerIds },
      clubId: match.clubId,
    },
  })

  // Create a map of playerId -> jerseyNumber
  const jerseyMap = new Map(playerClubs.map(pt => [pt.playerId, pt.jerseyNumber]))

  // Combine data
  const results = matchPlayers.map(mp => {
    const base = toMatchPlayerWithPlayer(mp)
    base.jersey_number = jerseyMap.get(mp.playerId) || 0
    return base
  })

  // Sort by RSVP status (in > maybe > out), then by name
  const statusPriority: Record<string, number> = { in: 0, maybe: 1, out: 2 }
  
  return results.sort((a, b) => {
    const statusDiff = statusPriority[a.rsvp_status] - statusPriority[b.rsvp_status]
    if (statusDiff !== 0) return statusDiff
    return a.player_name.localeCompare(b.player_name)
  })
}

// ============================================================================
// Bulk Update Participation
// ============================================================================

/**
 * Bulk update played status for multiple players
 * Useful for initial setup or batch edits
 * 
 * @param matchId - Match ID
 * @param updates - Array of player/played updates
 */
export async function bulkUpdateParticipation(
  matchId: string,
  updates: ParticipationUpdate[]
): Promise<void> {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  // Get match with team info
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { club: true },
  })

  if (!match) {
    throw new Error(ERRORS.MATCH_NOT_FOUND)
  }

  // Check if user is team admin
  const isAdmin = await isTeamAdmin(match.clubId, session.user.id)
  if (!isAdmin) {
    throw new Error(ERRORS.NOT_ADMIN)
  }

  // Update all players in a transaction
  await prisma.$transaction(
    updates.map(update =>
      prisma.matchPlayer.update({
        where: {
          matchId_playerId: {
            matchId,
            playerId: update.playerId,
          },
        },
        data: {
          played: update.played,
        },
      })
    )
  )

  console.log('[Participation] Bulk updated:', matchId, updates.length, 'players')
}

// ============================================================================
// Initialize Participation for RSVP 'in' Players
// ============================================================================

/**
 * Initialize played=true for all players with rsvp_status='in'
 * Called when match transitions to FINISHED state
 * 
 * @param matchId - Match ID
 */
export async function initializeParticipation(matchId: string): Promise<void> {
  // Set played=true for all players with rsvp_status='in'
  const result = await prisma.matchPlayer.updateMany({
    where: {
      matchId,
      rsvpStatus: 'in',
    },
    data: {
      played: true,
    },
  })

  console.log('[Participation] Initialized participation for match:', matchId, result.count, 'players marked as played')
}

// ============================================================================
// Get Played Players Count
// ============================================================================

/**
 * Get count of players who played vs total RSVP'd
 * 
 * @param matchId - Match ID
 * @returns Object with played count and total count
 */
export async function getParticipationCounts(matchId: string): Promise<{
  played: number
  total: number
  rsvps: { in: number; maybe: number; out: number }
}> {
  const matchPlayers = await prisma.matchPlayer.findMany({
    where: { matchId },
    select: {
      played: true,
      rsvpStatus: true,
    },
  })

  const played = matchPlayers.filter(mp => mp.played).length
  const total = matchPlayers.length
  const rsvps = {
    in: matchPlayers.filter(mp => mp.rsvpStatus === 'in').length,
    maybe: matchPlayers.filter(mp => mp.rsvpStatus === 'maybe').length,
    out: matchPlayers.filter(mp => mp.rsvpStatus === 'out').length,
  }

  return { played, total, rsvps }
}
