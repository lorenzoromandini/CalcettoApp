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
