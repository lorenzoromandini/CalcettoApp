/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Player Database Operations - Prisma Version
 */

import { prisma } from './index';
import type { Player, PlayerClub } from '@/types/database';
import type { CreatePlayerInput, UpdatePlayerInput } from '@/lib/validations/player';

function toPlayerType(dbPlayer: any): Player {
  return {
    id: dbPlayer.id,
    name: dbPlayer.name,
    surname: dbPlayer.surname ?? null,
    nickname: dbPlayer.nickname ?? null,
    avatar_url: dbPlayer.avatarUrl ?? null,
    user_id: dbPlayer.userId ?? null,
    roles: dbPlayer.roles as Player['roles'],
    created_at: dbPlayer.createdAt.toISOString(),
    updated_at: dbPlayer.updatedAt.toISOString(),
    sync_status: null,
  };
}

function toPlayerClubType(dbPlayerClub: any): PlayerClub {
  return {
    id: dbPlayerClub.id,
    player_id: dbPlayerClub.playerId,
    club_id: dbPlayerClub.clubId,
    jersey_number: dbPlayerClub.jerseyNumber,
    primary_role: dbPlayerClub.primaryRole,
    secondary_roles: dbPlayerClub.secondaryRoles || [],
    joined_at: dbPlayerClub.joinedAt.toISOString(),
    created_at: dbPlayerClub.createdAt.toISOString(),
    sync_status: 'synced',
  };
}

export async function createPlayer(
  data: CreatePlayerInput,
  clubId: string
): Promise<string> {
  const primaryRole = data.roles[0];
  const secondaryRoles = data.roles.slice(1);

  const player = await prisma.player.create({
    data: {
      name: data.name,
      surname: data.surname,
      nickname: data.nickname,
      roles: data.roles,
    },
  });

  await prisma.playerClub.create({
    data: {
      playerId: player.id,
      clubId: clubId,
      jerseyNumber: data.jersey_number ?? 1,
      primaryRole,
      secondaryRoles,
    },
  });

  return player.id;
}

// Alias for backward compatibility
export const getPlayersByTeam = getClubPlayers;

export async function getClubPlayers(clubId: string): Promise<(Player & { jersey_number?: number; player_team_id?: string; primary_role?: string; user_id?: string | null })[]> {
  const playerClubs = await prisma.playerClub.findMany({
    where: { clubId },
    include: {
      player: true,
    },
    orderBy: {
      jerseyNumber: 'asc',
    },
  });

  return playerClubs.map(pt => ({
    ...toPlayerType(pt.player),
    jersey_number: pt.jerseyNumber,
    primary_role: pt.primaryRole,
    user_id: pt.player.userId,
  }));
}

export async function getPlayer(playerId: string): Promise<Player | null> {
  const player = await prisma.player.findUnique({
    where: { id: playerId },
  });

  if (!player) return null;
  return toPlayerType(player);
}

export async function getPlayerWithTeamInfo(playerId: string, clubId: string) {
  const playerClub = await prisma.playerClub.findFirst({
    where: {
      playerId,
      clubId,
    },
    include: {
      player: true,
    },
  });

  if (!playerClub) return null;

  return {
    ...toPlayerType(playerClub.player),
    jersey_number: playerClub.jerseyNumber,
  };
}

export async function updatePlayer(
  playerId: string,
  data: UpdatePlayerInput,
  clubId?: string
): Promise<void> {
  await prisma.player.update({
    where: { id: playerId },
    data: {
      name: data.name,
      surname: data.surname,
      nickname: data.nickname,
      roles: data.roles,
    },
  });

  if (clubId && data.jersey_number !== undefined) {
    const secondaryRoles = data.roles ? data.roles.slice(1) : undefined;
    
    await prisma.playerClub.updateMany({
      where: {
        playerId,
        clubId,
      },
      data: {
        jerseyNumber: data.jersey_number,
        ...(secondaryRoles !== undefined && { secondaryRoles }),
      },
    });
  }
}

export async function deletePlayer(playerId: string): Promise<void> {
  await prisma.player.delete({
    where: { id: playerId },
  });
}

export async function getPlayerCount(clubId: string): Promise<number> {
  return await prisma.playerClub.count({
    where: { clubId },
  });
}

export async function isJerseyNumberTaken(
  clubId: string,
  jerseyNumber: number,
  excludePlayerId?: string
): Promise<boolean> {
  const existing = await prisma.playerClub.findFirst({
    where: {
      clubId,
      jerseyNumber,
      ...(excludePlayerId && {
        playerId: {
          not: excludePlayerId,
        },
      }),
    },
  });

  return !!existing;
}

export async function uploadPlayerAvatar(
  playerId: string,
  file: File
): Promise<string> {
  // For now, return a data URL
  // In production, you'd upload to S3, Cloudinary, etc.
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Additional functions for backward compatibility
export async function addPlayerToTeam(
  playerId: string,
  clubId: string,
  jerseyNumber: number,
  primaryRole: string,
  secondaryRoles: string[] = []
): Promise<void> {
  await prisma.playerClub.create({
    data: {
      playerId,
      clubId,
      jerseyNumber,
      primaryRole,
      secondaryRoles,
    },
  });
}

export async function removePlayerFromTeam(
  playerId: string,
  clubId: string
): Promise<void> {
  await prisma.playerClub.deleteMany({
    where: {
      playerId,
      clubId,
    },
  });
}
