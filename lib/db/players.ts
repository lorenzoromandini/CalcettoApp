/**
 * Player CRUD Operations with Offline Support and Multi-Team Support
 * 
 * ARCHITECTURE: Players are team-agnostic entities with personal data (name, avatar, roles).
 * The relationship to teams is stored in player_teams table with jersey_number per team.
 * A player can belong to multiple teams with different jersey numbers in each.
 */

import { getDB } from './index';
import { queueOfflineAction } from './actions';
import { createClient } from '@/lib/supabase/client';
import type { Player, PlayerTeam } from './schema';
import type { CreatePlayerInput, UpdatePlayerInput } from '@/lib/validations/player';

const supabase = createClient();

/**
 * Get player teams (teams a player belongs to with jersey numbers)
 */
export async function getPlayerTeams(playerId: string): Promise<PlayerTeam[]> {
  const db = await getDB();
  return await db.getAllFromIndex('player_teams', 'by-player-id', playerId);
}

/**
 * Get players by team ID with their team-specific data (jersey number)
 * Joins players with player_teams for the specified team
 */
export async function getPlayersByTeam(teamId: string): Promise<(Player & { jersey_number?: number; player_team_id: string })[]> {
  const db = await getDB();
  
  // Get all player_team relationships for this team
  const playerTeams = await db.getAllFromIndex('player_teams', 'by-team-id', teamId);
  
  // Get full player data for each
  const players: (Player & { jersey_number?: number; player_team_id: string })[] = [];
  for (const pt of playerTeams) {
    const player = await db.get('players', pt.player_id);
    if (player) {
      players.push({
        ...player,
        jersey_number: pt.jersey_number,
        player_team_id: pt.id,
      });
    }
  }
  
  return players;
}

/**
 * Get a single player by ID
 */
export async function getPlayer(id: string): Promise<Player | undefined> {
  const db = await getDB();
  return await db.get('players', id);
}

/**
 * Upload avatar to Supabase Storage
 */
export async function uploadAvatar(
  playerId: string,
  blob: Blob
): Promise<string | null> {
  try {
    const fileName = `players/${playerId}.jpg`;
    const { error } = await supabase.storage
      .from('avatars')
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error('Avatar upload failed:', error);
      return null;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
    return data.publicUrl;
  } catch (error) {
    console.error('Avatar upload error:', error);
    return null;
  }
}

/**
 * Create a new player and add them to a team
 * This creates both the player record and the player_teams relationship
 */
export async function createPlayer(
  data: CreatePlayerInput,
  teamId: string,
  avatarBlob?: Blob
): Promise<Player & { jersey_number: number; player_team_id: string }> {
  const db = await getDB();
  const now = new Date().toISOString();
  const playerId = crypto.randomUUID();
  const playerTeamId = crypto.randomUUID();

  // Upload avatar if provided
  let avatarUrl: string | undefined;
  if (avatarBlob) {
    avatarUrl = await uploadAvatar(playerId, avatarBlob) || undefined;
  }

  // Create player object (team-agnostic personal data)
  const player: Player = {
    id: playerId,
    name: data.name,
    surname: data.surname || '',
    nickname: data.nickname || undefined,
    avatar_url: avatarUrl,
    user_id: undefined,
    roles: data.roles,
    created_at: now,
    updated_at: now,
    sync_status: 'pending',
  };

  // Create player-team relationship (team-specific data)
  const playerTeam: PlayerTeam = {
    id: playerTeamId,
    player_id: playerId,
    team_id: teamId,
    jersey_number: data.jersey_number || 0,
    joined_at: now,
    created_at: now,
    sync_status: 'pending',
  };

  // Optimistic local writes
  await db.put('players', player);
  await db.put('player_teams', playerTeam);

  // Queue for sync - two separate actions
  await queueOfflineAction('create', 'players', {
    id: playerId,
    name: data.name,
    surname: data.surname,
    nickname: data.nickname,
    avatar_url: avatarUrl,
    roles: data.roles,
  });

  await queueOfflineAction('create', 'player_teams', {
    id: playerTeamId,
    player_id: playerId,
    team_id: teamId,
    jersey_number: data.jersey_number,
  });

  return {
    ...player,
    jersey_number: data.jersey_number || 0,
    player_team_id: playerTeamId,
  };
}

