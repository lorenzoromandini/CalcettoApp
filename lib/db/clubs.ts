/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Club Database Operations - Prisma Version
 * 
 * Provides CRUD operations for clubs using Prisma and PostgreSQL.
 * Aligned with the AGENTS.md reference schema.
 * 
 * Key changes:
 * - ClubMember now contains player data (primaryRole, secondaryRoles, jerseyNumber)
 * - ClubPrivilege is now an enum (MEMBER, MANAGER, OWNER)
 * - Removed syncStatus from Club
 */

import { prisma } from './index';
import type { Club, ClubMember, User } from '@/types/database';
import type { CreateClubInput, UpdateClubInput } from '@/lib/validations/club';
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

function toClubType(dbClub: any): Club {
  return {
    id: dbClub.id,
    name: dbClub.name,
    description: dbClub.description ?? null,
    imageUrl: dbClub.imageUrl ?? null,
    createdBy: dbClub.createdBy,
    createdAt: dbClub.createdAt.toISOString(),
    updatedAt: dbClub.updatedAt.toISOString(),
    deletedAt: dbClub.deletedAt?.toISOString() ?? null,
  };
}

function toClubMemberType(dbMember: any): ClubMember & { user: User | null } {
  return {
    id: dbMember.id,
    clubId: dbMember.clubId,
    userId: dbMember.userId,
    privileges: dbMember.privileges as ClubMember['privileges'],
    joinedAt: dbMember.joinedAt.toISOString(),
    primaryRole: dbMember.primaryRole as PlayerRole,
    secondaryRoles: (dbMember.secondaryRoles as PlayerRole[]) || [],
    jerseyNumber: dbMember.jerseyNumber,
    user: dbMember.user ? {
      id: dbMember.user.id,
      email: dbMember.user.email,
      firstName: dbMember.user.firstName,
      lastName: dbMember.user.lastName,
      nickname: dbMember.user.nickname ?? null,
      image: dbMember.user.image ?? null,
      password: dbMember.user.password ?? null,
      createdAt: dbMember.user.createdAt.toISOString(),
      updatedAt: dbMember.user.updatedAt.toISOString(),
      lastLogin: dbMember.user.lastLogin?.toISOString() ?? null,
    } : null,
  };
}

// ============================================================================
// Club CRUD Operations
// ============================================================================

export async function createClub(
  data: CreateClubInput,
  userId: string
): Promise<string> {
  const club = await prisma.club.create({
    data: {
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      createdBy: userId,
    },
  });

  // Create club member (creator is owner)
  await prisma.clubMember.create({
    data: {
      clubId: club.id,
      userId: userId,
      privileges: ClubPrivilege.OWNER,
      primaryRole: PlayerRole.CEN,
      secondaryRoles: [],
      jerseyNumber: 1,
    },
  });

  return club.id;
}

// Alias for backward compatibility
export const createTeam = createClub;

export async function getUserClubs(userId: string): Promise<(Club & { memberCount: number })[]> {
  const memberships = await prisma.clubMember.findMany({
    where: {
      userId: userId,
      club: {
        deletedAt: null,
      },
    },
    include: {
      club: true,
    },
    orderBy: {
      club: {
        createdAt: 'desc',
      },
    },
  });

  const clubIds = memberships.map(m => m.clubId);
  const memberCounts = await prisma.clubMember.groupBy({
    by: ['clubId'],
    where: {
      clubId: {
        in: clubIds,
      },
    },
    _count: {
      id: true,
    },
  });

  const countMap = new Map(memberCounts.map(m => [m.clubId, m._count.id]));

  return memberships.map(m => ({
    ...toClubType(m.club),
    memberCount: countMap.get(m.clubId) || 0,
  }));
}

// Alias for backward compatibility
export const getUserTeams = getUserClubs;

export async function getClub(clubId: string): Promise<Club | null> {
  const club = await prisma.club.findFirst({
    where: {
      id: clubId,
      deletedAt: null,
    },
  });

  if (!club) return null;
  return toClubType(club);
}

export async function updateClub(
  clubId: string,
  data: UpdateClubInput
): Promise<void> {
  await prisma.club.update({
    where: { id: clubId },
    data: {
      ...(data.name !== undefined && data.name !== null && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
    },
  });
}

// Alias for backward compatibility
export const updateTeam = updateClub;

export async function deleteClub(clubId: string): Promise<void> {
  await prisma.club.update({
    where: { id: clubId },
    data: {
      deletedAt: new Date(),
    },
  });
}

// Alias for backward compatibility
export const deleteTeam = deleteClub;

export async function isClubAdmin(clubId: string, userId: string): Promise<boolean> {
  const membership = await prisma.clubMember.findFirst({
    where: {
      clubId,
      userId,
      privileges: {
        in: [ClubPrivilege.OWNER, ClubPrivilege.MANAGER],
      },
    },
  });

  return !!membership;
}

// Alias for backward compatibility
export const isTeamAdmin = isClubAdmin;

export async function isClubMember(clubId: string, userId: string): Promise<boolean> {
  const membership = await prisma.clubMember.findFirst({
    where: {
      clubId,
      userId,
    },
  });

  return !!membership;
}

export async function getClubMembers(clubId: string): Promise<(ClubMember & { user: User | null })[]> {
  const members = await prisma.clubMember.findMany({
    where: { clubId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          nickname: true,
          image: true,
          password: true,
          createdAt: true,
          updatedAt: true,
          lastLogin: true,
        },
      },
    },
    orderBy: {
      jerseyNumber: 'asc',
    },
  });

  return members.map(toClubMemberType);
}

