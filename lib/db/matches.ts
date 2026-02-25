/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Match Database Operations - Prisma Version
 * 
 * Provides CRUD operations for matches using Prisma and PostgreSQL.
 * Replaces the Supabase-based implementation.
 * 
 * Updated for new schema:
 * - Removed sync_status field
 * - Mode is now enum (FIVE_V_FIVE/EIGHT_V_EIGHT/ELEVEN_V_ELEVEN)
 * - Using MatchStatus and MatchMode enums from Prisma
 */

import { prisma } from './index';
import { MatchStatus, MatchMode, ClubPrivilege } from '@prisma/client';
import type { Match } from '@/types/database';
import type { CreateMatchInput, UpdateMatchInput } from '@/lib/validations/match';

function toMatchType(dbMatch: any): Match {
  return {
    id: dbMatch.id,
    clubId: dbMatch.clubId,
    scheduledAt: dbMatch.scheduledAt.toISOString(),
    location: dbMatch.location ?? undefined,
    mode: dbMatch.mode as MatchMode,
    status: dbMatch.status as MatchStatus,
    homeScore: dbMatch.homeScore ?? undefined,
    awayScore: dbMatch.awayScore ?? undefined,
    notes: dbMatch.notes ?? undefined,
    createdBy: dbMatch.createdBy || '',
    createdAt: dbMatch.createdAt.toISOString(),
    updatedAt: dbMatch.updatedAt.toISOString(),
    scoreFinalizedBy: dbMatch.scoreFinalizedBy ?? undefined,
    ratingsCompletedBy: dbMatch.ratingsCompletedBy ?? undefined,
    scoreFinalizedAt: dbMatch.scoreFinalizedAt?.toISOString() ?? undefined,
    ratingsCompletedAt: dbMatch.ratingsCompletedAt?.toISOString() ?? undefined,
    sharedToken: dbMatch.sharedToken ?? undefined,
    sharedAt: dbMatch.sharedAt?.toISOString() ?? undefined,
  };
}

// ============================================================================
// Match CRUD Operations
// ============================================================================

/**
 * Create a new match
 * 
 * @param data - Match creation data (scheduled_at, location, mode, notes)
 * @param clubId - ID of the team the match belongs to
 * @param userId - ID of the user creating the match
 * @returns The created match ID
 */
export async function createMatch(
  data: CreateMatchInput,
  clubId: string,
  userId: string
): Promise<string> {
  const match = await prisma.match.create({
    data: {
      clubId,
      scheduledAt: new Date(data.scheduledAt),
      location: data.location,
      mode: data.mode as MatchMode,
      status: 'SCHEDULED' as MatchStatus,
      notes: data.notes,
      createdBy: userId,
    },
  });

  console.log('[MatchDB] Match created:', match.id);
  return match.id;
}

/**
 * Get all matches for a club
 * 
 * @param clubId - Club ID to get matches for
 * @returns Array of matches
 */
export async function getClubMatches(clubId: string): Promise<Match[]> {
  const matches = await prisma.match.findMany({
    where: { clubId },
    orderBy: {
      scheduledAt: 'desc',
    },
  });

  return matches.map(toMatchType);
}

/**
 * Get a single match by ID
 * 
 * @param matchId - Match ID to fetch
 * @returns Match object or null if not found
 */
export async function getMatch(matchId: string): Promise<Match | null> {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
  });

  if (!match) return null;
  return toMatchType(match);
}

/**
 * Get upcoming matches for a club
 * Matches where scheduled_at >= NOW() AND status = 'scheduled'
 * 
 * @param clubId - Club ID to get matches for
 * @returns Array of upcoming matches, ordered by scheduled_at ASC
 */
export async function getUpcomingMatches(clubId: string): Promise<Match[]> {
  const now = new Date();
  
  const matches = await prisma.match.findMany({
    where: {
      clubId,
      scheduledAt: {
        gte: now,
      },
      status: 'SCHEDULED' as MatchStatus,
    },
    orderBy: {
      scheduledAt: 'asc',
    },
  });

  return matches.map(toMatchType);
}

