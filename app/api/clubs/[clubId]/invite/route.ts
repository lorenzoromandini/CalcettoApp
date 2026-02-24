import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-token';
import { prisma } from '@/lib/prisma';
import { createInvite } from '@/lib/db/invites';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const userId = getUserIdFromRequest(request);
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { clubId } = await params;

  // Verifica che l'utente sia Owner o Manager
  const membership = await prisma.clubMember.findFirst({
    where: { clubId, userId },
  });

  if (!membership || (membership.privilege !== 'owner' && membership.privilege !== 'manager')) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const { maxUses = 50 } = await request.json();

  try {
    const token = await createInvite(clubId, userId, maxUses);
    const link = `/clubs/invite?token=${token}`;
    
    return NextResponse.json({ link, token });
  } catch (error) {
    console.error('Failed to create invite:', error);
    return NextResponse.json(
      { error: 'Failed to create invite' },
      { status: 500 }
    );
  }
}
