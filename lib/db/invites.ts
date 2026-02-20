/**
 * Invite Database Operations - Prisma Version
 */

import { prisma } from '@/lib/prisma';
import type { PlayerRole } from '@/lib/db/schema';

export interface AvailableJerseyNumbers {
  min: number;
  max: number;
  taken: number[];
  available: number[];
}

export async function createInvite(
  teamId: string,
  createdBy: string,
  maxUses: number = 50
): Promise<string> {
  const token = crypto.randomUUID().replace(/-/g, '');
  
  const invite = await prisma.teamInvite.create({
    data: {
      teamId,
      createdBy,
      token,
      maxUses,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return invite.token;
}

export async function generateInviteLink(
  teamId: string,
  userId: string,
  options?: { maxUses?: number }
): Promise<{ link: string; token: string }> {
  const token = await createInvite(teamId, userId, options?.maxUses ?? 50);
  const link = `/teams/invite?token=${token}`;
  return { link, token };
}

export async function getInviteByToken(token: string) {
  return await prisma.teamInvite.findUnique({
    where: { token },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
        },
      },
    },
  });
}

export async function getAvailableJerseyNumbers(teamId: string): Promise<AvailableJerseyNumbers> {
  const playerTeams = await prisma.playerTeam.findMany({
    where: { teamId },
    select: { jerseyNumber: true },
  });

  const taken = playerTeams.map(pt => pt.jerseyNumber).sort((a, b) => a - b);
  const min = 1;
  const max = 99;
  
  const available: number[] = [];
  for (let i = min; i <= max; i++) {
    if (!taken.includes(i)) {
      available.push(i);
    }
  }

  return { min, max, taken, available };
}

export async function checkTeamMembership(userId: string, teamId: string): Promise<{
  isMember: boolean;
  hasPlayerSetup: boolean;
  playerTeamId?: string;
}> {
  const teamMember = await prisma.teamMember.findFirst({
    where: { userId, teamId },
  });

  if (!teamMember) {
    return { isMember: false, hasPlayerSetup: false };
  }

  const player = await prisma.player.findUnique({
    where: { userId },
    include: {
      playerTeams: {
        where: { teamId },
      },
    },
  });

  if (!player || player.playerTeams.length === 0) {
    return { isMember: true, hasPlayerSetup: false };
  }

  return {
    isMember: true,
    hasPlayerSetup: true,
    playerTeamId: player.playerTeams[0].id,
  };
}

export async function setupPlayerInTeam(
  userId: string,
  teamId: string,
  data: {
    name: string;
    surname?: string;
    nickname?: string;
    jerseyNumber: number;
    primaryRole: PlayerRole;
    secondaryRoles: PlayerRole[];
  }
): Promise<{ success: boolean; playerTeamId?: string; error?: string }> {
  let player = await prisma.player.findUnique({
    where: { userId },
  });

  if (!player) {
    player = await prisma.player.create({
      data: {
        userId,
        name: data.name,
        surname: data.surname,
        nickname: data.nickname,
        roles: [data.primaryRole, ...data.secondaryRoles],
      },
    });
  } else {
    await prisma.player.update({
      where: { id: player.id },
      data: {
        name: data.name,
        surname: data.surname,
        nickname: data.nickname,
        roles: [data.primaryRole, ...data.secondaryRoles],
      },
    });
  }

  const existingPlayerTeam = await prisma.playerTeam.findUnique({
    where: {
      playerId_teamId: {
        playerId: player.id,
        teamId,
      },
    },
  });

  if (existingPlayerTeam) {
    return { success: false, error: 'Player already setup in this team' };
  }

  const jerseyTaken = await prisma.playerTeam.findFirst({
    where: { teamId, jerseyNumber: data.jerseyNumber },
  });

  if (jerseyTaken) {
    return { success: false, error: 'Jersey number already taken' };
  }

  const playerTeam = await prisma.playerTeam.create({
    data: {
      playerId: player.id,
      teamId,
      jerseyNumber: data.jerseyNumber,
      primaryRole: data.primaryRole,
      secondaryRoles: data.secondaryRoles,
    },
  });

  return { success: true, playerTeamId: playerTeam.id };
}

export async function redeemInvite(
  token: string,
  userId: string
): Promise<{ success: boolean; teamId?: string; needsSetup?: boolean }> {
  const invite = await prisma.teamInvite.findUnique({
    where: { token },
  });

  if (!invite) return { success: false };
  if (invite.expiresAt < new Date()) return { success: false };
  if (invite.useCount >= invite.maxUses) return { success: false };

  const existingMember = await prisma.teamMember.findFirst({
    where: {
      teamId: invite.teamId,
      userId,
    },
  });

  if (existingMember) {
    const membership = await checkTeamMembership(userId, invite.teamId);
    return {
      success: true,
      teamId: invite.teamId,
      needsSetup: !membership.hasPlayerSetup,
    };
  }

  await prisma.teamMember.create({
    data: {
      teamId: invite.teamId,
      userId,
      role: 'member',
    },
  });

  await prisma.teamInvite.update({
    where: { id: invite.id },
    data: {
      useCount: { increment: 1 },
      usedAt: new Date(),
      usedBy: userId,
    },
  });

  return {
    success: true,
    teamId: invite.teamId,
    needsSetup: true,
  };
}

export async function getTeamInvites(teamId: string) {
  return await prisma.teamInvite.findMany({
    where: {
      teamId,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function deleteInvite(inviteId: string): Promise<void> {
  await prisma.teamInvite.delete({
    where: { id: inviteId },
  });
}
