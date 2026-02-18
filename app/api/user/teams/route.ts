import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const memberships = await prisma.teamMember.findMany({
      where: {
        userId: session.user.id,
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
      where: { userId: session.user.id },
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
