/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Formation Database Operations - Prisma Version
 * 
 * Provides CRUD operations for formations using Prisma and PostgreSQL.
 * Replaces the Supabase-based implementation.
 */

import { prisma } from './index';
import type { FormationMode } from '@/lib/formations';

export interface FormationPosition {
  x: number;
  y: number;
  label: string;
  playerId?: string;
}

export interface FormationData {
  formation: string; // preset ID like "5-1-2-1"
  positions: FormationPosition[];
}

/**
 * Get formation for a match
 * 
 * @param matchId - Match ID
 * @returns Formation data or null if not found
 */
export async function getFormation(matchId: string): Promise<FormationData | null> {
  const formation = await prisma.formation.findUnique({
    where: { matchId },
    include: {
      positions: true,
    },
  });

  if (!formation) {
    return null;
  }

  const teamFormation = formation.teamFormation as { formation?: string } | null;

  return {
    formation: teamFormation?.formation || '5-1-2-1',
    positions: formation.positions.map(p => ({
      x: p.positionX,
      y: p.positionY,
      label: p.positionLabel,
      playerId: p.playerId || undefined,
    })),
  };
}

/**
 * Save formation for a match
 * Uses upsert to handle both create and update
 * 
 * @param matchId - Match ID
 * @param data - Formation data
 */
export async function saveFormation(
  matchId: string,
  data: FormationData
): Promise<void> {
  // Upsert formation
  const formation = await prisma.formation.upsert({
    where: { matchId },
    update: {
      teamFormation: { formation: data.formation },
    },
    create: {
      matchId,
      teamFormation: { formation: data.formation },
    },
  });

  // Delete old positions
  await prisma.formationPosition.deleteMany({
    where: { formationId: formation.id },
  });

  // Insert new positions
  if (data.positions.length > 0) {
    await prisma.formationPosition.createMany({
      data: data.positions.map(p => ({
        formationId: formation.id,
        playerId: p.playerId || null,
        positionX: p.x,
        positionY: p.y,
        positionLabel: p.label,
        isSubstitute: false,
      })),
    });
  }

  console.log('[FormationDB] Formation saved:', matchId);
}

/**
 * Delete formation for a match
 * 
 * @param matchId - Match ID
 */
export async function deleteFormation(matchId: string): Promise<void> {
  await prisma.formation.delete({
    where: { matchId },
  });

  console.log('[FormationDB] Formation deleted:', matchId);
}
