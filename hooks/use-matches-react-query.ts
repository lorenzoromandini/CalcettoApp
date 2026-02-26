import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/components/providers/session-provider';
import { authFetch } from '@/lib/auth-fetch';
import { 
  createMatchAction, 
  updateMatchAction, 
  cancelMatchAction,
  uncancelMatchAction
} from '@/lib/actions/matches';
import type { Match } from '@/lib/db/schema';
import type { CreateMatchInput, UpdateMatchInput } from '@/lib/validations/match';

// Query keys
export const matchKeys = {
  all: ['matches'] as const,
  lists: () => [...matchKeys.all, 'list'] as const,
  list: (clubId: string) => [...matchKeys.lists(), clubId] as const,
  details: () => [...matchKeys.all, 'detail'] as const,
  detail: (id: string) => [...matchKeys.details(), id] as const,
};

// ============================================================================
// useMatchesQuery Hook - Get all matches for a club
// ============================================================================

interface UseMatchesQueryReturn {
  matches: Match[];
  isLoading: boolean;
  error: Error | null;
}

export function useMatchesQuery(clubId: string): UseMatchesQueryReturn {
  const { data: session, isLoading: sessionLoading } = useSession();

  const { data: matches = [], isLoading: queryLoading, error } = useQuery({
    queryKey: matchKeys.list(clubId),
    queryFn: async () => {
      const response = await authFetch(`/api/clubs/${clubId}/matches`);
      if (!response.ok) throw new Error('Failed to fetch matches');
      return response.json() as Promise<Match[]>;
    },
    enabled: !!session?.user?.id && !sessionLoading && !!clubId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    matches,
    isLoading: sessionLoading || queryLoading,
    error: error as Error | null,
  };
}

// ============================================================================
// useMatchQuery Hook - Get single match details
// ============================================================================

interface UseMatchQueryReturn {
  match: Match | null;
  isLoading: boolean;
  error: Error | null;
}

export function useMatchQuery(matchId: string | null): UseMatchQueryReturn {
  const { data: match, isLoading, error } = useQuery({
    queryKey: matchKeys.detail(matchId || ''),
    queryFn: async () => {
      if (!matchId) return null;
      const response = await authFetch(`/api/matches/${matchId}`);
      if (!response.ok) throw new Error('Failed to fetch match');
      return response.json() as Promise<Match>;
    },
    enabled: !!matchId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    match: match || null,
    isLoading,
    error: error as Error | null,
  };
}

// ============================================================================
// useCreateMatchMutation Hook - Create match with cache invalidation
// ============================================================================

interface UseCreateMatchMutationReturn {
  createMatch: (data: CreateMatchInput, clubId: string) => Promise<string>;
  isPending: boolean;
  error: Error | null;
}

export function useCreateMatchMutation(): UseCreateMatchMutationReturn {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const mutation = useMutation({
    mutationFn: async ({ data, clubId }: { data: CreateMatchInput; clubId: string }) => {
      const result = await createMatchAction(data, clubId);
      return result.id;
    },
    onSuccess: (_, variables) => {
      // Invalidate clubs list to show new match
      queryClient.invalidateQueries({ queryKey: matchKeys.list(variables.clubId) });
    },
  });

  return {
    createMatch: (data, clubId) => mutation.mutateAsync({ data, clubId }),
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

// ============================================================================
// useUpdateMatchMutation Hook - Update match with selective cache update
// ============================================================================

interface UseUpdateMatchMutationReturn {
  updateMatch: (matchId: string, data: UpdateMatchInput) => Promise<void>;
  isPending: boolean;
  error: Error | null;
}

export function useUpdateMatchMutation(): UseUpdateMatchMutationReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ matchId, data }: { matchId: string; data: UpdateMatchInput }) => {
      await updateMatchAction(matchId, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate specific match and list
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(variables.matchId) });
    },
  });

  return {
    updateMatch: (matchId, data) => mutation.mutateAsync({ matchId, data }),
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

// ============================================================================
// useCancelMatchMutation Hook - Cancel match
// ============================================================================

interface UseCancelMatchMutationReturn {
  cancelMatch: (matchId: string) => Promise<void>;
  isPending: boolean;
  error: Error | null;
}

export function useCancelMatchMutation(): UseCancelMatchMutationReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (matchId: string) => {
      await cancelMatchAction(matchId);
    },
    onSuccess: (_, matchId) => {
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(matchId) });
    },
  });

  return {
    cancelMatch: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

// ============================================================================
// useUncancelMatchMutation Hook - Uncancel match
// ============================================================================

interface UseUncancelMatchMutationReturn {
  uncancelMatch: (matchId: string) => Promise<void>;
  isPending: boolean;
  error: Error | null;
}

export function useUncancelMatchMutation(): UseUncancelMatchMutationReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (matchId: string) => {
      await uncancelMatchAction(matchId);
    },
    onSuccess: (_, matchId) => {
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(matchId) });
    },
  });

  return {
    uncancelMatch: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

// Backward compatibility exports
export { useMatchesQuery as useMatchesReactQuery, useMatchQuery as useMatchReactQuery };
