'use server'

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Player Ratings Server Actions
 * 
 * Manages player ratings with nuanced 38-value scale.
 * Only players who played (played=true) can be rated.
 * Ratings are only editable when match status is FINISHED.
 * 
 * Updated for new schema:
 * - PlayerRating now links to ClubMember (clubMemberId) instead of Player
 * - FormationPosition tracks played status instead of MatchPlayer
 */

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { isTeamAdmin } from '@/lib/db/clubs'
import { ratingToDecimal, decimalToRating, isValidRating } from '@/lib/rating-utils'
import { MatchStatus } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

// ============================================================================
// Types
// ============================================================================

/**
 * Player rating from database
 */
export interface PlayerRating {
  id: string
  matchId: string
  clubMemberId: string
  rating: string  // Formatted string (e.g., "6.5")
  ratingDecimal: number  // Decimal value for calculations
  comment?: string
  createdAt: string
  updatedAt: string
}

/**
 * Player rating with member details
 */
export interface PlayerRatingWithMember extends PlayerRating {
  firstName: string
  lastName: string
  nickname?: string
  image?: string
  jerseyNumber: number
}

// Backward compatibility alias
export type PlayerRatingWithPlayer = PlayerRatingWithMember

/**
 * Data for creating/updating a rating
 */
export interface RatingInput {
  matchId: string
  clubMemberId: string  // Changed from playerId
  rating: string  // String format (e.g., "6", "6-", "6+", "6.5")
  comment?: string
}

// ============================================================================
// Error Messages (Italian)
// ============================================================================

const ERRORS = {
  UNAUTHORIZED: 'Devi essere autenticato per eseguire questa azione',
  NOT_ADMIN: 'Solo gli amministratori possono assegnare voti',
  MATCH_NOT_FOUND: 'Partita non trovata',
  MEMBER_NOT_IN_MATCH: 'Il membro non fa parte di questa partita',
  MEMBER_NOT_PLAYED: 'Il membro non ha giocato in questa partita',
  MATCH_NOT_FINISHED: 'I voti possono essere assegnati solo a partite terminate',
  MATCH_COMPLETED: 'I voti non possono essere modificati per partite completate',
  INVALID_RATING: 'Voto non valido. Usa uno dei 38 valori consentiti.',
  COMMENT_TOO_LONG: 'Il commento non può superare i 500 caratteri',
}

// ============================================================================
// Helper: Convert Prisma PlayerRating to app type
// ============================================================================

function toPlayerRating(dbRating: any): PlayerRating {
  const ratingDecimal = dbRating.rating.toNumber()
  return {
    id: dbRating.id,
    matchId: dbRating.matchId,
    clubMemberId: dbRating.clubMemberId,
    rating: decimalToRating(ratingDecimal),
    ratingDecimal: ratingDecimal,
    comment: dbRating.comment ?? undefined,
    createdAt: dbRating.createdAt.toISOString(),
    updatedAt: dbRating.updatedAt.toISOString(),
  }
}

function toPlayerRatingWithMember(dbRating: any): PlayerRatingWithMember {
  const base = toPlayerRating(dbRating)
  return {
    ...base,
    firstName: dbRating.clubMember?.user?.firstName || 'Unknown',
    lastName: dbRating.clubMember?.user?.lastName || '',
    nickname: dbRating.clubMember?.user?.nickname ?? undefined,
    image: dbRating.clubMember?.user?.image ?? undefined,
    jerseyNumber: dbRating.clubMember?.jerseyNumber || 0,
  }
}

// ============================================================================
// Create or Update Rating (Upsert)
// ============================================================================

/**
 * Create or update a player's rating for a match
 * 
 * Requirements:
 * - User must be club admin
 * - Match status must be FINISHED (not COMPLETED)
 * - Player must have played=true in this match (via FormationPosition)
 * - Rating must be one of 38 valid values
 * 
 * @param data - Rating input data
 * @returns Created/updated PlayerRating
 */
