import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-token';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const requestingUserId = getUserIdFromRequest(request);
  
  if (!requestingUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = await params;

  try {
    // Verifica che l'utente richiedente sia lo stesso utente o un admin
    const isSelf = requestingUserId === userId;
    
    if (!isSelf) {
      // Se non è se stesso, verifica se è admin di almeno un club in comune
      const commonClub = await prisma.clubMember.findFirst({
        where: {
          userId: requestingUserId,
          privileges: { in: ['OWNER', 'MANAGER'] },
          club: {
            members: {
              some: { userId }
            }
          }
        }
      });

      if (!commonClub) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
      }
    }

    // Get all clubs with membership details
    const memberships = await prisma.clubMember.findMany({
      where: { userId },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    });

    const clubs = memberships.map(m => ({
      membershipId: m.id,
      clubId: m.clubId,
      name: m.club.name,
      imageUrl: m.club.imageUrl,
      jerseyNumber: m.jerseyNumber,
      primaryRole: m.primaryRole,
      secondaryRoles: m.secondaryRoles,
      privileges: m.privileges,
      joinedAt: m.joinedAt.toISOString(),
    }));

    return NextResponse.json(clubs);
  } catch (error) {
    console.error('Failed to fetch user clubs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user clubs' },
      { status: 500 }
    );
  }
}
