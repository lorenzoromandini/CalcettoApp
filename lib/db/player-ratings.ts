'use server'

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Player Ratings Server Actions
 * 
 * Manages player ratings with nuanced 38-value scale.
 * Only players who played (played=true) can be rated.
 * Ratings are only editable when match status is FINISHED.
 */

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { isTeamAdmin } from '@/lib/db/teams'
import { ratingToDecimal, decimalToRating, isValidRating } from '@/lib/rating-utils'
import { MatchStatus } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

// ============================================================================
// Types
// ============================================================================

/**
 * Player rating from database
 */
export interface PlayerRating {
  id: string
  match_id: string
  player_id: string
  rating: string  // Formatted string (e.g., "6.5")
  rating_decimal: number  // Decimal value for calculations
  comment?: string
  created_at: string
  updated_at: string
}

/**
 * Player rating with player details
 */
export interface PlayerRatingWithPlayer extends PlayerRating {
  player_name: string
  player_surname?: string
  player_nickname?: string
  player_avatar?: string
  jersey_number: number
}

/**
 * Data for creating/updating a rating
 */
export interface RatingInput {
  matchId: string
  playerId: string
  rating: string  // String format (e.g., "6", "6-", "6+", "6.5")
  comment?: string
}

// ============================================================================
// Error Messages (Italian)
// ============================================================================

const ERRORS = {
  UNAUTHORIZED: 'Devi essere autenticato per eseguire questa azione',
  NOT_ADMIN: 'Solo gli amministratori possono assegnare voti',
  MATCH_NOT_FOUND: 'Partita non trovata',
  PLAYER_NOT_IN_MATCH: 'Il giocatore non fa parte di questa partita',
  PLAYER_NOT_PLAYED: 'Il giocatore non ha giocato in questa partita',
  MATCH_NOT_FINISHED: 'I voti possono essere assegnati solo a partite terminate',
  MATCH_COMPLETED: 'I voti non possono essere modificati per partite completate',
  INVALID_RATING: 'Voto non valido. Usa uno dei 38 valori consentiti.',
  COMMENT_TOO_LONG: 'Il commento non può superare i 500 caratteri',
}

// ============================================================================
// Helper: Convert Prisma PlayerRating to app type
// ============================================================================

function toPlayerRating(dbRating: any): PlayerRating {
  const ratingDecimal = dbRating.rating.toNumber()
  return {
    id: dbRating.id,
    match_id: dbRating.matchId,
    player_id: dbRating.playerId,
    rating: decimalToRating(ratingDecimal),
    rating_decimal: ratingDecimal,
    comment: dbRating.comment ?? undefined,
    created_at: dbRating.createdAt.toISOString(),
    updated_at: dbRating.updatedAt.toISOString(),
  }
}

function toPlayerRatingWithPlayer(dbRating: any): PlayerRatingWithPlayer {
  const base = toPlayerRating(dbRating)
  return {
    ...base,
    player_name: dbRating.player?.name || 'Unknown',
    player_surname: dbRating.player?.surname ?? undefined,
    player_nickname: dbRating.player?.nickname ?? undefined,
    player_avatar: dbRating.player?.avatarUrl ?? undefined,
    jersey_number: dbRating.jerseyNumber || 0,
  }
}

// ============================================================================
// Create or Update Rating (Upsert)
// ============================================================================

/**
 * Create or update a player's rating for a match
 * 
 * Requirements:
 * - User must be team admin
 * - Match status must be FINISHED (not COMPLETED)
 * - Player must have played=true in this match
 * - Rating must be one of 38 valid values
 * 
 * @param data - Rating input data
 * @returns Created/updated PlayerRating
 */
