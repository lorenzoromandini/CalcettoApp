'use client'

/**
 * Statistics React Hooks
 *
 * Provides data fetching for player statistics and team leaderboards.
 * Uses server actions from lib/db/statistics.ts for data access.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  getMemberStatsAction,
  getTopScorersAction,
  getTopAssistersAction,
  getTopAppearancesAction,
  getTopWinsAction,
  getTopLossesAction,
  getTopRatedMembersAction,
  getTopGoalsConcededAction,
} from '@/lib/actions/statistics'
import type { MemberStats, MemberLeaderboardEntry } from '@/lib/db/statistics'

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
  stats: MemberStats | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Hook to fetch player statistics including goals_conceded for goalkeepers
 *
 * @param playerId - Player ID
 * @param clubId - Optional team ID to filter statistics
 * @returns Player statistics with loading and error states
 */
export function usePlayerStats(
  playerId: string | null,
  clubId?: string
): UsePlayerStatsReturn {
  const [stats, setStats] = useState<MemberStats | null>(null)
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
      const result = await getMemberStatsAction(playerId, clubId)
      setStats(result)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : MESSAGES.fetch.error
      setError(errorMsg)
      console.error('[usePlayerStats] Fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [playerId, clubId])

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
// useClubLeaderboards Hook
// ============================================================================

interface TeamLeaderboards {
  scorers: MemberLeaderboardEntry[]
  assisters: MemberLeaderboardEntry[]
  appearances: MemberLeaderboardEntry[]
  wins: MemberLeaderboardEntry[]
  losses: MemberLeaderboardEntry[]
  rated: MemberLeaderboardEntry[]
  goalsConceded: MemberLeaderboardEntry[]
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
 * @param clubId - Team ID
 * @returns All leaderboards with loading and error states
 */
export function useClubLeaderboards(clubId: string | null): UseTeamLeaderboardsReturn {
  const [leaderboards, setLeaderboards] = useState<TeamLeaderboards>({
    scorers: [],
    assisters: [],
    appearances: [],
    wins: [],
    losses: [],
    rated: [],
    goalsConceded: [],
  })
  const [isLoading, setIsLoading] = useState(!!clubId)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboards = useCallback(async () => {
    if (!clubId) {
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
      console.log('[useClubLeaderboards] Fetching leaderboards for club:', clubId)
      const [
        scorers,
        assisters,
        appearances,
        wins,
        losses,
        rated,
        goalsConceded,
      ] = await Promise.all([
        getTopScorersAction(clubId, 3),
        getTopAssistersAction(clubId, 3),
        getTopAppearancesAction(clubId, 3),
        getTopWinsAction(clubId, 3),
        getTopLossesAction(clubId, 3),
        getTopRatedMembersAction(clubId, 3),
        getTopGoalsConcededAction(clubId, 3),
      ])
      console.log('[useClubLeaderboards] All leaderboards fetched')

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
      console.error('[useClubLeaderboards] Fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [clubId])

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
  entries: MemberLeaderboardEntry[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Hook to fetch top scorers leaderboard
 */
export function useTopScorers(clubId: string | null, limit: number = 3): UseLeaderboardReturn {
  const [entries, setEntries] = useState<MemberLeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(!!clubId)
  const [error, setError] = useState<string | null>(null)

  const fetchEntries = useCallback(async () => {
    if (!clubId) {
      setEntries([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await getTopScorersAction(clubId, limit)
      setEntries(result)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : MESSAGES.fetch.error
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }, [clubId, limit])

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
export function useTopRatedPlayers(clubId: string | null, limit: number = 3): UseLeaderboardReturn {
  const [entries, setEntries] = useState<MemberLeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(!!clubId)
  const [error, setError] = useState<string | null>(null)

  const fetchEntries = useCallback(async () => {
    if (!clubId) {
      setEntries([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await getTopRatedMembersAction(clubId, limit)
      setEntries(result)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : MESSAGES.fetch.error
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }, [clubId, limit])

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
