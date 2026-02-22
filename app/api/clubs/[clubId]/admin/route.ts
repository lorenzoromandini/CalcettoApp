import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-token';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const userId = getUserIdFromRequest(request);
  
  if (!userId) {
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }

  const { clubId } = await params;

  const membership = await prisma.clubMember.findFirst({
    where: {
      clubId,
      userId,
      role: {
        in: ['admin', 'co-admin'],
      },
    },
  });

  return NextResponse.json({ isAdmin: !!membership });
}
