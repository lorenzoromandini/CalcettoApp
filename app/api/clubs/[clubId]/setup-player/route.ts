import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-token';
import { prisma } from '@/lib/prisma';
import type { PlayerRole } from '@/lib/db/schema';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const userId = getUserIdFromRequest(request);
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { clubId } = await params;

  const clubMember = await prisma.clubMember.findFirst({
    where: { clubId, userId },
  });

  if (!clubMember) {
    return NextResponse.json({ error: 'Not a member of this team' }, { status: 403 });
  }

  const playerClubs = await prisma.playerClub.findMany({
    where: { clubId },
    select: { jerseyNumber: true },
  });

  const taken = playerClubs.map(pt => pt.jerseyNumber).sort((a, b) => a - b);
  const min = 1;
  const max = 99;
  
  const available: number[] = [];
  for (let i = min; i <= max; i++) {
    if (!taken.includes(i)) {
      available.push(i);
    }
  }

  const player = await prisma.player.findUnique({
    where: { userId },
  });

  return NextResponse.json({
    availableJerseyNumbers: { min, max, taken, available },
    player: player ? {
      name: player.name,
      surname: player.surname,
      nickname: player.nickname,
    } : null,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const userId = getUserIdFromRequest(request);
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { clubId } = await params;
  const body = await request.json();

  const { name, surname, nickname, jerseyNumber, primaryRole, secondaryRoles } = body as {
    name: string;
    surname?: string;
    nickname?: string;
    jerseyNumber: number;
    primaryRole: PlayerRole;
    secondaryRoles: PlayerRole[];
  };

  if (!name || !primaryRole || !jerseyNumber) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const clubMember = await prisma.clubMember.findFirst({
    where: { clubId, userId },
  });

  if (!clubMember) {
    return NextResponse.json({ error: 'Not a member of this team' }, { status: 403 });
  }

  let player = await prisma.player.findUnique({
    where: { userId },
  });

  if (!player) {
    player = await prisma.player.create({
      data: {
        userId,
        name,
        surname: surname || null,
        nickname: nickname || null,
        roles: [primaryRole, ...secondaryRoles],
      },
    });
  } else {
    await prisma.player.update({
      where: { id: player.id },
      data: {
        name,
        surname: surname || null,
        nickname: nickname || null,
        roles: [primaryRole, ...secondaryRoles],
      },
    });
  }

  const existingPlayerClub = await prisma.playerClub.findUnique({
    where: {
      playerId_clubId: {
        playerId: player.id,
        clubId,
      },
    },
  });

  if (existingPlayerClub) {
    return NextResponse.json({ error: 'Player already setup in this team' }, { status: 400 });
  }

  const jerseyTaken = await prisma.playerClub.findFirst({
    where: { clubId, jerseyNumber },
  });

  if (jerseyTaken) {
    return NextResponse.json({ error: 'Jersey number already taken' }, { status: 400 });
  }

  const playerClub = await prisma.playerClub.create({
    data: {
      playerId: player.id,
      clubId,
      jerseyNumber,
      primaryRole: "PLAYER",
      secondaryRoles: [],
    },
  });

  return NextResponse.json({ success: true, playerClubId: playerClub.id });
}
