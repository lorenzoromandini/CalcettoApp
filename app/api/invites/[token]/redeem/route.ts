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

  // Check if user is already a member
  const existingMember = await prisma.teamMember.findFirst({
    where: {
      teamId: invite.teamId,
      userId: session.user.id,
    },
  });

  if (existingMember) {
    return NextResponse.json({ error: 'Already a member' }, { status: 400 });
  }

  // Add user to team
  await prisma.teamMember.create({
    data: {
      teamId: invite.teamId,
      userId: session.user.id,
      role: 'member',
    },
  });

  // Update invite
  await prisma.teamInvite.update({
    where: { id: invite.id },
    data: {
      useCount: { increment: 1 },
      usedAt: new Date(),
      usedBy: session.user.id,
    },
  });

  return NextResponse.json({ success: true, teamId: invite.teamId });
}
