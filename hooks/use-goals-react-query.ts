import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/components/providers/session-provider';
import { authFetch } from '@/lib/auth-fetch';
import { 
  addGoalAction, 
  removeGoalAction 
} from '@/lib/actions/goals';
import type { GoalWithMembers, AddGoalInput } from '@/lib/db/goals';

// Query keys
export const goalKeys = {
  all: ['goals'] as const,
  lists: () => [...goalKeys.all, 'list'] as const,
  list: (matchId: string) => [...goalKeys.lists(), matchId] as const,
};

// ============================================================================
// useGoalsQuery Hook - Get all goals for a match
// ============================================================================

interface UseGoalsQueryReturn {
  goals: GoalWithMembers[];
  isLoading: boolean;
  error: Error | null;
}

export function useGoalsQuery(matchId: string): UseGoalsQueryReturn {
  const { data: session, isLoading: sessionLoading } = useSession();

  const { data: goals = [], isLoading: queryLoading, error } = useQuery({
    queryKey: goalKeys.list(matchId),
    queryFn: async () => {
      const response = await authFetch(`/api/matches/${matchId}/goals`);
      if (!response.ok) throw new Error('Failed to fetch goals');
      return response.json() as Promise<GoalWithMembers[]>;
    },
    enabled: !!session?.user?.id && !sessionLoading && !!matchId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    goals,
    isLoading: sessionLoading || queryLoading,
    error: error as Error | null,
  };
}

// ============================================================================
// useAddGoalMutation Hook - Add goal with optimistic update
// ============================================================================

interface UseAddGoalMutationReturn {
  addGoal: (data: AddGoalInput) => Promise<void>;
  isPending: boolean;
  error: Error | null;
}

export function useAddGoalMutation(matchId: string): UseAddGoalMutationReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: AddGoalInput) => {
      await addGoalAction(data);
    },
    onMutate: async (data) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: goalKeys.list(matchId) });

      // Snapshot previous value
      const previousGoals = queryClient.getQueryData<GoalWithMembers[]>(goalKeys.list(matchId));

        // Optimistically add the goal
      if (previousGoals) {
        const optimisticGoal: GoalWithMembers = {
          id: `temp-${Date.now()}`,
          matchId: data.matchId,
          scorerId: data.scorerId,
          assisterId: data.assisterId || null,
          isOwnGoal: data.isOwnGoal || false,
          order: previousGoals.length + 1,
          createdAt: new Date(),
          scorer: null as any, // Will be populated by refetch
          assister: null,
        } as GoalWithMembers;
        queryClient.setQueryData(goalKeys.list(matchId), [...previousGoals, optimisticGoal]);
      }

      return { previousGoals };
    },
    onError: (err, data, context) => {
      // Rollback on error
      if (context?.previousGoals) {
        queryClient.setQueryData(goalKeys.list(matchId), context.previousGoals);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: goalKeys.list(matchId) });
    },
  });

  return {
    addGoal: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

// ============================================================================
// useRemoveGoalMutation Hook - Remove goal with optimistic update
// ============================================================================

interface UseRemoveGoalMutationReturn {
  removeGoal: (goalId: string) => Promise<void>;
  isPending: boolean;
  error: Error | null;
}

export function useRemoveGoalMutation(matchId: string): UseRemoveGoalMutationReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (goalId: string) => {
      await removeGoalAction(goalId, matchId);
    },
    onMutate: async (goalId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: goalKeys.list(matchId) });

      // Snapshot previous value
      const previousGoals = queryClient.getQueryData<GoalWithMembers[]>(goalKeys.list(matchId));

      // Optimistically remove the goal
      if (previousGoals) {
        queryClient.setQueryData(
          goalKeys.list(matchId),
          previousGoals.filter(goal => goal.id !== goalId)
        );
      }

      return { previousGoals };
    },
    onError: (err, goalId, context) => {
      // Rollback on error
      if (context?.previousGoals) {
        queryClient.setQueryData(goalKeys.list(matchId), context.previousGoals);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: goalKeys.list(matchId) });
    },
  });

  return {
    removeGoal: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

// Backward compatibility exports
export { useGoalsQuery as useGoalsReactQuery };
