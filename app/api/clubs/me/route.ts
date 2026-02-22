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
        role: true,
      },
    });

    const roles = memberships.map((m) => ({
      clubId: m.clubId,
      role: m.role as 'admin' | 'co-admin' | 'member',
    }));

    return NextResponse.json({ roles });
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user roles' },
      { status: 500 }
    );
  }
}
