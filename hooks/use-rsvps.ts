/**
 * RSVP React Hooks
 * 
 * Provides data fetching and mutations for match RSVPs with
 * optimistic updates, real-time sync, and offline support.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  getMatchRSVPs,
  getRSVPCounts,
  updateRSVP as updateRSVPDB,
  getMyRSVP,
  subscribeToRSVPs,
  type RSVPCounts,
  type MatchRSVP,
} from '@/lib/db/rsvps';
import type { RSVPStatus } from '@/lib/db/schema';

// ============================================================================
// useRSVPs Hook - Get all RSVPs for a match with real-time updates
// ============================================================================

interface UseRSVPsReturn {
  rsvps: MatchRSVP[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useRSVPs(matchId: string): UseRSVPsReturn {
  const [rsvps, setRSVPs] = useState<MatchRSVP[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const fetchRSVPs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getMatchRSVPs(matchId);
      setRSVPs(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch RSVPs'));
    } finally {
      setIsLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    // Initial fetch
    fetchRSVPs();

    // Set up real-time subscription
    const unsubscribe = subscribeToRSVPs(matchId, (newRSVPs) => {
      setRSVPs(newRSVPs);
      setIsLoading(false);
    });

    unsubscribeRef.current = unsubscribe;

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [matchId, fetchRSVPs]);

  return {
    rsvps,
    isLoading,
    error,
    refetch: fetchRSVPs,
  };
}

// ============================================================================
// useRSVPCounts Hook - Get RSVP counts for a match
// ============================================================================

interface UseRSVPCountsReturn {
  counts: RSVPCounts;
  isLoading: boolean;
  error: Error | null;
}

export function useRSVPCounts(matchId: string): UseRSVPCountsReturn {
  const [counts, setCounts] = useState<RSVPCounts>({
    in: 0,
    out: 0,
    maybe: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getRSVPCounts(matchId);
      setCounts(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch RSVP counts'));
    } finally {
      setIsLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  return {
    counts,
    isLoading,
    error,
  };
}

// ============================================================================
// useUpdateRSVP Hook - Update RSVP with optimistic updates
// ============================================================================

interface UseUpdateRSVPReturn {
  updateRSVP: (playerId: string, status: RSVPStatus) => Promise<void>;
  isPending: boolean;
  error: Error | null;
}

export function useUpdateRSVP(
  matchId: string,
  onSuccess?: () => void
): UseUpdateRSVPReturn {
  const t = useTranslations('matches');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateRSVP = useCallback(
    async (playerId: string, status: RSVPStatus): Promise<void> => {
      setIsPending(true);
      setError(null);

      try {
        // Update in database (handles offline queueing internally)
        await updateRSVPDB(matchId, playerId, status);
        
        toast.success(t('rsvp.updateSuccess'), {
          duration: 2000,
        });
        
        onSuccess?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update RSVP');
        setError(error);
        
        toast.error(t('rsvp.updateError'), {
          duration: 3000,
        });
        
        throw error;
      } finally {
        setIsPending(false);
      }
    },
    [matchId, t, onSuccess]
  );

  return {
    updateRSVP,
    isPending,
    error,
  };
}

// ============================================================================
// useUpdateRSVPWithOptimistic Hook - Update RSVP with optimistic UI updates
// ============================================================================

interface UseUpdateRSVPWithOptimisticReturn {
  updateRSVP: (playerId: string, status: RSVPStatus) => Promise<void>;
  isPending: boolean;
  error: Error | null;
  optimisticRSVPs: MatchRSVP[];
}

export function useUpdateRSVPWithOptimistic(
  matchId: string,
  currentRSVPs: MatchRSVP[],
  onSuccess?: () => void
): UseUpdateRSVPWithOptimisticReturn {
  const t = useTranslations('matches');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [optimisticRSVPs, setOptimisticRSVPs] = useState<MatchRSVP[]>(currentRSVPs);

  // Keep optimistic RSVPs in sync with current RSVPs when not pending
  useEffect(() => {
    if (!isPending) {
      setOptimisticRSVPs(currentRSVPs);
    }
  }, [currentRSVPs, isPending]);

  const updateRSVP = useCallback(
    async (playerId: string, status: RSVPStatus): Promise<void> => {
      // Store previous state for rollback
      const previousRSVPs = optimisticRSVPs;

      // Optimistic update: Update UI immediately
      setOptimisticRSVPs((prev) => {
        const existing = prev.find((r) => r.player_id === playerId);
        
        if (existing) {
          // Update existing RSVP
          return prev.map((r) =>
            r.player_id === playerId
              ? { ...r, rsvp_status: status, rsvp_at: new Date().toISOString() }
              : r
          );
        } else {
          // This shouldn't happen in normal flow, but handle gracefully
          console.warn('[useRSVPs] RSVP not found for player:', playerId);
          return prev;
        }
      });

      setIsPending(true);
      setError(null);

      try {
        // Update in database
        await updateRSVPDB(matchId, playerId, status);
        
        toast.success(t('rsvp.updateSuccess'), {
          duration: 2000,
        });
        
        onSuccess?.();
      } catch (err) {
        // Rollback on error
        setOptimisticRSVPs(previousRSVPs);
        
        const error = err instanceof Error ? err : new Error('Failed to update RSVP');
        setError(error);
        
        toast.error(t('rsvp.updateError'), {
          duration: 3000,
        });
        
        throw error;
      } finally {
        setIsPending(false);
      }
    },
    [matchId, t, onSuccess, optimisticRSVPs]
  );

  return {
    updateRSVP,
    isPending,
    error,
    optimisticRSVPs,
  };
}

// ============================================================================
// useMyRSVP Hook - Get current user's RSVP status
// ============================================================================

interface UseMyRSVPReturn {
  status: RSVPStatus | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useMyRSVP(
  matchId: string,
  playerId: string | null
): UseMyRSVPReturn {
  const [status, setStatus] = useState<RSVPStatus | null>(null);
  const [isLoading, setIsLoading] = useState(!!playerId);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!playerId) {
      setStatus(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getMyRSVP(matchId, playerId);
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch RSVP status'));
    } finally {
      setIsLoading(false);
    }
  }, [matchId, playerId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    status,
    isLoading,
    error,
    refetch: fetchStatus,
  };
}

// ============================================================================
// useRSVPData Hook - Combined hook for all RSVP data
// ============================================================================

interface UseRSVPDataReturn {
  rsvps: MatchRSVP[];
  counts: RSVPCounts;
  myRSVP: RSVPStatus | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useRSVPData(
  matchId: string,
  playerId: string | null
): UseRSVPDataReturn {
  const { rsvps, isLoading: rsvpsLoading, error: rsvpsError, refetch } = useRSVPs(matchId);
  const { counts, isLoading: countsLoading, error: countsError } = useRSVPCounts(matchId);
  const { status: myRSVP, isLoading: myRSVPLoading, error: myRSVPError } = useMyRSVP(matchId, playerId);

  const isLoading = rsvpsLoading || countsLoading || myRSVPLoading;
  const error = rsvpsError || countsError || myRSVPError;

  // Derive counts from RSVPs for consistency
  const derivedCounts: RSVPCounts = {
    in: rsvps.filter((r) => r.rsvp_status === 'in').length,
    out: rsvps.filter((r) => r.rsvp_status === 'out').length,
    maybe: rsvps.filter((r) => r.rsvp_status === 'maybe').length,
    total: rsvps.length,
  };

  return {
    rsvps,
    counts: rsvps.length > 0 ? derivedCounts : counts,
    myRSVP,
    isLoading,
    error,
    refetch,
  };
}
