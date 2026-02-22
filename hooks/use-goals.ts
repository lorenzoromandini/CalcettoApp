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
import type { GoalWithPlayers, AddGoalInput } from '@/lib/db/goals'

// Re-export for convenience
export type { GoalWithPlayers, AddGoalInput }

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

export function useGoalStats(
  goals: GoalWithPlayers[], 
  clubId: string
): GoalStats {
  const homeGoals = goals.filter(g => 
    g.clubId === clubId && !g.isOwnGoal
  )
  const awayGoals = goals.filter(g => 
    g.clubId !== clubId && !g.isOwnGoal
  )

  // Own goals count for the other team
  const ownGoalsForAway = goals.filter(g => 
    g.clubId === clubId && g.isOwnGoal
  )
  const ownGoalsForHome = goals.filter(g => 
    g.clubId !== clubId && g.isOwnGoal
  )

  return {
    homeScore: homeGoals.length + ownGoalsForHome.length,
    awayScore: awayGoals.length + ownGoalsForAway.length,
    homeGoals,
    awayGoals,
  }
}
