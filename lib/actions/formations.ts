'use server'

/**
 * Formation Server Actions
 * 
 * Mobile-optimized Server Actions for formation operations.
 */

import { auth } from '@/lib/auth'
import { saveFormation as dbSaveFormation, deleteFormation as dbDeleteFormation, getMatchParticipants as dbGetMatchParticipants } from '@/lib/db/formations'
import { getMatch } from '@/lib/db/matches'
import type { FormationData } from '@/lib/db/formations'
import { revalidatePath } from 'next/cache'

// ============================================================================
// Error Messages (Italian)
// ============================================================================

const ERRORS = {
  UNAUTHORIZED: 'Devi essere autenticato per eseguire questa azione',
  NOT_ADMIN: 'Solo gli amministratori possono gestire le formazioni',
  MATCH_NOT_FOUND: 'Partita non trovata',
}

// ============================================================================
// Save Formation
// ============================================================================

export async function saveFormationAction(matchId: string, data: FormationData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  const match = await getMatch(matchId)
  if (!match) {
    throw new Error(ERRORS.MATCH_NOT_FOUND)
  }

  try {
    await dbSaveFormation(matchId, data)
    
    revalidatePath(`/clubs/${match.clubId}/matches/${matchId}/formation`)
    revalidatePath(`/clubs/${match.clubId}/matches/${matchId}`)
    
    return { success: true }
  } catch (error) {
    console.error('[FormationAction] Save error:', error)
    throw new Error('Failed to save formation')
  }
}

// ============================================================================
// Delete Formation
// ============================================================================

export async function deleteFormationAction(matchId: string, isHome: boolean) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  const match = await getMatch(matchId)
  if (!match) {
    throw new Error(ERRORS.MATCH_NOT_FOUND)
  }

  try {
    await dbDeleteFormation(matchId, isHome)
    
    revalidatePath(`/clubs/${match.clubId}/matches/${matchId}/formation`)
    revalidatePath(`/clubs/${match.clubId}/matches/${matchId}`)
    
    return { success: true }
  } catch (error) {
    console.error('[FormationAction] Delete error:', error)
    throw new Error('Failed to delete formation')
  }
}
