'use client'

/**
 * Player Evolution React Hook
 *
 * Provides data fetching for player evolution data.
 * Used for multi-line chart visualization on player profile.
 */

import { useState, useEffect, useCallback } from 'react'
import { getMemberEvolutionAction } from '@/lib/actions/player-evolution'
import type { EvolutionDataPoint } from '@/lib/db/player-evolution'

// ============================================================================
// Types
// ============================================================================

interface UsePlayerEvolutionReturn {
  evolution: EvolutionDataPoint[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

// ============================================================================
// Italian Messages
// ============================================================================

const MESSAGES = {
  fetch: {
    error: 'Errore nel caricamento dei dati evolutivi',
  },
}

// ============================================================================
// usePlayerEvolution Hook
// ============================================================================

/**
 * Hook to fetch player's evolution data for chart visualization
 *
 * @param playerId - Player ID (null to skip fetching)
 * @param clubId - Team ID to filter matches (null to skip fetching)
 * @param limit - Maximum number of matches to include (default 10)
 * @returns Evolution data with loading and error states
 */
export function usePlayerEvolution(
  playerId: string | null,
  clubId: string | null,
  limit: number = 10
): UsePlayerEvolutionReturn {
  const [evolution, setEvolution] = useState<EvolutionDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(!!playerId && !!clubId)
  const [error, setError] = useState<string | null>(null)

  const fetchEvolution = useCallback(async () => {
    if (!playerId || !clubId) {
      setEvolution([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await getMemberEvolutionAction(playerId, clubId, limit)
      setEvolution(result)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : MESSAGES.fetch.error
      setError(errorMsg)
      console.error('[usePlayerEvolution] Fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [playerId, clubId, limit])

  useEffect(() => {
    fetchEvolution()
  }, [fetchEvolution])

  return { evolution, isLoading, error, refresh: fetchEvolution }
}

// Re-export the type for convenience
export type { EvolutionDataPoint }
