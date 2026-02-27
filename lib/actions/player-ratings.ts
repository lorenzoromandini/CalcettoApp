'use server'

/**
 * Player Ratings Server Actions
 * 
 * Additional wrapper actions for player ratings queries.
 * These complement the existing actions in ratings.ts
 */

import { getSession } from '@/lib/session'
import {
  getMatchRatings as dbGetMatchRatings,
  getRatingsCount as dbGetRatingsCount,
  getPlayerRatingHistory as dbGetPlayerRatingHistory,
  getPlayerMatchRating as dbGetPlayerMatchRating,
  getPlayerAverageRating as dbGetPlayerAverageRating
} from '@/lib/db/player-ratings'
import type { PlayerRatingWithMember, RatingHistoryEntry } from '@/lib/db/player-ratings'

// ============================================================================
// Error Messages (Italian)
// ============================================================================

const ERRORS = {
  UNAUTHORIZED: 'Devi essere autenticato per eseguire questa azione',
}

// ============================================================================
// Get Match Ratings
// ============================================================================

export async function getMatchRatingsAction(matchId: string): Promise<PlayerRatingWithMember[]> {
  const session = await getSession()
  
  if (!session?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  try {
    const ratings = await dbGetMatchRatings(matchId)
    return ratings
  } catch (error) {
    console.error('[PlayerRatingsAction] Get match ratings error:', error)
    throw new Error('Failed to get match ratings')
  }
}

// ============================================================================
// Get Ratings Count
// ============================================================================

export async function getRatingsCountAction(matchId: string): Promise<{
  rated: number
  played: number
}> {
  const session = await getSession()
  
  if (!session?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  try {
    const counts = await dbGetRatingsCount(matchId)
    return counts
  } catch (error) {
    console.error('[PlayerRatingsAction] Get ratings count error:', error)
    throw new Error('Failed to get ratings count')
  }
}

// ============================================================================
// Get Player Rating History
// ============================================================================

export async function getPlayerRatingHistoryAction(
  clubMemberId: string,
  clubId?: string
): Promise<RatingHistoryEntry[]> {
  const session = await getSession()
  
  if (!session?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  try {
    const history = await dbGetPlayerRatingHistory(clubMemberId, clubId)
    return history
  } catch (error) {
    console.error('[PlayerRatingsAction] Get player rating history error:', error)
    throw new Error('Failed to get player rating history')
  }
}

// ============================================================================
// Get Player Match Rating
// ============================================================================

export async function getPlayerMatchRatingAction(
  matchId: string,
  clubMemberId: string
) {
  const session = await getSession()
  
  if (!session?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  try {
    const rating = await dbGetPlayerMatchRating(matchId, clubMemberId)
    return rating
  } catch (error) {
    console.error('[PlayerRatingsAction] Get player match rating error:', error)
    throw new Error('Failed to get player match rating')
  }
}

// ============================================================================
// Get Player Average Rating
// ============================================================================

export async function getPlayerAverageRatingAction(clubMemberId: string): Promise<number | null> {
  const session = await getSession()
  
  if (!session?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  try {
    const average = await dbGetPlayerAverageRating(clubMemberId)
    return average
  } catch (error) {
    console.error('[PlayerRatingsAction] Get player average rating error:', error)
    throw new Error('Failed to get player average rating')
  }
}
