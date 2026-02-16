/**
 * RSVP React Hooks
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
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useRSVPs(matchId: string): UseRSVPsReturn {
  const [rsvps, setRSVPs] = useState<PlayerRSVP[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRSVPs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
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
    } finally {
      setIsLoading(false);
    }
  }, [matchId]);

  // Initial fetch and polling
  useEffect(() => {
    fetchRSVPs();

    // Poll every 10 seconds for real-time updates
    const interval = setInterval(() => {
      fetchRSVPs();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchRSVPs]);

  return {
    rsvps,
    isLoading,
    error,
    refetch: fetchRSVPs,
  };
}

// ============================================================================
// useRSVPCounts Hook - Get RSVP counts
// ============================================================================

interface UseRSVPCountsReturn {
  counts: RSVPCounts;
  isLoading: boolean;
  error: Error | null;
}

export function useRSVPCounts(matchId: string): UseRSVPCountsReturn {
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
}

// ============================================================================
// useUpdateRSVP Hook - Update RSVP with optimistic updates
// ============================================================================

interface UseUpdateRSVPReturn {
  updateRSVP: (playerId: string, status: RSVPStatus) => Promise<void>;
  isPending: boolean;
  error: Error | null;
}

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

  return {
    updateRSVP,
    isPending,
    error,
  };
}

// ============================================================================
// useMyRSVP Hook - Get current user's RSVP status
// ============================================================================

interface UseMyRSVPReturn {
  status: RSVPStatus | null;
  isLoading: boolean;
}

export function useMyRSVP(matchId: string, playerId: string | null): UseMyRSVPReturn {
  const [status, setStatus] = useState<RSVPStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!playerId) {
      setIsLoading(false);
      return;
    }

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
}
