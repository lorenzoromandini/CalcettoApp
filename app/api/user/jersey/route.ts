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

    const membership = await prisma.clubMember.findFirst({
      where: {
        userId,
        clubId,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Non fai parte di questa squadra' },
        { status: 403 }
      );
    }

    const existingPlayerClub = await prisma.playerClub.findFirst({
      where: {
        clubId,
        jerseyNumber,
      },
    });

    let player = await prisma.player.findUnique({
      where: { userId },
    });

    if (existingPlayerClub && existingPlayerClub.playerId !== player?.id) {
      return NextResponse.json(
        { error: 'Questo numero è già stato preso da un altro giocatore in questa squadra' },
        { status: 400 }
      );
    }

    if (!player) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      player = await prisma.player.create({
        data: {
          name: user?.firstName || 'Player',
          surname: user?.lastName,
          nickname: user?.nickname,
          userId,
          roles: [],
        },
      });
    }

    const existingEntry = await prisma.playerClub.findFirst({
      where: {
        playerId: player.id,
        clubId,
      },
    });

    if (existingEntry) {
      await prisma.playerClub.update({
        where: { id: existingEntry.id },
        data: { jerseyNumber },
      });
    } else {
      await prisma.playerClub.create({
        data: {
          playerId: player.id,
          clubId,
          jerseyNumber,
          primaryRole: 'player',
        },
      });
    }

    return NextResponse.json({ success: true, jerseyNumber });
  } catch (error) {
    console.error('Error updating jersey number:', error);
    return NextResponse.json(
      { error: 'Errore durante il salvataggio' },
      { status: 500 }
    );
  }
}