export async function upsertPlayerRating(data: RatingInput): Promise<PlayerRating> {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  // Validate rating format
  if (!isValidRating(data.rating)) {
    throw new Error(ERRORS.INVALID_RATING)
  }

  // Validate comment length
  if (data.comment && data.comment.length > 500) {
    throw new Error(ERRORS.COMMENT_TOO_LONG)
  }

  // Get match with team info
  const match = await prisma.match.findUnique({
    where: { id: data.matchId },
    include: { team: true },
  })

  if (!match) {
    throw new Error(ERRORS.MATCH_NOT_FOUND)
  }

  // Check if user is team admin
  const isAdmin = await isTeamAdmin(match.teamId, session.user.id)
  if (!isAdmin) {
    throw new Error(ERRORS.NOT_ADMIN)
  }

  // Check match status - must be FINISHED (not COMPLETED)
  if (match.status !== MatchStatus.FINISHED) {
    if (match.status === MatchStatus.COMPLETED) {
      throw new Error(ERRORS.MATCH_COMPLETED)
    }
    throw new Error(ERRORS.MATCH_NOT_FINISHED)
  }

  // Check if player is in the match and has played
  const matchPlayer = await prisma.matchPlayer.findUnique({
    where: {
      matchId_playerId: {
        matchId: data.matchId,
        playerId: data.playerId,
      },
    },
  })

  if (!matchPlayer) {
    throw new Error(ERRORS.PLAYER_NOT_IN_MATCH)
  }

  if (!matchPlayer.played) {
    throw new Error(ERRORS.PLAYER_NOT_PLAYED)
  }

  // Convert rating string to decimal
  const ratingDecimal = ratingToDecimal(data.rating)

  // Upsert the rating
  const upsertedRating = await prisma.playerRating.upsert({
    where: {
      matchId_playerId: {
        matchId: data.matchId,
        playerId: data.playerId,
      },
    },
    create: {
      matchId: data.matchId,
      playerId: data.playerId,
      rating: new Decimal(ratingDecimal),
      comment: data.comment,
    },
    update: {
      rating: new Decimal(ratingDecimal),
      comment: data.comment,
    },
    include: {
      player: true,
    },
  })

  console.log('[Ratings] Upserted rating:', data.matchId, data.playerId, data.rating, '→', ratingDecimal)

  return toPlayerRating(upsertedRating)
}

// ============================================================================
// Get Match Ratings
// ============================================================================

/**
 * Get all ratings for a match with player details
 * Includes jersey number from player_teams table
 * 
 * @param matchId - Match ID
 * @returns Array of ratings with player details
 */
export async function getMatchRatings(matchId: string): Promise<PlayerRatingWithPlayer[]> {
  // Get match to find team
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { teamId: true },
  })

  if (!match) {
    return []
  }

  // Get all ratings with player details
  const ratings = await prisma.playerRating.findMany({
    where: { matchId },
    include: {
      player: true,
    },
  })

  // Get jersey numbers for all players
  const playerIds = ratings.map(r => r.playerId)
  const playerTeams = await prisma.playerTeam.findMany({
    where: {
      playerId: { in: playerIds },
      teamId: match.teamId,
    },
  })

  // Create a map of playerId -> jerseyNumber
  const jerseyMap = new Map(playerTeams.map(pt => [pt.playerId, pt.jerseyNumber]))

  // Convert to app types
  const results = ratings.map(r => {
    const base = toPlayerRatingWithPlayer(r)
    base.jersey_number = jerseyMap.get(r.playerId) || 0
    return base
  })

  // Sort by rating descending (best first)
  return results.sort((a, b) => b.rating_decimal - a.rating_decimal)
}

// ============================================================================
// Get Single Player Match Rating
// ============================================================================

/**
 * Get rating for a specific player in a match
 * 
 * @param matchId - Match ID
 * @param playerId - Player ID
 * @returns PlayerRating or null if not rated
 */
export async function getPlayerMatchRating(
  matchId: string,
  playerId: string
): Promise<PlayerRating | null> {
  const rating = await prisma.playerRating.findUnique({
    where: {
      matchId_playerId: {
        matchId,
        playerId,
      },
    },
  })

  if (!rating) {
    return null
  }

  return toPlayerRating(rating)
}

// ============================================================================
// Get Player Average Rating
// ============================================================================

/**
 * Calculate player's average rating across all completed matches
 * 
 * @param playerId - Player ID
 * @returns Average rating as decimal, or null if no ratings
 */
