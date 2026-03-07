import { NextRequest, NextResponse } from 'next/server';
import { ClubPrivilege } from '@prisma/client';
import { getUserIdFromRequest } from '@/lib/auth-token';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string; memberId: string }> }
) {
  const userId = getUserIdFromRequest(request);
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { clubId, memberId } = await params;

  try {
    // Get member data
    const member = await prisma.clubMember.findFirst({
      where: {
        id: memberId,
        clubId,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            nickname: true,
            image: true,
          }
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: member.id,
      clubId: member.clubId,
      userId: member.userId,
      jerseyNumber: member.jerseyNumber,
      primaryRole: member.primaryRole,
      secondaryRoles: member.secondaryRoles,
      symbol: (member as any).symbol,
      privileges: member.privileges,
      joinedAt: member.joinedAt.toISOString(),
      user: member.user,
    });
  } catch (error) {
    console.error('Failed to fetch member:', error);
    return NextResponse.json(
      { error: 'Failed to fetch member data' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string; memberId: string }> }
) {
  const userId = getUserIdFromRequest(request);
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { clubId, memberId } = await params;

  try {
    // Verifica che l'utente sia Admin
    const adminMembership = await prisma.clubMember.findFirst({
      where: { clubId, userId },
    });

    if (!adminMembership || adminMembership.privileges !== ClubPrivilege.OWNER) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Trova il membro da rimuovere
    const targetMember = await prisma.clubMember.findUnique({
      where: { id: memberId },
    });

    if (!targetMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    if (targetMember.clubId !== clubId) {
      return NextResponse.json({ error: 'Member not in this club' }, { status: 403 });
    }

    // Non permettere di rimuovere se stesso o l'owner
    if (targetMember.userId === userId) {
      return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 403 });
    }

    if (targetMember.privileges === ClubPrivilege.OWNER) {
      return NextResponse.json({ error: 'Cannot remove owner' }, { status: 403 });
    }

    // Rimuovi il membro
    await prisma.clubMember.delete({
      where: { id: memberId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove member:', error);
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}
