'use server'

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Goal Database Operations
 * 
 * Provides CRUD operations for goals with admin authorization.
 * Goals can be added during IN_PROGRESS or FINISHED match status.
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
  SCORER_NOT_PLAYER: 'Il marcatore deve essere un giocatore della squadra',
}

// ============================================================================
// Type Definitions
// ============================================================================

export interface AddGoalInput {
  matchId: string
  clubId: string      // Which team scored (our team or opponent placeholder)
  scorerId: string
  assisterId?: string
  isOwnGoal?: boolean
}

export interface GoalWithPlayers extends Goal {
  scorer: {
    id: string
    name: string
    surname: string | null
    nickname: string | null
    avatarUrl: string | null
  }
  assister: {
    id: string
    name: string
    surname: string | null
    nickname: string | null
    avatarUrl: string | null
  } | null
}

// ============================================================================
// Helper: Convert Prisma Goal to app type
// ============================================================================

function toGoalWithPlayers(dbGoal: any): GoalWithPlayers {
  return {
    ...dbGoal,
    scorer: {
      id: dbGoal.scorer.id,
      name: dbGoal.scorer.name,
      surname: dbGoal.scorer.surname,
      nickname: dbGoal.scorer.nickname,
      avatarUrl: dbGoal.scorer.avatarUrl,
    },
    assister: dbGoal.assister ? {
      id: dbGoal.assister.id,
      name: dbGoal.assister.name,
      surname: dbGoal.assister.surname,
      nickname: dbGoal.assister.nickname,
      avatarUrl: dbGoal.assister.avatarUrl,
    } : null,
  }
}

// ============================================================================
// Add Goal
// ============================================================================

export async function addGoal(data: AddGoalInput): Promise<GoalWithPlayers> {
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
      clubId: data.clubId,
      scorerId: data.scorerId,
      assisterId: data.assisterId,
      isOwnGoal: data.isOwnGoal ?? false,
      order: nextOrder,
    },
    include: {
      scorer: true,
      assister: true,
    },
  })

  // Update match score
  await updateMatchScore(data.matchId)

  console.log('[Goals] Goal added:', goal.id, 'Order:', nextOrder)
  return toGoalWithPlayers(goal)
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

export async function getMatchGoals(matchId: string): Promise<GoalWithPlayers[]> {
  const goals = await prisma.goal.findMany({
    where: { matchId },
    orderBy: { order: 'asc' },
    include: {
      scorer: true,
      assister: true,
    },
  })

  return goals.map(toGoalWithPlayers)
}

// ============================================================================
// Update Match Score (helper)
// ============================================================================

export async function updateMatchScore(matchId: string): Promise<void> {
  // Get match with team info
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { clubId: true },
  })

  if (!match) return

  // Get all goals for this match
  const goals = await prisma.goal.findMany({
    where: { matchId },
    select: { clubId: true, isOwnGoal: true },
  })

  // Count goals for each team
  // Goals where clubId matches the match's team are home goals (excluding own goals)
  // Goals where clubId doesn't match are away goals
  // Own goals count for the opposing team
  let homeScore = 0
  let awayScore = 0

  for (const goal of goals) {
    if (goal.clubId === match.clubId) {
      // Our team's goal record
      if (goal.isOwnGoal) {
        // Own goal counts for opponent
        awayScore++
      } else {
        homeScore++
      }
    } else {
      // Opponent's goal record
      if (goal.isOwnGoal) {
        // Opponent's own goal counts for us
        homeScore++
      } else {
        awayScore++
      }
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

// ============================================================================
// Get Goals with Team Info
// ============================================================================

export interface GoalWithTeamInfo extends GoalWithPlayers {
  isOurTeam: boolean  // true if goal is for the team we're viewing
}

export async function getMatchGoalsWithTeamInfo(
  matchId: string, 
  ourTeamId: string
): Promise<GoalWithTeamInfo[]> {
  const goals = await getMatchGoals(matchId)
  
  return goals.map(goal => ({
    ...goal,
    isOurTeam: goal.clubId === ourTeamId && !goal.isOwnGoal,
  }))
}
