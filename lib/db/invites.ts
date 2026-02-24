/**
 * Invite Database Operations - Prisma Version
 * 
 * Updated for new schema:
 * - ClubInvite no longer has maxUses, useCount, usedAt, usedBy fields
 * - ClubMember uses 'privileges' (plural) with ClubPrivilege enum
 * - Removed Player/PlayerClub references - now using ClubMember directly
 */

import { prisma } from '@/lib/prisma';

// ClubPrivilege enum values
const ClubPrivilege = {
  MEMBER: 'MEMBER',
  MANAGER: 'MANAGER',
  OWNER: 'OWNER',
} as const;
type ClubPrivilege = typeof ClubPrivilege[keyof typeof ClubPrivilege];

// PlayerRole enum values
const PlayerRole = {
  POR: 'POR',
  DIF: 'DIF',
  CEN: 'CEN',
  ATT: 'ATT',
} as const;
type PlayerRole = typeof PlayerRole[keyof typeof PlayerRole];

export interface AvailableJerseyNumbers {
  min: number;
  max: number;
  taken: number[];
  available: number[];
}

export async function createInvite(
  clubId: string,
  createdBy: string,
): Promise<string> {
  const token = crypto.randomUUID().replace(/-/g, '');
  
  const invite = await prisma.clubInvite.create({
    data: {
      clubId,
      createdBy,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return invite.token;
}

export async function generateInviteLink(
  clubId: string,
  userId: string,
): Promise<{ link: string; token: string }> {
  const token = await createInvite(clubId, userId);
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
  const clubMembers = await prisma.clubMember.findMany({
    where: { clubId },
    select: { jerseyNumber: true },
  });

  const taken = clubMembers.map((cm: { jerseyNumber: number }) => cm.jerseyNumber).sort((a: number, b: number) => a - b);
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
  hasProfile: boolean;
  memberId?: string;
}> {
  const clubMember = await prisma.clubMember.findFirst({
    where: { userId, clubId },
  });

  if (!clubMember) {
    return { isMember: false, hasProfile: false };
  }

  // In new schema, ClubMember already contains all player data
  // So if they have a ClubMember record, they have a profile
  return {
    isMember: true,
    hasProfile: true,
    memberId: clubMember.id,
  };
}

export async function setupMemberInClub(
  userId: string,
  clubId: string,
  data: {
    jerseyNumber: number;
    primaryRole: PlayerRole;
    secondaryRoles: PlayerRole[];
  }
): Promise<{ success: boolean; memberId?: string; error?: string }> {
  // Check if user is already a member
  const existingMember = await prisma.clubMember.findFirst({
    where: { userId, clubId },
  });

  if (existingMember) {
    return { success: false, error: 'Already a member of this club' };
  }

  // Check jersey number availability
  const jerseyTaken = await prisma.clubMember.findFirst({
    where: { clubId, jerseyNumber: data.jerseyNumber },
  });

  if (jerseyTaken) {
    return { success: false, error: 'Jersey number already taken' };
  }

  // Create the club member with all required fields
  const member = await prisma.clubMember.create({
    data: {
      clubId,
      userId,
      privileges: ClubPrivilege.MEMBER,
      primaryRole: data.primaryRole,
      secondaryRoles: data.secondaryRoles,
      jerseyNumber: data.jerseyNumber,
    },
  });

  return { success: true, memberId: member.id };
}

export async function redeemInvite(
  token: string,
  userId: string
): Promise<{ success: boolean; clubId?: string; needsSetup?: boolean }> {
  const invite = await prisma.clubInvite.findUnique({
    where: { token },
  });

  if (!invite) return { success: false };
  if (invite.expiresAt && invite.expiresAt < new Date()) return { success: false };

  const existingMember = await prisma.clubMember.findFirst({
    where: {
      clubId: invite.clubId,
      userId,
    },
  });

  if (existingMember) {
    return {
      success: true,
      clubId: invite.clubId,
      needsSetup: false,  // Already a member, no setup needed
    };
  }

  // Create ClubMember with default values
  await prisma.clubMember.create({
    data: {
      clubId: invite.clubId,
      userId,
      privileges: ClubPrivilege.MEMBER,
      primaryRole: PlayerRole.CEN,
      secondaryRoles: [],
      jerseyNumber: await getNextJerseyNumber(invite.clubId),
    },
  });

  return {
    success: true,
    clubId: invite.clubId,
    needsSetup: true,  // New member, might need profile customization
  };
}

async function getNextJerseyNumber(clubId: string): Promise<number> {
  const members = await prisma.clubMember.findMany({
    where: { clubId },
    select: { jerseyNumber: true },
  });
  
  const usedNumbers = new Set(members.map((m: { jerseyNumber: number }) => m.jerseyNumber));
  let number = 1;
  while (usedNumbers.has(number)) {
    number++;
  }
  return number;
}

export async function getClubInvites(clubId: string) {
  return await prisma.clubInvite.findMany({
    where: {
      clubId,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
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

// Backward compatibility alias
export const setupPlayerInTeam = setupMemberInClub;
