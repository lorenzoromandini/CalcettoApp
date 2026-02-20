import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ isAdmin: false, isOwner: false }, { status: 401 });
  }

  const { teamId } = await params;

  const [membership, team] = await Promise.all([
    prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: session.user.id,
        role: {
          in: ['admin', 'manager'],
        },
      },
    }),
    prisma.team.findFirst({
      where: { id: teamId, createdBy: session.user.id },
      select: { createdBy: true },
    }),
  ]);

  const isOwner = team?.createdBy === session.user.id;

  return NextResponse.json({ 
    isAdmin: !!membership,
    isOwner 
  });
}
