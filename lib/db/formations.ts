/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Formation Database Operations - Prisma Version
 * 
 * Provides CRUD operations for formations using Prisma and PostgreSQL.
 * Updated for new schema:
 * - Formation now has isHome boolean and formationName (instead of teamFormation)
 * - FormationPosition has clubMemberId (instead of playerId)
 * - Match can have multiple formations (home and away)
 */

import { prisma } from './index';
import type { FormationMode } from '@/lib/formations';
import type { MatchPlayerWithPlayer } from './player-participation';
import type { ClubMemberWithRolePriority, SaveMatchFormationsPayload } from '@/types/formations';

export interface FormationPosition {
  x: number;
  y: number;
  label: string;
  clubMemberId?: string;
}

export interface FormationData {
  formation: string; // preset ID like "5-1-2-1"
  positions: FormationPosition[];
  isHome: boolean;
}

/**
 * Get formation for a match (home or away)
 * 
 * @param matchId - Match ID
 * @param isHome - Whether to get home formation (true) or away formation (false)
 * @returns Formation data or null if not found
 */
export async function getFormation(matchId: string, isHome: boolean = true): Promise<FormationData | null> {
  const formation = await prisma.formation.findUnique({
    where: {
      matchId_isHome: {
        matchId,
        isHome,
      },
    },
    include: {
      positions: true,
    },
  });

  if (!formation) {
    return null;
  }

  return {
    formation: formation.formationName || '5-1-2-1',
    positions: formation.positions.map(p => ({
      x: p.positionX,
      y: p.positionY,
      label: p.positionLabel,
      clubMemberId: p.clubMemberId || undefined,
    })),
    isHome: formation.isHome,
  };
}

/**
 * Save formation for a match
 * Uses upsert to handle both create and update
 * 
 * @param matchId - Match ID
 * @param data - Formation data including isHome flag
 */
export async function saveFormation(
  matchId: string,
  data: FormationData
): Promise<void> {
  // Upsert formation
  const formation = await prisma.formation.upsert({
    where: {
      matchId_isHome: {
        matchId,
        isHome: data.isHome,
      },
    },
    update: {
      formationName: data.formation,
    },
    create: {
      matchId,
      isHome: data.isHome,
      formationName: data.formation,
    },
  });

  // Delete old positions
  await prisma.formationPosition.deleteMany({
    where: { formationId: formation.id },
  });

  // Insert new positions
  if (data.positions.length > 0) {
    const positionData = data.positions.map(p => ({
      formationId: formation.id,
      clubMemberId: p.clubMemberId || null,
      positionX: p.x,
      positionY: p.y,
      positionLabel: p.label,
      isSubstitute: false,
    }));
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.formationPosition.createMany({
      data: positionData as any[],
    });
  }

  console.log('[FormationDB] Formation saved:', matchId, 'isHome:', data.isHome);
}

/**
 * Delete formation for a match (home or away)
 * 
 * @param matchId - Match ID
 * @param isHome - Whether to delete home formation (true) or away formation (false)
 */
export async function deleteFormation(matchId: string, isHome: boolean = true): Promise<void> {
  await prisma.formation.delete({
    where: {
      matchId_isHome: {
        matchId,
        isHome,
      },
    },
  });

  console.log('[FormationDB] Formation deleted:', matchId, 'isHome:', isHome);
}

/**
 * Get both home and away formations for a match
 * 
 * @param matchId - Match ID
 * @returns Object with home and away formations
 */
export async function getMatchFormations(matchId: string): Promise<{
  home: FormationData | null;
  away: FormationData | null;
}> {
  const [home, away] = await Promise.all([
    getFormation(matchId, true),
    getFormation(matchId, false),
  ]);

  return { home, away };
}

/**
 * Get all members who participated in a match (played=true)
 * Used for rating - only players who played can be rated
 * 
 * @param matchId - Match ID
 * @returns Array of club members with user info who played
 */
