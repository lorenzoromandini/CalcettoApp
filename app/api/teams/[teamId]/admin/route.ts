import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-token';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const userId = getUserIdFromRequest(request);
  
  if (!userId) {
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }

  const { teamId } = await params;

  const membership = await prisma.teamMember.findFirst({
    where: {
      teamId,
      userId,
      role: {
        in: ['admin', 'co-admin'],
      },
    },
  });

  return NextResponse.json({ isAdmin: !!membership });
}
