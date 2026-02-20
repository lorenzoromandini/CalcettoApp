import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { PlayerRole } from '@/lib/db/schema';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { teamId } = await params;

  const teamMember = await prisma.teamMember.findFirst({
    where: { teamId, userId: session.user.id },
  });

  if (!teamMember) {
    return NextResponse.json({ error: 'Not a member of this team' }, { status: 403 });
  }

  const playerTeams = await prisma.playerTeam.findMany({
    where: { teamId },
    select: { jerseyNumber: true },
  });

  const taken = playerTeams.map(pt => pt.jerseyNumber).sort((a, b) => a - b);
  const min = 1;
  const max = 99;
  
  const available: number[] = [];
  for (let i = min; i <= max; i++) {
    if (!taken.includes(i)) {
      available.push(i);
    }
  }

  const player = await prisma.player.findUnique({
    where: { userId: session.user.id },
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
  request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { teamId } = await params;
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

  const teamMember = await prisma.teamMember.findFirst({
    where: { teamId, userId: session.user.id },
  });

  if (!teamMember) {
    return NextResponse.json({ error: 'Not a member of this team' }, { status: 403 });
  }

  let player = await prisma.player.findUnique({
    where: { userId: session.user.id },
  });

  if (!player) {
    player = await prisma.player.create({
      data: {
        userId: session.user.id,
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

  const existingPlayerTeam = await prisma.playerTeam.findUnique({
    where: {
      playerId_teamId: {
        playerId: player.id,
        teamId,
      },
    },
  });

  if (existingPlayerTeam) {
    return NextResponse.json({ error: 'Player already setup in this team' }, { status: 400 });
  }

  const jerseyTaken = await prisma.playerTeam.findFirst({
    where: { teamId, jerseyNumber },
  });

  if (jerseyTaken) {
    return NextResponse.json({ error: 'Jersey number already taken' }, { status: 400 });
  }

  const playerTeam = await prisma.playerTeam.create({
    data: {
      playerId: player.id,
      teamId,
      jerseyNumber,
      primaryRole,
      secondaryRoles,
    },
  });

  return NextResponse.json({ success: true, playerTeamId: playerTeam.id });
}
