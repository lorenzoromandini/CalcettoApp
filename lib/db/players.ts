/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Player Database Operations - Prisma Version
 */

import { prisma } from './index';
import type { Player, PlayerTeam } from '@/lib/db/schema';
import type { CreatePlayerInput, UpdatePlayerInput } from '@/lib/validations/player';

function toPlayerType(dbPlayer: any): Player {
  return {
    id: dbPlayer.id,
    name: dbPlayer.name,
    surname: dbPlayer.surname ?? undefined,
    nickname: dbPlayer.nickname ?? undefined,
    avatar_url: dbPlayer.avatarUrl ?? undefined,
    user_id: dbPlayer.userId ?? undefined,
    roles: dbPlayer.roles as Player['roles'],
    created_at: dbPlayer.createdAt.toISOString(),
    updated_at: dbPlayer.updatedAt.toISOString(),
    sync_status: 'synced',
  };
}

function toPlayerTeamType(dbPlayerTeam: any): PlayerTeam {
  return {
    id: dbPlayerTeam.id,
    player_id: dbPlayerTeam.playerId,
    team_id: dbPlayerTeam.teamId,
    jersey_number: dbPlayerTeam.jerseyNumber,
    joined_at: dbPlayerTeam.joinedAt.toISOString(),
    created_at: dbPlayerTeam.createdAt.toISOString(),
    sync_status: 'synced',
  };
}

export async function createPlayer(
  data: CreatePlayerInput,
  teamId: string
): Promise<string> {
  const player = await prisma.player.create({
    data: {
      name: data.name,
      surname: data.surname,
      nickname: data.nickname,
      roles: data.roles,
    },
  });

  // Link player to team
  await prisma.playerTeam.create({
    data: {
      playerId: player.id,
      teamId: teamId,
      jerseyNumber: data.jersey_number ?? 1,
    },
  });

  return player.id;
}

// Alias for backward compatibility
export const getPlayersByTeam = getTeamPlayers;

export async function getTeamPlayers(teamId: string): Promise<(Player & { jersey_number?: number; player_team_id?: string })[]> {
  const playerTeams = await prisma.playerTeam.findMany({
    where: { teamId },
    include: {
      player: true,
    },
    orderBy: {
      jerseyNumber: 'asc',
    },
  });

  return playerTeams.map(pt => ({
    ...toPlayerType(pt.player),
    jersey_number: pt.jerseyNumber,
  }));
}

export async function getPlayer(playerId: string): Promise<Player | null> {
  const player = await prisma.player.findUnique({
    where: { id: playerId },
  });

  if (!player) return null;
  return toPlayerType(player);
}

export async function getPlayerWithTeamInfo(playerId: string, teamId: string) {
  const playerTeam = await prisma.playerTeam.findFirst({
    where: {
      playerId,
      teamId,
    },
    include: {
      player: true,
    },
  });

  if (!playerTeam) return null;

  return {
    ...toPlayerType(playerTeam.player),
    jersey_number: playerTeam.jerseyNumber,
  };
}

export async function updatePlayer(
  playerId: string,
  data: UpdatePlayerInput,
  teamId?: string
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

  // Update jersey number if provided
  if (teamId && data.jersey_number !== undefined) {
    await prisma.playerTeam.updateMany({
      where: {
        playerId,
        teamId,
      },
      data: {
        jerseyNumber: data.jersey_number,
      },
    });
  }
}

export async function deletePlayer(playerId: string): Promise<void> {
  await prisma.player.delete({
    where: { id: playerId },
  });
}

export async function getPlayerCount(teamId: string): Promise<number> {
  return await prisma.playerTeam.count({
    where: { teamId },
  });
}

export async function isJerseyNumberTaken(
  teamId: string,
  jerseyNumber: number,
  excludePlayerId?: string
): Promise<boolean> {
  const existing = await prisma.playerTeam.findFirst({
    where: {
      teamId,
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
  teamId: string,
  jerseyNumber: number
): Promise<void> {
  await prisma.playerTeam.create({
    data: {
      playerId,
      teamId,
      jerseyNumber,
    },
  });
}

export async function removePlayerFromTeam(
  playerId: string,
  teamId: string
): Promise<void> {
  await prisma.playerTeam.deleteMany({
    where: {
      playerId,
      teamId,
    },
  });
}
