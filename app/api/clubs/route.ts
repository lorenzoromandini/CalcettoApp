import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-token';
import { getUserClubs, createClub } from '@/lib/db/clubs';
import { createClubSchema } from '@/lib/validations/club';

export async function GET(request: NextRequest) {
  try {
    console.log('[GET /api/clubs] Request received');
    const userId = getUserIdFromRequest(request);
    console.log('[GET /api/clubs] userId:', userId);
    
    if (!userId) {
      console.log('[GET /api/clubs] No userId, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[GET /api/clubs] Fetching clubs for user:', userId);
    const clubs = await getUserClubs(userId);
    console.log('[GET /api/clubs] Clubs found:', clubs.length);
    return NextResponse.json(clubs);
  } catch (error) {
    console.error('[GET /api/clubs] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clubs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createClubSchema.parse(body);
    
    const clubId = await createClub(validatedData, userId);
    
    return NextResponse.json({ id: clubId }, { status: 201 });
  } catch (error) {
    console.error('Error creating club:', error);
    return NextResponse.json(
      { error: 'Failed to create club' },
      { status: 500 }
    );
  }
}
