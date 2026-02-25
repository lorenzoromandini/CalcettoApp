'use server'

/**
 * Statistics Aggregation Module
 * 
 * Provides functions for member statistics aggregation and leaderboards.
 * All statistics are calculated from COMPLETED matches only.
 * 
 * Updated for new schema:
 * - Removed Player references - now using ClubMember
 * - FormationPosition uses clubMemberId instead of playerId
 * - Goal uses scorerId/assisterId linking to ClubMember
 */

// Using literal enum values
const MatchStatus = {
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  FINISHED: 'FINISHED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
type MatchStatus = typeof MatchStatus[keyof typeof MatchStatus];

import { prisma } from '@/lib/db'
// MatchStatus imported above

// ============================================================================
// Type Definitions
// ============================================================================

export interface MemberStats {
  club_member_id: string
  first_name: string
  last_name?: string
  nickname?: string
  image?: string
  goals: number
  assists: number
  appearances: number
  wins: number
  losses: number
  draws: number
  goals_conceded: number | null  // Only for goalkeepers
  avg_rating: number | null
  total_ratings: number
}

export interface MemberLeaderboardEntry {
  club_member_id: string
  first_name: string
  nickname?: string
  image?: string
  value: number
}

// ============================================================================
// Get Member Statistics
// ============================================================================

/**
 * Get comprehensive statistics for a member
 * 
 * @param clubMemberId - ClubMember ID
 * @param clubId - Optional club ID to filter statistics
 * @returns MemberStats object or null if member not found
 */
export async function getMemberStats(
  clubMemberId: string,
  clubId?: string
): Promise<MemberStats | null> {
  // Get member info with user details
  const member = await prisma.clubMember.findUnique({
    where: { id: clubMemberId },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          nickname: true,
          image: true,
        },
      },
    },
  })

  if (!member) return null

  // Get all completed matches where this member has a formation position
  const positions = await prisma.formationPosition.findMany({
    where: {
      clubMemberId,
      formation: {
        match: {
          status: MatchStatus.COMPLETED,
          ...(clubId ? { clubId } : {}),
        },
      },
      played: true,
    },
    include: {
      formation: {
        select: {
          isHome: true,
          match: {
            select: {
              id: true,
              homeScore: true,
              awayScore: true,
            },
          },
        },
      },
    },
  })

  // Calculate appearances, wins, losses, draws
  let appearances = 0
  let wins = 0
  let losses = 0
  let draws = 0

  for (const pos of positions) {
    if (!pos.formation?.match) continue
    
    appearances++
    const match = pos.formation.match
    const homeScore = match.homeScore ?? 0
    const awayScore = match.awayScore ?? 0

    if (pos.formation.isHome) {
      if (homeScore > awayScore) wins++
      else if (homeScore < awayScore) losses++
      else draws++
    } else {
      if (awayScore > homeScore) wins++
      else if (awayScore < homeScore) losses++
      else draws++
    }
  }

  // Get goals (exclude own goals)
  const goals = await prisma.goal.count({
    where: {
      scorerId: clubMemberId,
      isOwnGoal: false,
      match: {
        status: MatchStatus.COMPLETED,
        ...(clubId ? { clubId } : {}),
      },
    },
  })

  // Get assists
  const assists = await prisma.goal.count({
    where: {
      assisterId: clubMemberId,
      match: {
        status: MatchStatus.COMPLETED,
        ...(clubId ? { clubId } : {}),
      },
    },
  })

  // Calculate goals conceded (only for goalkeepers in GK position)
  let goals_conceded: number | null = null
  const isGoalkeeper = member.primaryRole === 'POR'

  if (isGoalkeeper) {
    // Get positions where member was in GK position
    const gkPositions = positions.filter(
      pos => pos.positionLabel === 'GK'
    )

    if (gkPositions.length > 0) {
      goals_conceded = 0
      for (const pos of gkPositions) {
        const match = pos.formation.match
        if (!match) continue

        // GK on home side concedes away goals, and vice versa
        if (pos.formation.isHome) {
          goals_conceded += match.awayScore ?? 0
        } else {
          goals_conceded += match.homeScore ?? 0
        }
      }
    }
  }

  // Get average rating
  const ratings = await prisma.playerRating.findMany({
    where: {
      clubMemberId,
      match: {
        status: MatchStatus.COMPLETED,
        ...(clubId ? { clubId } : {}),
      },
    },
    select: {
      rating: true,
    },
  })

  const total_ratings = ratings.length
  const avg_rating = total_ratings > 0
    ? ratings.reduce((sum, r) => sum + r.rating.toNumber(), 0) / total_ratings
    : null

  return {
    club_member_id: member.id,
    first_name: member.user.firstName,
    last_name: member.user.lastName ?? undefined,
    nickname: member.user.nickname ?? undefined,
    image: member.user.image ?? undefined,
    goals,
    assists,
    appearances,
    wins,
    losses,
    draws,
    goals_conceded,
    avg_rating: avg_rating ? Math.round(avg_rating * 100) / 100 : null,
    total_ratings,
  }
}