export async function getPlayerAverageRating(playerId: string): Promise<number | null> {
  // Get all ratings for this player in completed matches
  const ratings = await prisma.playerRating.findMany({
    where: {
      playerId,
      match: {
        status: MatchStatus.COMPLETED,
      },
    },
    select: {
      rating: true,
    },
  })

  if (ratings.length === 0) {
    return null
  }

  // Calculate average
  const sum = ratings.reduce((acc, r) => acc + r.rating.toNumber(), 0)
  const average = sum / ratings.length

  return Math.round(average * 100) / 100  // Round to 2 decimal places
}

// ============================================================================
// Delete Rating
// ============================================================================

/**
 * Delete a player's rating for a match
 * Only allowed when match status is FINISHED
 * 
 * @param matchId - Match ID
 * @param playerId - Player ID
 */
export async function deletePlayerRating(
  matchId: string,
  playerId: string
): Promise<void> {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  // Get match with team info
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { team: true },
  })

  if (!match) {
    throw new Error(ERRORS.MATCH_NOT_FOUND)
  }

  // Check if user is team admin
  const isAdmin = await isTeamAdmin(match.teamId, session.user.id)
  if (!isAdmin) {
    throw new Error(ERRORS.NOT_ADMIN)
  }

  // Check match status
  if (match.status !== MatchStatus.FINISHED) {
    if (match.status === MatchStatus.COMPLETED) {
      throw new Error(ERRORS.MATCH_COMPLETED)
    }
    throw new Error(ERRORS.MATCH_NOT_FINISHED)
  }

  // Delete the rating
  await prisma.playerRating.delete({
    where: {
      matchId_playerId: {
        matchId,
        playerId,
      },
    },
  })

  console.log('[Ratings] Deleted rating:', matchId, playerId)
}

// ============================================================================
// Get Ratings Count
// ============================================================================

/**
 * Get count of ratings vs played players for a match
 * 
 * @param matchId - Match ID
 * @returns Object with rated count and played count
 */
export async function getRatingsCount(matchId: string): Promise<{
  rated: number
  played: number
}> {
  // Count played players
  const playedPlayers = await prisma.matchPlayer.count({
    where: {
      matchId,
      played: true,
    },
  })

  // Count ratings
  const ratings = await prisma.playerRating.count({
    where: {
      matchId,
    },
  })

  return {
    rated: ratings,
    played: playedPlayers,
  }
}

// ============================================================================
// Bulk Upsert Ratings
// ============================================================================

/**
 * Bulk create/update ratings for multiple players
 * Useful for saving all ratings at once
 * 
 * @param ratings - Array of rating inputs
 * @returns Array of created/updated ratings
 */
export async function bulkUpsertRatings(
  ratings: RatingInput[]
): Promise<PlayerRating[]> {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  if (ratings.length === 0) {
    return []
  }

  // Validate all ratings first
  for (const data of ratings) {
    if (!isValidRating(data.rating)) {
      throw new Error(`${ERRORS.INVALID_RATING}: ${data.rating}`)
    }
    if (data.comment && data.comment.length > 500) {
      throw new Error(ERRORS.COMMENT_TOO_LONG)
    }
  }

  // Get match (all ratings should be for same match)
  const matchId = ratings[0].matchId
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { team: true },
  })

  if (!match) {
    throw new Error(ERRORS.MATCH_NOT_FOUND)
  }

  // Check if user is team admin
  const isAdmin = await isTeamAdmin(match.teamId, session.user.id)
  if (!isAdmin) {
    throw new Error(ERRORS.NOT_ADMIN)
  }

  // Check match status
  if (match.status !== MatchStatus.FINISHED) {
    if (match.status === MatchStatus.COMPLETED) {
      throw new Error(ERRORS.MATCH_COMPLETED)
    }
    throw new Error(ERRORS.MATCH_NOT_FINISHED)
  }

  // Verify all players have played
  const playerIds = ratings.map(r => r.playerId)
  const matchPlayers = await prisma.matchPlayer.findMany({
    where: {
      matchId,
      playerId: { in: playerIds },
    },
  })

  const playerMap = new Map(matchPlayers.map(mp => [mp.playerId, mp]))
  for (const data of ratings) {
    const mp = playerMap.get(data.playerId)
    if (!mp) {
      throw new Error(ERRORS.PLAYER_NOT_IN_MATCH)
    }
    if (!mp.played) {
      throw new Error(ERRORS.PLAYER_NOT_PLAYED)
    }
  }

  // Bulk upsert in transaction
  const results = await prisma.$transaction(
    ratings.map(data =>
      prisma.playerRating.upsert({
        where: {
          matchId_playerId: {
            matchId: data.matchId,
            playerId: data.playerId,
          },
        },
        create: {
          matchId: data.matchId,
          playerId: data.playerId,
          rating: new Decimal(ratingToDecimal(data.rating)),
          comment: data.comment,
        },
        update: {
          rating: new Decimal(ratingToDecimal(data.rating)),
          comment: data.comment,
        },
      })
    )
  )

  console.log('[Ratings] Bulk upserted:', matchId, results.length, 'ratings')

  return results.map(toPlayerRating)
}

