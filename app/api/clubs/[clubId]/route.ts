import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getClub, updateClub, deleteClub, isClubOwner } from '@/lib/db/clubs';
import { updateClubSchema } from '@/lib/validations/club';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  try {
    const session = await getSession();
    
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clubId } = await params;
    const club = await getClub(clubId);
    
    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }
    
    return NextResponse.json(club);
  } catch (error) {
    console.error('Error fetching club:', error);
    return NextResponse.json(
      { error: 'Failed to fetch club' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  try {
    const session = await getSession();
    
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clubId } = await params;
    const body = await request.json();
    const validatedData = updateClubSchema.parse(body);
    
    await updateClub(clubId, validatedData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating club:', error);
    return NextResponse.json(
      { error: 'Failed to update club' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  try {
    const session = await getSession();
    
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clubId } = await params;
    
    // Check if user is the owner
    const isOwner = await isClubOwner(clubId, session.id);
    if (!isOwner) {
      return NextResponse.json({ error: 'Solo il proprietario può eliminare il club' }, { status: 403 });
    }
    
    await deleteClub(clubId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting club:', error);
    return NextResponse.json(
      { error: 'Failed to delete club' },
      { status: 500 }
    );
  }
}
