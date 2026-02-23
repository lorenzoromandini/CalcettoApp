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
      avatarUrl: player.avatarUrl,
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
  const formData = await request.formData();
  
  const jerseyNumber = parseInt(formData.get('jerseyNumber') as string);
  const primaryRole = formData.get('primaryRole') as PlayerRole;
  const secondaryRoles = JSON.parse(formData.get('secondaryRoles') as string || '[]') as PlayerRole[];
  const avatarFile = formData.get('avatar') as Blob | null;

  if (!primaryRole || isNaN(jerseyNumber)) {
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

  // Se il player non esiste, crealo (per retrocompatibilità con utenti registrati prima della modifica)
  if (!player) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, nickname: true },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 });
    }
    
    player = await prisma.player.create({
      data: {
        userId,
        name: user.firstName,
        surname: user.lastName,
        nickname: user.nickname,
        roles: [],
      },
    });
  }

  // Aggiorna i ruoli del player con quelli scelti per questo club e l'avatar se fornito
  const updateData: { roles: string[]; avatarUrl?: string } = {
    roles: [primaryRole, ...secondaryRoles],
  };
  
  let avatarUrl: string | undefined;
  if (avatarFile && avatarFile.size > 0) {
    const buffer = Buffer.from(await avatarFile.arrayBuffer());
    const base64 = buffer.toString('base64');
    avatarUrl = `data:image/jpeg;base64,${base64}`;
    updateData.avatarUrl = avatarUrl;
  }
  
  await prisma.player.update({
    where: { id: player.id },
    data: updateData,
  });

  // Aggiorna anche l'avatar nell'utente
  if (avatarUrl && player.userId) {
    await prisma.user.update({
      where: { id: player.userId },
      data: { image: avatarUrl },
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
      primaryRole: primaryRole,
      secondaryRoles: secondaryRoles,
    },
  });

  return NextResponse.json({ success: true, playerClubId: playerClub.id });
}
