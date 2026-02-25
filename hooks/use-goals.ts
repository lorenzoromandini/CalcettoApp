'use client'

/**
 * Goals React Hooks
 * 
 * Provides hooks for managing goals with optimistic updates
 * and toast notifications.
 */

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  addGoal as addGoalAction,
  removeGoal as removeGoalAction,
  getMatchGoals,
} from '@/lib/db/goals'
import type { GoalWithMembers, AddGoalInput } from '@/lib/db/goals'

// Re-export for convenience (backward compatibility)
export type { GoalWithMembers, AddGoalInput }
export type GoalWithPlayers = GoalWithMembers

// ============================================================================
// Italian Messages
// ============================================================================

const MESSAGES = {
  addGoal: {
    loading: 'Aggiunta gol...',
    success: 'Gol aggiunto',
    error: 'Errore durante l\'aggiunta del gol',
  },
  removeGoal: {
    loading: 'Rimozione gol...',
    success: 'Gol rimosso',
    error: 'Errore durante la rimozione del gol',
  },
  fetchGoals: {
    error: 'Errore durante il caricamento dei gol',
  },
}

// ============================================================================
// useGoals Hook
// ============================================================================

interface UseGoalsReturn {
  goals: GoalWithPlayers[]
  isLoading: boolean
  addGoal: (data: AddGoalInput) => Promise<void>
  removeGoal: (goalId: string) => Promise<void>
  refresh: () => Promise<void>
}

export function useGoals(matchId: string): UseGoalsReturn {
  const [goals, setGoals] = useState<GoalWithPlayers[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  /**
   * Fetch goals from server
   */
  const fetchGoals = useCallback(async () => {
    setIsLoading(true)

    try {
      const data = await getMatchGoals(matchId)
      setGoals(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : MESSAGES.fetchGoals.error
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [matchId])

  /**
   * Add goal with optimistic update
   */
  const handleAddGoal = useCallback(async (data: AddGoalInput) => {
    const toastId = toast.loading(MESSAGES.addGoal.loading)

    try {
      const newGoal = await addGoalAction(data)
      setGoals(prev => [...prev, newGoal])
      toast.success(MESSAGES.addGoal.success, { id: toastId })
      router.refresh() // Refresh to update match score
    } catch (error) {
      const message = error instanceof Error ? error.message : MESSAGES.addGoal.error
      toast.error(message, { id: toastId })
      throw error
    }
  }, [router])

  /**
   * Remove goal with optimistic update
   */
  const handleRemoveGoal = useCallback(async (goalId: string) => {
    const toastId = toast.loading(MESSAGES.removeGoal.loading)

    // Optimistic update
    const previousGoals = goals
    setGoals(prev => prev.filter(g => g.id !== goalId))

    try {
      await removeGoalAction(goalId)
      toast.success(MESSAGES.removeGoal.success, { id: toastId })
      router.refresh() // Refresh to update match score
    } catch (error) {
      // Rollback on error
      setGoals(previousGoals)
      const message = error instanceof Error ? error.message : MESSAGES.removeGoal.error
      toast.error(message, { id: toastId })
      throw error
    }
  }, [goals, router])

  // Fetch goals on mount and when matchId changes
  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  return {
    goals,
    isLoading,
    addGoal: handleAddGoal,
    removeGoal: handleRemoveGoal,
    refresh: fetchGoals,
  }
}

// ============================================================================
// useGoalStats Hook - Derived stats from goals
// ============================================================================

interface GoalStats {
  homeScore: number
  awayScore: number
  homeGoals: GoalWithPlayers[]
  awayGoals: GoalWithPlayers[]
}

// Note: In the new schema, Goal doesn't have clubId.
// We determine home/away based on which formation the scorer belongs to.
// For now, this is a simplified version that returns empty arrays.
// TODO: Pass homeMemberIds and awayMemberIds to properly categorize goals
export function useGoalStats(
  _goals: GoalWithPlayers[],
  _clubId: string,
  _homeMemberIds?: string[]
): GoalStats {
  // Simplified - goals are returned without home/away categorization
  // In the new schema, we need formation data to determine which team scored
  return {
    homeScore: 0,
    awayScore: 0,
    homeGoals: [],
    awayGoals: [],
  }
}
