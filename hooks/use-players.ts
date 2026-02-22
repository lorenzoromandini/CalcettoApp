import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/components/providers/session-provider';
import { authFetch } from '@/lib/auth-fetch';
import type { Player, PlayerClub } from '@/lib/db/schema';
import type { CreatePlayerInput, UpdatePlayerInput } from '@/lib/validations/player';

interface UsePlayersReturn {
  players: (Player & { jersey_number?: number })[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function usePlayers(clubId: string | null): UsePlayersReturn {
  const [players, setPlayers] = useState<(Player & { jersey_number?: number })[]>([]);
  const [isLoading, setIsLoading] = useState(!!clubId);
  const [error, setError] = useState<Error | null>(null);

  const fetchPlayers = useCallback(async () => {
    if (!clubId) {
      setPlayers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authFetch(`/api/clubs/${clubId}/players`);
      if (!response.ok) throw new Error('Failed to fetch players');
      const data = await response.json();
      setPlayers(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch players'));
    } finally {
      setIsLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  return {
    players,
    isLoading,
    error,
    refetch: fetchPlayers,
  };
}

interface UseCreatePlayerReturn {
  createPlayer: (data: CreatePlayerInput) => Promise<string>;
  isPending: boolean;
  error: Error | null;
}

export function useCreatePlayer(clubId: string | null): UseCreatePlayerReturn {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createPlayerMutation = useCallback(async (
    data: CreatePlayerInput
  ): Promise<string> => {
    if (!clubId) {
      throw new Error('Team ID is required');
    }

    setIsPending(true);
    setError(null);

    try {
      const response = await authFetch(`/api/clubs/${clubId}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create player');
      }
      const result = await response.json();
      return result.id;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create player');
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, [clubId]);

  return {
    createPlayer: createPlayerMutation,
    isPending,
    error,
  };
}

interface UseUpdatePlayerReturn {
  updatePlayer: (playerId: string, data: UpdatePlayerInput) => Promise<void>;
  isPending: boolean;
  error: Error | null;
}

export function useUpdatePlayer(clubId?: string): UseUpdatePlayerReturn {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updatePlayerMutation = useCallback(async (
    playerId: string, 
    data: UpdatePlayerInput
  ): Promise<void> => {
    setIsPending(true);
    setError(null);

    try {
      const response = await authFetch(`/api/clubs/${clubId}/players/${playerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update player');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update player');
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, [clubId]);

  return {
    updatePlayer: updatePlayerMutation,
    isPending,
    error,
  };
}

interface UseDeletePlayerReturn {
  deletePlayer: (playerId: string) => Promise<void>;
  isPending: boolean;
  error: Error | null;
}

export function useDeletePlayer(clubId: string): UseDeletePlayerReturn {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deletePlayerMutation = useCallback(async (playerId: string): Promise<void> => {
    setIsPending(true);
    setError(null);

    try {
      const response = await authFetch(`/api/clubs/${clubId}/players/${playerId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete player');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete player');
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, [clubId]);

  return {
    deletePlayer: deletePlayerMutation,
    isPending,
    error,
  };
}

interface UseAddPlayerToTeamReturn {
  addPlayerToTeam: (playerId: string, jerseyNumber: number) => Promise<void>;
  isPending: boolean;
  error: Error | null;
}

export function useAddPlayerToTeam(clubId: string | null): UseAddPlayerToTeamReturn {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const addPlayerMutation = useCallback(async (
    playerId: string, 
    jerseyNumber: number
  ): Promise<void> => {
    if (!clubId) {
      throw new Error('Team ID is required');
    }

    setIsPending(true);
    setError(null);

    try {
      const response = await authFetch(`/api/clubs/${clubId}/players/${playerId}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jerseyNumber }),
      });
      if (!response.ok) throw new Error('Failed to add player to team');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add player to team');
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, [clubId]);

  return {
    addPlayerToTeam: addPlayerMutation,
    isPending,
    error,
  };
}

interface UseRemovePlayerFromTeamReturn {
  removePlayerFromTeam: (playerId: string) => Promise<void>;
  isPending: boolean;
  error: Error | null;
}

export function useRemovePlayerFromTeam(clubId: string | null): UseRemovePlayerFromTeamReturn {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const removePlayerMutation = useCallback(async (playerId: string): Promise<void> => {
    if (!clubId) {
      throw new Error('Team ID is required');
    }

    setIsPending(true);
    setError(null);

    try {
      const response = await authFetch(`/api/clubs/${clubId}/players/${playerId}/remove`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to remove player from team');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to remove player from team');
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, [clubId]);

  return {
    removePlayerFromTeam: removePlayerMutation,
    isPending,
    error,
  };
}