/**
 * Add an existing player to another team
 * Use case: Player already exists (maybe from another team), add to current team with different jersey number
 */
export async function addPlayerToTeam(
  playerId: string,
  teamId: string,
  jerseyNumber: number
): Promise<PlayerTeam> {
  const db = await getDB();
  const now = new Date().toISOString();
  const playerTeamId = crypto.randomUUID();

  // Check if player is already in this team
  const existing = await db.getAllFromIndex('player_teams', 'by-team-id', teamId);
  if (existing.some(pt => pt.player_id === playerId)) {
    throw new Error('Player is already a member of this team');
  }

  const playerTeam: PlayerTeam = {
    id: playerTeamId,
    player_id: playerId,
    team_id: teamId,
    jersey_number: jerseyNumber,
    joined_at: now,
    created_at: now,
    sync_status: 'pending',
  };

  await db.put('player_teams', playerTeam);

  await queueOfflineAction('create', 'player_teams', {
    id: playerTeamId,
    player_id: playerId,
    team_id: teamId,
    jersey_number: jerseyNumber,
  });

  return playerTeam;
}

/**
 * Update player's personal data (name, avatar, roles)
 * This affects the player across ALL teams they belong to
 */
export async function updatePlayer(
  playerId: string,
  data: UpdatePlayerInput,
  avatarBlob?: Blob
): Promise<Player> {
  const db = await getDB();
  const existing = await db.get('players', playerId);

  if (!existing) {
    throw new Error('Player not found');
  }

  // Upload new avatar if provided
  let avatarUrl = existing.avatar_url;
  if (avatarBlob) {
    avatarUrl = await uploadAvatar(playerId, avatarBlob) || existing.avatar_url;
  }

  const updated: Player = {
    ...existing,
    ...data,
    avatar_url: avatarUrl,
    updated_at: new Date().toISOString(),
    sync_status: 'pending',
  };

  await db.put('players', updated);

  await queueOfflineAction('update', 'players', {
    id: playerId,
    ...data,
    avatar_url: avatarUrl,
  });

  return updated;
}

/**
 * Update player's team-specific data (jersey number)
 * This only affects the specific team relationship
 */
export async function updatePlayerTeamData(
  playerTeamId: string,
  jerseyNumber: number
): Promise<PlayerTeam> {
  const db = await getDB();
  const existing = await db.get('player_teams', playerTeamId);

  if (!existing) {
    throw new Error('Player team relationship not found');
  }

  const updated: PlayerTeam = {
    ...existing,
    jersey_number: jerseyNumber,
    sync_status: 'pending',
  };

  await db.put('player_teams', updated);

  await queueOfflineAction('update', 'player_teams', {
    id: playerTeamId,
    jersey_number: jerseyNumber,
  });

  return updated;
}

/**
 * Remove player from a team (soft delete the player_teams relationship)
 * The player record remains for other teams/history
 */
export async function removePlayerFromTeam(playerTeamId: string): Promise<void> {
  const db = await getDB();
  const playerTeam = await db.get('player_teams', playerTeamId);

  if (!playerTeam) {
    throw new Error('Player team relationship not found');
  }

  // Mark for deletion
  await db.delete('player_teams', playerTeamId);

  await queueOfflineAction('delete', 'player_teams', {
    id: playerTeamId,
  });
}

/**
 * Hard delete player (use with caution - affects all teams)
 * Soft delete preferred - use removePlayerFromTeam for single team removal
 */
export async function deletePlayer(playerId: string): Promise<void> {
  const db = await getDB();
  const player = await db.get('players', playerId);

  if (!player) {
    throw new Error('Player not found');
  }

  await db.delete('players', playerId);

  await queueOfflineAction('delete', 'players', {
    id: playerId,
  });
}
