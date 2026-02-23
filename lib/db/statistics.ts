'use server'

/**
 * Statistics Aggregation Module
 * 
 * Provides functions for player statistics aggregation and leaderboards.
 * All statistics are calculated from COMPLETED matches only.
 */

import { prisma } from '@/lib/db'
import { MatchStatus } from '@prisma/client'

// ============================================================================
// Type Definitions
// ============================================================================

export interface PlayerStats {
  player_id: string
  player_name: string
  player_surname?: string
  player_nickname?: string
  player_avatar?: string
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

export interface PlayerLeaderboardEntry {
  player_id: string
  player_name: string
  player_nickname?: string
  player_avatar?: string
  value: number
}

// ============================================================================
// Get Player Statistics
// ============================================================================

/**
 * Get comprehensive statistics for a player
 * 
 * @param playerId - Player ID
 * @param clubId - Optional team ID to filter statistics
 * @returns PlayerStats object or null if player not found
 */
export async function getPlayerStats(
  playerId: string,
  clubId?: string
): Promise<PlayerStats | null> {
  // Get player info
  const player = await prisma.player.findUnique({
    where: { id: playerId },
    select: {
      id: true,
      name: true,
      surname: true,
      nickname: true,
      avatarUrl: true,
      roles: true,
    },
  })

  if (!player) return null

  // Get all completed matches where this player has a formation position
  const positions = await prisma.formationPosition.findMany({
    where: {
      playerId,
      formation: {
        match: {
          status: MatchStatus.COMPLETED,
          ...(clubId ? { clubId } : {}),
        },
      },
      side: { not: null },  // Only count positions with a side (played)
    },
    include: {
      formation: {
        include: {
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
    if (!pos.side || !pos.formation.match) continue
    
    appearances++
    const match = pos.formation.match
    const homeScore = match.homeScore ?? 0
    const awayScore = match.awayScore ?? 0

    if (pos.side === 'home') {
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
      scorerId: playerId,
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
      assisterId: playerId,
      match: {
        status: MatchStatus.COMPLETED,
        ...(clubId ? { clubId } : {}),
      },
    },
  })

  // Calculate goals conceded (only for goalkeepers in GK position)
  let goals_conceded: number | null = null
  const isGoalkeeper = player.roles.includes('goalkeeper')

  if (isGoalkeeper) {
    // Get positions where player was in GK position
    const gkPositions = positions.filter(
      pos => pos.positionLabel === 'GK' && pos.side
    )

    if (gkPositions.length > 0) {
      goals_conceded = 0
      for (const pos of gkPositions) {
        const match = pos.formation.match
        if (!match) continue

        // GK on home side concedes away goals, and vice versa
        if (pos.side === 'home') {
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
      playerId,
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
    player_id: player.id,
    player_name: player.name,
    player_surname: player.surname ?? undefined,
    player_nickname: player.nickname ?? undefined,
    player_avatar: player.avatarUrl ?? undefined,
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
): Promise<PlayerLeaderboardEntry[]> {
  const result = await prisma.$queryRaw<{ player_id: string; count: bigint }[]>`
    SELECT 
      g.scorer_id as player_id,
      COUNT(*) as count
    FROM goals g
    JOIN matches m ON g.match_id = m.id
    WHERE m.club_id = ${clubId}
      AND m.status = 'COMPLETED'
      AND g.is_own_goal = false
    GROUP BY g.scorer_id
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
): Promise<PlayerLeaderboardEntry[]> {
  const result = await prisma.$queryRaw<{ player_id: string; count: bigint }[]>`
    SELECT 
      g.assister_id as player_id,
      COUNT(*) as count
    FROM goals g
    JOIN matches m ON g.match_id = m.id
    WHERE m.club_id = ${clubId}
      AND m.status = 'COMPLETED'
      AND g.assister_id IS NOT NULL
    GROUP BY g.assister_id
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
): Promise<PlayerLeaderboardEntry[]> {
  const result = await prisma.$queryRaw<{ player_id: string; count: bigint }[]>`
    SELECT 
      fp.player_id as player_id,
      COUNT(*) as count
    FROM formation_positions fp
    JOIN formations f ON fp.formation_id = f.id
    JOIN matches m ON f.match_id = m.id
    WHERE m.club_id = ${clubId}
      AND m.status = 'COMPLETED'
      AND fp.player_id IS NOT NULL
      AND fp.side IS NOT NULL
    GROUP BY fp.player_id
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
): Promise<PlayerLeaderboardEntry[]> {
  const result = await prisma.$queryRaw<{ player_id: string; count: bigint }[]>`
    SELECT 
      fp.player_id as player_id,
      COUNT(*) as count
    FROM formation_positions fp
    JOIN formations f ON fp.formation_id = f.id
    JOIN matches m ON f.match_id = m.id
    WHERE m.club_id = ${clubId}
      AND m.status = 'COMPLETED'
      AND fp.player_id IS NOT NULL
      AND fp.side IS NOT NULL
      AND (
        (fp.side = 'home' AND m.home_score > m.away_score)
        OR (fp.side = 'away' AND m.away_score > m.home_score)
      )
    GROUP BY fp.player_id
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
): Promise<PlayerLeaderboardEntry[]> {
  const result = await prisma.$queryRaw<{ player_id: string; count: bigint }[]>`
    SELECT 
      fp.player_id as player_id,
      COUNT(*) as count
    FROM formation_positions fp
    JOIN formations f ON fp.formation_id = f.id
    JOIN matches m ON f.match_id = m.id
    WHERE m.club_id = ${clubId}
      AND m.status = 'COMPLETED'
      AND fp.player_id IS NOT NULL
      AND fp.side IS NOT NULL
      AND (
        (fp.side = 'home' AND m.home_score < m.away_score)
        OR (fp.side = 'away' AND m.away_score < m.home_score)
      )
    GROUP BY fp.player_id
    ORDER BY count DESC
    LIMIT ${limit}
  `

  return await enrichLeaderboardEntries(result)
}

/**
 * Get top rated players leaderboard
 * Requires minimum 3 ratings to appear
 */
export async function getTopRatedPlayers(
  clubId: string,
  limit: number = 3
): Promise<PlayerLeaderboardEntry[]> {
  const result = await prisma.$queryRaw<{ player_id: string; avg_rating: number }[]>`
    SELECT 
      pr.player_id as player_id,
      AVG(pr.rating) as avg_rating
    FROM player_ratings pr
    JOIN matches m ON pr.match_id = m.id
    WHERE m.club_id = ${clubId}
      AND m.status = 'COMPLETED'
    GROUP BY pr.player_id
    HAVING COUNT(*) >= 3
    ORDER BY avg_rating DESC
    LIMIT ${limit}
  `

  return await enrichLeaderboardEntries(
    result.map(r => ({ player_id: r.player_id, count: BigInt(Math.round(r.avg_rating * 100)) }))
  ).then(entries => 
    entries.map((entry, i) => ({
      ...entry,
      value: Number(result[i]?.avg_rating ?? 0),
    }))
  )
}

/**
 * Get top goalkeepers with fewest goals conceded
 * Only players with 'goalkeeper' role who played in GK position
 */
export async function getTopGoalsConceded(
  clubId: string,
  limit: number = 3
): Promise<PlayerLeaderboardEntry[]> {
  // Get goalkeepers with their goals conceded
  const result = await prisma.$queryRaw<{ player_id: string; goals_conceded: bigint }[]>`
    SELECT 
      fp.player_id as player_id,
      SUM(
        CASE 
          WHEN fp.side = 'home' THEN m.away_score
          WHEN fp.side = 'away' THEN m.home_score
          ELSE 0
        END
      ) as goals_conceded
    FROM formation_positions fp
    JOIN formations f ON fp.formation_id = f.id
    JOIN matches m ON f.match_id = m.id
    JOIN players p ON fp.player_id = p.id
    WHERE m.club_id = ${clubId}
      AND m.status = 'COMPLETED'
      AND fp.player_id IS NOT NULL
      AND fp.side IS NOT NULL
      AND fp.position_label = 'GK'
      AND 'goalkeeper' = ANY(p.roles)
    GROUP BY fp.player_id
    ORDER BY goals_conceded ASC
    LIMIT ${limit}
  `

  return await enrichLeaderboardEntries(
    result.map(r => ({ player_id: r.player_id, count: r.goals_conceded }))
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
): Promise<{ player_name: string; count: number }[]> {
  const goals = await prisma.goal.findMany({
    where: {
      matchId,
      isOwnGoal: false,
    },
    include: {
      scorer: {
        select: {
          name: true,
          surname: true,
          nickname: true,
        },
      },
    },
  })

  // Count goals per player
  const scorerMap = new Map<string, { name: string; count: number }>()

  for (const goal of goals) {
    const playerId = goal.scorerId
    const displayName = goal.scorer.nickname || goal.scorer.name

    if (scorerMap.has(playerId)) {
      const entry = scorerMap.get(playerId)!
      entry.count++
    } else {
      scorerMap.set(playerId, { name: displayName, count: 1 })
    }
  }

  // Convert to array and sort by count
  return Array.from(scorerMap.values())
    .sort((a, b) => b.count - a.count)
    .map(entry => ({ player_name: entry.name, count: entry.count }))
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Enrich leaderboard entries with player info
 */
async function enrichLeaderboardEntries(
  results: { player_id: string; count: bigint }[]
): Promise<PlayerLeaderboardEntry[]> {
  if (results.length === 0) return []

  const playerIds = results.map(r => r.player_id)
  
  const players = await prisma.player.findMany({
    where: { id: { in: playerIds } },
    select: {
      id: true,
      name: true,
      nickname: true,
      avatarUrl: true,
    },
  })

  const playerMap = new Map(players.map(p => [p.id, p]))

  return results.map(r => {
    const player = playerMap.get(r.player_id)
    return {
      player_id: r.player_id,
      player_name: player?.name ?? 'Unknown',
      player_nickname: player?.nickname ?? undefined,
      player_avatar: player?.avatarUrl ?? undefined,
      value: Number(r.count),
    }
  })
}
