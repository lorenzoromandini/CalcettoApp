'use server'

/**
 * Roster Server Actions
 *
 * Server Actions for retrieving and managing club roster data.
 */

import { getSession } from '@/lib/session'
import { getClubMembersDashboardData, DashboardMemberData } from '@/lib/db/player-ratings'

// ============================================================================
// Error Messages (Italian)
// ============================================================================

const ERRORS = {
  UNAUTHORIZED: 'Devi essere autenticato per eseguire questa azione',
}

// ============================================================================
// Get Roster Cards Data
// ============================================================================

/**
 * Retrieves all club members with their dashboard data,
 * sorted by lastThreeGamesAvgRating in descending order.
 * Members without ratings (null) are placed at the end.
 *
 * @param clubId - The club ID to fetch members for
 * @returns Array of DashboardMemberData sorted by rating (highest first)
 */
export async function getRosterCardsData(clubId: string): Promise<DashboardMemberData[]> {
  // Verify user is authenticated
  const session = await getSession()

  if (!session?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  // Fetch all club members with their dashboard data
  const members = await getClubMembersDashboardData(clubId)

  // Sort by lastThreeGamesAvgRating in descending order
  // Members with null ratings go to the end
  const sortedMembers = members.sort((a: DashboardMemberData, b: DashboardMemberData) => {
    // Handle null values - place them at the end
    if (a.lastThreeGamesAvgRating === null && b.lastThreeGamesAvgRating === null) {
      return 0
    }
    if (a.lastThreeGamesAvgRating === null) {
      return 1
    }
    if (b.lastThreeGamesAvgRating === null) {
      return -1
    }
    // Both have values - sort descending (highest rating first)
    return b.lastThreeGamesAvgRating - a.lastThreeGamesAvgRating
  })

  return sortedMembers
}
