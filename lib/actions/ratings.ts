'use server'

/**
 * Player Ratings Server Actions
 * 
 * Mobile-optimized Server Actions for rating operations.
 */

import { auth } from '@/lib/auth'
import { 
  upsertPlayerRating as dbUpsertPlayerRating,
  deletePlayerRating as dbDeletePlayerRating,
  bulkUpsertRatings as dbBulkUpsertRatings
} from '@/lib/db/player-ratings'
import { getMatch } from '@/lib/db/matches'
import type { RatingInput } from '@/lib/db/player-ratings'
import { revalidatePath } from 'next/cache'

// ============================================================================
// Error Messages (Italian)
// ============================================================================

const ERRORS = {
  UNAUTHORIZED: 'Devi essere autenticato per eseguire questa azione',
}

// ============================================================================
// Upsert Rating
// ============================================================================

export async function upsertRatingAction(data: RatingInput) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  try {
    const rating = await dbUpsertPlayerRating(data)
    
    const match = await getMatch(data.matchId)
    if (match) {
      revalidatePath(`/clubs/${match.clubId}/matches/${data.matchId}/ratings`)
    }
    
    return { success: true, rating }
  } catch (error) {
    console.error('[RatingsAction] Upsert error:', error)
    throw error
  }
}

// ============================================================================
// Delete Rating
// ============================================================================

export async function deleteRatingAction(matchId: string, clubMemberId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  try {
    await dbDeletePlayerRating(matchId, clubMemberId)
    
    const match = await getMatch(matchId)
    if (match) {
      revalidatePath(`/clubs/${match.clubId}/matches/${matchId}/ratings`)
    }
    
    return { success: true }
  } catch (error) {
    console.error('[RatingsAction] Delete error:', error)
    throw error
  }
}

// ============================================================================
// Bulk Upsert Ratings
// ============================================================================

export async function bulkUpsertRatingsAction(ratings: RatingInput[]) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  try {
    const result = await dbBulkUpsertRatings(ratings)
    
    if (ratings.length > 0) {
      const matchId = ratings[0].matchId
      const match = await getMatch(matchId)
      if (match) {
        revalidatePath(`/clubs/${match.clubId}/matches/${matchId}/ratings`)
      }
    }
    
    return { success: true, ratings: result }
  } catch (error) {
    console.error('[RatingsAction] Bulk upsert error:', error)
    throw error
  }
}
