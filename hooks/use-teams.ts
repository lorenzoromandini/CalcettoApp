/**
 * Teams React Hooks - NextAuth Version
 * 
 * Provides data fetching and mutations for team management.
 * Uses NextAuth for authentication.
 */

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { 
  getUserTeams, 
  getTeam, 
  createTeam as createTeamDB, 
  updateTeam as updateTeamDB,
  deleteTeam as deleteTeamDB 
} from '@/lib/db/teams';
import type { Team } from '@/lib/db/schema';
import type { CreateTeamInput, UpdateTeamInput } from '@/lib/validations/team';

// ============================================================================
// useTeams Hook - Get all teams for current user
// ============================================================================

interface UseTeamsReturn {
  teams: Team[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useTeams(): UseTeamsReturn {
  const { data: session } = useSession();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTeams = useCallback(async () => {
    if (!session?.user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userTeams = await getUserTeams(session.user.id);
      setTeams(userTeams);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch teams'));
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return {
    teams,
    isLoading,
    error,
    refetch: fetchTeams,
  };
}

// ============================================================================
// useTeam Hook - Get single team details
// ============================================================================

interface UseTeamReturn {
  team: Team | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useTeam(teamId: string | null): UseTeamReturn {
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(!!teamId);
  const [error, setError] = useState<Error | null>(null);

  const fetchTeam = useCallback(async () => {
    if (!teamId) {
      setTeam(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const teamData = await getTeam(teamId);
      setTeam(teamData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch team'));
    } finally {
      setIsLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  return {
    team,
    isLoading,
    error,
    refetch: fetchTeam,
  };
}

// ============================================================================
// useCreateTeam Hook - Create team mutation
// ============================================================================

interface UseCreateTeamReturn {
  createTeam: (data: CreateTeamInput) => Promise<string>;
  isPending: boolean;
  error: Error | null;
}

export function useCreateTeam(): UseCreateTeamReturn {
  const { data: session } = useSession();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createTeam = useCallback(async (data: CreateTeamInput): Promise<string> => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    setIsPending(true);
    setError(null);

    try {
      const teamId = await createTeamDB(data, session.user.id);
      return teamId;
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
  updateTeam: (teamId: string, data: UpdateTeamInput) => Promise<void>;
  isPending: boolean;
  error: Error | null;
}

export function useUpdateTeam(): UseUpdateTeamReturn {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateTeam = useCallback(async (teamId: string, data: UpdateTeamInput): Promise<void> => {
    setIsPending(true);
    setError(null);

    try {
      await updateTeamDB(teamId, data);
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
  deleteTeam: (teamId: string) => Promise<void>;
  isPending: boolean;
  error: Error | null;
}

export function useDeleteTeam(): UseDeleteTeamReturn {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteTeam = useCallback(async (teamId: string): Promise<void> => {
    setIsPending(true);
    setError(null);

    try {
      await deleteTeamDB(teamId);
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