// ============================================================================
// Rating History
// ============================================================================

/**
 * Rating history entry for chart visualization
 */
export interface RatingHistoryEntry {
  match_id: string
  match_date: Date
  rating: number
  rating_display: string
  comment?: string
}

/**
 * Get player's rating history ordered chronologically by match date
 * 
 * Fetches all ratings for a player from COMPLETED matches.
 * Used for rating trend visualization on player profile.
 * 
 * @param playerId - Player ID
 * @param teamId - Optional team ID to filter history
 * @returns Array of rating history entries ordered by match date
 */
export async function getPlayerRatingHistory(
  playerId: string,
  teamId?: string
): Promise<RatingHistoryEntry[]> {
  const ratings = await prisma.playerRating.findMany({
    where: {
      playerId,
      match: {
        status: MatchStatus.COMPLETED,
        ...(teamId ? { teamId } : {}),
      },
    },
    include: {
      match: {
        select: {
          id: true,
          scheduledAt: true,
        },
      },
    },
    orderBy: {
      match: {
        scheduledAt: 'asc',
      },
    },
  })

  return ratings.map(r => ({
    match_id: r.matchId,
    match_date: r.match.scheduledAt,
    rating: r.rating.toNumber(),
    rating_display: decimalToRating(r.rating.toNumber()),
    comment: r.comment ?? undefined,
  }))
}

// ============================================================================
// Dashboard Player Data
// ============================================================================

export type FrameBorderColor = 'gray' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'fire-red'

export interface DashboardPlayerData {
  player: {
    id: string
    name: string
    surname: string | null
    nickname: string | null
    avatar_url: string | null
  }
  teamId: string | null
  teamName: string | null
  jerseyNumber: number | null
  lastThreeGamesAvgRating: number | null
  hasMvpInLastThree: boolean
  frameColor: FrameBorderColor
}

