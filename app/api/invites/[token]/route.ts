import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const invite = await prisma.teamInvite.findUnique({
    where: { token },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
        },
      },
    },
  });

  if (!invite) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (invite.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Expired' }, { status: 400 });
  }

  if (invite.useCount >= invite.maxUses) {
    return NextResponse.json({ error: 'Max uses reached' }, { status: 400 });
  }

  return NextResponse.json({
    id: invite.id,
    team: invite.team,
    expiresAt: invite.expiresAt,
    useCount: invite.useCount,
    maxUses: invite.maxUses,
  });
}
