import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-token';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string; memberId: string }> }
) {
  const userId = getUserIdFromRequest(request);
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { clubId, memberId } = await params;
  const { privilege } = await request.json();

  try {
    // Verifica che l'utente sia Owner
    const ownerMembership = await prisma.clubMember.findFirst({
      where: { clubId, userId },
    });

    if (!ownerMembership || ownerMembership.privilege !== 'owner') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Non permettere di modificare l'owner stesso
    const targetMember = await prisma.clubMember.findUnique({
      where: { id: memberId },
    });

    if (!targetMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    if (targetMember.clubId !== clubId) {
      return NextResponse.json({ error: 'Member not in this club' }, { status: 403 });
    }

    if (targetMember.privilege === 'owner') {
      return NextResponse.json({ error: 'Cannot modify owner privilege' }, { status: 403 });
    }

    // Aggiorna il privilegio
    const updatedMember = await prisma.clubMember.update({
      where: { id: memberId },
      data: { privilege },
    });

    return NextResponse.json({ success: true, member: updatedMember });
  } catch (error) {
    console.error('Failed to update member privilege:', error);
    return NextResponse.json(
      { error: 'Failed to update member privilege' },
      { status: 500 }
    );
  }
}
