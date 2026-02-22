/**
 * Teams React Hooks - NextAuth Version
 * 
 * Provides data fetching and mutations for team management.
 * Uses NextAuth for authentication.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from '@/components/providers/session-provider';
import { authFetch } from '@/lib/auth-fetch';
import type { Team } from '@/lib/db/schema';
import type { CreateClubInput, UpdateClubInput } from '@/lib/validations/club';

// ============================================================================
// useClubs Hook - Get all teams for current user
// ============================================================================

interface UseTeamsReturn {
  teams: Team[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useClubs(): UseTeamsReturn {
  const { data: session, isLoading: sessionLoading } = useSession();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTeams = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authFetch('/api/teams');
      if (!response.ok) throw new Error('Failed to fetch teams');
      const data = await response.json();
      setTeams(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch teams'));
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (!sessionLoading) {
      fetchTeams();
    }
  }, [sessionLoading, fetchTeams]);

  return {
    teams,
    isLoading,
    error,
    refetch: fetchTeams,
  };
}

// ============================================================================
// useClub Hook - Get single team details
// ============================================================================

interface UseTeamReturn {
  club: Team | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useClub(clubId: string | null): UseTeamReturn {
  const [club, setClub] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(!!clubId);
  const [error, setError] = useState<Error | null>(null);

  const fetchClub = useCallback(async () => {
    if (!clubId) {
      setClub(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authFetch(`/api/clubs/${clubId}`);
      if (!response.ok) throw new Error('Failed to fetch club');
      const data = await response.json();
      setClub(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch club'));
    } finally {
      setIsLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    fetchClub();
  }, [fetchClub]);

  return {
    club,
    isLoading,
    error,
    refetch: fetchClub,
  };
}

// ============================================================================
// useCreateTeam Hook - Create team mutation
// ============================================================================

interface UseCreateTeamReturn {
  createTeam: (data: CreateClubInput) => Promise<string>;
  isPending: boolean;
  error: Error | null;
}

export function useCreateTeam(): UseCreateTeamReturn {
  const { data: session } = useSession();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createTeam = useCallback(async (data: CreateClubInput): Promise<string> => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    setIsPending(true);
    setError(null);

    try {
      const response = await authFetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create team');
      const result = await response.json();
      return result.id;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create team');
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, [session?.user?.id]);

  return {
    createTeam,
    isPending,
    error,
  };
}

// ============================================================================
// useUpdateTeam Hook - Update team mutation
// ============================================================================

interface UseUpdateTeamReturn {
  updateTeam: (clubId: string, data: UpdateClubInput) => Promise<void>;
  isPending: boolean;
  error: Error | null;
}

export function useUpdateTeam(): UseUpdateTeamReturn {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateTeam = useCallback(async (clubId: string, data: UpdateClubInput): Promise<void> => {
    setIsPending(true);
    setError(null);

    try {
      const response = await authFetch(`/api/clubs/${clubId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update team');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update team');
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    updateTeam,
    isPending,
    error,
  };
}

// ============================================================================
// useDeleteTeam Hook - Delete team mutation
// ============================================================================

interface UseDeleteTeamReturn {
  deleteTeam: (clubId: string) => Promise<void>;
  isPending: boolean;
  error: Error | null;
}

export function useDeleteTeam(): UseDeleteTeamReturn {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteTeam = useCallback(async (clubId: string): Promise<void> => {
    setIsPending(true);
    setError(null);

    try {
      const response = await authFetch(`/api/clubs/${clubId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete team');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete team');
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    deleteTeam,
    isPending,
    error,
  };
}
