/**
 * RSVP React Hooks
<<<<<<< HEAD
 * Provides real-time RSVP data, optimistic updates, and counts
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  getMatchPlayers, 
  updateRSVP as updateRSVPDB, 
  getRSVPCounts as getRSVPCountsDB 
} from '@/lib/db/matches';
import type { MatchPlayer } from '@/lib/db/schema';
import { toast } from 'sonner';

export type RSVPStatus = 'in' | 'out' | 'maybe';

export interface RSVPCounts {
  in: number;
  out: number;
  maybe: number;
  total: number;
}

export interface PlayerRSVP {
  id: string;
  match_id: string;
  player_id: string;
  player_name: string;
  player_surname?: string;
  player_avatar?: string;
  rsvp_status: RSVPStatus;
  rsvp_at: string;
}

// ============================================================================
// useRSVPs Hook - Get all RSVPs for a match with real-time polling
// ============================================================================

interface UseRSVPsReturn {
  rsvps: PlayerRSVP[];
=======
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
>>>>>>> origin/main
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useRSVPs(matchId: string): UseRSVPsReturn {
<<<<<<< HEAD
  const [rsvps, setRSVPs] = useState<PlayerRSVP[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
=======
  const [rsvps, setRSVPs] = useState<MatchRSVP[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
>>>>>>> origin/main

  const fetchRSVPs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
<<<<<<< HEAD
      const matchPlayers = await getMatchPlayers(matchId);
      
      // Transform to PlayerRSVP format
      const transformed: PlayerRSVP[] = matchPlayers.map(mp => ({
        id: mp.id,
        match_id: mp.match_id,
        player_id: mp.player_id,
        player_name: (mp as any).player?.name || '',
        player_surname: (mp as any).player?.surname,
        player_avatar: (mp as any).player?.avatarUrl,
        rsvp_status: mp.rsvp_status,
        rsvp_at: mp.rsvp_at,
      }));

      // Sort: IN first, then Maybe, then OUT, then by rsvp_at (most recent first)
      const statusOrder: Record<RSVPStatus, number> = { in: 0, maybe: 1, out: 2 };
      transformed.sort((a, b) => {
        const statusDiff = (statusOrder[a.rsvp_status] ?? 3) - (statusOrder[b.rsvp_status] ?? 3);
        if (statusDiff !== 0) return statusDiff;
        return new Date(b.rsvp_at).getTime() - new Date(a.rsvp_at).getTime();
      });

      setRSVPs(transformed);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load RSVPs'));
=======
      const data = await getMatchRSVPs(matchId);
      setRSVPs(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch RSVPs'));
>>>>>>> origin/main
    } finally {
      setIsLoading(false);
    }
  }, [matchId]);

<<<<<<< HEAD
  // Initial fetch and polling
  useEffect(() => {
    fetchRSVPs();

    // Poll every 10 seconds for real-time updates
    const interval = setInterval(() => {
      fetchRSVPs();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchRSVPs]);
=======
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
>>>>>>> origin/main

  return {
    rsvps,
    isLoading,
    error,
    refetch: fetchRSVPs,
  };
}

// ============================================================================
<<<<<<< HEAD
// useRSVPCounts Hook - Get RSVP counts
=======
// useRSVPCounts Hook - Get RSVP counts for a match
>>>>>>> origin/main
// ============================================================================

interface UseRSVPCountsReturn {
  counts: RSVPCounts;
  isLoading: boolean;
  error: Error | null;
}

export function useRSVPCounts(matchId: string): UseRSVPCountsReturn {
<<<<<<< HEAD
  const [counts, setCounts] = useState<RSVPCounts>({ in: 0, out: 0, maybe: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      setIsLoading(true);
      try {
        const dbCounts = await getRSVPCountsDB(matchId);
        setCounts({
          in: dbCounts.in,
          out: dbCounts.out,
          maybe: dbCounts.maybe,
          total: dbCounts.in + dbCounts.out + dbCounts.maybe,
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load counts'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
    
    // Poll every 10 seconds
    const interval = setInterval(fetchCounts, 10000);
    return () => clearInterval(interval);
  }, [matchId]);

  return { counts, isLoading, error };
=======
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
>>>>>>> origin/main
}

// ============================================================================
// useUpdateRSVP Hook - Update RSVP with optimistic updates
// ============================================================================

interface UseUpdateRSVPReturn {
  updateRSVP: (playerId: string, status: RSVPStatus) => Promise<void>;
  isPending: boolean;
  error: Error | null;
}

<<<<<<< HEAD
export function useUpdateRSVP(matchId: string, onSuccess?: () => void): UseUpdateRSVPReturn {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateRSVP = useCallback(async (playerId: string, status: RSVPStatus) => {
    setIsPending(true);
    setError(null);

    try {
      await updateRSVPDB(matchId, playerId, status);
      toast.success('Risposta aggiornata!');
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update RSVP'));
      toast.error('Errore durante l\'aggiornamento');
      throw err;
    } finally {
      setIsPending(false);
    }
  }, [matchId, onSuccess]);
=======
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
>>>>>>> origin/main

  return {
    updateRSVP,
    isPending,
    error,
  };
}

// ============================================================================
<<<<<<< HEAD
=======
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
>>>>>>> origin/main
// useMyRSVP Hook - Get current user's RSVP status
// ============================================================================

interface UseMyRSVPReturn {
  status: RSVPStatus | null;
  isLoading: boolean;
<<<<<<< HEAD
}

export function useMyRSVP(matchId: string, playerId: string | null): UseMyRSVPReturn {
  const [status, setStatus] = useState<RSVPStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!playerId) {
=======
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
>>>>>>> origin/main
      setIsLoading(false);
      return;
    }

<<<<<<< HEAD
    const fetchMyRSVP = async () => {
      try {
        const rsvps = await getMatchPlayers(matchId);
        const myRSVP = rsvps.find(r => r.player_id === playerId);
        setStatus(myRSVP?.rsvp_status || null);
      } catch (err) {
        console.error('Failed to fetch my RSVP:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyRSVP();
  }, [matchId, playerId]);

  return { status, isLoading };
=======
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
>>>>>>> origin/main
}