/**
 * Get past matches for a club
 * Matches where scheduled_at < NOW() OR status IN ('completed', 'cancelled')
 * 
 * @param clubId - Club ID to get matches for
 * @returns Array of past matches, ordered by scheduled_at DESC
 */
export async function getPastMatches(clubId: string): Promise<Match[]> {
  const now = new Date();
  
  const matches = await prisma.match.findMany({
    where: {
      clubId,
      OR: [
        {
          scheduledAt: {
            lt: now,
          },
        },
        {
          status: {
            in: ['COMPLETED', 'CANCELLED'] as MatchStatus[],
          },
        },
      ],
    },
    orderBy: {
      scheduledAt: 'desc',
    },
  });

  return matches.map(toMatchType);
}

/**
 * Update a match
 * Can only update if status = 'scheduled'
 * 
 * @param matchId - Match ID to update
 * @param data - Update data (partial match fields)
 */
export async function updateMatch(
  matchId: string,
  data: UpdateMatchInput
): Promise<void> {
  // Check if match exists and can be updated
  const existing = await prisma.match.findUnique({
    where: { id: matchId },
  });

  if (!existing) {
    throw new Error('Match not found');
  }

  if (existing.status !== 'SCHEDULED') {
    throw new Error('Cannot update match that has already started or been cancelled');
  }

  await prisma.match.update({
    where: { id: matchId },
    data: {
      ...data,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      mode: data.mode ? data.mode as MatchMode : undefined,
    },
  });

  console.log('[MatchDB] Match updated:', matchId);
}

/**
 * Cancel a match (set status to 'cancelled')
 * Can only cancel if status = 'scheduled'
 * 
 * @param matchId - Match ID to cancel
 */
export async function cancelMatch(matchId: string): Promise<void> {
  // Check if match exists and can be cancelled
  const existing = await prisma.match.findUnique({
    where: { id: matchId },
  });

  if (!existing) {
    throw new Error('Match not found');
  }

  if (existing.status !== 'SCHEDULED') {
    throw new Error('Cannot cancel match that has already started or been cancelled');
  }

  await prisma.match.update({
    where: { id: matchId },
    data: {
      status: 'CANCELLED' as MatchStatus,
    },
  });

  console.log('[MatchDB] Match cancelled:', matchId);
}

/**
 * Uncancel a match (set status back to 'scheduled')
 * 
 * @param matchId - Match ID to uncancel
 */
export async function uncancelMatch(matchId: string): Promise<void> {
  // Check if match exists
  const existing = await prisma.match.findUnique({
    where: { id: matchId },
  });

  if (!existing) {
    throw new Error('Match not found');
  }

  if (existing.status !== 'CANCELLED') {
    throw new Error('Cannot uncancel match that is not cancelled');
  }

  await prisma.match.update({
    where: { id: matchId },
    data: {
      status: 'SCHEDULED' as MatchStatus,
    },
  });

  console.log('[MatchDB] Match uncancelled:', matchId);
}

// ============================================================================
// Admin Check Helper
// ============================================================================

/**
 * Check if a user is an admin of the team that owns a match
 * 
 * @param matchId - Match ID to check
 * @param userId - User ID to check
 * @returns true if user is admin of the match's team
 */
export async function isMatchAdmin(matchId: string, userId: string): Promise<boolean> {
  // Get the match
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { clubId: true },
  });

  if (!match) return false;

  // Check club membership
  const membership = await prisma.clubMember.findFirst({
    where: {
      clubId: match.clubId,
      userId: userId,
      privileges: {
        in: [ClubPrivilege.OWNER, ClubPrivilege.MANAGER],
      },
    },
  });

  return !!membership;
}

// Re-export enums for convenience
export { ClubPrivilege };
