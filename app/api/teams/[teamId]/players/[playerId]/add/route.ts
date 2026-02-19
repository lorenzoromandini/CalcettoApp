import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { addPlayerToTeam } from '@/lib/db/players';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; playerId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamId, playerId } = await params;
    const body = await request.json();
    
    await addPlayerToTeam(playerId, teamId, body.jerseyNumber);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding player to team:', error);
    return NextResponse.json(
      { error: 'Failed to add player to team' },
      { status: 500 }
    );
  }
}
