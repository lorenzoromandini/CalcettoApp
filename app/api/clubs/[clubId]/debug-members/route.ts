import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-token';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const userId = getUserIdFromRequest(request);
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { clubId } = await params;

  try {
    // Verifica che l'utente sia membro del club
    const membership = await prisma.clubMember.findFirst({
      where: { clubId, userId },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Not a member' }, { status: 403 });
    }

    // Ottieni tutti i membri del club con info complete
    const members = await prisma.clubMember.findMany({
      where: { clubId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            password: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });

    const totalCount = await prisma.clubMember.count({
      where: { clubId },
    });

    return NextResponse.json({
      totalCount,
      members: members.map(m => ({
        id: m.id,
        userId: m.userId,
        privilege: m.privileges,
        email: m.user?.email,
        name: m.user?.firstName && m.user?.lastName 
          ? `${m.user.firstName} ${m.user.lastName}`
          : m.user?.email,
        isTestUser: m.user?.email?.startsWith('test.') || m.user?.password === 'test-password-hash',
        password: m.user?.password, // Solo per debug
        createdAt: m.user?.createdAt,
      })),
    });
  } catch (error) {
    console.error('Failed to debug club members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}