export async function upsertPlayerRating(data: RatingInput): Promise<PlayerRating> {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  // Validate rating format
  if (!isValidRating(data.rating)) {
    throw new Error(ERRORS.INVALID_RATING)
  }

  // Validate comment length
  if (data.comment && data.comment.length > 500) {
    throw new Error(ERRORS.COMMENT_TOO_LONG)
  }

  // Get match with club info
  const match = await prisma.match.findUnique({
    where: { id: data.matchId },
    include: { club: true },
  })

  if (!match) {
    throw new Error(ERRORS.MATCH_NOT_FOUND)
  }

  // Check if user is club admin
  const isAdmin = await isTeamAdmin(match.clubId, session.user.id)
  if (!isAdmin) {
    throw new Error(ERRORS.NOT_ADMIN)
  }

  // Check match status - must be FINISHED (not COMPLETED)
  if (match.status !== MatchStatus.FINISHED) {
    if (match.status === MatchStatus.COMPLETED) {
      throw new Error(ERRORS.MATCH_COMPLETED)
    }
    throw new Error(ERRORS.MATCH_NOT_FINISHED)
  }

  // Check if clubMember is in the match formation and has played
  const formationPosition = await prisma.formationPosition.findFirst({
    where: {
      clubMemberId: data.clubMemberId,
      formation: {
        matchId: data.matchId,
      },
      played: true,
    },
  })

  if (!formationPosition) {
    throw new Error(ERRORS.MEMBER_NOT_PLAYED)
  }

  // Convert rating string to decimal
  const ratingDecimal = ratingToDecimal(data.rating)

  // Upsert the rating
  const upsertedRating = await prisma.playerRating.upsert({
    where: {
      matchId_clubMemberId: {
        matchId: data.matchId,
        clubMemberId: data.clubMemberId,
      },
    },
    create: {
      matchId: data.matchId,
      clubMemberId: data.clubMemberId,
      rating: new Decimal(ratingDecimal),
      comment: data.comment,
    },
    update: {
      rating: new Decimal(ratingDecimal),
      comment: data.comment,
    },
    include: {
      clubMember: {
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
      },
    },
  })

  console.log('[Ratings] Upserted rating:', data.matchId, data.clubMemberId, data.rating, '→', ratingDecimal)

  return toPlayerRating(upsertedRating)
}

// ============================================================================
// Get Match Ratings
// ============================================================================

/**
 * Get all ratings for a match with member details
 * Includes jersey number from club_members table
 * 
 * @param matchId - Match ID
 * @returns Array of ratings with member details
 */
export async function getMatchRatings(matchId: string): Promise<PlayerRatingWithMember[]> {
  // Get all ratings with member details
  const ratings = await prisma.playerRating.findMany({
    where: { matchId },
    include: {
      clubMember: {
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
      },
    },
  })

  // Convert to app types
  const results = ratings.map(toPlayerRatingWithMember)

  // Sort by rating descending (best first)
  return results.sort((a: PlayerRatingWithMember, b: PlayerRatingWithMember) => b.ratingDecimal - a.ratingDecimal)
}

// ============================================================================
// Get Single Member Match Rating
// ============================================================================

/**
 * Get rating for a specific member in a match
 * 
 * @param matchId - Match ID
 * @param clubMemberId - ClubMember ID
 * @returns PlayerRating or null if not rated
 */
export async function getPlayerMatchRating(
  matchId: string,
  clubMemberId: string
): Promise<PlayerRating | null> {
  const rating = await prisma.playerRating.findUnique({
    where: {
      matchId_clubMemberId: {
        matchId,
        clubMemberId,
      },
    },
  })

  if (!rating) {
    return null
  }

  return toPlayerRating(rating)
}

// ============================================================================
// Get Member Average Rating
// ============================================================================

/**
 * Calculate member's average rating across all completed matches
 * 
 * @param clubMemberId - ClubMember ID
 * @returns Average rating as decimal, or null if no ratings
 */
export async function getPlayerAverageRating(clubMemberId: string): Promise<number | null> {
  // Get all ratings for this member in completed matches
  const ratings = await prisma.playerRating.findMany({
    where: {
      clubMemberId,
      match: {
        status: MatchStatus.COMPLETED,
      },
    },
    select: {
      rating: true,
    },
  })

  if (ratings.length === 0) {
    return null
  }

  // Calculate average
  const sum = ratings.reduce((acc: number, r: { rating: { toNumber: () => number } }) => acc + r.rating.toNumber(), 0)
  const average = sum / ratings.length

  return Math.round(average * 100) / 100  // Round to 2 decimal places
}

