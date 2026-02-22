import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-token';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const memberships = await prisma.clubMember.findMany({
      where: {
        userId: userId,
        club: {
          deletedAt: null,
        },
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const player = await prisma.player.findUnique({
      where: { userId: userId },
    });

    const teams = await Promise.all(
      memberships.map(async (membership) => {
        let jerseyNumber = null;
        let playerId = null;

        if (player) {
          const playerClub = await prisma.playerClub.findFirst({
            where: {
              playerId: player.id,
              clubId: membership.clubId,
            },
          });
          jerseyNumber = playerClub?.jerseyNumber ?? null;
          playerId = player?.id ?? null;
        }

        return {
          id: membership.club.id,
          name: membership.club.name,
          jerseyNumber,
          playerId,
        };
      })
    );

    return NextResponse.json({ teams });
  } catch (error) {
    console.error('Error fetching user teams:', error);
    return NextResponse.json(
      { error: 'Errore durante il caricamento delle squadre' },
      { status: 500 }
    );
  }
}
