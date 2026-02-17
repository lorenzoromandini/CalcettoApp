'use client'

/**
 * Player Ratings Hook
 * 
 * Provides data fetching and mutations for player ratings
 * with optimistic updates and toast notifications.
 */

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  getMatchRatings,
  upsertPlayerRating,
  deletePlayerRating,
  getRatingsCount,
  bulkUpsertRatings,
  type PlayerRatingWithPlayer,
  type PlayerRating,
  type RatingInput,
} from '@/lib/db/player-ratings'
import type { RatingValue } from '@/lib/rating-utils'

// ============================================================================
// Italian Messages
// ============================================================================

const MESSAGES = {
  upsert: {
    success: 'Voto salvato',
    error: 'Errore durante il salvataggio del voto',
  },
  delete: {
    success: 'Voto rimosso',
    error: 'Errore durante la rimozione del voto',
  },
  bulkSave: {
    success: 'Voti salvati',
    error: 'Errore durante il salvataggio dei voti',
  },
  fetch: {
    error: 'Errore durante il caricamento dei voti',
  },
}

// ============================================================================
// Types
// ============================================================================

/**
 * Local rating state for optimistic updates
 */
interface LocalRating {
  rating: string
  comment?: string
  isPending: boolean
}

// ============================================================================
// Hook Return Type
// ============================================================================

