import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/components/providers/session-provider';
import { authFetch } from '@/lib/auth-fetch';
import { 
  createClubAction, 
  updateClubAction, 
  deleteClubAction 
} from '@/lib/actions/clubs';
import type { Club } from '@/lib/db/schema';
import type { CreateClubInput, UpdateClubInput } from '@/lib/validations/club';

// Query keys
export const clubKeys = {
  all: ['clubs'] as const,
  lists: () => [...clubKeys.all, 'list'] as const,
  list: (filters: string) => [...clubKeys.lists(), { filters }] as const,
  details: () => [...clubKeys.all, 'detail'] as const,
  detail: (id: string) => [...clubKeys.details(), id] as const,
};

// Club with memberCount from getUserClubs
type ClubWithMemberCount = Club & { memberCount: number };

// ============================================================================
// useClubsQuery Hook - Get all clubs for current user
// ============================================================================

interface UseClubsQueryReturn {
  clubs: ClubWithMemberCount[];
  isLoading: boolean;
  error: Error | null;
}

export function useClubsQuery(): UseClubsQueryReturn {
  const { data: session, isLoading: sessionLoading } = useSession();

  const { data: clubs = [], isLoading: queryLoading, error } = useQuery({
    queryKey: clubKeys.lists(),
    queryFn: async () => {
      const response = await authFetch('/api/clubs');
      if (!response.ok) throw new Error('Failed to fetch clubs');
      return response.json() as Promise<ClubWithMemberCount[]>;
    },
    enabled: !!session?.user?.id && !sessionLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    clubs,
    isLoading: sessionLoading || queryLoading,
    error: error as Error | null,
  };
}

// ============================================================================
// useClubQuery Hook - Get single club details
// ============================================================================

interface UseClubQueryReturn {
  club: Club | null;
  isLoading: boolean;
  error: Error | null;
}

export function useClubQuery(clubId: string | null): UseClubQueryReturn {
  const { data: club, isLoading, error } = useQuery({
    queryKey: clubKeys.detail(clubId || ''),
    queryFn: async () => {
      if (!clubId) return null;
      const response = await authFetch(`/api/clubs/${clubId}`);
      if (!response.ok) throw new Error('Failed to fetch club');
      return response.json() as Promise<Club>;
    },
    enabled: !!clubId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    club: club || null,
    isLoading,
    error: error as Error | null,
  };
}

// ============================================================================
// useCreateClubMutation Hook - Create club with optimistic update
// ============================================================================

interface UseCreateClubMutationReturn {
  createClub: (data: CreateClubInput) => Promise<string>;
  isPending: boolean;
  error: Error | null;
}

export function useCreateClubMutation(): UseCreateClubMutationReturn {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const mutation = useMutation({
    mutationFn: async (data: CreateClubInput) => {
      const result = await createClubAction(data);
      return result.id;
    },
    onSuccess: () => {
      // Invalidate and refetch clubs list
      queryClient.invalidateQueries({ queryKey: clubKeys.lists() });
    },
  });

  return {
    createClub: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

// ============================================================================
// useUpdateClubMutation Hook - Update club
// ============================================================================

interface UseUpdateClubMutationReturn {
  updateClub: (clubId: string, data: UpdateClubInput) => Promise<void>;
  isPending: boolean;
  error: Error | null;
}

export function useUpdateClubMutation(): UseUpdateClubMutationReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ clubId, data }: { clubId: string; data: UpdateClubInput }) => {
      await updateClubAction(clubId, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate specific club and list
      queryClient.invalidateQueries({ queryKey: clubKeys.detail(variables.clubId) });
      queryClient.invalidateQueries({ queryKey: clubKeys.lists() });
    },
  });

  return {
    updateClub: (clubId, data) => mutation.mutateAsync({ clubId, data }),
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

// ============================================================================
// useDeleteClubMutation Hook - Delete club with optimistic update
// ============================================================================

interface UseDeleteClubMutationReturn {
  deleteClub: (clubId: string) => Promise<void>;
  isPending: boolean;
  error: Error | null;
}

export function useDeleteClubMutation(): UseDeleteClubMutationReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (clubId: string) => {
      await deleteClubAction(clubId);
    },
    onMutate: async (clubId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: clubKeys.lists() });

      // Snapshot previous value
      const previousClubs = queryClient.getQueryData<ClubWithMemberCount[]>(clubKeys.lists());

      // Optimistically remove the club
      if (previousClubs) {
        queryClient.setQueryData(
          clubKeys.lists(),
          previousClubs.filter(club => club.id !== clubId)
        );
      }

      return { previousClubs };
    },
    onError: (err, clubId, context) => {
      // Rollback on error
      if (context?.previousClubs) {
        queryClient.setQueryData(clubKeys.lists(), context.previousClubs);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: clubKeys.lists() });
    },
  });

  return {
    deleteClub: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

// Backward compatibility exports
export { useClubsQuery as useClubsReactQuery, useClubQuery as useClubReactQuery };