export async function getClubMembersWithUsers(clubId: string): Promise<(ClubMember & { user: User | null })[]> {
  return getClubMembers(clubId);
}

export async function getClubMemberCount(clubId: string): Promise<number> {
  return await prisma.clubMember.count({
    where: { clubId },
  });
}

// ============================================================================
// Member Management
// ============================================================================

export async function updateMemberPrivilege(
  clubId: string,
  memberId: string,
  newPrivilege: ClubPrivilege
): Promise<void> {
  await prisma.clubMember.update({
    where: {
      id: memberId,
      clubId,
    },
    data: {
      privileges: newPrivilege,
    },
  });
}

// Backward compatibility alias
export const updateMemberRole = updateMemberPrivilege;

export async function removeClubMember(
  clubId: string,
  memberId: string
): Promise<void> {
  await prisma.clubMember.delete({
    where: {
      id: memberId,
      clubId,
    },
  });
}

export async function transferOwnership(
  clubId: string,
  currentAdminId: string,
  newAdminId: string
): Promise<void> {
  const currentAdmin = await prisma.clubMember.findFirst({
    where: {
      clubId,
      userId: currentAdminId,
      privileges: ClubPrivilege.OWNER,
    },
  });

  const newAdmin = await prisma.clubMember.findFirst({
    where: {
      clubId,
      userId: newAdminId,
    },
  });

  if (!currentAdmin || !newAdmin) {
    throw new Error('Members not found');
  }

  // Demote current admin to member
  await prisma.clubMember.update({
    where: { id: currentAdmin.id },
    data: { privileges: ClubPrivilege.MEMBER },
  });

  // Promote new admin
  await prisma.clubMember.update({
    where: { id: newAdmin.id },
    data: { privileges: ClubPrivilege.OWNER },
  });
}

// ============================================================================
// Member (Player) Data Management
// ============================================================================

export async function createClubMember(
  clubId: string,
  userId: string,
  data: {
    jerseyNumber: number;
    primaryRole: PlayerRole;
    secondaryRoles?: PlayerRole[];
  }
): Promise<string> {
  const member = await prisma.clubMember.create({
    data: {
      clubId,
      userId,
      privileges: ClubPrivilege.MEMBER,
      primaryRole: data.primaryRole,
      secondaryRoles: data.secondaryRoles || [],
      jerseyNumber: data.jerseyNumber,
    },
  });

  return member.id;
}

export async function updateClubMember(
  clubId: string,
  memberId: string,
  data: {
    jerseyNumber?: number;
    primaryRole?: PlayerRole;
    secondaryRoles?: PlayerRole[];
  }
): Promise<void> {
  await prisma.clubMember.update({
    where: {
      id: memberId,
      clubId,
    },
    data: {
      ...(data.jerseyNumber !== undefined && { jerseyNumber: data.jerseyNumber }),
      ...(data.primaryRole !== undefined && { primaryRole: data.primaryRole }),
      ...(data.secondaryRoles !== undefined && { secondaryRoles: data.secondaryRoles }),
    },
  });
}

export async function getClubMember(clubId: string, memberId: string): Promise<(ClubMember & { user: User | null }) | null> {
  const member = await prisma.clubMember.findFirst({
    where: {
      id: memberId,
      clubId,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          nickname: true,
          image: true,
          password: true,
          createdAt: true,
          updatedAt: true,
          lastLogin: true,
        },
      },
    },
  });

  if (!member) return null;
  return toClubMemberType(member);
}

export async function getClubMemberByUserId(clubId: string, userId: string): Promise<(ClubMember & { user: User | null }) | null> {
  const member = await prisma.clubMember.findUnique({
    where: {
      clubId_userId: {
        clubId,
        userId,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          nickname: true,
          image: true,
          password: true,
          createdAt: true,
          updatedAt: true,
          lastLogin: true,
        },
      },
    },
  });

  if (!member) return null;
  return toClubMemberType(member);
}

export async function isJerseyNumberTaken(
  clubId: string,
  jerseyNumber: number,
  excludeMemberId?: string
): Promise<boolean> {
  const existing = await prisma.clubMember.findFirst({
    where: {
      clubId,
      jerseyNumber,
      ...(excludeMemberId && {
        id: {
          not: excludeMemberId,
        },
      }),
    },
  });

  return !!existing;
}

// ============================================================================
// Invite System
// ============================================================================

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
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return invite.token;
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

export async function redeemInvite(
  token: string,
  userId: string
): Promise<boolean> {
  const invite = await prisma.clubInvite.findUnique({
    where: { token },
  });

  if (!invite) return false;
  if (invite.expiresAt && invite.expiresAt < new Date()) return false;

  // Check if user is already a member
  const existingMember = await prisma.clubMember.findUnique({
    where: {
      clubId_userId: {
        clubId: invite.clubId,
        userId,
      },
    },
  });

  if (existingMember) return false;

  // Add user to club
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

  return true;
}

async function getNextJerseyNumber(clubId: string): Promise<number> {
  const members = await prisma.clubMember.findMany({
    where: { clubId },
    select: { jerseyNumber: true },
  });
  
  const usedNumbers = new Set(members.map(m => m.jerseyNumber));
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