export async function getMatchParticipants(matchId: string): Promise<MatchPlayerWithPlayer[]> {
  const positions = await prisma.formationPosition.findMany({
    where: {
      played: true,
      formation: {
        matchId,
      },
    },
    include: {
      clubMember: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              nickname: true,
              image: true,
            },
          },
        },
      },
    },
  });

  return positions.map((pos) => ({
    id: pos.id,
    clubMemberId: pos.clubMemberId,
    user: pos.clubMember.user || null,
    jerseyNumber: pos.clubMember.jerseyNumber,
    primaryRole: pos.clubMember.primaryRole,
    played: pos.played,
  }));
}

/**
 * Get club members ordered by role priority
 * Used in formation builder - shows players with target role first
 * 
 * @param clubId - Club ID
 * @param targetRole - Optional role to prioritize
 * @returns Array of members sorted by role priority
 */
export async function getClubMembersWithRolePriority(
  clubId: string,
  targetRole?: string
): Promise<ClubMemberWithRolePriority[]> {
  const members = await prisma.clubMember.findMany({
    where: { clubId },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          nickname: true,
          image: true,
        },
      },
    },
    orderBy: [
      { primaryRole: 'asc' },
      { jerseyNumber: 'asc' },
    ],
  });

  return members.map((member) => {
    const isPrimary = member.primaryRole === targetRole;
    const isSecondary = member.secondaryRoles.includes(targetRole as any);
    
    // Priority: 0 = primary, 1 = secondary, 2 = other
    const rolePriority = isPrimary ? 0 : isSecondary ? 1 : 2;
    
    return {
      id: member.id,
      userId: member.userId,
      firstName: member.user?.firstName || '',
      lastName: member.user?.lastName || '',
      nickname: member.user?.nickname || undefined,
      jerseyNumber: member.jerseyNumber,
      primaryRole: member.primaryRole as any,
      secondaryRoles: member.secondaryRoles as any[],
      rolePriority,
      isAssigned: false,
      isAssignedToOtherTeam: false,
    };
  }).sort((a, b) => {
    // Sort by priority first, then by jersey number
    if (a.rolePriority !== b.rolePriority) {
      return a.rolePriority - b.rolePriority;
    }
    return a.jerseyNumber - b.jerseyNumber;
  });
}

/**
 * Save both team formations for a match in a transaction
 * Used in formation builder - saves team1 and team2 atomically
 * 
 * @param payload - SaveMatchFormationsPayload with both team formations
 * @returns Object with success status and formation IDs
 */
export async function saveMatchFormations(
  payload: SaveMatchFormationsPayload
): Promise<{ success: boolean; team1FormationId?: string; team2FormationId?: string; error?: string }> {
  const { matchId, team1, team2 } = payload;
  
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Delete existing formations
      await tx.formation.deleteMany({
        where: { matchId },
      });
      
      // Create Team 1 (home) formation
      const formation1 = await tx.formation.create({
        data: {
          matchId,
          isHome: true,
          formationName: team1.moduleId,
          positions: {
            create: team1.assignments.map((a) => ({
              clubMemberId: a.clubMemberId,
              positionX: a.positionX,
              positionY: a.positionY,
              positionLabel: a.positionLabel,
              isSubstitute: false,
              played: false,
            })),
          },
        },
      });
      
      // Create Team 2 (away) formation
      const formation2 = await tx.formation.create({
        data: {
          matchId,
          isHome: false,
          formationName: team2.moduleId,
          positions: {
            create: team2.assignments.map((a) => ({
              clubMemberId: a.clubMemberId,
              positionX: a.positionX,
              positionY: a.positionY,
              positionLabel: a.positionLabel,
              isSubstitute: false,
              played: false,
            })),
          },
        },
      });
      
      return {
        team1FormationId: formation1.id,
        team2FormationId: formation2.id,
      };
    });
    
    return {
      success: true,
      team1FormationId: result.team1FormationId,
      team2FormationId: result.team2FormationId,
    };
  } catch (error) {
    console.error('[FormationDB] Save match formations error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save formations',
    };
  }
}
