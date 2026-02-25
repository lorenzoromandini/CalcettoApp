import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-token';
import { prisma } from '@/lib/prisma';
import { ClubPrivilege } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const userId = getUserIdFromRequest(request);
  
  if (!userId) {
    return NextResponse.json({ isOwner: false, isManager: false, privileges: null }, { status: 401 });
  }

  const { clubId } = await params;

  const membership = await prisma.clubMember.findFirst({
    where: {
      clubId,
      userId,
    },
  });

  const privileges = membership?.privileges || null;
  const isOwner = privileges === ClubPrivilege.OWNER;
  const isManager = privileges === ClubPrivilege.MANAGER;

  return NextResponse.json({ isOwner, isManager, privileges });
}
