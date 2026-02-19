import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }

  const { teamId } = await params;

  const membership = await prisma.teamMember.findFirst({
    where: {
      teamId,
      userId: session.user.id,
      role: {
        in: ['admin', 'co-admin'],
      },
    },
  });

  return NextResponse.json({ isAdmin: !!membership });
}
