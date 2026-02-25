import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-token';
import { prisma } from '@/lib/prisma';
import { ClubPrivilege, PlayerRole } from '@prisma/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const userId = getUserIdFromRequest(request);
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { token } = await params;

  const invite = await prisma.clubInvite.findUnique({
    where: { token },
  });

  if (!invite) {
    return NextResponse.json({ error: 'Invalid invite' }, { status: 404 });
  }

  if (invite.expiresAt && invite.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Invite expired' }, { status: 400 });
  }

  // Check if user is already a member
  const existingMember = await prisma.clubMember.findUnique({
    where: {
      clubId_userId: {
        clubId: invite.clubId,
        userId,
      },
    },
  });

  if (existingMember) {
    // Member already exists, check if they've set up their player data
    const needsSetup = !existingMember.primaryRole;
    return NextResponse.json({ 
      success: true, 
      clubId: invite.clubId, 
      needsSetup,
      alreadyMember: true 
    });
  }

  // Find the next available jersey number
  const existingMembers = await prisma.clubMember.findMany({
    where: { clubId: invite.clubId },
    select: { jerseyNumber: true },
  });
  
  const usedNumbers = new Set(existingMembers.map(m => m.jerseyNumber));
  let jerseyNumber = 1;
  while (usedNumbers.has(jerseyNumber)) {
    jerseyNumber++;
  }

  // Create ClubMember with embedded player data
  await prisma.clubMember.create({
    data: {
      clubId: invite.clubId,
      userId,
      privileges: ClubPrivilege.MEMBER,
      primaryRole: PlayerRole.CEN, // Default role
      secondaryRoles: [],
      jerseyNumber,
    },
  });

  return NextResponse.json({ 
    success: true, 
    clubId: invite.clubId, 
    needsSetup: true 
  });
}
