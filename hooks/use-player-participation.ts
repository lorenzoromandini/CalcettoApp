'use client'

/**
 * Player Participation Hook
 * 
 * Provides data fetching and mutations for player participation tracking
 * with optimistic updates and toast notifications.
 */

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  getMatchParticipantsAction,
  updatePlayerParticipationAction,
  bulkUpdateParticipationAction,
  getParticipationCountsAction,
} from '@/lib/actions/player-participation'
import type { ParticipationUpdate, MatchPlayerWithPlayer } from '@/lib/db/player-participation'

// ============================================================================
// Italian Messages
// ============================================================================

const MESSAGES = {
  togglePlayed: {
    success: 'Stato partecipazione aggiornato',
    error: 'Errore durante l\'aggiornamento',
  },
  bulkUpdate: {
    success: 'Partecipazioni aggiornate',
    error: 'Errore durante l\'aggiornamento delle partecipazioni',
  },
  fetch: {
    error: 'Errore durante il caricamento dei partecipanti',
  },
}

// ============================================================================
// Hook Return Type
// ============================================================================

interface UsePlayerParticipationReturn {
  participants: MatchPlayerWithPlayer[]
  isLoading: boolean
  error: Error | null
  togglePlayed: (playerId: string, currentPlayed: boolean) => Promise<void>
  bulkUpdate: (updates: ParticipationUpdate[]) => Promise<void>
  playedPlayers: MatchPlayerWithPlayer[]
  refresh: () => Promise<void>
  counts: {
    played: number
    total: number
  }
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook to manage player participation for a match
 * 
 * @param matchId - Match ID
 * @returns Participation state and handlers
 */
export function usePlayerParticipation(matchId: string): UsePlayerParticipationReturn {
  const [participants, setParticipants] = useState<MatchPlayerWithPlayer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [counts, setCounts] = useState({ played: 0, total: 0 })

  /**
   * Fetch all participants for the match
   */
  const fetchParticipants = useCallback(async () => {
    if (!matchId) return
    
    setIsLoading(true)
    setError(null)

    try {
      const data = await getMatchParticipantsAction(matchId)
      setParticipants(data)
      
      // Calculate counts
      const played = data.filter(p => p.played).length
      setCounts({ played, total: data.length })
    } catch (err) {
      const error = err instanceof Error ? err : new Error(MESSAGES.fetch.error)
      setError(error)
      console.error('[usePlayerParticipation] Fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [matchId])

  /**
   * Toggle a player's played status with optimistic update
   */
  const togglePlayed = useCallback(async (playerId: string, currentPlayed: boolean) => {
    // Store previous state for rollback
    const previousParticipants = participants
    const previousCounts = counts

    // Optimistic update
    const newPlayed = !currentPlayed
    setParticipants(prev => 
      prev.map(p => 
        p.clubMemberId === playerId 
          ? { ...p, played: newPlayed }
          : p
      )
    )
    setCounts(prev => ({
      ...prev,
      played: newPlayed ? prev.played + 1 : prev.played - 1,
    }))

    try {
      await updatePlayerParticipationAction(matchId, playerId, newPlayed)
      toast.success(MESSAGES.togglePlayed.success, { duration: 2000 })
    } catch (err) {
      // Rollback on error
      setParticipants(previousParticipants)
      setCounts(previousCounts)
      
      const error = err instanceof Error ? err : new Error(MESSAGES.togglePlayed.error)
      toast.error(error.message, { duration: 3000 })
      throw error
    }
  }, [matchId, participants, counts])

  /**
   * Bulk update participation for multiple players
   */
  const bulkUpdate = useCallback(async (updates: ParticipationUpdate[]) => {
    setIsLoading(true)

    try {
      await bulkUpdateParticipationAction(matchId, updates)
      
      // Refetch to get updated data
      await fetchParticipants()
      
      toast.success(MESSAGES.bulkUpdate.success, { duration: 2000 })
    } catch (err) {
      const error = err instanceof Error ? err : new Error(MESSAGES.bulkUpdate.error)
      toast.error(error.message, { duration: 3000 })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [matchId, fetchParticipants])

  // Fetch participants on mount
  useEffect(() => {
    fetchParticipants()
  }, [fetchParticipants])

  // Derived: Players who played
  const playedPlayers = participants.filter(p => p.played)

  return {
    participants,
    isLoading,
    error,
    togglePlayed,
    bulkUpdate,
    playedPlayers,
    refresh: fetchParticipants,
    counts,
  }
}

// ============================================================================
// Counts Only Hook
// ============================================================================

interface UseParticipationCountsReturn {
  played: number
  total: number
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Hook to get just the participation counts (lighter weight)
 */
export function useParticipationCounts(matchId: string): UseParticipationCountsReturn {
  const [played, setPlayed] = useState(0)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchCounts = useCallback(async () => {
    if (!matchId) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await getParticipationCountsAction(matchId)
      setPlayed(data.played)
      setTotal(data.total)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch counts')
      setError(error)
    } finally {
      setIsLoading(false)
    }
  }, [matchId])

  useEffect(() => {
    fetchCounts()
  }, [fetchCounts])

  return {
    played,
    total,
    isLoading,
    error,
    refetch: fetchCounts,
  }
}
