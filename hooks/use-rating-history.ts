'use client'

/**
 * Rating History React Hook
 *
 * Provides data fetching for player rating history.
 * Used for rating trend visualization on player profile.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  getPlayerRatingHistory,
  type RatingHistoryEntry,
} from '@/lib/db/player-ratings'

// ============================================================================
// Types
// ============================================================================

interface UseRatingHistoryResult {
  history: RatingHistoryEntry[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

// ============================================================================
// Italian Messages
// ============================================================================

const MESSAGES = {
  fetch: {
    error: 'Errore nel caricamento della cronologia voti',
  },
}

// ============================================================================
// useRatingHistory Hook
// ============================================================================

/**
 * Hook to fetch player's rating history for chart visualization
 *
 * @param playerId - Player ID
 * @param teamId - Optional team ID to filter history
 * @returns Rating history with loading and error states
 */
export function useRatingHistory(
  playerId: string | null,
  teamId?: string
): UseRatingHistoryResult {
  const [history, setHistory] = useState<RatingHistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(!!playerId)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    if (!playerId) {
      setHistory([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await getPlayerRatingHistory(playerId, teamId)
      setHistory(data)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : MESSAGES.fetch.error
      setError(errorMsg)
      console.error('[useRatingHistory] Fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [playerId, teamId])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return {
    history,
    isLoading,
    error,
    refetch: fetchHistory,
  }
}

// Re-export the type for convenience
export type { RatingHistoryEntry }
