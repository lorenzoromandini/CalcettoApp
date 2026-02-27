'use server'

/**
 * Statistics Server Actions
 * 
 * Wrapper actions for statistics queries.
 * These wrap the DB functions to provide proper Server Action interface.
 */

import { getSession } from '@/lib/session'
import {
  getMemberStats as dbGetMemberStats,
  getTopScorers as dbGetTopScorers,
  getTopAssisters as dbGetTopAssisters,
  getTopAppearances as dbGetTopAppearances,
  getTopWins as dbGetTopWins,
  getTopLosses as dbGetTopLosses,
  getTopRatedMembers as dbGetTopRatedMembers,
  getTopGoalsConceded as dbGetTopGoalsConceded,
  getMatchScorers as dbGetMatchScorers
} from '@/lib/db/statistics'
import type { MemberStats, MemberLeaderboardEntry } from '@/lib/db/statistics'

// ============================================================================
// Error Messages (Italian)
// ============================================================================

const ERRORS = {
  UNAUTHORIZED: 'Devi essere autenticato per eseguire questa azione',
}

// ============================================================================
// Get Member Stats
// ============================================================================

export async function getMemberStatsAction(
  clubMemberId: string,
  clubId?: string
): Promise<MemberStats | null> {
  const session = await getSession()
  
  if (!session?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  try {
    const stats = await dbGetMemberStats(clubMemberId, clubId)
    return stats
  } catch (error) {
    console.error('[StatisticsAction] Get member stats error:', error)
    throw new Error('Failed to get member stats')
  }
}

// ============================================================================
// Get Club Leaderboards (all at once)
// ============================================================================

export interface ClubLeaderboards {
  topScorers: MemberLeaderboardEntry[]
  topAssisters: MemberLeaderboardEntry[]
  topAppearances: MemberLeaderboardEntry[]
  topWins: MemberLeaderboardEntry[]
  topLosses: MemberLeaderboardEntry[]
  topRated: MemberLeaderboardEntry[]
  topGoalsConceded: MemberLeaderboardEntry[]
}

export async function getClubLeaderboardsAction(
  clubId: string,
  limit: number = 3
): Promise<ClubLeaderboards> {
  const session = await getSession()
  
  if (!session?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  try {
    const [
      topScorers,
      topAssisters,
      topAppearances,
      topWins,
      topLosses,
      topRated,
      topGoalsConceded
    ] = await Promise.all([
      dbGetTopScorers(clubId, limit),
      dbGetTopAssisters(clubId, limit),
      dbGetTopAppearances(clubId, limit),
      dbGetTopWins(clubId, limit),
      dbGetTopLosses(clubId, limit),
      dbGetTopRatedMembers(clubId, limit),
      dbGetTopGoalsConceded(clubId, limit)
    ])

    return {
      topScorers,
      topAssisters,
      topAppearances,
      topWins,
      topLosses,
      topRated,
      topGoalsConceded
    }
  } catch (error) {
    console.error('[StatisticsAction] Get club leaderboards error:', error)
    throw new Error('Failed to get club leaderboards')
  }
}

// ============================================================================
// Individual Leaderboard Actions
// ============================================================================

export async function getTopScorersAction(clubId: string, limit: number = 3) {
  const session = await getSession()
  
  if (!session?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  try {
    const scorers = await dbGetTopScorers(clubId, limit)
    return scorers
  } catch (error) {
    console.error('[StatisticsAction] Get top scorers error:', error)
    throw new Error('Failed to get top scorers')
  }
}

export async function getTopAssistersAction(clubId: string, limit: number = 3) {
  const session = await getSession()
  
  if (!session?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  try {
    const assisters = await dbGetTopAssisters(clubId, limit)
    return assisters
  } catch (error) {
    console.error('[StatisticsAction] Get top assisters error:', error)
    throw new Error('Failed to get top assisters')
  }
}

export async function getTopAppearancesAction(clubId: string, limit: number = 3) {
  const session = await getSession()
  
  if (!session?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  try {
    const appearances = await dbGetTopAppearances(clubId, limit)
    return appearances
  } catch (error) {
    console.error('[StatisticsAction] Get top appearances error:', error)
    throw new Error('Failed to get top appearances')
  }
}

export async function getTopWinsAction(clubId: string, limit: number = 3) {
  const session = await getSession()
  
  if (!session?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  try {
    const wins = await dbGetTopWins(clubId, limit)
    return wins
  } catch (error) {
    console.error('[StatisticsAction] Get top wins error:', error)
    throw new Error('Failed to get top wins')
  }
}

export async function getTopLossesAction(clubId: string, limit: number = 3) {
  const session = await getSession()
  
  if (!session?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  try {
    const losses = await dbGetTopLosses(clubId, limit)
    return losses
  } catch (error) {
    console.error('[StatisticsAction] Get top losses error:', error)
    throw new Error('Failed to get top losses')
  }
}

export async function getTopRatedMembersAction(clubId: string, limit: number = 3) {
  const session = await getSession()
  
  if (!session?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  try {
    const rated = await dbGetTopRatedMembers(clubId, limit)
    return rated
  } catch (error) {
    console.error('[StatisticsAction] Get top rated members error:', error)
    throw new Error('Failed to get top rated members')
  }
}

export async function getTopGoalsConcededAction(clubId: string, limit: number = 3) {
  const session = await getSession()
  
  if (!session?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  try {
    const goalsConceded = await dbGetTopGoalsConceded(clubId, limit)
    return goalsConceded
  } catch (error) {
    console.error('[StatisticsAction] Get top goals conceded error:', error)
    throw new Error('Failed to get top goals conceded')
  }
}

// ============================================================================
// Get Match Scorers
// ============================================================================

export async function getMatchScorersAction(matchId: string) {
  const session = await getSession()
  
  if (!session?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  try {
    const scorers = await dbGetMatchScorers(matchId)
    return scorers
  } catch (error) {
    console.error('[StatisticsAction] Get match scorers error:', error)
    throw new Error('Failed to get match scorers')
  }
}
