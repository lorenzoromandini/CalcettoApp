/**
 * Players React Hooks
 * 
 * Provides data fetching and mutations for player management with
 * loading states, error handling, and cache invalidation.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  getPlayersByTeam, 
  createPlayer, 
  updatePlayer, 
  deletePlayer,
  addPlayerToTeam,
  removePlayerFromTeam
} from '@/lib/db/players';
import type { Player, PlayerTeam } from '@/lib/db/schema';
import type { CreatePlayerInput, UpdatePlayerInput } from '@/lib/validations/player';

// ============================================================================
// usePlayers Hook - Get all players for a team
// ============================================================================

interface UsePlayersReturn {
  players: (Player & { jersey_number?: number; player_team_id: string })[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function usePlayers(teamId: string | null): UsePlayersReturn {
  const [players, setPlayers] = useState<(Player & { jersey_number?: number; player_team_id: string })[]>([]);
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
      const teamPlayers = await getPlayersByTeam(teamId);
      setPlayers(teamPlayers);
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

// ============================================================================
// useCreatePlayer Hook - Create player mutation
// ============================================================================

interface UseCreatePlayerReturn {
  createPlayer: (data: CreatePlayerInput, avatarBlob?: Blob) => Promise<Player & { jersey_number: number; player_team_id: string }>;
  isPending: boolean;
  error: Error | null;
}

export function useCreatePlayer(teamId: string | null): UseCreatePlayerReturn {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createPlayerMutation = useCallback(async (
    data: CreatePlayerInput, 
    avatarBlob?: Blob
  ): Promise<Player & { jersey_number: number; player_team_id: string }> => {
    if (!teamId) {
      throw new Error('Team ID is required');
    }

    setIsPending(true);
    setError(null);

    try {
      const player = await createPlayer(data, teamId, avatarBlob);
      return player;
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

// ============================================================================
// useUpdatePlayer Hook - Update player mutation
// ============================================================================

interface UseUpdatePlayerReturn {
  updatePlayer: (playerId: string, data: UpdatePlayerInput, avatarBlob?: Blob) => Promise<Player>;
  isPending: boolean;
  error: Error | null;
}

export function useUpdatePlayer(): UseUpdatePlayerReturn {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updatePlayerMutation = useCallback(async (
    playerId: string, 
    data: UpdatePlayerInput, 
    avatarBlob?: Blob
  ): Promise<Player> => {
    setIsPending(true);
    setError(null);

    try {
      const player = await updatePlayer(playerId, data, avatarBlob);
      return player;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update player');
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    updatePlayer: updatePlayerMutation,
    isPending,
    error,
  };
}

// ============================================================================
// useDeletePlayer Hook - Delete player mutation
// ============================================================================

interface UseDeletePlayerReturn {
  deletePlayer: (playerId: string) => Promise<void>;
  isPending: boolean;
  error: Error | null;
}

export function useDeletePlayer(): UseDeletePlayerReturn {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deletePlayerMutation = useCallback(async (playerId: string): Promise<void> => {
    setIsPending(true);
    setError(null);

    try {
      await deletePlayer(playerId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete player');
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    deletePlayer: deletePlayerMutation,
    isPending,
    error,
  };
}

// ============================================================================
// useAddPlayerToTeam Hook - Add existing player to team
// ============================================================================

interface UseAddPlayerToTeamReturn {
  addPlayerToTeam: (playerId: string, jerseyNumber: number) => Promise<PlayerTeam>;
  isPending: boolean;
  error: Error | null;
}

export function useAddPlayerToTeam(teamId: string | null): UseAddPlayerToTeamReturn {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const addPlayerMutation = useCallback(async (
    playerId: string, 
    jerseyNumber: number
  ): Promise<PlayerTeam> => {
    if (!teamId) {
      throw new Error('Team ID is required');
    }

    setIsPending(true);
    setError(null);

    try {
      const playerTeam = await addPlayerToTeam(playerId, teamId, jerseyNumber);
      return playerTeam;
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

// ============================================================================
// useRemovePlayerFromTeam Hook - Remove player from team
// ============================================================================

interface UseRemovePlayerFromTeamReturn {
  removePlayerFromTeam: (playerTeamId: string) => Promise<void>;
  isPending: boolean;
  error: Error | null;
}

export function useRemovePlayerFromTeam(): UseRemovePlayerFromTeamReturn {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const removePlayerMutation = useCallback(async (playerTeamId: string): Promise<void> => {
    setIsPending(true);
    setError(null);

    try {
      await removePlayerFromTeam(playerTeamId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to remove player from team');
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    removePlayerFromTeam: removePlayerMutation,
    isPending,
    error,
  };
}
