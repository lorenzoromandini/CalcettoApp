/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Team Database Operations - Prisma Version
 * 
 * Provides CRUD operations for teams using Prisma and PostgreSQL.
 * Replaces the Supabase-based implementation.
 */

import { prisma } from './index';
import type { Team, TeamMember } from '@/types/database';
import type { CreateTeamInput, UpdateTeamInput } from '@/lib/validations/team';

function toTeamType(dbTeam: any): Team {
  return {
    id: dbTeam.id,
    name: dbTeam.name,
    description: dbTeam.description ?? null,
    image_url: dbTeam.imageUrl ?? null,
    team_mode: null,
    created_by: dbTeam.createdBy,
    created_at: dbTeam.createdAt.toISOString(),
    updated_at: dbTeam.updatedAt.toISOString(),
    deleted_at: dbTeam.deletedAt?.toISOString() ?? null,
    sync_status: null,
  };
}

function toTeamMemberType(dbMember: any): TeamMember {
  return {
    id: dbMember.id,
    team_id: dbMember.teamId,
    user_id: dbMember.userId ?? null,
    player_id: dbMember.playerId ?? null,
    role: dbMember.role as TeamMember['role'],
    joined_at: dbMember.joinedAt.toISOString(),
  };
}

// ============================================================================
// Team CRUD Operations
// ============================================================================

export async function createTeam(
  data: CreateTeamInput,
  userId: string
): Promise<string> {
  const team = await prisma.team.create({
    data: {
      name: data.name,
      description: data.description,
      imageUrl: data.image_url,
      createdBy: userId,
    },
  });

  // Create team member (creator is admin)
  await prisma.teamMember.create({
    data: {
      teamId: team.id,
      userId: userId,
      role: 'admin',
    },
  });

  return team.id;
}

export async function getUserTeams(userId: string): Promise<Team[]> {
  const memberships = await prisma.teamMember.findMany({
    where: {
      userId: userId,
      team: {
        deletedAt: null,
      },
    },
    include: {
      team: true,
    },
    orderBy: {
      team: {
        createdAt: 'desc',
      },
    },
  });

  return memberships.map(m => toTeamType(m.team));
}

export async function getTeam(teamId: string): Promise<Team | null> {
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      deletedAt: null,
    },
  });

  if (!team) return null;
  return toTeamType(team);
}

export async function updateTeam(
  teamId: string,
  data: UpdateTeamInput
): Promise<void> {
  await prisma.team.update({
    where: { id: teamId },
    data: {
      name: data.name,
      description: data.description,
      imageUrl: data.image_url,
    },
  });
}

export async function deleteTeam(teamId: string): Promise<void> {
  await prisma.team.update({
    where: { id: teamId },
    data: {
      deletedAt: new Date(),
    },
  });
}

export async function isTeamAdmin(teamId: string, userId: string): Promise<boolean> {
  const membership = await prisma.teamMember.findFirst({
    where: {
      teamId,
      userId,
      role: {
        in: ['admin', 'co-admin'],
      },
    },
  });

  return !!membership;
}

export async function isTeamMember(teamId: string, userId: string): Promise<boolean> {
  const membership = await prisma.teamMember.findFirst({
    where: {
      teamId,
      userId,
    },
  });

  return !!membership;
}

export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  const members = await prisma.teamMember.findMany({
    where: { teamId },
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
    team_id: m.teamId,
    user_id: m.userId ?? null,
    player_id: m.playerId ?? null,
    role: m.role as TeamMember['role'],
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

export async function getTeamMembersWithUsers(teamId: string): Promise<any[]> {
  const members = await prisma.teamMember.findMany({
    where: { teamId },
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
    teamId: m.teamId,
    userId: m.userId,
    playerId: m.playerId,
    role: m.role,
    joinedAt: m.joinedAt,
    user: m.user,
  }));
}

export async function getTeamMemberCount(teamId: string): Promise<number> {
  return await prisma.teamMember.count({
    where: { teamId },
  });
}

// ============================================================================
// Member Management
// ============================================================================

export async function updateMemberRole(
  teamId: string,
  memberId: string,
  newRole: 'admin' | 'co-admin' | 'member'
): Promise<void> {
  await prisma.teamMember.update({
    where: {
      id: memberId,
      teamId,
    },
    data: {
      role: newRole,
    },
  });
}

export async function removeTeamMember(
  teamId: string,
  memberId: string
): Promise<void> {
  await prisma.teamMember.delete({
    where: {
      id: memberId,
      teamId,
    },
  });
}

export async function transferOwnership(
  teamId: string,
  currentAdminId: string,
  newAdminId: string
): Promise<void> {
  // Get current admin membership
  const currentAdmin = await prisma.teamMember.findFirst({
    where: {
      teamId,
      userId: currentAdminId,
      role: 'admin',
    },
  });

  const newAdmin = await prisma.teamMember.findFirst({
    where: {
      teamId,
      userId: newAdminId,
    },
  });

  if (!currentAdmin || !newAdmin) {
    throw new Error('Members not found');
  }

  // Demote current admin to member
  await prisma.teamMember.update({
    where: { id: currentAdmin.id },
    data: { role: 'member' },
  });

  // Promote new admin
  await prisma.teamMember.update({
    where: { id: newAdmin.id },
    data: { role: 'admin' },
  });
}

// ============================================================================
// Invite System
// ============================================================================

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
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return invite.token;
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

export async function redeemInvite(
  token: string,
  userId: string
): Promise<boolean> {
  const invite = await prisma.teamInvite.findUnique({
    where: { token },
  });

  if (!invite) return false;
  if (invite.expiresAt < new Date()) return false;
  if (invite.useCount >= invite.maxUses) return false;

  // Check if user is already a member
  const existingMember = await prisma.teamMember.findFirst({
    where: {
      teamId: invite.teamId,
      userId,
    },
  });

  if (existingMember) return false;

  // Add user to team
  await prisma.teamMember.create({
    data: {
      teamId: invite.teamId,
      userId,
      role: 'member',
    },
  });

  // Update invite
  await prisma.teamInvite.update({
    where: { id: invite.id },
    data: {
      useCount: { increment: 1 },
      usedAt: new Date(),
      usedBy: userId,
    },
  });

  return true;
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
