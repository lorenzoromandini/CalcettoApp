import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-token';
import { removePlayerFromTeam } from '@/lib/db/players';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; playerId: string }> }
) {
  try {
    const userId = getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamId, playerId } = await params;
    
    await removePlayerFromTeam(playerId, teamId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing player from team:', error);
    return NextResponse.json(
      { error: 'Failed to remove player from team' },
      { status: 500 }
    );
  }
}
