/**
 * Player Participation Database Operations
 * 
 * Stubs for participation tracking functions.
 * These are referenced by hooks/use-player-participation.ts
 * but the actual implementation depends on your business logic.
 * 
 * The new schema uses FormationPosition.played to track participation.
 */

import { prisma } from './index';

export interface ParticipationUpdate {
  playerId: string;
  played: boolean;
}

export interface MatchPlayerWithPlayer {
  id: string;
  clubMemberId: string;
  user: {
    firstName: string;
    lastName: string;
    nickname: string | null;
    image: string | null;
  } | null;
  jerseyNumber: number;
  primaryRole: string;
  played: boolean;
}

/**
 * Get all participants for a match
 * Returns club members who have formation positions with played=true
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
 * Update a single player's participation status
 * Note: This updates the played flag on FormationPosition
 */
export async function updatePlayerParticipation(
  matchId: string,
  playerId: string,
  played: boolean
): Promise<void> {
  // Find the formation position for this player in this match
  const position = await prisma.formationPosition.findFirst({
    where: {
      clubMemberId: playerId,
      formation: {
        matchId,
      },
    },
  });

  if (position) {
    await prisma.formationPosition.update({
      where: { id: position.id },
      data: { played },
    });
  }
}

/**
 * Bulk update participation for multiple players
 */
export async function bulkUpdateParticipation(
  matchId: string,
  updates: ParticipationUpdate[]
): Promise<void> {
  for (const update of updates) {
    await updatePlayerParticipation(matchId, update.playerId, update.played);
  }
}

/**
 * Get participation counts for a match
 */
export async function getParticipationCounts(matchId: string): Promise<{
  played: number;
  total: number;
  rsvps: { in: number; maybe: number; out: number };
}> {
  const positions = await prisma.formationPosition.findMany({
    where: {
      formation: {
        matchId,
      },
    },
  });

  const played = positions.filter(p => p.played).length;
  const total = positions.length;

  // RSVP functionality not implemented in new schema
  return {
    played,
    total,
    rsvps: { in: 0, maybe: 0, out: 0 },
  };
}

// Backward compatibility alias
export type { MatchPlayerWithPlayer as MatchPlayerWithMember };
