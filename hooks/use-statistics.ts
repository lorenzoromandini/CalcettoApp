'use client'

/**
 * Statistics React Hooks
 *
 * Provides data fetching for player statistics and team leaderboards.
 * Uses server actions from lib/db/statistics.ts for data access.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  getPlayerStats,
  getTopScorers,
  getTopAssisters,
  getTopAppearances,
  getTopWins,
  getTopLosses,
  getTopRatedPlayers,
  getTopGoalsConceded,
  type PlayerStats,
  type PlayerLeaderboardEntry,
} from '@/lib/db/statistics'

// ============================================================================
// Italian Messages
// ============================================================================

const MESSAGES = {
  fetch: {
    error: 'Errore nel caricamento delle statistiche',
  },
}

// ============================================================================
// usePlayerStats Hook
// ============================================================================

interface UsePlayerStatsReturn {
  stats: PlayerStats | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Hook to fetch player statistics including goals_conceded for goalkeepers
 *
 * @param playerId - Player ID
 * @param teamId - Optional team ID to filter statistics
 * @returns Player statistics with loading and error states
 */
export function usePlayerStats(
  playerId: string | null,
  teamId?: string
): UsePlayerStatsReturn {
  const [stats, setStats] = useState<PlayerStats | null>(null)
  const [isLoading, setIsLoading] = useState(!!playerId)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    if (!playerId) {
      setStats(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await getPlayerStats(playerId, teamId)
      setStats(result)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : MESSAGES.fetch.error
      setError(errorMsg)
      console.error('[usePlayerStats] Fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [playerId, teamId])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    isLoading,
    error,
    refresh: fetchStats,
  }
}

// ============================================================================
// useTeamLeaderboards Hook
// ============================================================================

interface TeamLeaderboards {
  scorers: PlayerLeaderboardEntry[]
  assisters: PlayerLeaderboardEntry[]
  appearances: PlayerLeaderboardEntry[]
  wins: PlayerLeaderboardEntry[]
  losses: PlayerLeaderboardEntry[]
  rated: PlayerLeaderboardEntry[]
  goalsConceded: PlayerLeaderboardEntry[]
}

interface UseTeamLeaderboardsReturn {
  leaderboards: TeamLeaderboards
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Hook to fetch all 7 team leaderboards at once
 *
 * @param teamId - Team ID
 * @returns All leaderboards with loading and error states
 */
export function useTeamLeaderboards(teamId: string | null): UseTeamLeaderboardsReturn {
  const [leaderboards, setLeaderboards] = useState<TeamLeaderboards>({
    scorers: [],
    assisters: [],
    appearances: [],
    wins: [],
    losses: [],
    rated: [],
    goalsConceded: [],
  })
  const [isLoading, setIsLoading] = useState(!!teamId)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboards = useCallback(async () => {
    if (!teamId) {
      setLeaderboards({
        scorers: [],
        assisters: [],
        appearances: [],
        wins: [],
        losses: [],
        rated: [],
        goalsConceded: [],
      })
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Fetch all 7 leaderboards in parallel
      const [
        scorers,
        assisters,
        appearances,
        wins,
        losses,
        rated,
        goalsConceded,
      ] = await Promise.all([
        getTopScorers(teamId, 3),
        getTopAssisters(teamId, 3),
        getTopAppearances(teamId, 3),
        getTopWins(teamId, 3),
        getTopLosses(teamId, 3),
        getTopRatedPlayers(teamId, 3),
        getTopGoalsConceded(teamId, 3),
      ])

      setLeaderboards({
        scorers,
        assisters,
        appearances,
        wins,
        losses,
        rated,
        goalsConceded,
      })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : MESSAGES.fetch.error
      setError(errorMsg)
      console.error('[useTeamLeaderboards] Fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [teamId])

  useEffect(() => {
    fetchLeaderboards()
  }, [fetchLeaderboards])

  return {
    leaderboards,
    isLoading,
    error,
    refresh: fetchLeaderboards,
  }
}

// ============================================================================
// Individual Leaderboard Hooks (lighter weight for specific use cases)
// ============================================================================

interface UseLeaderboardReturn {
  entries: PlayerLeaderboardEntry[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Hook to fetch top scorers leaderboard
 */
export function useTopScorers(teamId: string | null, limit: number = 3): UseLeaderboardReturn {
  const [entries, setEntries] = useState<PlayerLeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(!!teamId)
  const [error, setError] = useState<string | null>(null)

  const fetchEntries = useCallback(async () => {
    if (!teamId) {
      setEntries([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await getTopScorers(teamId, limit)
      setEntries(result)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : MESSAGES.fetch.error
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }, [teamId, limit])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  return {
    entries,
    isLoading,
    error,
    refresh: fetchEntries,
  }
}

/**
 * Hook to fetch top rated players leaderboard
 */
export function useTopRatedPlayers(teamId: string | null, limit: number = 3): UseLeaderboardReturn {
  const [entries, setEntries] = useState<PlayerLeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(!!teamId)
  const [error, setError] = useState<string | null>(null)

  const fetchEntries = useCallback(async () => {
    if (!teamId) {
      setEntries([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await getTopRatedPlayers(teamId, limit)
      setEntries(result)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : MESSAGES.fetch.error
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }, [teamId, limit])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  return {
    entries,
    isLoading,
    error,
    refresh: fetchEntries,
  }
}