// ============================================================================
// Delete Rating
// ============================================================================

/**
 * Delete a member's rating for a match
 * Only allowed when match status is FINISHED
 * 
 * @param matchId - Match ID
 * @param clubMemberId - ClubMember ID
 */
export async function deletePlayerRating(
  matchId: string,
  clubMemberId: string
): Promise<void> {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  // Get match with club info
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { club: true },
  })

  if (!match) {
    throw new Error(ERRORS.MATCH_NOT_FOUND)
  }

  // Check if user is club admin
  const isAdmin = await isTeamAdmin(match.clubId, session.user.id)
  if (!isAdmin) {
    throw new Error(ERRORS.NOT_ADMIN)
  }

  // Check match status
  if (match.status !== MatchStatus.FINISHED) {
    if (match.status === MatchStatus.COMPLETED) {
      throw new Error(ERRORS.MATCH_COMPLETED)
    }
    throw new Error(ERRORS.MATCH_NOT_FINISHED)
  }

  // Delete the rating
  await prisma.playerRating.delete({
    where: {
      matchId_clubMemberId: {
        matchId,
        clubMemberId,
      },
    },
  })

  console.log('[Ratings] Deleted rating:', matchId, clubMemberId)
}

// ============================================================================
// Get Ratings Count
// ============================================================================

/**
 * Get count of ratings vs played members for a match
 * 
 * @param matchId - Match ID
 * @returns Object with rated count and played count
 */
export async function getRatingsCount(matchId: string): Promise<{
  rated: number
  played: number
}> {
  // Count played members (from FormationPosition)
  const playedMembers = await prisma.formationPosition.count({
    where: {
      formation: {
        matchId,
      },
      played: true,
    },
  })

  // Count ratings
  const ratings = await prisma.playerRating.count({
    where: {
      matchId,
    },
  })

  return {
    rated: ratings,
    played: playedMembers,
  }
}

// ============================================================================
// Bulk Upsert Ratings
// ============================================================================

/**
 * Bulk create/update ratings for multiple members
 * Useful for saving all ratings at once
 * 
 * @param ratings - Array of rating inputs
 * @returns Array of created/updated ratings
 */
export async function bulkUpsertRatings(
  ratings: RatingInput[]
): Promise<PlayerRating[]> {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  if (ratings.length === 0) {
    return []
  }

  // Validate all ratings first
  for (const data of ratings) {
    if (!isValidRating(data.rating)) {
      throw new Error(`${ERRORS.INVALID_RATING}: ${data.rating}`)
    }
    if (data.comment && data.comment.length > 500) {
      throw new Error(ERRORS.COMMENT_TOO_LONG)
    }
  }

  // Get match (all ratings should be for same match)
  const matchId = ratings[0].matchId
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { club: true },
  })

  if (!match) {
    throw new Error(ERRORS.MATCH_NOT_FOUND)
  }

  // Check if user is club admin
  const isAdmin = await isTeamAdmin(match.clubId, session.user.id)
  if (!isAdmin) {
    throw new Error(ERRORS.NOT_ADMIN)
  }

  // Check match status
  if (match.status !== MatchStatus.FINISHED) {
    if (match.status === MatchStatus.COMPLETED) {
      throw new Error(ERRORS.MATCH_COMPLETED)
    }
    throw new Error(ERRORS.MATCH_NOT_FINISHED)
  }

  // Verify all members have played
  const clubMemberIds = ratings.map(r => r.clubMemberId)
  const formationPositions = await prisma.formationPosition.findMany({
    where: {
      clubMemberId: { in: clubMemberIds },
      formation: {
        matchId,
      },
      played: true,
    },
  })

  const memberMap = new Map(formationPositions.map(fp => [fp.clubMemberId, fp]))
  for (const data of ratings) {
    const fp = memberMap.get(data.clubMemberId)
    if (!fp) {
      throw new Error(ERRORS.MEMBER_NOT_PLAYED)
    }
  }

  // Bulk upsert in transaction
  const results = await prisma.$transaction(
    ratings.map(data =>
      prisma.playerRating.upsert({
        where: {
          matchId_clubMemberId: {
            matchId: data.matchId,
            clubMemberId: data.clubMemberId,
          },
        },
        create: {
          matchId: data.matchId,
          clubMemberId: data.clubMemberId,
          rating: new Decimal(ratingToDecimal(data.rating)),
          comment: data.comment,
        },
        update: {
          rating: new Decimal(ratingToDecimal(data.rating)),
          comment: data.comment,
        },
      })
    )
  )

  console.log('[Ratings] Bulk upserted:', matchId, results.length, 'ratings')

  return results.map(toPlayerRating)
}

