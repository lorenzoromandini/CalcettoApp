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
  clubId: string,
  createdBy: string,
  maxUses: number = 50
): Promise<string> {
  const token = crypto.randomUUID().replace(/-/g, '');
  
  const invite = await prisma.clubInvite.create({
    data: {
      clubId,
      createdBy,
      token,
      maxUses,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return invite.token;
}

export async function generateInviteLink(
  clubId: string,
  userId: string,
  options?: { maxUses?: number }
): Promise<{ link: string; token: string }> {
  const token = await createInvite(clubId, userId, options?.maxUses ?? 50);
  const link = `/clubs/invite?token=${token}`;
  return { link, token };
}

export async function getInviteByToken(token: string) {
  return await prisma.clubInvite.findUnique({
    where: { token },
    include: {
      club: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
        },
      },
    },
  });
}

export async function getAvailableJerseyNumbers(clubId: string): Promise<AvailableJerseyNumbers> {
  const playerClubs = await prisma.playerClub.findMany({
    where: { clubId },
    select: { jerseyNumber: true },
  });

  const taken = playerClubs.map(pt => pt.jerseyNumber).sort((a, b) => a - b);
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

export async function checkClubMembership(userId: string, clubId: string): Promise<{
  isMember: boolean;
  hasPlayerSetup: boolean;
  playerClubId?: string;
}> {
  const clubMember = await prisma.clubMember.findFirst({
    where: { userId, clubId },
  });

  if (!clubMember) {
    return { isMember: false, hasPlayerSetup: false };
  }

  const player = await prisma.player.findUnique({
    where: { userId },
    include: {
      playerClubs: {
        where: { clubId },
      },
    },
  });

  if (!player || player.playerClubs.length === 0) {
    return { isMember: true, hasPlayerSetup: false };
  }

  return {
    isMember: true,
    hasPlayerSetup: true,
    playerClubId: player.playerClubs[0].id,
  };
}

export async function setupPlayerInTeam(
  userId: string,
  clubId: string,
  data: {
    name: string;
    surname?: string;
    nickname?: string;
    jerseyNumber: number;
    primaryRole: PlayerRole;
    secondaryRoles: PlayerRole[];
  }
): Promise<{ success: boolean; playerClubId?: string; error?: string }> {
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

  const existingPlayerClub = await prisma.playerClub.findUnique({
    where: {
      playerId_clubId: {
        playerId: player.id,
        clubId,
      },
    },
  });

  if (existingPlayerClub) {
    return { success: false, error: 'Player already setup in this team' };
  }

  const jerseyTaken = await prisma.playerClub.findFirst({
    where: { clubId, jerseyNumber: data.jerseyNumber },
  });

  if (jerseyTaken) {
    return { success: false, error: 'Jersey number already taken' };
  }

  const playerClub = await prisma.playerClub.create({
    data: {
      playerId: player.id,
      clubId,
      jerseyNumber: data.jerseyNumber,
      primaryRole: data.primaryRole,
      secondaryRoles: data.secondaryRoles,
    },
  });

  return { success: true, playerClubId: playerClub.id };
}

export async function redeemInvite(
  token: string,
  userId: string
): Promise<{ success: boolean; clubId?: string; needsSetup?: boolean }> {
  const invite = await prisma.clubInvite.findUnique({
    where: { token },
  });

  if (!invite) return { success: false };
  if (invite.expiresAt < new Date()) return { success: false };
  if (invite.useCount >= invite.maxUses) return { success: false };

  const existingMember = await prisma.clubMember.findFirst({
    where: {
      clubId: invite.clubId,
      userId,
    },
  });

  if (existingMember) {
    const membership = await checkClubMembership(userId, invite.clubId);
    return {
      success: true,
      clubId: invite.clubId,
      needsSetup: !membership.hasPlayerSetup,
    };
  }

  await prisma.clubMember.create({
    data: {
      clubId: invite.clubId,
      userId,
      privilege: 'member',
    },
  });

  await prisma.clubInvite.update({
    where: { id: invite.id },
    data: {
      useCount: { increment: 1 },
      usedAt: new Date(),
      usedBy: userId,
    },
  });

  return {
    success: true,
    clubId: invite.clubId,
    needsSetup: true,
  };
}

export async function getClubInvites(clubId: string) {
  return await prisma.clubInvite.findMany({
    where: {
      clubId,
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
  await prisma.clubInvite.delete({
    where: { id: inviteId },
  });
}
