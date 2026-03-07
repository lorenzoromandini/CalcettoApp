import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-token';
import { prisma } from '@/lib/prisma';
import { PlayerRole } from '@prisma/client';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string; memberId: string }> }
) {
  const userId = getUserIdFromRequest(request);
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { clubId, memberId } = await params;

  try {
    const body = await request.json();
    const { jerseyNumber, primaryRole, secondaryRoles } = body;

    // Verifica che l'utente sia il proprietario del profilo o admin del club
    const member = await prisma.clubMember.findFirst({
      where: {
        id: memberId,
        clubId,
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Verifica che l'utente possa modificare (se stesso o admin)
    const isSelf = member.userId === userId;
    const isAdmin = await prisma.clubMember.findFirst({
      where: {
        clubId,
        userId,
        privileges: { in: ['OWNER', 'MANAGER'] },
      },
    });

    if (!isSelf && !isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Validate jersey number uniqueness
    if (jerseyNumber !== undefined) {
      const existingMember = await prisma.clubMember.findFirst({
        where: {
          clubId,
          jerseyNumber,
          NOT: { id: memberId },
        },
      });

      if (existingMember) {
        return NextResponse.json({ 
          error: 'Numero di maglia già in uso' 
        }, { status: 400 });
      }
    }

    // Update member
    const updatedMember = await prisma.clubMember.update({
      where: { id: memberId },
      data: {
        ...(jerseyNumber !== undefined && { jerseyNumber }),
        ...(primaryRole && { primaryRole: primaryRole as PlayerRole }),
        ...(secondaryRoles && { secondaryRoles: secondaryRoles as PlayerRole[] }),
      },
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error('Failed to update member:', error);
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    );
  }
}
