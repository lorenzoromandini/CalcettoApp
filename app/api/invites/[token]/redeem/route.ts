import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-token';
import { prisma } from '@/lib/prisma';

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

  if (invite.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Invite expired' }, { status: 400 });
  }

  if (invite.useCount >= invite.maxUses) {
    return NextResponse.json({ error: 'Invite max uses reached' }, { status: 400 });
  }

  const existingMember = await prisma.clubMember.findFirst({
    where: {
      clubId: invite.clubId,
      userId,
    },
  });

  let needsSetup = true;

  if (existingMember) {
    const player = await prisma.player.findUnique({
      where: { userId },
      include: {
        playerClubs: {
          where: { clubId: invite.clubId },
        },
      },
    });
    needsSetup = !player || player.playerClubs.length === 0;
    return NextResponse.json({ 
      success: true, 
      clubId: invite.clubId, 
      needsSetup,
      alreadyMember: true 
    });
  }

  await prisma.clubMember.create({
    data: {
      clubId: invite.clubId,
      userId,
      privilege: 'member',
    },
  });

  await prisma.clubInvite.update({
    where: { id: invite.id },
    data: {
      useCount: { increment: 1 },
      usedAt: new Date(),
      usedBy: userId,
    },
  });

  return NextResponse.json({ 
    success: true, 
    clubId: invite.clubId, 
    needsSetup: true 
  });
}
