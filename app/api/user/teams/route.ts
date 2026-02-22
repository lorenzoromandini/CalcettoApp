import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-token';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const memberships = await prisma.teamMember.findMany({
      where: {
        userId: userId,
        team: {
          deletedAt: null,
        },
      },
      include: {
        team: {
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
          const playerTeam = await prisma.playerTeam.findFirst({
            where: {
              playerId: player.id,
              teamId: membership.teamId,
            },
          });
          jerseyNumber = playerTeam?.jerseyNumber ?? null;
          playerId = player?.id ?? null;
        }

        return {
          id: membership.team.id,
          name: membership.team.name,
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