// ============================================================================
// Rating History
// ============================================================================

/**
 * Rating history entry for chart visualization
 */
export interface RatingHistoryEntry {
  matchId: string
  matchDate: Date
  rating: number
  ratingDisplay: string
  comment?: string
}

/**
 * Get member's rating history ordered chronologically by match date
 * 
 * Fetches all ratings for a member from COMPLETED matches.
 * Used for rating trend visualization on member profile.
 * 
 * @param clubMemberId - ClubMember ID
 * @param clubId - Optional club ID to filter history
 * @returns Array of rating history entries ordered by match date
 */
export async function getPlayerRatingHistory(
  clubMemberId: string,
  clubId?: string
): Promise<RatingHistoryEntry[]> {
  const ratings = await prisma.playerRating.findMany({
    where: {
      clubMemberId,
      match: {
        status: MatchStatus.COMPLETED,
        ...(clubId ? { clubId } : {}),
      },
    },
    include: {
      match: {
        select: {
          id: true,
          scheduledAt: true,
        },
      },
    },
    orderBy: {
      match: {
        scheduledAt: 'asc',
      },
    },
  })

  return ratings.map((r: { matchId: string; match: { scheduledAt: Date }; rating: { toNumber: () => number }; comment?: string | null }) => ({
    matchId: r.matchId,
    matchDate: r.match.scheduledAt,
    rating: r.rating.toNumber(),
    ratingDisplay: decimalToRating(r.rating.toNumber()),
    comment: r.comment ?? undefined,
  }))
}

// ============================================================================
// Dashboard Member Data
// ============================================================================

export type FrameBorderColor = 'gray' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'fire-red'

export interface DashboardMemberData {
  member: {
    id: string
    firstName: string
    lastName: string
    nickname: string | null
    image: string | null
  }
  clubId: string | null
  teamName: string | null
  jerseyNumber: number | null
  lastThreeGamesAvgRating: number | null
  hasMvpInLastThree: boolean
  frameColor: FrameBorderColor
}

export async function getMemberDashboardData(
  userId: string,
  clubId?: string
): Promise<DashboardMemberData | null> {
  // Find member by userId - preferisci OWNER, poi ordina per data di adesione
  const memberships = await prisma.clubMember.findMany({
    where: { 
      userId,
      ...(clubId ? { clubId } : {}),
    },
    include: {
      user: true,
      club: true,
    },
    orderBy: [
      { privileges: 'desc' }, // OWNER prima, poi MANAGER, poi MEMBER
      { joinedAt: 'desc' },  // Poi il più recente
    ],
    take: 1,
  })
  
  const member = memberships[0]

  if (!member) {
    console.log('[getMemberDashboardData] No member found for userId:', userId, 'clubId:', clubId)
    return null
  }
  
  console.log('[getMemberDashboardData] Found member:', {
    memberId: member.id,
    jerseyNumber: member.jerseyNumber,
    privileges: member.privileges,
    clubName: member.club?.name
  })

  const lastThreeRatings = await prisma.playerRating.findMany({
    where: {
      clubMemberId: member.id,
      match: {
        clubId: member.clubId,
        status: MatchStatus.COMPLETED,
      },
    },
    include: {
      match: {
        select: {
          id: true,
          scheduledAt: true,
        },
      },
    },
    orderBy: {
      match: {
        scheduledAt: 'desc',
      },
    },
    take: 3,
  })

  let lastThreeGamesAvgRating: number | null = null
  let hasMvpInLastThree = false

  if (lastThreeRatings.length > 0) {
    const sum = lastThreeRatings.reduce((acc: number, r: { rating: { toNumber: () => number } }) => acc + r.rating.toNumber(), 0)
    lastThreeGamesAvgRating = Math.round((sum / lastThreeRatings.length) * 100) / 100

    for (const rating of lastThreeRatings) {
      const allMatchRatings = await prisma.playerRating.findMany({
        where: { matchId: rating.matchId },
        select: { clubMemberId: true, rating: true },
      })

      if (allMatchRatings.length > 0) {
        const maxRating = Math.max(...allMatchRatings.map((r: { rating: { toNumber: () => number } }) => r.rating.toNumber()))
        const topMembers = allMatchRatings.filter((r: { rating: { toNumber: () => number } }) => r.rating.toNumber() === maxRating)
        if (topMembers.some((m: { clubMemberId: string }) => m.clubMemberId === member.id)) {
          hasMvpInLastThree = true
          break
        }
      }
    }
  }

  const frameColor = await calculateFrameColor(lastThreeGamesAvgRating, hasMvpInLastThree)

  const result = {
    member: {
      id: member.id,
      firstName: member.user.firstName,
      lastName: member.user.lastName,
      nickname: member.user.nickname,
      image: member.user.image,
    },
    clubId: member.clubId,
    teamName: member.club.name,
    jerseyNumber: member.jerseyNumber,
    lastThreeGamesAvgRating,
    hasMvpInLastThree,
    frameColor,
  }

  console.log('[getMemberDashboardData] RETURNING:', {
    jerseyNumber: result.jerseyNumber,
    type: typeof result.jerseyNumber,
    clubName: result.teamName,
    memberId: result.member.id
  })

  return result
}

