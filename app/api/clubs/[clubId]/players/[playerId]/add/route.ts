import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-token';
import { addPlayerToTeam } from '@/lib/db/players';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string; playerId: string }> }
) {
  try {
    const userId = getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clubId, playerId } = await params;
    const body = await request.json();
    
    await addPlayerToTeam(playerId, clubId, body.jerseyNumber, body.primaryRole || 'PLAYER', body.secondaryRoles || []);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding player to club:', error);
    return NextResponse.json(
      { error: 'Failed to add player to team' },
      { status: 500 }
    );
  }
}
