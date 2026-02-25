import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const invite = await prisma.clubInvite.findUnique({
    where: { token },
    include: {
      club: {
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

  // Check if invite has expired
  if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
    return NextResponse.json({ error: 'Expired' }, { status: 400 });
  }

  // Note: The new schema doesn't have useCount/maxUses on ClubInvite
  // This feature was removed in the restructure

  return NextResponse.json({
    id: invite.id,
    club: invite.club,
    expiresAt: invite.expiresAt,
  });
}
