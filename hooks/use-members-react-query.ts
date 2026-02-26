import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/components/providers/session-provider';
import { authFetch } from '@/lib/auth-fetch';
import { 
  updateMemberAction, 
  removeMemberAction 
} from '@/lib/actions/members';
import type { ClubMember, User, PlayerRole } from '@/types/database';

// Re-export PlayerRole for backward compatibility
export type { PlayerRole };

export interface MemberWithUser extends ClubMember {
  user: User | null;
}

// Query keys
export const memberKeys = {
  all: ['members'] as const,
  lists: () => [...memberKeys.all, 'list'] as const,
  list: (clubId: string) => [...memberKeys.lists(), clubId] as const,
  details: () => [...memberKeys.all, 'detail'] as const,
  detail: (clubId: string, memberId: string) => [...memberKeys.details(), clubId, memberId] as const,
};

// ============================================================================
// useMembersQuery Hook - Get all members for a club
// ============================================================================

interface UseMembersQueryReturn {
  members: MemberWithUser[];
  isLoading: boolean;
  error: Error | null;
}

export function useMembersQuery(clubId: string | null): UseMembersQueryReturn {
  const { data: session, isLoading: sessionLoading } = useSession();

  const { data: members = [], isLoading: queryLoading, error } = useQuery({
    queryKey: clubId ? memberKeys.list(clubId) : memberKeys.lists(),
    queryFn: async () => {
      if (!clubId) return [];
      const response = await authFetch(`/api/clubs/${clubId}/members`);
      if (!response.ok) throw new Error('Failed to fetch members');
      return response.json() as Promise<MemberWithUser[]>;
    },
    enabled: !!session?.user?.id && !sessionLoading && !!clubId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    members,
    isLoading: sessionLoading || queryLoading,
    error: error as Error | null,
  };
}

// ============================================================================
// useUpdateMemberMutation Hook - Update member
// ============================================================================

interface UseUpdateMemberMutationReturn {
  updateMember: (memberId: string, data: Partial<ClubMember>) => Promise<void>;
  isPending: boolean;
  error: Error | null;
}

export function useUpdateMemberMutation(clubId: string): UseUpdateMemberMutationReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ memberId, data }: { memberId: string; data: Partial<ClubMember> }) => {
      await updateMemberAction(clubId, memberId, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate members list and specific member
      queryClient.invalidateQueries({ queryKey: memberKeys.list(clubId) });
      queryClient.invalidateQueries({ 
        queryKey: memberKeys.detail(clubId, variables.memberId) 
      });
    },
  });

  return {
    updateMember: (memberId, data) => mutation.mutateAsync({ memberId, data }),
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

// ============================================================================
// useRemoveMemberMutation Hook - Remove member with optimistic update
// ============================================================================

interface UseRemoveMemberMutationReturn {
  removeMember: (memberId: string) => Promise<void>;
  isPending: boolean;
  error: Error | null;
}

export function useRemoveMemberMutation(clubId: string): UseRemoveMemberMutationReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (memberId: string) => {
      await removeMemberAction(clubId, memberId);
    },
    onMutate: async (memberId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: memberKeys.list(clubId) });

      // Snapshot previous value
      const previousMembers = queryClient.getQueryData<MemberWithUser[]>(memberKeys.list(clubId));

      // Optimistically remove the member
      if (previousMembers) {
        queryClient.setQueryData(
          memberKeys.list(clubId),
          previousMembers.filter(member => member.id !== memberId)
        );
      }

      return { previousMembers };
    },
    onError: (err, memberId, context) => {
      // Rollback on error
      if (context?.previousMembers) {
        queryClient.setQueryData(memberKeys.list(clubId), context.previousMembers);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: memberKeys.list(clubId) });
    },
  });

  return {
    removeMember: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

// Backward compatibility exports
export { useMembersQuery as useMembersReactQuery };
