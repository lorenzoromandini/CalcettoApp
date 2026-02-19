import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import type { Player, PlayerTeam } from '@/lib/db/schema';
import type { CreatePlayerInput, UpdatePlayerInput } from '@/lib/validations/player';

interface UsePlayersReturn {
  players: (Player & { jersey_number?: number })[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function usePlayers(teamId: string | null): UsePlayersReturn {
  const [players, setPlayers] = useState<(Player & { jersey_number?: number })[]>([]);
  const [isLoading, setIsLoading] = useState(!!teamId);
  const [error, setError] = useState<Error | null>(null);

  const fetchPlayers = useCallback(async () => {
    if (!teamId) {
      setPlayers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/teams/${teamId}/players`);
      if (!response.ok) throw new Error('Failed to fetch players');
      const data = await response.json();
      setPlayers(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch players'));
    } finally {
      setIsLoading(false);
    }
  }, [teamId]);

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

export function useCreatePlayer(teamId: string | null): UseCreatePlayerReturn {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createPlayerMutation = useCallback(async (
    data: CreatePlayerInput
  ): Promise<string> => {
    if (!teamId) {
      throw new Error('Team ID is required');
    }

    setIsPending(true);
    setError(null);

    try {
      const response = await fetch(`/api/teams/${teamId}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create player');
      const result = await response.json();
      return result.id;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create player');
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, [teamId]);

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

export function useUpdatePlayer(teamId?: string): UseUpdatePlayerReturn {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updatePlayerMutation = useCallback(async (
    playerId: string, 
    data: UpdatePlayerInput
  ): Promise<void> => {
    setIsPending(true);
    setError(null);

    try {
      const response = await fetch(`/api/teams/${teamId}/players/${playerId}`, {
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
  }, [teamId]);

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

export function useDeletePlayer(teamId: string): UseDeletePlayerReturn {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deletePlayerMutation = useCallback(async (playerId: string): Promise<void> => {
    setIsPending(true);
    setError(null);

    try {
      const response = await fetch(`/api/teams/${teamId}/players/${playerId}`, {
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
  }, [teamId]);

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

export function useAddPlayerToTeam(teamId: string | null): UseAddPlayerToTeamReturn {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const addPlayerMutation = useCallback(async (
    playerId: string, 
    jerseyNumber: number
  ): Promise<void> => {
    if (!teamId) {
      throw new Error('Team ID is required');
    }

    setIsPending(true);
    setError(null);

    try {
      const response = await fetch(`/api/teams/${teamId}/players/${playerId}/add`, {
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
  }, [teamId]);

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

export function useRemovePlayerFromTeam(teamId: string | null): UseRemovePlayerFromTeamReturn {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const removePlayerMutation = useCallback(async (playerId: string): Promise<void> => {
    if (!teamId) {
      throw new Error('Team ID is required');
    }

    setIsPending(true);
    setError(null);

    try {
      const response = await fetch(`/api/teams/${teamId}/players/${playerId}/remove`, {
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
  }, [teamId]);

  return {
    removePlayerFromTeam: removePlayerMutation,
    isPending,
    error,
  };
}
