import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-token';
import { getMemberDashboardData } from '@/lib/db/player-ratings';

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get optional clubId from query params
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get('clubId') || undefined;

    const memberData = await getMemberDashboardData(userId, clubId);
    
    return NextResponse.json(memberData);
  } catch (error) {
    console.error('Error fetching dashboard member data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch member data' },
      { status: 500 }
    );
  }
}
