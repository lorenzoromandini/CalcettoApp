'use client'

/**
 * Match Lifecycle Hook
 * 
 * Provides handlers for match state transitions with optimistic updates
 * and toast notifications.
 */

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  startMatchAction,
  endMatchAction,
  completeMatchAction,
  inputFinalResultsAction,
} from '@/lib/actions/match-lifecycle'

// ============================================================================
// Italian Messages
// ============================================================================

const MESSAGES = {
  startMatch: {
    loading: 'Avvio partita in corso...',
    success: 'Partita avviata',
    error: 'Errore durante l\'avvio della partita',
  },
  endMatch: {
    loading: 'Terminazione partita in corso...',
    success: 'Partita terminata',
    error: 'Errore durante la terminazione della partita',
  },
  completeMatch: {
    loading: 'Completamento partita in corso...',
    success: 'Partita completata e bloccata',
    error: 'Errore durante il completamento della partita',
  },
  inputFinalResults: {
    loading: 'Salvataggio risultati...',
    success: 'Risultati salvati',
    error: 'Errore durante il salvataggio dei risultati',
  },
}

// ============================================================================
// Hook Return Type
// ============================================================================

interface UseMatchLifecycleReturn {
  isLoading: boolean
  startMatch: () => Promise<void>
  endMatch: () => Promise<void>
  completeMatch: () => Promise<void>
  inputFinalResults: (homeScore: number, awayScore: number) => Promise<void>
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useMatchLifecycle(
  matchId: string,
  clubId: string
): UseMatchLifecycleReturn {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  /**
   * Start match: SCHEDULED → IN_PROGRESS
   */
  const handleStartMatch = useCallback(async () => {
    setIsLoading(true)
    const toastId = toast.loading(MESSAGES.startMatch.loading)

    try {
      await startMatchAction(matchId)
      toast.success(MESSAGES.startMatch.success, { id: toastId })
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : MESSAGES.startMatch.error
      toast.error(message, { id: toastId })
    } finally {
      setIsLoading(false)
    }
  }, [matchId, router])

  /**
   * End match: IN_PROGRESS → FINISHED
   */
  const handleEndMatch = useCallback(async () => {
    setIsLoading(true)
    const toastId = toast.loading(MESSAGES.endMatch.loading)

    try {
      await endMatchAction(matchId)
      toast.success(MESSAGES.endMatch.success, { id: toastId })
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : MESSAGES.endMatch.error
      toast.error(message, { id: toastId })
    } finally {
      setIsLoading(false)
    }
  }, [matchId, router])

  /**
   * Complete match: FINISHED → COMPLETED (locks all edits)
   */
  const handleCompleteMatch = useCallback(async () => {
    setIsLoading(true)
    const toastId = toast.loading(MESSAGES.completeMatch.loading)

    try {
      await completeMatchAction(matchId)
      toast.success(MESSAGES.completeMatch.success, { id: toastId })
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : MESSAGES.completeMatch.error
      toast.error(message, { id: toastId })
    } finally {
      setIsLoading(false)
    }
  }, [matchId, router])

  /**
   * Input final results: SCHEDULED → FINISHED with scores
   */
  const handleInputFinalResults = useCallback(async (
    homeScore: number,
    awayScore: number
  ) => {
    setIsLoading(true)
    const toastId = toast.loading(MESSAGES.inputFinalResults.loading)

    try {
      await inputFinalResultsAction(matchId, homeScore, awayScore)
      toast.success(MESSAGES.inputFinalResults.success, { id: toastId })
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : MESSAGES.inputFinalResults.error
      toast.error(message, { id: toastId })
    } finally {
      setIsLoading(false)
    }
  }, [matchId, router])

  return {
    isLoading,
    startMatch: handleStartMatch,
    endMatch: handleEndMatch,
    completeMatch: handleCompleteMatch,
    inputFinalResults: handleInputFinalResults,
  }
}
