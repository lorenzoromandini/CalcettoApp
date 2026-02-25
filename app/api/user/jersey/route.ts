import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-token';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const body = await request.json();
    const { clubId, jerseyNumber } = body;

    if (!clubId || typeof jerseyNumber !== 'number' || jerseyNumber < 1 || jerseyNumber > 99) {
      return NextResponse.json(
        { error: 'Dati non validi. Il numero deve essere tra 1 e 99.' },
        { status: 400 }
      );
    }

    const membership = await prisma.clubMember.findUnique({
      where: {
        clubId_userId: {
          clubId,
          userId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Non fai parte di questo club' },
        { status: 403 }
      );
    }

    // Check if jersey number is already taken by another member
    const existingMember = await prisma.clubMember.findFirst({
      where: {
        clubId,
        jerseyNumber,
        id: {
          not: membership.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'Questo numero è già stato preso da un altro giocatore in questo club' },
        { status: 400 }
      );
    }

    // Update the member's jersey number
    await prisma.clubMember.update({
      where: { id: membership.id },
      data: { jerseyNumber },
    });

    return NextResponse.json({ success: true, jerseyNumber });
  } catch (error) {
    console.error('Error updating jersey number:', error);
    return NextResponse.json(
      { error: 'Errore durante il salvataggio' },
      { status: 500 }
    );
  }
}
