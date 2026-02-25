import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-token';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const memberships = await prisma.clubMember.findMany({
      where: {
        userId: userId,
        club: {
          deletedAt: null,
        },
      },
      select: {
        clubId: true,
        privilege: true,
      },
    });

    const privileges = memberships.map((m) => ({
      clubId: m.clubId,
      privilege: m.privileges as 'owner' | 'manager' | 'member',
    }));

    return NextResponse.json({ privileges });
  } catch (error) {
    console.error('Error fetching user privileges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user privileges' },
      { status: 500 }
    );
  }
}
