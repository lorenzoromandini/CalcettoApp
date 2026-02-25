import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-token';
import { prisma } from '@/lib/prisma';
import { ClubPrivilege } from '@prisma/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const userId = getUserIdFromRequest(request);
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { clubId } = await params;

  try {
    // Verifica che l'utente sia Owner
    const membership = await prisma.clubMember.findFirst({
      where: { clubId, userId },
    });

    if (!membership || membership.privileges !== ClubPrivilege.OWNER) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Trova tutti i membri di test (email che inizia con 'test.')
    const testMembers = await prisma.clubMember.findMany({
      where: { 
        clubId,
        user: {
          email: {
            startsWith: 'test.',
          },
        },
      },
      include: {
        user: true,
      },
    });

    let removedCount = 0;

    // Elimina i membri di test
    for (const member of testMembers) {
      // Elimina prima il club member
      await prisma.clubMember.delete({
        where: { id: member.id },
      });

      // Poi elimina l'utente
      if (member.userId) {
        await prisma.user.delete({
          where: { id: member.userId },
        });
      }

      removedCount++;
    }

    return NextResponse.json({
      success: true,
      removedCount,
      message: `Rimossi ${removedCount} membri di test`,
    });
  } catch (error) {
    console.error('Failed to cleanup test members:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup' },
      { status: 500 }
    );
  }
}
