'use server'

/**
 * Match Lifecycle Server Actions
 * 
 * Wrapper actions for match lifecycle transitions.
 * These wrap the DB functions to provide proper Server Action interface.
 */

import { getSession } from '@/lib/session'
import { 
  startMatch as dbStartMatch,
  endMatch as dbEndMatch,
  completeMatch as dbCompleteMatch,
  inputFinalResults as dbInputFinalResults
} from '@/lib/db/match-lifecycle'
import { getMatch } from '@/lib/db/matches'
import { revalidatePath } from 'next/cache'

// ============================================================================
// Error Messages (Italian)
// ============================================================================

const ERRORS = {
  UNAUTHORIZED: 'Devi essere autenticato per eseguire questa azione',
  MATCH_NOT_FOUND: 'Partita non trovata',
}

// ============================================================================
// Start Match
// ============================================================================

export async function startMatchAction(matchId: string) {
  const session = await getSession()
  
  if (!session?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  try {
    const match = await dbStartMatch(matchId)
    
    // Revalidate paths
    revalidatePath(`/clubs/${match.clubId}/matches/${matchId}`)
    revalidatePath(`/clubs/${match.clubId}/matches`)
    
    return { success: true, match }
  } catch (error) {
    console.error('[MatchLifecycleAction] Start match error:', error)
    throw error
  }
}

// ============================================================================
// End Match
// ============================================================================

export async function endMatchAction(matchId: string) {
  const session = await getSession()
  
  if (!session?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  try {
    const match = await dbEndMatch(matchId)
    
    // Revalidate paths
    revalidatePath(`/clubs/${match.clubId}/matches/${matchId}`)
    revalidatePath(`/clubs/${match.clubId}/matches`)
    
    return { success: true, match }
  } catch (error) {
    console.error('[MatchLifecycleAction] End match error:', error)
    throw error
  }
}

// ============================================================================
// Complete Match
// ============================================================================

export async function completeMatchAction(matchId: string) {
  const session = await getSession()
  
  if (!session?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  try {
    const match = await dbCompleteMatch(matchId)
    
    // Revalidate paths
    revalidatePath(`/clubs/${match.clubId}/matches/${matchId}`)
    revalidatePath(`/clubs/${match.clubId}/matches`)
    
    return { success: true, match }
  } catch (error) {
    console.error('[MatchLifecycleAction] Complete match error:', error)
    throw error
  }
}

// ============================================================================
// Input Final Results
// ============================================================================

export async function inputFinalResultsAction(
  matchId: string,
  homeScore: number,
  awayScore: number
) {
  const session = await getSession()
  
  if (!session?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  try {
    const match = await dbInputFinalResults(matchId, homeScore, awayScore)
    
    // Revalidate paths
    revalidatePath(`/clubs/${match.clubId}/matches/${matchId}`)
    revalidatePath(`/clubs/${match.clubId}/matches`)
    revalidatePath(`/clubs/${match.clubId}/matches/${matchId}/results`)
    
    return { success: true, match }
  } catch (error) {
    console.error('[MatchLifecycleAction] Input final results error:', error)
    throw error
  }
}
