'use server'

/**
 * Player Evolution Data Server Actions
 * 
 * Provides data aggregation for player evolution charts.
 * Aggregates goals, assists, and ratings per match for trend visualization.
 */

import { prisma } from '@/lib/db'
import { MatchStatus } from '@prisma/client'
import { decimalToRating } from '@/lib/rating-utils'

// ============================================================================
// Types
// ============================================================================

/**
 * Evolution data point for chart visualization
 */
export interface EvolutionDataPoint {
  match_id: string
  match_date: string  // Formatted date for chart display
  match_label: string  // Short label (e.g., "15 Gen")
  goals: number
  assists: number
  rating: number | null
  rating_display?: string
}

// ============================================================================
// Get Player Evolution Data
// ============================================================================

/**
 * Get player evolution data for chart visualization
 * Aggregates goals, assists, and rating per match
 * 
 * @param playerId - Player ID
 * @param clubId - Club ID to filter matches
 * @param limit - Maximum number of matches to include (default 10)
 * @returns Array of evolution data points ordered chronologically
 */
export async function getPlayerEvolution(
  playerId: string,
  clubId: string,
  limit: number = 10
): Promise<EvolutionDataPoint[]> {
  // Get all matches where player participated (has a formation position with side)
  const positions = await prisma.formationPosition.findMany({
    where: {
      playerId,
      formation: {
        match: {
          clubId,
          status: MatchStatus.COMPLETED,
        },
      },
      side: { not: null },
    },
    include: {
      formation: {
        include: {
          match: {
            select: {
              id: true,
              scheduledAt: true,
            },
          },
        },
      },
    },
    orderBy: {
      formation: {
        match: {
          scheduledAt: 'asc',
        },
      },
    },
    take: limit,
  })

  if (positions.length === 0) return []

  // Get match IDs for parallel queries
  const matchIds = positions.map(p => p.formation.matchId)

  // Get goals for each match (scored by player, excluding own goals)
  const goalsByMatch = await prisma.goal.groupBy({
    by: ['matchId'],
    where: {
      matchId: { in: matchIds },
      scorerId: playerId,
      isOwnGoal: false,
    },
    _count: true,
  })
  const goalsMap = new Map(goalsByMatch.map(g => [g.matchId, g._count]))

  // Get assists for each match
  const assistsByMatch = await prisma.goal.groupBy({
    by: ['matchId'],
    where: {
      matchId: { in: matchIds },
      assisterId: playerId,
    },
    _count: true,
  })
  const assistsMap = new Map(assistsByMatch.map(a => [a.matchId, a._count]))

  // Get ratings for each match
  const ratings = await prisma.playerRating.findMany({
    where: {
      playerId,
      matchId: { in: matchIds },
    },
    select: {
      matchId: true,
      rating: true,
    },
  })
  const ratingsMap = new Map(ratings.map(r => [r.matchId, r.rating.toNumber()]))

  // Build evolution data
  return positions.map(p => {
    const match = p.formation.match
    const date = match.scheduledAt
    const rating = ratingsMap.get(match.id) ?? null

    return {
      match_id: match.id,
      match_date: date.toISOString(),
      match_label: new Intl.DateTimeFormat('it-IT', {
        day: 'numeric',
        month: 'short'
      }).format(date),
      goals: goalsMap.get(match.id) ?? 0,
      assists: assistsMap.get(match.id) ?? 0,
      rating,
      rating_display: rating !== null ? decimalToRating(rating) : undefined,
    }
  })
}
