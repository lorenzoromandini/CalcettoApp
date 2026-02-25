import { useState, useEffect, useCallback } from 'react';
import { authFetch } from '@/lib/auth-fetch';
import type { ClubMember, User, PlayerRole } from '@/types/database';

// Re-export PlayerRole for backward compatibility
export type { PlayerRole };

export interface MemberWithUser extends ClubMember {
  user: User | null;
}

interface UseMembersReturn {
  members: MemberWithUser[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useMembers(clubId: string | null): UseMembersReturn {
  const [members, setMembers] = useState<MemberWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(!!clubId);
  const [error, setError] = useState<Error | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!clubId) {
      setMembers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authFetch(`/api/clubs/${clubId}/members`);
      if (!response.ok) throw new Error('Failed to fetch members');
      const data = await response.json();
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch members'));
    } finally {
      setIsLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return {
    members,
    isLoading,
    error,
    refetch: fetchMembers,
  };
}

// Backward compatibility - useMembers is the new usePlayers
export const usePlayers = useMembers;

interface UseUpdateMemberReturn {
  updateMember: (memberId: string, data: Partial<ClubMember>) => Promise<void>;
  isPending: boolean;
  error: Error | null;
}

export function useUpdateMember(clubId?: string): UseUpdateMemberReturn {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateMemberMutation = useCallback(async (
    memberId: string, 
    data: Partial<ClubMember>
  ): Promise<void> => {
    if (!clubId) throw new Error('Club ID is required');
    
    setIsPending(true);
    setError(null);

    try {
      const response = await authFetch(`/api/clubs/${clubId}/members/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update member');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update member');
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, [clubId]);

  return {
    updateMember: updateMemberMutation,
    isPending,
    error,
  };
}

// Backward compatibility
export const useUpdatePlayer = useUpdateMember;

interface UseRemoveMemberReturn {
  removeMember: (memberId: string) => Promise<void>;
  isPending: boolean;
  error: Error | null;
}

export function useRemoveMember(clubId: string | null): UseRemoveMemberReturn {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const removeMemberMutation = useCallback(async (memberId: string): Promise<void> => {
    if (!clubId) throw new Error('Club ID is required');
    
    setIsPending(true);
    setError(null);

    try {
      const response = await authFetch(`/api/clubs/${clubId}/members/${memberId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove member');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to remove member');
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, [clubId]);

  return {
    removeMember: removeMemberMutation,
    isPending,
    error,
  };
}

// Backward compatibility
export const useDeletePlayer = useRemoveMember;
export const useRemovePlayerFromTeam = useRemoveMember;
