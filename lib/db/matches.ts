/**
 * Matches Database Operations - Prisma Version
 */

import { prisma } from '@/lib/prisma';
import type { Match, MatchPlayer } from '@/lib/db/schema';
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
    created_by: dbMatch.createdBy,
    created_at: dbMatch.createdAt.toISOString(),
    updated_at: dbMatch.updatedAt.toISOString(),
    sync_status: 'synced',
  };
}

function toMatchPlayerType(dbMatchPlayer: any): MatchPlayer {
  return {
    id: dbMatchPlayer.id,
    match_id: dbMatchPlayer.matchId,
    player_id: dbMatchPlayer.playerId,
    rsvp_status: dbMatchPlayer.rsvpStatus as MatchPlayer['rsvp_status'],
    rsvp_at: dbMatchPlayer.rsvpAt?.toISOString() ?? '',
    position_on_pitch: dbMatchPlayer.positionOnPitch ?? undefined,
    sync_status: 'synced',
  };
}

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
      status: 'scheduled',
      notes: data.notes,
      createdBy: userId,
    },
  });

  return match.id;
}

export async function getTeamMatches(teamId: string): Promise<Match[]> {
  const matches = await prisma.match.findMany({
    where: { teamId },
    orderBy: {
      scheduledAt: 'desc',
    },
  });

  return matches.map(toMatchType);
}

export async function getMatch(matchId: string): Promise<Match | null> {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
  });

  if (!match) return null;
  return toMatchType(match);
}

export async function getUpcomingMatches(teamId: string): Promise<Match[]> {
  const now = new Date();
  
  const matches = await prisma.match.findMany({
    where: {
      teamId,
      scheduledAt: {
        gte: now,
      },
      status: 'scheduled',
    },
    orderBy: {
      scheduledAt: 'asc',
    },
  });

  return matches.map(toMatchType);
}

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
            in: ['completed', 'cancelled'],
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

export async function updateMatch(
  matchId: string,
  data: UpdateMatchInput
): Promise<void> {
  await prisma.match.update({
    where: {
      id: matchId,
      status: 'scheduled',
    },
    data: {
      scheduledAt: data.scheduled_at ? new Date(data.scheduled_at) : undefined,
      location: data.location,
      mode: data.mode,
      notes: data.notes,
    },
  });
}

export async function cancelMatch(matchId: string): Promise<void> {
  await prisma.match.update({
    where: {
      id: matchId,
      status: 'scheduled',
    },
    data: {
      status: 'cancelled',
    },
  });
}

export async function uncancelMatch(matchId: string): Promise<void> {
  await prisma.match.update({
    where: {
      id: matchId,
      status: 'cancelled',
    },
    data: {
      status: 'scheduled',
    },
  });
}

export async function isMatchAdmin(matchId: string, userId: string): Promise<boolean> {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { teamId: true },
  });

  if (!match) return false;

  const membership = await prisma.teamMember.findFirst({
    where: {
      teamId: match.teamId,
      userId,
      role: {
        in: ['admin', 'co-admin'],
      },
    },
  });

  return !!membership;
}

// Match Players (RSVP)
export async function getMatchPlayers(matchId: string): Promise<MatchPlayer[]> {
  const players = await prisma.matchPlayer.findMany({
    where: { matchId },
    include: {
      player: {
        select: {
          name: true,
          surname: true,
          avatarUrl: true,
        },
      },
    },
  });

  return players.map(toMatchPlayerType);
}

export async function updateRSVP(
  matchId: string,
  playerId: string,
  status: 'in' | 'out' | 'maybe'
): Promise<void> {
  await prisma.matchPlayer.upsert({
    where: {
      matchId_playerId: {
        matchId,
        playerId,
      },
    },
    update: {
      rsvpStatus: status,
      rsvpAt: new Date(),
    },
    create: {
      matchId,
      playerId,
      rsvpStatus: status,
      rsvpAt: new Date(),
    },
  });
}

export async function getRSVPCounts(matchId: string) {
  const counts = await prisma.matchPlayer.groupBy({
    by: ['rsvpStatus'],
    where: { matchId },
    _count: {
      rsvpStatus: true,
    },
  });

  return {
    in: counts.find(c => c.rsvpStatus === 'in')?._count.rsvpStatus ?? 0,
    out: counts.find(c => c.rsvpStatus === 'out')?._count.rsvpStatus ?? 0,
    maybe: counts.find(c => c.rsvpStatus === 'maybe')?._count.rsvpStatus ?? 0,
  };
}
