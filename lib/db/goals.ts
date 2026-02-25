'use server'

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Goal Database Operations
 * 
 * Provides CRUD operations for goals with admin authorization.
 * Goals can be added during IN_PROGRESS or FINISHED match status.
 * 
 * Updated for new schema:
 * - Goal now links to ClubMember (scorerId, assisterId) instead of Player
 * - Removed clubId field from Goal
 * - ClubMember is used for all player references
 */

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { isTeamAdmin } from '@/lib/db/clubs'
import { MatchStatus } from '@prisma/client'
import type { Goal } from '@prisma/client'

// ============================================================================
// Error Messages (Italian)
// ============================================================================

const ERRORS = {
  UNAUTHORIZED: 'Devi essere autenticato per eseguire questa azione',
  NOT_ADMIN: 'Solo gli amministratori possono gestire i gol',
  MATCH_NOT_FOUND: 'Partita non trovata',
  GOAL_NOT_FOUND: 'Gol non trovato',
  INVALID_STATUS: 'I gol possono essere aggiunti solo durante la partita o dopo la fine',
  MATCH_COMPLETED: 'Non puoi modificare i gol di una partita completata',
  SCORER_NOT_MEMBER: 'Il marcatore deve essere un membro del club',
}

// ============================================================================
// Type Definitions
// ============================================================================

export interface AddGoalInput {
  matchId: string
  scorerId: string
  assisterId?: string
  isOwnGoal?: boolean
}

export interface GoalWithMembers extends Goal {
  scorer: {
    id: string
    user: {
      firstName: string
      lastName: string
      nickname: string | null
      image: string | null
    }
    jerseyNumber: number
  }
  assister: {
    id: string
    user: {
      firstName: string
      lastName: string
      nickname: string | null
      image: string | null
    }
    jerseyNumber: number
  } | null
}

// Backward compatibility alias
export type GoalWithPlayers = GoalWithMembers

// ============================================================================
// Helper: Convert Prisma Goal to app type
// ============================================================================

function toGoalWithMembers(dbGoal: any): GoalWithMembers {
  return {
    ...dbGoal,
    scorer: {
      id: dbGoal.scorer.id,
      user: {
        firstName: dbGoal.scorer.user.firstName,
        lastName: dbGoal.scorer.user.lastName,
        nickname: dbGoal.scorer.user.nickname,
        image: dbGoal.scorer.user.image,
      },
      jerseyNumber: dbGoal.scorer.jerseyNumber,
    },
    assister: dbGoal.assister ? {
      id: dbGoal.assister.id,
      user: {
        firstName: dbGoal.assister.user.firstName,
        lastName: dbGoal.assister.user.lastName,
        nickname: dbGoal.assister.user.nickname,
        image: dbGoal.assister.user.image,
      },
      jerseyNumber: dbGoal.assister.jerseyNumber,
    } : null,
  }
}

// ============================================================================
// Add Goal
// ============================================================================

export async function addGoal(data: AddGoalInput): Promise<GoalWithMembers> {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
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

  // Validate match status - goals allowed in IN_PROGRESS or FINISHED
  if (match.status !== MatchStatus.IN_PROGRESS && match.status !== MatchStatus.FINISHED) {
    throw new Error(ERRORS.INVALID_STATUS)
  }

  // Get current max order for the match
  const maxOrderGoal = await prisma.goal.findFirst({
    where: { matchId: data.matchId },
    orderBy: { order: 'desc' },
    select: { order: true },
  })

  const nextOrder = (maxOrderGoal?.order ?? 0) + 1

  // Create goal
  const goal = await prisma.goal.create({
    data: {
      matchId: data.matchId,
      scorerId: data.scorerId,
      assisterId: data.assisterId,
      isOwnGoal: data.isOwnGoal ?? false,
      order: nextOrder,
    },
    include: {
      scorer: {
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
      assister: {
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

  // Update match score
  await updateMatchScore(data.matchId)

  console.log('[Goals] Goal added:', goal.id, 'Order:', nextOrder)
  return toGoalWithMembers(goal)
}

// ============================================================================
// Remove Goal
// ============================================================================

export async function removeGoal(goalId: string): Promise<void> {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  // Get goal with match info
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    include: { match: true },
  })

  if (!goal) {
    throw new Error(ERRORS.GOAL_NOT_FOUND)
  }

  // Check if user is team admin
  const isAdmin = await isTeamAdmin(goal.match.clubId, session.user.id)
  if (!isAdmin) {
    throw new Error(ERRORS.NOT_ADMIN)
  }

  // Validate match status
  if (goal.match.status === MatchStatus.COMPLETED) {
    throw new Error(ERRORS.MATCH_COMPLETED)
  }

  // Delete goal
  await prisma.goal.delete({
    where: { id: goalId },
  })

  // Reorder remaining goals to maintain sequential order
  const remainingGoals = await prisma.goal.findMany({
    where: { matchId: goal.matchId },
    orderBy: { order: 'asc' },
  })

  // Update order for each remaining goal
  for (let i = 0; i < remainingGoals.length; i++) {
    if (remainingGoals[i].order !== i + 1) {
      await prisma.goal.update({
        where: { id: remainingGoals[i].id },
        data: { order: i + 1 },
      })
    }
  }

  // Update match score
  await updateMatchScore(goal.matchId)

  console.log('[Goals] Goal removed:', goalId)
}

// ============================================================================
// Get Match Goals
// ============================================================================

export async function getMatchGoals(matchId: string): Promise<GoalWithMembers[]> {
  const goals = await prisma.goal.findMany({
    where: { matchId },
    orderBy: { order: 'asc' },
    include: {
      scorer: {
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
      assister: {
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

  return goals.map(toGoalWithMembers)
}

// ============================================================================
// Update Match Score (helper)
// ============================================================================

export async function updateMatchScore(matchId: string): Promise<void> {
  // Get all goals for this match
  const goals = await prisma.goal.findMany({
    where: { matchId },
    select: { 
      isOwnGoal: true,
    },
  })

  // Count goals (simplified logic - goals are just counted)
  // In a real scenario, you'd need to know if a goal was for home or away
  // This is simplified based on the new schema
  let homeScore = 0
  let awayScore = 0

  // This is a simplified implementation
  // The actual logic would depend on how you track which side scored
  for (const goal of goals) {
    if (!goal.isOwnGoal) {
      // Non-own goals count for the scorer's team
      // This is simplified - you'd need more info to determine home/away
      homeScore++
    } else {
      // Own goals count for the opponent
      awayScore++
    }
  }

  // Update match with calculated scores
  await prisma.match.update({
    where: { id: matchId },
    data: {
      homeScore,
      awayScore,
    },
  })

  console.log('[Goals] Match score updated:', matchId, homeScore, '-', awayScore)
}
