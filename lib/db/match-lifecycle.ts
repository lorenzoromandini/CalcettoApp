'use server'

/**
 * Match Lifecycle Server Actions
 * 
 * Handles match state transitions: start, end, complete, and final results.
 * All actions require admin/co-admin role.
 */

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { isTeamAdmin } from '@/lib/db/teams'
import { initializeParticipation } from '@/lib/db/player-participation'
import { MatchStatus } from '@prisma/client'
import type { Match } from '@prisma/client'

// ============================================================================
// Error Messages (Italian)
// ============================================================================

const ERRORS = {
  UNAUTHORIZED: 'Devi essere autenticato per eseguire questa azione',
  NOT_ADMIN: 'Solo gli amministratori possono eseguire questa azione',
  MATCH_NOT_FOUND: 'Partita non trovata',
  INVALID_STATUS: {
    START: 'La partita deve essere programmata per essere avviata',
    END: 'La partita deve essere in corso per essere terminata',
    COMPLETE: 'La partita deve essere terminata per essere completata',
    FINAL_RESULTS: 'La partita deve essere programmata per inserire i risultati finali',
  },
}

// ============================================================================
// Helper: Set side for all positions in a match's formation
// ============================================================================

/**
 * Set the side field for all FormationPosition records based on positionX
 * - positionX < 5 → 'home' (left side of pitch)
 * - positionX >= 5 → 'away' (right side of pitch)
 */
async function setPositionSides(matchId: string): Promise<void> {
  // Get the formation for this match
  const formation = await prisma.formation.findUnique({
    where: { matchId },
    include: { positions: true },
  })

  if (!formation) {
    console.log('[MatchLifecycle] No formation found for match:', matchId)
    return
  }

  // Update each position with its side
  for (const position of formation.positions) {
    const side = position.positionX < 5 ? 'home' : 'away'
    await prisma.formationPosition.update({
      where: { id: position.id },
      data: { side },
    })
  }

  console.log('[MatchLifecycle] Set sides for', formation.positions.length, 'positions in match:', matchId)
}

// ============================================================================
// Helper: Convert Prisma Match to app Match type
// ============================================================================

function toMatchType(dbMatch: Match): Match {
  return dbMatch
}

// ============================================================================
// Start Match: SCHEDULED → IN_PROGRESS
// ============================================================================

export async function startMatch(matchId: string): Promise<Match> {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  // Get match with team info
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { team: true },
  })

  if (!match) {
    throw new Error(ERRORS.MATCH_NOT_FOUND)
  }

  // Check if user is team admin
  const isAdmin = await isTeamAdmin(match.teamId, session.user.id)
  if (!isAdmin) {
    throw new Error(ERRORS.NOT_ADMIN)
  }

  // Validate current status
  if (match.status !== MatchStatus.SCHEDULED) {
    throw new Error(ERRORS.INVALID_STATUS.START)
  }

  // Update match status
  const updatedMatch = await prisma.match.update({
    where: { id: matchId },
    data: {
      status: MatchStatus.IN_PROGRESS,
    },
  })

  return toMatchType(updatedMatch)
}

// ============================================================================
// End Match: IN_PROGRESS → FINISHED
// ============================================================================

export async function endMatch(matchId: string): Promise<Match> {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  // Get match with team info
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { team: true },
  })

  if (!match) {
    throw new Error(ERRORS.MATCH_NOT_FOUND)
  }

  // Check if user is team admin
  const isAdmin = await isTeamAdmin(match.teamId, session.user.id)
  if (!isAdmin) {
    throw new Error(ERRORS.NOT_ADMIN)
  }

  // Validate current status
  if (match.status !== MatchStatus.IN_PROGRESS) {
    throw new Error(ERRORS.INVALID_STATUS.END)
  }

  // Update match status
  const updatedMatch = await prisma.match.update({
    where: { id: matchId },
    data: {
      status: MatchStatus.FINISHED,
    },
  })

  // Initialize participation: mark all RSVP 'in' players as played
  // This is done after the match ends so admin can adjust later
  await initializeParticipation(matchId)

  return toMatchType(updatedMatch)
}

// ============================================================================
// Complete Match: FINISHED → COMPLETED (locks all edits)
// ============================================================================

export async function completeMatch(matchId: string): Promise<Match> {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  // Get match with team info
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { team: true },
  })

  if (!match) {
    throw new Error(ERRORS.MATCH_NOT_FOUND)
  }

  // Check if user is team admin
  const isAdmin = await isTeamAdmin(match.teamId, session.user.id)
  if (!isAdmin) {
    throw new Error(ERRORS.NOT_ADMIN)
  }

  // Validate current status
  if (match.status !== MatchStatus.FINISHED) {
    throw new Error(ERRORS.INVALID_STATUS.COMPLETE)
  }

  // Set side for all positions before completing
  // This records which team each player was on for statistics
  await setPositionSides(matchId)

  // Update match status
  const updatedMatch = await prisma.match.update({
    where: { id: matchId },
    data: {
      status: MatchStatus.COMPLETED,
    },
  })

  return toMatchType(updatedMatch)
}

// ============================================================================
// Input Final Results: SCHEDULED → FINISHED (skip in_progress, set scores)
// ============================================================================

export async function inputFinalResults(
  matchId: string,
  homeScore: number,
  awayScore: number
): Promise<Match> {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  // Get match with team info
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { team: true },
  })

  if (!match) {
    throw new Error(ERRORS.MATCH_NOT_FOUND)
  }

  // Check if user is team admin
  const isAdmin = await isTeamAdmin(match.teamId, session.user.id)
  if (!isAdmin) {
    throw new Error(ERRORS.NOT_ADMIN)
  }

  // Validate current status
  if (match.status !== MatchStatus.SCHEDULED) {
    throw new Error(ERRORS.INVALID_STATUS.FINAL_RESULTS)
  }

  // Validate scores
  if (homeScore < 0 || homeScore > 99 || awayScore < 0 || awayScore > 99) {
    throw new Error('I punteggi devono essere tra 0 e 99')
  }

  // Update match status and scores
  const updatedMatch = await prisma.match.update({
    where: { id: matchId },
    data: {
      status: MatchStatus.FINISHED,
      homeScore,
      awayScore,
    },
  })

  // Initialize participation: mark all RSVP 'in' players as played
  // This is done after the match ends so admin can adjust later
  await initializeParticipation(matchId)

  return toMatchType(updatedMatch)
}
