'use server'

/**
 * Player Evolution Server Actions
 * 
 * Wrapper actions for player evolution data.
 * These wrap the DB functions to provide proper Server Action interface.
 */

import { getSession } from '@/lib/session'
import {
  getMemberEvolution as dbGetMemberEvolution,
  getPlayerEvolution as dbGetPlayerEvolution
} from '@/lib/db/player-evolution'
import type { EvolutionDataPoint } from '@/lib/db/player-evolution'

// ============================================================================
// Error Messages (Italian)
// ============================================================================

const ERRORS = {
  UNAUTHORIZED: 'Devi essere autenticato per eseguire questa azione',
}

// ============================================================================
// Get Member Evolution
// ============================================================================

export async function getMemberEvolutionAction(
  clubMemberId: string,
  clubId: string,
  limit: number = 10
): Promise<EvolutionDataPoint[]> {
  const session = await getSession()
  
  if (!session?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  try {
    const evolution = await dbGetMemberEvolution(clubMemberId, clubId, limit)
    return evolution
  } catch (error) {
    console.error('[PlayerEvolutionAction] Get member evolution error:', error)
    throw new Error('Failed to get member evolution')
  }
}

// ============================================================================
// Get Player Evolution (alias)
// ============================================================================

export async function getPlayerEvolutionAction(
  clubMemberId: string,
  clubId: string,
  limit: number = 10
): Promise<EvolutionDataPoint[]> {
  const session = await getSession()
  
  if (!session?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  try {
    const evolution = await dbGetPlayerEvolution(clubMemberId, clubId, limit)
    return evolution
  } catch (error) {
    console.error('[PlayerEvolutionAction] Get player evolution error:', error)
    throw new Error('Failed to get player evolution')
  }
}
