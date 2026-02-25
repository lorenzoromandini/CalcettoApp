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

    const clubs = memberships.map((membership) => {
      return {
        id: membership.club.id,
        name: membership.club.name,
        jerseyNumber: membership.jerseyNumber,
        memberId: membership.id,
      };
    });

    return NextResponse.json({ clubs });
  } catch (error) {
    console.error('Error fetching user clubs:', error);
    return NextResponse.json(
      { error: 'Errore durante il caricamento dei club' },
      { status: 500 }
    );
  }
}
