'use server'

/**
 * Member Evolution Data Server Actions
 * 
 * Provides data aggregation for member evolution charts.
 * Aggregates goals, assists, and ratings per match for trend visualization.
 * 
 * Updated for new schema:
 * - Uses clubMemberId instead of playerId
 * - FormationPosition tracks played status
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
// Get Member Evolution Data
// ============================================================================

/**
 * Get member evolution data for chart visualization
 * Aggregates goals, assists, and rating per match
 * 
 * @param clubMemberId - ClubMember ID
 * @param clubId - Club ID to filter matches
 * @param limit - Maximum number of matches to include (default 10)
 * @returns Array of evolution data points ordered chronologically
 */
export async function getMemberEvolution(
  clubMemberId: string,
  clubId: string,
  limit: number = 10
): Promise<EvolutionDataPoint[]> {
  // Get all matches where member participated (has a formation position with played=true)
  const positions = await prisma.formationPosition.findMany({
    where: {
      clubMemberId,
      formation: {
        match: {
          clubId,
          status: MatchStatus.COMPLETED,
        },
      },
      played: true,
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
  const matchIds = positions.map((p: { formation: { matchId: string } }) => p.formation.matchId)

  // Get goals for each match (scored by member, excluding own goals)
  const goalsByMatch = await prisma.goal.groupBy({
    by: ['matchId'],
    where: {
      matchId: { in: matchIds },
      scorerId: clubMemberId,
      isOwnGoal: false,
    },
    _count: true,
  })
  const goalsMap = new Map(goalsByMatch.map((g: { matchId: string; _count: number }) => [g.matchId, g._count]))

  // Get assists for each match
  const assistsByMatch = await prisma.goal.groupBy({
    by: ['matchId'],
    where: {
      matchId: { in: matchIds },
      assisterId: clubMemberId,
    },
    _count: true,
  })
  const assistsMap = new Map(assistsByMatch.map((a: { matchId: string; _count: number }) => [a.matchId, a._count]))

  // Get ratings for each match
  const ratings = await prisma.playerRating.findMany({
    where: {
      clubMemberId,
      matchId: { in: matchIds },
    },
    select: {
      matchId: true,
      rating: true,
    },
  })
  const ratingsMap = new Map(ratings.map((r: { matchId: string; rating: { toNumber: () => number } }) => [r.matchId, r.rating.toNumber()]))

  // Build evolution data
  return positions.map((p: { formation: { match: { id: string; scheduledAt: Date } } }) => {
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

// Backward compatibility alias
export const getPlayerEvolution = getMemberEvolution;
