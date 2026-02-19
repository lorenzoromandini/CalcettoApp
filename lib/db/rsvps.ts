/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * RSVP Database Operations - Prisma Version
 * 
 * Provides CRUD operations for match RSVPs using Prisma and PostgreSQL.
 * Replaces the Supabase-based implementation.
 */

import { prisma } from './index';

export type RSVPStatus = 'in' | 'out' | 'maybe';

export interface RSVPCounts {
  in: number;
  out: number;
  maybe: number;
  total: number;
}

export interface MatchRSVP {
  id: string;
  match_id: string;
  player_id: string;
  player_name: string;
  player_avatar?: string;
  rsvp_status: RSVPStatus;
  rsvp_at: string;
}

function toMatchRSVP(dbMatchPlayer: any): MatchRSVP {
  return {
    id: dbMatchPlayer.id,
    match_id: dbMatchPlayer.matchId,
    player_id: dbMatchPlayer.playerId,
    player_name: dbMatchPlayer.player?.name || 'Unknown',
    player_avatar: dbMatchPlayer.player?.avatarUrl ?? undefined,
    rsvp_status: dbMatchPlayer.rsvpStatus as RSVPStatus,
    rsvp_at: dbMatchPlayer.rsvpAt?.toISOString() || new Date().toISOString(),
  };
}

// ============================================================================
// RSVP Operations
// ============================================================================

/**
 * Update or create an RSVP for a player
 * Uses upsert to handle both new and existing RSVPs
 * 
 * @param matchId - Match ID
 * @param playerId - Player ID
 * @param status - RSVP status ('in' | 'out' | 'maybe')
 */
export async function updateRSVP(
  matchId: string,
  playerId: string,
  status: RSVPStatus
): Promise<void> {
  const now = new Date();

  await prisma.matchPlayer.upsert({
    where: {
      matchId_playerId: {
        matchId,
        playerId,
      },
    },
    update: {
      rsvpStatus: status,
      rsvpAt: now,
    },
    create: {
      matchId,
      playerId,
      rsvpStatus: status,
      rsvpAt: now,
    },
  });

  console.log('[RSVPDB] RSVP updated:', matchId, playerId, status);
}

/**
 * Get all RSVPs for a match with player details
 * 
 * @param matchId - Match ID to get RSVPs for
 * @returns Array of RSVPs with player details
 */
export async function getMatchRSVPs(matchId: string): Promise<MatchRSVP[]> {
  const matchPlayers = await prisma.matchPlayer.findMany({
    where: { matchId },
    include: {
      player: true,
    },
  });

  const rsvps = matchPlayers.map(toMatchRSVP);

  // Sort by status priority: in > maybe > out, then by rsvp_at
  return rsvps.sort((a, b) => {
    const statusPriority = { in: 0, maybe: 1, out: 2 };
    if (statusPriority[a.rsvp_status] !== statusPriority[b.rsvp_status]) {
      return statusPriority[a.rsvp_status] - statusPriority[b.rsvp_status];
    }
    return new Date(a.rsvp_at).getTime() - new Date(b.rsvp_at).getTime();
  });
}

/**
 * Get RSVP counts for a match
 * 
 * @param matchId - Match ID
 * @returns Counts for each status and total
 */
export async function getRSVPCounts(matchId: string): Promise<RSVPCounts> {
  const counts = await prisma.matchPlayer.groupBy({
    by: ['rsvpStatus'],
    where: { matchId },
    _count: {
      rsvpStatus: true,
    },
  });

  const result = {
    in: 0,
    out: 0,
    maybe: 0,
    total: 0,
  };

  for (const count of counts) {
    const status = count.rsvpStatus as RSVPStatus;
    const cnt = count._count.rsvpStatus;
    result[status] = cnt;
    result.total += cnt;
  }

  return result;
}

/**
 * Get current user's RSVP for a match
 * 
 * @param matchId - Match ID
 * @param playerId - Player ID
 * @returns RSVP status or null if not responded
 */
export async function getMyRSVP(
  matchId: string,
  playerId: string
): Promise<RSVPStatus | null> {
  const matchPlayer = await prisma.matchPlayer.findUnique({
    where: {
      matchId_playerId: {
        matchId,
        playerId,
      },
    },
  });

  if (!matchPlayer) return null;
  return matchPlayer.rsvpStatus as RSVPStatus;
}

// ============================================================================
// Real-time Subscription (Placeholder)
// ============================================================================

/**
 * Subscribe to RSVP changes for a match
 * 
 * Note: Real-time subscriptions will be re-implemented using
 * a different approach (WebSockets, Server-Sent Events, or polling)
 * 
 * @param matchId - Match ID to subscribe to
 * @param onUpdate - Callback function when RSVPs change
 * @returns Unsubscribe function
 */
export function subscribeToRSVPs(
  _matchId: string,
  _onUpdate: (rsvps: MatchRSVP[]) => void
): () => void {
  // Placeholder - real-time updates will be re-implemented
  console.log('[RSVPDB] Real-time subscriptions not yet implemented with Prisma');

  // Return no-op unsubscribe function
  return () => {
    // No-op
  };
}


