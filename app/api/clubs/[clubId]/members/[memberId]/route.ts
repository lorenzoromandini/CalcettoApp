import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-token';
import { prisma } from '@/lib/prisma';

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

    if (!adminMembership || adminMembership.privileges !== 'owner') {
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

    if (targetMember.privileges === 'owner') {
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
