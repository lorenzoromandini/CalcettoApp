/**
 * Matches React Hooks - NextAuth Version
 */

import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/components/providers/session-provider';
import { 
  getTeamMatches, 
  getMatch, 
  createMatch as createMatchDB, 
  updateMatch as updateMatchDB,
  cancelMatch as cancelMatchDB,
  uncancelMatch as uncancelMatchDB,
  getUpcomingMatches as getUpcomingMatchesDB,
  getPastMatches as getPastMatchesDB,
} from '@/lib/db/matches';
import type { Match } from '@/lib/db/schema';
import type { CreateMatchInput, UpdateMatchInput } from '@/lib/validations/match';

// ============================================================================
// useMatches Hook - Get all matches for a team
// ============================================================================

interface UseMatchesReturn {
  matches: Match[];
  upcomingMatches: Match[];
  pastMatches: Match[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useMatches(teamId: string): UseMatchesReturn {
  const [matches, setMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [pastMatches, setPastMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMatches = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const allMatches = await getTeamMatches(teamId);
      const upcoming = await getUpcomingMatchesDB(teamId);
      const past = await getPastMatchesDB(teamId);

      setMatches(allMatches);
      setUpcomingMatches(upcoming);
      setPastMatches(past);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch matches'));
    } finally {
      setIsLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  return {
    matches,
    upcomingMatches,
    pastMatches,
    isLoading,
    error,
    refetch: fetchMatches,
  };
}

// ============================================================================
// useMatch Hook - Get single match details
// ============================================================================

interface UseMatchReturn {
  match: Match | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useMatch(matchId: string | null): UseMatchReturn {
  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(!!matchId);
  const [error, setError] = useState<Error | null>(null);

  const fetchMatch = useCallback(async () => {
    if (!matchId) {
      setMatch(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const matchData = await getMatch(matchId);
      setMatch(matchData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch match'));
    } finally {
      setIsLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    fetchMatch();
  }, [fetchMatch]);

  return {
    match,
    isLoading,
    error,
    refetch: fetchMatch,
  };
}

// ============================================================================
// useCreateMatch Hook - Create match mutation
// ============================================================================

interface UseCreateMatchReturn {
  createMatch: (data: CreateMatchInput, teamId: string) => Promise<string>;
  isPending: boolean;
  error: Error | null;
}

export function useCreateMatch(): UseCreateMatchReturn {
  const { data: session } = useSession();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createMatch = useCallback(async (data: CreateMatchInput, teamId: string): Promise<string> => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    setIsPending(true);
    setError(null);

    try {
      const matchId = await createMatchDB(data, teamId, session.user.id);
      return matchId;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create match');
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, [session?.user?.id]);

  return {
    createMatch,
    isPending,
    error,
  };
}

// ============================================================================
// useUpdateMatch Hook - Update match mutation
// ============================================================================

interface UseUpdateMatchReturn {
  updateMatch: (matchId: string, data: UpdateMatchInput) => Promise<void>;
  isPending: boolean;
  error: Error | null;
}

export function useUpdateMatch(): UseUpdateMatchReturn {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateMatch = useCallback(async (matchId: string, data: UpdateMatchInput): Promise<void> => {
    setIsPending(true);
    setError(null);

    try {
      await updateMatchDB(matchId, data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update match');
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    updateMatch,
    isPending,
    error,
  };
}

// ============================================================================
// useCancelMatch Hook - Cancel/uncancel match mutation
// ============================================================================

interface UseCancelMatchReturn {
  cancelMatch: (matchId: string) => Promise<void>;
  uncancelMatch: (matchId: string) => Promise<void>;
  isPending: boolean;
  error: Error | null;
}

export function useCancelMatch(): UseCancelMatchReturn {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const cancelMatch = useCallback(async (matchId: string): Promise<void> => {
    setIsPending(true);
    setError(null);

    try {
      await cancelMatchDB(matchId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to cancel match');
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, []);

  const uncancelMatch = useCallback(async (matchId: string): Promise<void> => {
    setIsPending(true);
    setError(null);

    try {
      await uncancelMatchDB(matchId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to uncancel match');
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    cancelMatch,
    uncancelMatch,
    isPending,
    error,
  };
}
