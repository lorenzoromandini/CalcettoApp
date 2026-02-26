'use server'

/**
 * Goal Server Actions
 * 
 * Mobile-optimized Server Actions for goal operations.
 */

import { auth } from '@/lib/auth'
import { addGoal as dbAddGoal, removeGoal as dbRemoveGoal } from '@/lib/db/goals'
import { getMatch } from '@/lib/db/matches'
import type { AddGoalInput } from '@/lib/db/goals'
import { revalidatePath } from 'next/cache'

// ============================================================================
// Error Messages (Italian)
// ============================================================================

const ERRORS = {
  UNAUTHORIZED: 'Devi essere autenticato per eseguire questa azione',
}

// ============================================================================
// Add Goal
// ============================================================================

export async function addGoalAction(data: AddGoalInput) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  try {
    const goal = await dbAddGoal(data)
    
    const match = await getMatch(data.matchId)
    if (match) {
      revalidatePath(`/clubs/${match.clubId}/matches/${data.matchId}`)
      revalidatePath(`/clubs/${match.clubId}/matches/${data.matchId}/results`)
    }
    
    return { success: true, goal }
  } catch (error) {
    console.error('[GoalAction] Add error:', error)
    throw error
  }
}

// ============================================================================
// Remove Goal
// ============================================================================

export async function removeGoalAction(goalId: string, matchId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  try {
    await dbRemoveGoal(goalId)
    
    const match = await getMatch(matchId)
    if (match) {
      revalidatePath(`/clubs/${match.clubId}/matches/${matchId}`)
      revalidatePath(`/clubs/${match.clubId}/matches/${matchId}/results`)
    }
    
    return { success: true }
  } catch (error) {
    console.error('[GoalAction] Remove error:', error)
    throw error
  }
}
