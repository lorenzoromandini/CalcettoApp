import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-token';
import { prisma } from '@/lib/prisma';
import { MatchStatus } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string; memberId: string }> }
) {
  const userId = getUserIdFromRequest(request);
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { clubId, memberId } = await params;

  try {
    // Verifica che l'utente sia membro del club
    const requestingMember = await prisma.clubMember.findFirst({
      where: { clubId, userId },
    });

    if (!requestingMember) {
      return NextResponse.json({ error: 'Not a member of this club' }, { status: 403 });
    }

    // Get matches played
    const matchesPlayed = await prisma.formationPosition.count({
      where: {
        clubMemberId: memberId,
        played: true,
        formation: {
          match: {
            clubId,
            status: MatchStatus.COMPLETED,
          },
        },
      },
    });

    // Get goals scored
    const goalsScored = await prisma.goal.count({
      where: {
        scorerId: memberId,
        match: {
          clubId,
          status: MatchStatus.COMPLETED,
        },
      },
    });

    // Get assists
    const assists = await prisma.goal.count({
      where: {
        assisterId: memberId,
        match: {
          clubId,
          status: MatchStatus.COMPLETED,
        },
      },
    });

    // Get ratings
    const ratings = await prisma.playerRating.findMany({
      where: {
        clubMemberId: memberId,
        match: {
          clubId,
          status: MatchStatus.COMPLETED,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 3,
      select: {
        id: true,
        rating: true,
      },
    });

    // Calculate average rating
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating.toNumber(), 0) / ratings.length
      : null;

    return NextResponse.json({
      matchesPlayed,
      goalsScored,
      assists,
      avgRating,
      ratings: ratings.map(r => ({
        id: r.id,
        rating: r.rating,
      })),
    });
  } catch (error) {
    console.error('Failed to fetch member stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch member statistics' },
      { status: 500 }
    );
  }
}
