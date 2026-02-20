import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { token } = await params;

  const invite = await prisma.teamInvite.findUnique({
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

  const existingMember = await prisma.teamMember.findFirst({
    where: {
      teamId: invite.teamId,
      userId: session.user.id,
    },
  });

  let needsSetup = true;

  if (existingMember) {
    const player = await prisma.player.findUnique({
      where: { userId: session.user.id },
      include: {
        playerTeams: {
          where: { teamId: invite.teamId },
        },
      },
    });
    needsSetup = !player || player.playerTeams.length === 0;
    return NextResponse.json({ 
      success: true, 
      teamId: invite.teamId, 
      needsSetup,
      alreadyMember: true 
    });
  }

  await prisma.teamMember.create({
    data: {
      teamId: invite.teamId,
      userId: session.user.id,
      role: 'member',
    },
  });

  await prisma.teamInvite.update({
    where: { id: invite.id },
    data: {
      useCount: { increment: 1 },
      usedAt: new Date(),
      usedBy: session.user.id,
    },
  });

  return NextResponse.json({ 
    success: true, 
    teamId: invite.teamId, 
    needsSetup: true 
  });
}