interface UsePlayerRatingsReturn {
  ratings: PlayerRatingWithPlayer[]
  ratingsMap: Map<string, PlayerRatingWithPlayer>
  localRatings: Map<string, LocalRating>
  isLoading: boolean
  error: Error | null
  counts: {
    rated: number
    played: number
  }
  setRating: (playerId: string, rating: RatingValue, comment?: string) => Promise<void>
  removeRating: (playerId: string) => Promise<void>
  saveAllRatings: (ratings: Array<{ playerId: string; rating: RatingValue; comment?: string }>) => Promise<void>
  getRating: (playerId: string) => PlayerRatingWithPlayer | undefined
  getLocalRating: (playerId: string) => LocalRating | undefined
  refresh: () => Promise<void>
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook to manage player ratings for a match
 * 
 * @param matchId - Match ID
 * @returns Ratings state and handlers
 */
export function usePlayerRatings(matchId: string): UsePlayerRatingsReturn {
  const [ratings, setRatings] = useState<PlayerRatingWithPlayer[]>([])
  const [localRatings, setLocalRatings] = useState<Map<string, LocalRating>>(new Map())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [counts, setCounts] = useState({ rated: 0, played: 0 })

  /**
   * Fetch all ratings for the match
   */
  const fetchRatings = useCallback(async () => {
    if (!matchId) return

    setIsLoading(true)
    setError(null)

    try {
      const [ratingsData, countsData] = await Promise.all([
        getMatchRatings(matchId),
        getRatingsCount(matchId),
      ])

      setRatings(ratingsData)
      setCounts(countsData)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(MESSAGES.fetch.error)
      setError(error)
      console.error('[usePlayerRatings] Fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [matchId])

  /**
   * Set a player's rating with optimistic update
   */
  const setRating = useCallback(async (
    playerId: string,
    rating: RatingValue,
    comment?: string
  ) => {
    // Store previous state for rollback
    const previousRatings = ratings
    const previousLocalRatings = localRatings
    const previousCounts = counts

    // Optimistic update - update local state immediately
    setLocalRatings(prev => {
      const next = new Map(prev)
      next.set(playerId, { rating, comment, isPending: true })
      return next
    })

    // Also update counts optimistically
    const hadRating = ratings.some(r => r.player_id === playerId)
    if (!hadRating) {
      setCounts(prev => ({ ...prev, rated: prev.rated + 1 }))
    }

    try {
      const result = await upsertPlayerRating({
        matchId,
        playerId,
        rating,
        comment,
      })

      // Update ratings list
      setRatings(prev => {
        const existing = prev.findIndex(r => r.player_id === playerId)
        if (existing >= 0) {
          // Update existing rating
          const updated = [...prev]
          updated[existing] = {
            ...updated[existing],
            rating: result.rating,
            rating_decimal: result.rating_decimal,
            comment: result.comment,
          }
          return updated.sort((a, b) => b.rating_decimal - a.rating_decimal)
        } else {
          // Add new rating (would need player info from server)
          return prev
        }
      })

      // Clear pending state
      setLocalRatings(prev => {
        const next = new Map(prev)
        next.set(playerId, { rating, comment, isPending: false })
        return next
      })

      toast.success(MESSAGES.upsert.success, { duration: 2000 })
    } catch (err) {
      // Rollback on error
      setRatings(previousRatings)
      setLocalRatings(previousLocalRatings)
      setCounts(previousCounts)

      const error = err instanceof Error ? err : new Error(MESSAGES.upsert.error)
      toast.error(error.message, { duration: 3000 })
      throw error
    }
  }, [matchId, ratings, localRatings, counts])

  /**
   * Remove a player's rating
   */
  const removeRating = useCallback(async (playerId: string) => {
    // Store previous state for rollback
    const previousRatings = ratings
    const previousCounts = counts

    // Optimistic update
    setRatings(prev => prev.filter(r => r.player_id !== playerId))
    setCounts(prev => ({ ...prev, rated: Math.max(0, prev.rated - 1) }))
    setLocalRatings(prev => {
      const next = new Map(prev)
      next.delete(playerId)
      return next
    })

    try {
      await deletePlayerRating(matchId, playerId)
      toast.success(MESSAGES.delete.success, { duration: 2000 })
    } catch (err) {
      // Rollback on error
      setRatings(previousRatings)
      setCounts(previousCounts)

      const error = err instanceof Error ? err : new Error(MESSAGES.delete.error)
      toast.error(error.message, { duration: 3000 })
      throw error
    }
  }, [matchId, ratings, counts])

  /**
   * Save all ratings at once
   */
  const saveAllRatings = useCallback(async (
    ratingsToSave: Array<{ playerId: string; rating: RatingValue; comment?: string }>
  ) => {
    setIsLoading(true)

    try {
      await bulkUpsertRatings(
        ratingsToSave.map(r => ({
          matchId,
          playerId: r.playerId,
          rating: r.rating,
          comment: r.comment,
        }))
      )

      // Refetch to get updated data with player info
      await fetchRatings()

      toast.success(MESSAGES.bulkSave.success, { duration: 2000 })
    } catch (err) {
      const error = err instanceof Error ? err : new Error(MESSAGES.bulkSave.error)
      toast.error(error.message, { duration: 3000 })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [matchId, fetchRatings])

  // Fetch ratings on mount
  useEffect(() => {
    fetchRatings()
  }, [fetchRatings])

  // Create a map for quick lookup
  const ratingsMap = new Map(ratings.map(r => [r.player_id, r]))

  return {
    ratings,
    ratingsMap,
    localRatings,
    isLoading,
    error,
    counts,
    setRating,
    removeRating,
    saveAllRatings,
    getRating: (playerId: string) => ratingsMap.get(playerId),
    getLocalRating: (playerId: string) => localRatings.get(playerId),
    refresh: fetchRatings,
  }
}

// ============================================================================
// Counts Only Hook
// ============================================================================

interface UseRatingsCountsReturn {
  rated: number
  played: number
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Hook to get just the ratings counts (lighter weight)
 */
export function useRatingsCounts(matchId: string): UseRatingsCountsReturn {
  const [rated, setRated] = useState(0)
  const [played, setPlayed] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchCounts = useCallback(async () => {
    if (!matchId) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await getRatingsCount(matchId)
      setRated(data.rated)
      setPlayed(data.played)
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
    rated,
    played,
    isLoading,
    error,
    refetch: fetchCounts,
  }
}