export async function getPlayerDashboardData(
  userId: string,
  teamId?: string
): Promise<DashboardPlayerData | null> {
  const player = await prisma.player.findFirst({
    where: { userId },
    include: {
      playerTeams: {
        include: {
          team: true,
        },
        ...(teamId ? { where: { teamId } } : {}),
      },
    },
  })

  if (!player) return null

  const playerTeam = teamId
    ? player.playerTeams.find(pt => pt.teamId === teamId)
    : player.playerTeams[0]

  if (!playerTeam) {
    return {
      player: {
        id: player.id,
        name: player.name,
        surname: player.surname,
        nickname: player.nickname,
        avatar_url: player.avatarUrl,
      },
      teamId: null,
      teamName: null,
      jerseyNumber: null,
      lastThreeGamesAvgRating: null,
      hasMvpInLastThree: false,
      frameColor: 'gray',
    }
  }

  const lastThreeRatings = await prisma.playerRating.findMany({
    where: {
      playerId: player.id,
      match: {
        teamId: playerTeam.teamId,
        status: MatchStatus.COMPLETED,
      },
    },
    include: {
      match: {
        select: {
          id: true,
          scheduledAt: true,
        },
      },
    },
    orderBy: {
      match: {
        scheduledAt: 'desc',
      },
    },
    take: 3,
  })

  let lastThreeGamesAvgRating: number | null = null
  let hasMvpInLastThree = false

  if (lastThreeRatings.length > 0) {
    const sum = lastThreeRatings.reduce((acc, r) => acc + r.rating.toNumber(), 0)
    lastThreeGamesAvgRating = Math.round((sum / lastThreeRatings.length) * 100) / 100

    for (const rating of lastThreeRatings) {
      const allMatchRatings = await prisma.playerRating.findMany({
        where: { matchId: rating.matchId },
        select: { playerId: true, rating: true },
      })

      if (allMatchRatings.length > 0) {
        const maxRating = Math.max(...allMatchRatings.map(r => r.rating.toNumber()))
        const topPlayers = allMatchRatings.filter(r => r.rating.toNumber() === maxRating)
        if (topPlayers.some(p => p.playerId === player.id)) {
          hasMvpInLastThree = true
          break
        }
      }
    }
  }

  const frameColor = calculateFrameColor(lastThreeGamesAvgRating, hasMvpInLastThree)

  return {
    player: {
      id: player.id,
      name: player.name,
      surname: player.surname,
      nickname: player.nickname,
      avatar_url: player.avatarUrl,
    },
    teamId: playerTeam.teamId,
    teamName: playerTeam.team.name,
    jerseyNumber: playerTeam.jerseyNumber,
    lastThreeGamesAvgRating,
    hasMvpInLastThree,
    frameColor,
  }
}

export function calculateFrameColor(
  avgRating: number | null,
  hasMvp: boolean
): FrameBorderColor {
  if (hasMvp) return 'fire-red'
  if (avgRating === null) return 'gray'
  if (avgRating < 6) return 'bronze'
  if (avgRating < 7) return 'silver'
  if (avgRating < 8) return 'gold'
  return 'platinum'
}

export async function getTeamPlayersDashboardData(teamId: string): Promise<DashboardPlayerData[]> {
  const playerTeams = await prisma.playerTeam.findMany({
    where: { teamId },
    include: {
      player: true,
      team: true,
    },
    orderBy: {
      jerseyNumber: 'asc',
    },
  })

  const results: DashboardPlayerData[] = []

  for (const pt of playerTeams) {
    const lastThreeRatings = await prisma.playerRating.findMany({
      where: {
        playerId: pt.playerId,
        match: {
          teamId,
          status: MatchStatus.COMPLETED,
        },
      },
      orderBy: {
        match: {
          scheduledAt: 'desc',
        },
      },
      take: 3,
    })

    let lastThreeGamesAvgRating: number | null = null
    let hasMvpInLastThree = false

    if (lastThreeRatings.length > 0) {
      const sum = lastThreeRatings.reduce((acc, r) => acc + r.rating.toNumber(), 0)
      lastThreeGamesAvgRating = Math.round((sum / lastThreeRatings.length) * 100) / 100

      for (const rating of lastThreeRatings) {
        const allMatchRatings = await prisma.playerRating.findMany({
          where: { matchId: rating.matchId },
          select: { playerId: true, rating: true },
        })

        if (allMatchRatings.length > 0) {
          const maxRating = Math.max(...allMatchRatings.map(r => r.rating.toNumber()))
          const topPlayers = allMatchRatings.filter(r => r.rating.toNumber() === maxRating)
          if (topPlayers.some(p => p.playerId === pt.playerId)) {
            hasMvpInLastThree = true
            break
          }
        }
      }
    }

    const frameColor = calculateFrameColor(lastThreeGamesAvgRating, hasMvpInLastThree)

    results.push({
      player: {
        id: pt.player.id,
        name: pt.player.name,
        surname: pt.player.surname,
        nickname: pt.player.nickname,
        avatar_url: pt.player.avatarUrl,
      },
      teamId,
      teamName: pt.team.name,
      jerseyNumber: pt.jerseyNumber,
      lastThreeGamesAvgRating,
      hasMvpInLastThree,
      frameColor,
    })
  }

  return results
}
