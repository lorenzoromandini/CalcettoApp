import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/components/providers/session-provider';
import { authFetch } from '@/lib/auth-fetch';
import { 
  upsertRatingAction, 
  deleteRatingAction,
  bulkUpsertRatingsAction
} from '@/lib/actions/ratings';
import type { PlayerRating, PlayerRatingWithMember, RatingInput } from '@/lib/db/player-ratings';
import type { RatingValue } from '@/lib/rating-utils';

// Query keys
export const ratingKeys = {
  all: ['ratings'] as const,
  lists: () => [...ratingKeys.all, 'list'] as const,
  list: (matchId: string) => [...ratingKeys.lists(), matchId] as const,
  details: () => [...ratingKeys.all, 'detail'] as const,
  detail: (matchId: string, clubMemberId: string) => [...ratingKeys.details(), matchId, clubMemberId] as const,
};

// ============================================================================
// useRatingsQuery Hook - Get all ratings for a match
// ============================================================================

interface UseRatingsQueryReturn {
  ratings: PlayerRatingWithMember[];
  isLoading: boolean;
  error: Error | null;
}

export function useRatingsQuery(matchId: string): UseRatingsQueryReturn {
  const { data: session, isLoading: sessionLoading } = useSession();

  const { data: ratings = [], isLoading: queryLoading, error } = useQuery({
    queryKey: ratingKeys.list(matchId),
    queryFn: async () => {
      const response = await authFetch(`/api/matches/${matchId}/ratings`);
      if (!response.ok) throw new Error('Failed to fetch ratings');
      return response.json() as Promise<PlayerRatingWithMember[]>;
    },
    enabled: !!session?.user?.id && !sessionLoading && !!matchId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    ratings,
    isLoading: sessionLoading || queryLoading,
    error: error as Error | null,
  };
}

// ============================================================================
// useUpsertRatingMutation Hook - Create or update a rating
// ============================================================================

interface UseUpsertRatingMutationReturn {
  upsertRating: (data: RatingInput) => Promise<void>;
  isPending: boolean;
  error: Error | null;
}

export function useUpsertRatingMutation(matchId: string): UseUpsertRatingMutationReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: RatingInput) => {
      await upsertRatingAction(data);
    },
    onSuccess: (_, variables) => {
      // Invalidate ratings list and specific rating
      queryClient.invalidateQueries({ queryKey: ratingKeys.list(matchId) });
      queryClient.invalidateQueries({ 
        queryKey: ratingKeys.detail(matchId, variables.clubMemberId) 
      });
    },
  });

  return {
    upsertRating: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

// ============================================================================
// useDeleteRatingMutation Hook - Delete a rating
// ============================================================================

interface UseDeleteRatingMutationReturn {
  deleteRating: (clubMemberId: string) => Promise<void>;
  isPending: boolean;
  error: Error | null;
}

export function useDeleteRatingMutation(matchId: string): UseDeleteRatingMutationReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (clubMemberId: string) => {
      await deleteRatingAction(matchId, clubMemberId);
    },
    onSuccess: (_, clubMemberId) => {
      // Invalidate ratings list and specific rating
      queryClient.invalidateQueries({ queryKey: ratingKeys.list(matchId) });
      queryClient.invalidateQueries({ 
        queryKey: ratingKeys.detail(matchId, clubMemberId) 
      });
    },
  });

  return {
    deleteRating: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

// ============================================================================
// useBulkUpsertRatingsMutation Hook - Bulk update ratings
// ============================================================================

interface UseBulkUpsertRatingsMutationReturn {
  bulkUpsertRatings: (ratings: RatingInput[]) => Promise<void>;
  isPending: boolean;
  error: Error | null;
}

export function useBulkUpsertRatingsMutation(matchId: string): UseBulkUpsertRatingsMutationReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (ratings: RatingInput[]) => {
      await bulkUpsertRatingsAction(ratings);
    },
    onSuccess: () => {
      // Invalidate all ratings for this match
      queryClient.invalidateQueries({ queryKey: ratingKeys.list(matchId) });
    },
  });

  return {
    bulkUpsertRatings: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

// Backward compatibility exports
export { useRatingsQuery as useRatingsReactQuery };
