/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Match Database Operations - Prisma Version
 * 
 * Provides CRUD operations for matches using Prisma and PostgreSQL.
 * Replaces the Supabase-based implementation.
 */

import { prisma } from './index';
import { MatchStatus } from '@prisma/client';
import type { Match } from '@/types/database';
import type { CreateMatchInput, UpdateMatchInput } from '@/lib/validations/match';

function toMatchType(dbMatch: any): Match {
  return {
    id: dbMatch.id,
    team_id: dbMatch.teamId,
    scheduled_at: dbMatch.scheduledAt.toISOString(),
    location: dbMatch.location ?? undefined,
    mode: dbMatch.mode as Match['mode'],
    status: dbMatch.status as Match['status'],
    home_score: dbMatch.homeScore ?? undefined,
    away_score: dbMatch.awayScore ?? undefined,
    notes: dbMatch.notes ?? undefined,
    created_by: dbMatch.createdBy || '',
    created_at: dbMatch.createdAt.toISOString(),
    updated_at: dbMatch.updatedAt.toISOString(),
  };
}

// ============================================================================
// Match CRUD Operations
// ============================================================================

/**
 * Create a new match
 * 
 * @param data - Match creation data (scheduled_at, location, mode, notes)
 * @param teamId - ID of the team the match belongs to
 * @param userId - ID of the user creating the match
 * @returns The created match ID
 */
export async function createMatch(
  data: CreateMatchInput,
  teamId: string,
  userId: string
): Promise<string> {
  const match = await prisma.match.create({
    data: {
      teamId,
      scheduledAt: new Date(data.scheduled_at),
      location: data.location,
      mode: data.mode,
      status: MatchStatus.SCHEDULED,
      notes: data.notes,
      createdBy: userId,
    },
  });

  console.log('[MatchDB] Match created:', match.id);
  return match.id;
}

/**
 * Get all matches for a team
 * 
 * @param teamId - Team ID to get matches for
 * @returns Array of matches
 */
export async function getTeamMatches(teamId: string): Promise<Match[]> {
  const matches = await prisma.match.findMany({
    where: { teamId },
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
 * Get upcoming matches for a team
 * Matches where scheduled_at >= NOW() AND status = 'scheduled'
 * 
 * @param teamId - Team ID to get matches for
 * @returns Array of upcoming matches, ordered by scheduled_at ASC
 */
export async function getUpcomingMatches(teamId: string): Promise<Match[]> {
  const now = new Date();
  
  const matches = await prisma.match.findMany({
    where: {
      teamId,
      scheduledAt: {
        gte: now,
      },
      status: MatchStatus.SCHEDULED,
    },
    orderBy: {
      scheduledAt: 'asc',
    },
  });

  return matches.map(toMatchType);
}

/**
 * Get past matches for a team
 * Matches where scheduled_at < NOW() OR status IN ('completed', 'cancelled')
 * 
 * @param teamId - Team ID to get matches for
 * @returns Array of past matches, ordered by scheduled_at DESC
 */
export async function getPastMatches(teamId: string): Promise<Match[]> {
  const now = new Date();
  
  const matches = await prisma.match.findMany({
    where: {
      teamId,
      OR: [
        {
          scheduledAt: {
            lt: now,
          },
        },
        {
          status: {
            in: [MatchStatus.COMPLETED, MatchStatus.CANCELLED],
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

  if (existing.status !== MatchStatus.SCHEDULED) {
    throw new Error('Cannot update match that has already started or been cancelled');
  }

  await prisma.match.update({
    where: { id: matchId },
    data: {
      ...data,
      scheduledAt: data.scheduled_at ? new Date(data.scheduled_at) : undefined,
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

  if (existing.status !== MatchStatus.SCHEDULED) {
    throw new Error('Cannot cancel match that has already started or been cancelled');
  }

  await prisma.match.update({
    where: { id: matchId },
    data: {
      status: MatchStatus.CANCELLED,
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

  if (existing.status !== MatchStatus.CANCELLED) {
    throw new Error('Cannot uncancel match that is not cancelled');
  }

  await prisma.match.update({
    where: { id: matchId },
    data: {
      status: MatchStatus.SCHEDULED,
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
    select: { teamId: true },
  });

  if (!match) return false;

  // Check team membership
  const membership = await prisma.teamMember.findFirst({
    where: {
      teamId: match.teamId,
      userId: userId,
      role: {
        in: ['admin', 'co-admin'],
      },
    },
  });

  return !!membership;
}