export async function calculateFrameColor(
  avgRating: number | null,
  hasMvp: boolean
): Promise<FrameBorderColor> {
  if (hasMvp) return 'fire-red'
  if (avgRating === null) return 'bronze' // Nessuna partita disputata = bronzo
  if (avgRating < 6) return 'bronze'
  if (avgRating < 7) return 'silver'
  if (avgRating < 8) return 'gold'
  return 'platinum'
}

export async function getClubMembersDashboardData(clubId: string): Promise<DashboardMemberData[]> {
  const members = await prisma.clubMember.findMany({
    where: { clubId },
    include: {
      user: true,
      club: true,
    },
    orderBy: {
      jerseyNumber: 'asc',
    },
  })

  const results: DashboardMemberData[] = []

  for (const member of members) {
    const lastThreeRatings = await prisma.playerRating.findMany({
      where: {
        clubMemberId: member.id,
        match: {
          clubId,
          status: MatchStatus.COMPLETED,
        },
      },
      orderBy: {
        match: {
          scheduledAt: 'desc',
        },
      },
      take: 3,
    })

    let lastThreeGamesAvgRating: number | null = null
    let hasMvpInLastThree = false

    if (lastThreeRatings.length > 0) {
      const sum = lastThreeRatings.reduce((acc: number, r: { rating: { toNumber: () => number } }) => acc + r.rating.toNumber(), 0)
      lastThreeGamesAvgRating = Math.round((sum / lastThreeRatings.length) * 100) / 100

      for (const rating of lastThreeRatings) {
        const allMatchRatings = await prisma.playerRating.findMany({
          where: { matchId: rating.matchId },
          select: { clubMemberId: true, rating: true },
        })

        if (allMatchRatings.length > 0) {
          const maxRating = Math.max(...allMatchRatings.map((r: { rating: { toNumber: () => number } }) => r.rating.toNumber()))
          const topMembers = allMatchRatings.filter((r: { rating: { toNumber: () => number } }) => r.rating.toNumber() === maxRating)
          if (topMembers.some((m: { clubMemberId: string }) => m.clubMemberId === member.id)) {
            hasMvpInLastThree = true
            break
          }
        }
      }
    }

    const frameColor = await calculateFrameColor(lastThreeGamesAvgRating, hasMvpInLastThree)

    results.push({
      member: {
        id: member.id,
        firstName: member.user.firstName,
        lastName: member.user.lastName,
        nickname: member.user.nickname,
        image: member.user.image,
      },
      clubId,
      teamName: member.club.name,
      jerseyNumber: member.jerseyNumber,
      lastThreeGamesAvgRating,
      hasMvpInLastThree,
      frameColor,
    })
  }

  return results
}
