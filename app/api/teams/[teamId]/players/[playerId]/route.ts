import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { updatePlayer, deletePlayer, addPlayerToTeam, removePlayerFromTeam } from '@/lib/db/players';
import { updatePlayerSchema } from '@/lib/validations/player';

export async function PUT(
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
    const validatedData = updatePlayerSchema.parse(body);
    
    await updatePlayer(playerId, validatedData, teamId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating player:', error);
    return NextResponse.json(
      { error: 'Failed to update player' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; playerId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamId, playerId } = await params;
    await deletePlayer(playerId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting player:', error);
    return NextResponse.json(
      { error: 'Failed to delete player' },
      { status: 500 }
    );
  }
}
