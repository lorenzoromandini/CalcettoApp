import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-token';
import { prisma } from '@/lib/prisma';
import { PlayerRole } from '@prisma/client';

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

  // Get all members to find taken jersey numbers
  const members = await prisma.clubMember.findMany({
    where: { clubId },
    select: { jerseyNumber: true },
  });

  const taken = members.map(m => m.jerseyNumber).sort((a, b) => a - b);
  const min = 1;
  const max = 99;
  
  const available: number[] = [];
  for (let i = min; i <= max; i++) {
    if (!taken.includes(i)) {
      available.push(i);
    }
  }

  return NextResponse.json({
    availableJerseyNumbers: { min, max, taken, available },
    member: clubMember ? {
      primaryRole: clubMember.primaryRole,
      secondaryRoles: clubMember.secondaryRoles,
      jerseyNumber: clubMember.jerseyNumber,
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

  // Check if user is already a member
  const existingMember = await prisma.clubMember.findUnique({
    where: {
      clubId_userId: {
        clubId,
        userId,
      },
    },
  });

  if (existingMember) {
    return NextResponse.json({ error: 'Already a member of this team' }, { status: 400 });
  }

  // Check if jersey number is taken
  const jerseyTaken = await prisma.clubMember.findFirst({
    where: { clubId, jerseyNumber },
  });

  if (jerseyTaken) {
    return NextResponse.json({ error: 'Jersey number already taken' }, { status: 400 });
  }

  // Handle avatar upload
  let avatarUrl: string | undefined;
  if (avatarFile && avatarFile.size > 0) {
    const buffer = Buffer.from(await avatarFile.arrayBuffer());
    const base64 = buffer.toString('base64');
    avatarUrl = `data:image/jpeg;base64,${base64}`;
    
    // Update user image
    await prisma.user.update({
      where: { id: userId },
      data: { image: avatarUrl },
    });
  }

  // Create club member with player data
  const clubMember = await prisma.clubMember.create({
    data: {
      clubId,
      userId,
      privileges: 'MEMBER',
      primaryRole,
      secondaryRoles,
      jerseyNumber,
    },
  });

  return NextResponse.json({ success: true, memberId: clubMember.id });
}
