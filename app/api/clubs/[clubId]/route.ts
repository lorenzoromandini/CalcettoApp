import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-token';
import { getClub, updateClub, deleteClub } from '@/lib/db/clubs';
import { updateClubSchema } from '@/lib/validations/club';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  try {
    const userId = getUserIdFromRequest(request);
    
    if (!userId) {
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
    const userId = getUserIdFromRequest(request);
    
    if (!userId) {
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
    const userId = getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clubId } = await params;
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
