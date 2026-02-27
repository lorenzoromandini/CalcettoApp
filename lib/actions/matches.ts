'use server'

/**
 * Match Server Actions
 * 
 * Mobile-optimized Server Actions for match operations.
 */

import { auth } from '@/lib/auth'
import { 
  createMatch as dbCreateMatch, 
  updateMatch as dbUpdateMatch, 
  cancelMatch as dbCancelMatch,
  uncancelMatch as dbUncancelMatch,
  getMatch,
  getClubMatches
} from '@/lib/db/matches'
import { isTeamAdmin } from '@/lib/db/clubs'
import type { CreateMatchInput, UpdateMatchInput } from '@/lib/validations/match'
import { revalidatePath } from 'next/cache'

// ============================================================================
// Error Messages (Italian)
// ============================================================================

const ERRORS = {
  UNAUTHORIZED: 'Devi essere autenticato per eseguire questa azione',
  NOT_ADMIN: 'Solo gli amministratori possono eseguire questa azione',
  MATCH_NOT_FOUND: 'Partita non trovata',
}

// ============================================================================
// Create Match
// ============================================================================

export async function createMatchAction(data: CreateMatchInput, clubId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  // Check admin permission
  const isAdmin = await isTeamAdmin(clubId, session.user.id)
  if (!isAdmin) {
    throw new Error(ERRORS.NOT_ADMIN)
  }

  try {
    const matchId = await dbCreateMatch(data, clubId, session.user.id)
    
    // Revalidate
    revalidatePath(`/clubs/${clubId}/matches`)
    revalidatePath(`/clubs/${clubId}`)
    
    return { success: true, id: matchId }
  } catch (error) {
    console.error('[MatchAction] Create error:', error)
    throw new Error('Failed to create match')
  }
}

// ============================================================================
// Update Match
// ============================================================================

export async function updateMatchAction(matchId: string, data: UpdateMatchInput) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  const match = await getMatch(matchId)
  if (!match) {
    throw new Error(ERRORS.MATCH_NOT_FOUND)
  }

  // Check admin permission
  const isAdmin = await isTeamAdmin(match.clubId, session.user.id)
  if (!isAdmin) {
    throw new Error(ERRORS.NOT_ADMIN)
  }

  try {
    await dbUpdateMatch(matchId, data)
    
    // Revalidate
    revalidatePath(`/clubs/${match.clubId}/matches`)
    revalidatePath(`/clubs/${match.clubId}/matches/${matchId}`)
    
    return { success: true }
  } catch (error) {
    console.error('[MatchAction] Update error:', error)
    throw new Error('Failed to update match')
  }
}

// ============================================================================
// Cancel Match
// ============================================================================

export async function cancelMatchAction(matchId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  const match = await getMatch(matchId)
  if (!match) {
    throw new Error(ERRORS.MATCH_NOT_FOUND)
  }

  // Check admin permission
  const isAdmin = await isTeamAdmin(match.clubId, session.user.id)
  if (!isAdmin) {
    throw new Error(ERRORS.NOT_ADMIN)
  }

  try {
    await dbCancelMatch(matchId)
    
    // Revalidate
    revalidatePath(`/clubs/${match.clubId}/matches`)
    revalidatePath(`/clubs/${match.clubId}/matches/${matchId}`)
    
    return { success: true }
  } catch (error) {
    console.error('[MatchAction] Cancel error:', error)
    throw new Error('Failed to cancel match')
  }
}

// ============================================================================
// Uncancel Match
// ============================================================================

export async function uncancelMatchAction(matchId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  const match = await getMatch(matchId)
  if (!match) {
    throw new Error(ERRORS.MATCH_NOT_FOUND)
  }

  // Check admin permission
  const isAdmin = await isTeamAdmin(match.clubId, session.user.id)
  if (!isAdmin) {
    throw new Error(ERRORS.NOT_ADMIN)
  }

  try {
    await dbUncancelMatch(matchId)
    
    // Revalidate
    revalidatePath(`/clubs/${match.clubId}/matches`)
    revalidatePath(`/clubs/${match.clubId}/matches/${matchId}`)
    
    return { success: true }
  } catch (error) {
    console.error('[MatchAction] Uncancel error:', error)
    throw new Error('Failed to uncancel match')
  }
}

// ============================================================================
// Get Club Matches Count
// ============================================================================

export async function getClubMatchesCountAction(clubId: string): Promise<number> {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  try {
    const matches = await getClubMatches(clubId)
    return matches.length
  } catch (error) {
    console.error('[MatchAction] Get matches count error:', error)
    throw new Error('Failed to get matches count')
  }
}
