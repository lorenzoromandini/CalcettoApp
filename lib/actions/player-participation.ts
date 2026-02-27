'use server'

/**
 * Player Participation Server Actions
 * 
 * Wrapper actions for player participation tracking.
 * These wrap the DB functions to provide proper Server Action interface.
 */

import { getSession } from '@/lib/session'
import {
  getMatchParticipants as dbGetMatchParticipants,
  updatePlayerParticipation as dbUpdatePlayerParticipation,
  bulkUpdateParticipation as dbBulkUpdateParticipation,
  getParticipationCounts as dbGetParticipationCounts
} from '@/lib/db/player-participation'
import { getMatch } from '@/lib/db/matches'
import type { ParticipationUpdate, MatchPlayerWithPlayer } from '@/lib/db/player-participation'
import { revalidatePath } from 'next/cache'

// ============================================================================
// Error Messages (Italian)
// ============================================================================

const ERRORS = {
  UNAUTHORIZED: 'Devi essere autenticato per eseguire questa azione',
  NOT_ADMIN: 'Solo gli amministratori possono gestire la partecipazione',
  MATCH_NOT_FOUND: 'Partita non trovata',
}

// ============================================================================
// Get Match Participants
// ============================================================================

export async function getMatchParticipantsAction(matchId: string): Promise<MatchPlayerWithPlayer[]> {
  const session = await getSession()
  
  if (!session?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  try {
    const participants = await dbGetMatchParticipants(matchId)
    return participants
  } catch (error) {
    console.error('[PlayerParticipationAction] Get match participants error:', error)
    throw new Error('Failed to get match participants')
  }
}

// ============================================================================
// Update Player Participation
// ============================================================================

export async function updatePlayerParticipationAction(
  matchId: string,
  playerId: string,
  played: boolean
) {
  const session = await getSession()
  
  if (!session?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  // Get match to verify admin status
  const match = await getMatch(matchId)
  if (!match) {
    throw new Error(ERRORS.MATCH_NOT_FOUND)
  }

  // Check admin permission
  const { isTeamAdmin } = await import('@/lib/db/clubs')
  const isAdmin = await isTeamAdmin(match.clubId, session.id)
  if (!isAdmin) {
    throw new Error(ERRORS.NOT_ADMIN)
  }

  try {
    await dbUpdatePlayerParticipation(matchId, playerId, played)
    
    // Revalidate paths
    revalidatePath(`/clubs/${match.clubId}/matches/${matchId}`)
    revalidatePath(`/clubs/${match.clubId}/matches/${matchId}/ratings`)
    
    return { success: true }
  } catch (error) {
    console.error('[PlayerParticipationAction] Update participation error:', error)
    throw new Error('Failed to update player participation')
  }
}

// ============================================================================
// Bulk Update Participation
// ============================================================================

export async function bulkUpdateParticipationAction(
  matchId: string,
  updates: ParticipationUpdate[]
) {
  const session = await getSession()
  
  if (!session?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  // Get match to verify admin status
  const match = await getMatch(matchId)
  if (!match) {
    throw new Error(ERRORS.MATCH_NOT_FOUND)
  }

  // Check admin permission
  const { isTeamAdmin } = await import('@/lib/db/clubs')
  const isAdmin = await isTeamAdmin(match.clubId, session.id)
  if (!isAdmin) {
    throw new Error(ERRORS.NOT_ADMIN)
  }

  try {
    await dbBulkUpdateParticipation(matchId, updates)
    
    // Revalidate paths
    revalidatePath(`/clubs/${match.clubId}/matches/${matchId}`)
    revalidatePath(`/clubs/${match.clubId}/matches/${matchId}/ratings`)
    
    return { success: true }
  } catch (error) {
    console.error('[PlayerParticipationAction] Bulk update participation error:', error)
    throw new Error('Failed to bulk update participation')
  }
}

// ============================================================================
// Get Participation Counts
// ============================================================================

export async function getParticipationCountsAction(matchId: string): Promise<{
  played: number
  total: number
  rsvps: { in: number; maybe: number; out: number }
}> {
  const session = await getSession()
  
  if (!session?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  try {
    const counts = await dbGetParticipationCounts(matchId)
    return counts
  } catch (error) {
    console.error('[PlayerParticipationAction] Get participation counts error:', error)
    throw new Error('Failed to get participation counts')
  }
}
