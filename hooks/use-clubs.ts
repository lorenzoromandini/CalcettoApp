/**
 * Clubs React Hooks - NextAuth Version
 * 
 * Provides data fetching and mutations for club management.
 * Uses NextAuth for authentication.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from '@/components/providers/session-provider';
import { authFetch } from '@/lib/auth-fetch';
import { createClubAction, updateClubAction, deleteClubAction } from '@/lib/actions/clubs';
import type { Club } from '@/lib/db/schema';
import type { CreateClubInput, UpdateClubInput } from '@/lib/validations/club';

// Club with memberCount from getUserClubs
type ClubWithMemberCount = Club & { memberCount: number };

// ============================================================================
// useClubs Hook - Get all clubs for current user
// ============================================================================

interface UseClubsReturn {
  clubs: ClubWithMemberCount[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useClubs(): UseClubsReturn {
  const { data: session, isLoading: sessionLoading } = useSession();
  const [clubs, setClubs] = useState<ClubWithMemberCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchClubs = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authFetch('/api/clubs');
      if (!response.ok) throw new Error('Failed to fetch clubs');
      const data = await response.json();
      setClubs(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch clubs'));
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (!sessionLoading) {
      fetchClubs();
    }
  }, [sessionLoading, fetchClubs]);

  return {
    clubs,
    isLoading,
    error,
    refetch: fetchClubs,
  };
}

// ============================================================================
// useClub Hook - Get single club details
// ============================================================================

interface UseClubReturn {
  club: Club | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useClub(clubId: string | null): UseClubReturn {
  const [club, setClub] = useState<Club | null>(null);
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
// useCreateClub Hook - Create club mutation
// Uses Server Actions for instant feedback
// ============================================================================

interface UseCreateClubReturn {
  createClub: (data: CreateClubInput) => Promise<string>;
  isPending: boolean;
  error: Error | null;
}

export function useCreateClub(): UseCreateClubReturn {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createClub = useCallback(async (data: CreateClubInput): Promise<string> => {
    setIsPending(true);
    setError(null);

    try {
      const result = await createClubAction(data);
      return result.id;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create club');
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    createClub,
    isPending,
    error,
  };
}

// ============================================================================
// useUpdateClub Hook - Update club mutation
// Uses Server Actions for instant feedback
// ============================================================================

interface UseUpdateClubReturn {
  updateClub: (clubId: string, data: UpdateClubInput) => Promise<void>;
  isPending: boolean;
  error: Error | null;
}

export function useUpdateClub(): UseUpdateClubReturn {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateClub = useCallback(async (clubId: string, data: UpdateClubInput): Promise<void> => {
    setIsPending(true);
    setError(null);

    try {
      await updateClubAction(clubId, data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update club');
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    updateClub,
    isPending,
    error,
  };
}

// ============================================================================
// useDeleteClub Hook - Delete club mutation
// Uses Server Actions for instant feedback
// ============================================================================

interface UseDeleteClubReturn {
  deleteClub: (clubId: string) => Promise<void>;
  isPending: boolean;
  error: Error | null;
}

export function useDeleteClub(): UseDeleteClubReturn {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteClub = useCallback(async (clubId: string): Promise<void> => {
    setIsPending(true);
    setError(null);

    try {
      await deleteClubAction(clubId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete club');
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    deleteClub,
    isPending,
    error,
  };
}

// Backward compatibility aliases
export const useTeams = useClubs;
export const useTeam = useClub;
export const useCreateTeam = useCreateClub;
export const useUpdateTeam = useUpdateClub;
export const useDeleteTeam = useDeleteClub;
export type { UseClubsReturn as UseTeamsReturn, UseClubReturn as UseTeamReturn, UseCreateClubReturn as UseCreateTeamReturn, UseUpdateClubReturn as UseUpdateTeamReturn, UseDeleteClubReturn as UseDeleteTeamReturn };
