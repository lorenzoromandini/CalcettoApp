import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-token';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const userId = getUserIdFromRequest(request);
  
  if (!userId) {
    return NextResponse.json({ isAdmin: false, isCoAdmin: false, role: null }, { status: 401 });
  }

  const { clubId } = await params;

  const membership = await prisma.clubMember.findFirst({
    where: {
      clubId,
      userId,
    },
  });

  const role = membership?.role || null;
  const isAdmin = role === 'admin';
  const isCoAdmin = role === 'co-admin';

  return NextResponse.json({ isAdmin, isCoAdmin, role });
}