// ============================================================================
// Leaderboard Functions
// ============================================================================

/**
 * Get top scorers leaderboard
 */
export async function getTopScorers(
  clubId: string,
  limit: number = 3
): Promise<MemberLeaderboardEntry[]> {
  const result = await prisma.$queryRaw<{ club_member_id: string; count: bigint }[]>`
    SELECT 
      g.scorerId as club_member_id,
      COUNT(*) as count
    FROM goals g
    JOIN matches m ON g.matchId = m.id
    WHERE m.clubId = ${clubId}
      AND m.status = 'COMPLETED'
      AND g.isOwnGoal = false
    GROUP BY g.scorerId
    ORDER BY count DESC
    LIMIT ${limit}
  `

  return await enrichLeaderboardEntries(result)
}

/**
 * Get top assisters leaderboard
 */
export async function getTopAssisters(
  clubId: string,
  limit: number = 3
): Promise<MemberLeaderboardEntry[]> {
  const result = await prisma.$queryRaw<{ club_member_id: string; count: bigint }[]>`
    SELECT 
      g.assisterId as club_member_id,
      COUNT(*) as count
    FROM goals g
    JOIN matches m ON g.matchId = m.id
    WHERE m.clubId = ${clubId}
      AND m.status = 'COMPLETED'
      AND g.assisterId IS NOT NULL
    GROUP BY g.assisterId
    ORDER BY count DESC
    LIMIT ${limit}
  `

  return await enrichLeaderboardEntries(result)
}

/**
 * Get top appearances leaderboard
 */
export async function getTopAppearances(
  clubId: string,
  limit: number = 3
): Promise<MemberLeaderboardEntry[]> {
  const result = await prisma.$queryRaw<{ club_member_id: string; count: bigint }[]>`
    SELECT 
      fp.clubMemberId as club_member_id,
      COUNT(*) as count
    FROM formation_positions fp
    JOIN formations f ON fp.formationId = f.id
    JOIN matches m ON f.matchId = m.id
    WHERE m.clubId = ${clubId}
      AND m.status = 'COMPLETED'
      AND fp.played = true
    GROUP BY fp.clubMemberId
    ORDER BY count DESC
    LIMIT ${limit}
  `

  return await enrichLeaderboardEntries(result)
}

/**
 * Get top wins leaderboard
 */
export async function getTopWins(
  clubId: string,
  limit: number = 3
): Promise<MemberLeaderboardEntry[]> {
  const result = await prisma.$queryRaw<{ club_member_id: string; count: bigint }[]>`
    SELECT 
      fp.clubMemberId as club_member_id,
      COUNT(*) as count
    FROM formation_positions fp
    JOIN formations f ON fp.formationId = f.id
    JOIN matches m ON f.matchId = m.id
    WHERE m.clubId = ${clubId}
      AND m.status = 'COMPLETED'
      AND fp.played = true
      AND (
        (f.is_home = true AND m.homeScore > m.awayScore)
        OR (f.is_home = false AND m.awayScore > m.homeScore)
      )
    GROUP BY fp.clubMemberId
    ORDER BY count DESC
    LIMIT ${limit}
  `

  return await enrichLeaderboardEntries(result)
}

/**
 * Get top losses leaderboard
 */
export async function getTopLosses(
  clubId: string,
  limit: number = 3
): Promise<MemberLeaderboardEntry[]> {
  const result = await prisma.$queryRaw<{ club_member_id: string; count: bigint }[]>`
    SELECT 
      fp.clubMemberId as club_member_id,
      COUNT(*) as count
    FROM formation_positions fp
    JOIN formations f ON fp.formationId = f.id
    JOIN matches m ON f.matchId = m.id
    WHERE m.clubId = ${clubId}
      AND m.status = 'COMPLETED'
      AND fp.played = true
      AND (
        (f.is_home = true AND m.homeScore < m.awayScore)
        OR (f.is_home = false AND m.awayScore < m.homeScore)
      )
    GROUP BY fp.clubMemberId
    ORDER BY count DESC
    LIMIT ${limit}
  `

  return await enrichLeaderboardEntries(result)
}

