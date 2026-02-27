import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-token';
import { prisma } from '@/lib/prisma';
import { PlayerRole, ClubPrivilege } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const userId = getUserIdFromRequest(request);
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { clubId } = await params;

  // Check if user is already a member
  const clubMember = await prisma.clubMember.findFirst({
    where: { clubId, userId },
  });

  // Get club to check if user is the creator
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { createdBy: true },
  });

  const isCreator = club?.createdBy === userId;

  // Allow access if:
  // 1. User is already a member (updating profile)
  // 2. User is the creator setting up for the first time
  if (!clubMember && !isCreator) {
    return NextResponse.json({ error: 'Not authorized to setup player for this team' }, { status: 403 });
  }

  // Get user's existing avatar from User table
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { image: true },
  });

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
    userAvatar: user?.image || null, // Include user's existing avatar
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

  // Get club to check if user is the creator (should be OWNER)
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { createdBy: true },
  });

  // Determine privilege: OWNER if creator, MEMBER otherwise
  const privilege = club?.createdBy === userId ? ClubPrivilege.OWNER : ClubPrivilege.MEMBER;

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
      privileges: privilege,
      primaryRole,
      secondaryRoles,
      jerseyNumber,
    },
  });

  return NextResponse.json({ success: true, memberId: clubMember.id });
}
