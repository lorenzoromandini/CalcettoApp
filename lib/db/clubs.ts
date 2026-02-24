/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Club Database Operations - Prisma Version
 * 
 * Provides CRUD operations for clubs using Prisma and PostgreSQL.
 * Replaces the Supabase-based implementation.
 */

import { prisma } from './index';
import type { Club, ClubMember } from '@/types/database';
import type { CreateClubInput, UpdateClubInput } from '@/lib/validations/club';

function toClubType(dbClub: any): Club {
  return {
    id: dbClub.id,
    name: dbClub.name,
    description: dbClub.description ?? null,
    image_url: dbClub.imageUrl ?? null,
    created_by: dbClub.createdBy,
    created_at: dbClub.createdAt.toISOString(),
    updated_at: dbClub.updatedAt.toISOString(),
    deleted_at: dbClub.deletedAt?.toISOString() ?? null,
    sync_status: dbClub.syncStatus ?? null,
  };
}

function toClubMemberType(dbMember: any): ClubMember {
  return {
    id: dbMember.id,
    club_id: dbMember.clubId,
    user_id: dbMember.userId ?? null,
    player_id: dbMember.playerId ?? null,
    privilege: dbMember.privilege as ClubMember['privilege'],
    joined_at: dbMember.joinedAt.toISOString(),
  };
}

// Backward compatibility alias
function toClubPrivilegeType(dbMember: any): ClubMember {
  return toClubMemberType(dbMember);
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
      imageUrl: data.image_url,
      createdBy: userId,
    },
  });

  // Create club member (creator is owner)
  await prisma.clubMember.create({
    data: {
      clubId: club.id,
      userId: userId,
      privilege: 'owner',
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

  // Ottieni il conteggio reale dei membri per ogni club
  const clubIds = memberships.map(m => m.clubId);
  const memberCounts = await prisma.clubMember.groupBy({
    by: ['clubId'],
    where: {
      clubId: {
        in: clubIds,
      },
      userId: {
        not: null,
      },
    },
    _count: {
      userId: true,
    },
  });

  const countMap = new Map(memberCounts.map(m => [m.clubId, m._count.userId]));

  // Log di debug
  console.log('Club IDs:', clubIds);
  console.log('Member counts from DB:', memberCounts);
  console.log('Final count map:', Object.fromEntries(countMap));

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
      ...(data.image_url !== undefined && { imageUrl: data.image_url }),
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
      privilege: {
        in: ['owner', 'manager'],
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

export async function getClubMembers(clubId: string): Promise<ClubMember[]> {
  const members = await prisma.clubMember.findMany({
    where: { clubId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          nickname: true,
          email: true,
          image: true,
        },
      },
      player: true,
    },
  });

  return members.map((m) => ({
    id: m.id,
    club_id: m.clubId,
    user_id: m.userId ?? null,
    player_id: m.playerId ?? null,
    privilege: m.privilege as ClubMember['privilege'],
    joined_at: m.joinedAt.toISOString(),
    user: m.user ? {
      id: m.user.id,
      firstName: m.user.firstName,
      lastName: m.user.lastName,
      nickname: m.user.nickname,
      email: m.user.email,
      image: m.user.image,
    } : null,
  }));
}

export async function getClubMembersWithUsers(clubId: string): Promise<any[]> {
  const members = await prisma.clubMember.findMany({
    where: { clubId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          nickname: true,
          email: true,
        },
      },
    },
  });

  return members.filter(m => m.userId !== null).map(m => ({
    id: m.id,
    clubId: m.clubId,
    userId: m.userId,
    playerId: m.playerId,
    privilege: m.privilege,
    joinedAt: m.joinedAt,
    user: m.user,
  }));
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
  newPrivilege: 'owner' | 'manager' | 'member'
): Promise<void> {
  await prisma.clubMember.update({
    where: {
      id: memberId,
      clubId,
    },
    data: {
      privilege: newPrivilege,
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
  // Get current admin membership
  const currentAdmin = await prisma.clubMember.findFirst({
    where: {
      clubId,
      userId: currentAdminId,
      privilege: 'owner',
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
    data: { privilege: 'member' },
  });

  // Promote new admin
  await prisma.clubMember.update({
    where: { id: newAdmin.id },
    data: { privilege: 'owner' },
  });
}

// ============================================================================
// Invite System
// ============================================================================

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
  if (invite.expiresAt < new Date()) return false;
  if (invite.useCount >= invite.maxUses) return false;

  // Check if user is already a member
  const existingMember = await prisma.clubMember.findFirst({
    where: {
      clubId: invite.clubId,
      userId,
    },
  });

  if (existingMember) return false;

  // Add user to team
  await prisma.clubMember.create({
    data: {
      clubId: invite.clubId,
      userId,
      privilege: 'member',
    },
  });

  // Update invite
  await prisma.clubInvite.update({
    where: { id: invite.id },
    data: {
      useCount: { increment: 1 },
      usedAt: new Date(),
      usedBy: userId,
    },
  });

  return true;
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