/**
 * Get top rated members leaderboard
 * Requires minimum 3 ratings to appear
 */
export async function getTopRatedMembers(
  clubId: string,
  limit: number = 3
): Promise<MemberLeaderboardEntry[]> {
  const result = await prisma.$queryRaw<{ club_member_id: string; avg_rating: number }[]>`
    SELECT 
      pr.clubMemberId as club_member_id,
      AVG(pr.rating) as avg_rating
    FROM player_ratings pr
    JOIN matches m ON pr.matchId = m.id
    WHERE m.clubId = ${clubId}
      AND m.status = 'COMPLETED'
    GROUP BY pr.clubMemberId
    HAVING COUNT(*) >= 3
    ORDER BY avg_rating DESC
    LIMIT ${limit}
  `

  return await enrichLeaderboardEntries(
    result.map(r => ({ club_member_id: r.club_member_id, count: BigInt(Math.round(r.avg_rating * 100)) }))
  ).then(entries => 
    entries.map((entry, i) => ({
      ...entry,
      value: Number(result[i]?.avg_rating ?? 0),
    }))
  )
}

/**
 * Get top goalkeepers with fewest goals conceded
 * Only members with primaryRole = 'POR' who played in GK position
 */
export async function getTopGoalsConceded(
  clubId: string,
  limit: number = 3
): Promise<MemberLeaderboardEntry[]> {
  // Get goalkeepers with their goals conceded
  const result = await prisma.$queryRaw<{ club_member_id: string; goals_conceded: bigint }[]>`
    SELECT 
      fp.clubMemberId as club_member_id,
      SUM(
        CASE 
          WHEN f.is_home = true THEN m.awayScore
          WHEN f.is_home = false THEN m.homeScore
          ELSE 0
        END
      ) as goals_conceded
    FROM formation_positions fp
    JOIN formations f ON fp.formationId = f.id
    JOIN matches m ON f.matchId = m.id
    JOIN club_members cm ON fp.clubMemberId = cm.id
    WHERE m.clubId = ${clubId}
      AND m.status = 'COMPLETED'
      AND fp.played = true
      AND fp.positionLabel = 'GK'
      AND cm.primaryRole = 'POR'
    GROUP BY fp.clubMemberId
    ORDER BY goals_conceded ASC
    LIMIT ${limit}
  `

  return await enrichLeaderboardEntries(
    result.map(r => ({ club_member_id: r.club_member_id, count: r.goals_conceded }))
  ).then(entries => 
    entries.map((entry, i) => ({
      ...entry,
      value: Number(result[i]?.goals_conceded ?? 0),
    }))
  )
}

// ============================================================================
// Match Scorers
// ============================================================================

/**
 * Get scorers for a specific match
 * Used for match history cards
 */
export async function getMatchScorers(
  matchId: string
): Promise<{ first_name: string; count: number }[]> {
  const goals = await prisma.goal.findMany({
    where: {
      matchId,
      isOwnGoal: false,
    },
    include: {
      scorer: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              nickname: true,
            },
          },
        },
      },
    },
  })

  // Count goals per member
  const scorerMap = new Map<string, { name: string; count: number }>()

  for (const goal of goals) {
    const clubMemberId = goal.scorerId
    const displayName = goal.scorer.user.nickname || goal.scorer.user.firstName

    if (scorerMap.has(clubMemberId)) {
      const entry = scorerMap.get(clubMemberId)!
      entry.count++
    } else {
      scorerMap.set(clubMemberId, { name: displayName, count: 1 })
    }
  }

  // Convert to array and sort by count
  return Array.from(scorerMap.values())
    .sort((a, b) => b.count - a.count)
    .map(entry => ({ first_name: entry.name, count: entry.count }))
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Enrich leaderboard entries with member info
 */
async function enrichLeaderboardEntries(
  results: { club_member_id: string; count: bigint }[]
): Promise<MemberLeaderboardEntry[]> {
  if (results.length === 0) return []

  const clubMemberIds = results.map(r => r.club_member_id)
  
  const members = await prisma.clubMember.findMany({
    where: { id: { in: clubMemberIds } },
    include: {
      user: {
        select: {
          firstName: true,
          nickname: true,
          image: true,
        },
      },
    },
  })

  const memberMap = new Map(members.map(m => [m.id, m]))

  return results.map(r => {
    const member = memberMap.get(r.club_member_id)
    return {
      club_member_id: r.club_member_id,
      first_name: member?.user.firstName ?? 'Unknown',
      nickname: member?.user.nickname ?? undefined,
      image: member?.user.image ?? undefined,
      value: Number(r.count),
    }
  })
}
