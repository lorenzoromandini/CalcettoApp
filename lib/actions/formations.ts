'use server'

/**
 * Formation Server Actions
 * 
 * Mobile-optimized Server Actions for formation operations.
 */

import { auth } from '@/lib/auth'
import { 
  saveFormation as dbSaveFormation, 
  deleteFormation as dbDeleteFormation, 
  getMatchParticipants as dbGetMatchParticipants,
  saveMatchFormations as dbSaveMatchFormations,
  getClubMembersWithRolePriority as dbGetClubMembersWithRolePriority
} from '@/lib/db/formations'
import { getMatch } from '@/lib/db/matches'
import type { FormationData } from '@/lib/db/formations'
import type { SaveMatchFormationsPayload, ClubMemberWithRolePriority } from '@/types/formations'
import { revalidatePath } from 'next/cache'
import { isClubAdmin } from '@/lib/db/clubs'

// ============================================================================
// Error Messages (Italian)
// ============================================================================

const ERRORS = {
  UNAUTHORIZED: 'Devi essere autenticato per eseguire questa azione',
  NOT_ADMIN: 'Solo gli amministratori possono gestire le formazioni',
  MATCH_NOT_FOUND: 'Partita non trovata',
  INVALID_FORMATION: 'Dati formazione non validi',
}

// ============================================================================
// Save Formation (legacy - single team)
// ============================================================================

export async function saveFormationAction(matchId: string, data: FormationData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  const match = await getMatch(matchId)
  if (!match) {
    throw new Error(ERRORS.MATCH_NOT_FOUND)
  }

  // Check admin permission
  const isAdmin = await isClubAdmin(match.clubId, session.user.id)
  if (!isAdmin) {
    throw new Error(ERRORS.NOT_ADMIN)
  }

  try {
    await dbSaveFormation(matchId, data)
    
    revalidatePath(`/clubs/${match.clubId}/matches/${matchId}/formation`)
    revalidatePath(`/clubs/${match.clubId}/matches/${matchId}`)
    
    return { success: true }
  } catch (error) {
    console.error('[FormationAction] Save error:', error)
    throw new Error('Failed to save formation')
  }
}

// ============================================================================
// Save Match Formations (new - both teams)
// ============================================================================

export async function saveMatchFormationsAction(payload: SaveMatchFormationsPayload) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  const match = await getMatch(payload.matchId)
  if (!match) {
    throw new Error(ERRORS.MATCH_NOT_FOUND)
  }

  // Check admin permission
  const isAdmin = await isClubAdmin(match.clubId, session.user.id)
  if (!isAdmin) {
    throw new Error(ERRORS.NOT_ADMIN)
  }

  try {
    const result = await dbSaveMatchFormations(payload)
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to save formations')
    }
    
    // Revalidate paths
    revalidatePath(`/clubs/${match.clubId}/matches/${payload.matchId}/formation`)
    revalidatePath(`/clubs/${match.clubId}/matches/${payload.matchId}`)
    revalidatePath(`/clubs/${match.clubId}/matches`)
    
    return { 
      success: true, 
      team1FormationId: result.team1FormationId,
      team2FormationId: result.team2FormationId 
    }
  } catch (error) {
    console.error('[FormationAction] Save match formations error:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to save formations')
  }
}

// ============================================================================
// Get Club Members with Role Priority
// ============================================================================

export async function getClubMembersWithRolePriorityAction(
  clubId: string,
  targetRole?: string
): Promise<{ members: ClubMemberWithRolePriority[] }> {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  try {
    const members = await dbGetClubMembersWithRolePriority(clubId, targetRole)
    return { members }
  } catch (error) {
    console.error('[FormationAction] Get club members error:', error)
    throw new Error('Failed to fetch club members')
  }
}

// ============================================================================
// Delete Formation
// ============================================================================

export async function deleteFormationAction(matchId: string, isHome: boolean) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  const match = await getMatch(matchId)
  if (!match) {
    throw new Error(ERRORS.MATCH_NOT_FOUND)
  }

  // Check admin permission
  const isAdmin = await isClubAdmin(match.clubId, session.user.id)
  if (!isAdmin) {
    throw new Error(ERRORS.NOT_ADMIN)
  }

  try {
    await dbDeleteFormation(matchId, isHome)
    
    revalidatePath(`/clubs/${match.clubId}/matches/${matchId}/formation`)
    revalidatePath(`/clubs/${match.clubId}/matches/${matchId}`)
    
    return { success: true }
  } catch (error) {
    console.error('[FormationAction] Delete error:', error)
    throw new Error('Failed to delete formation')
  }
}

// ============================================================================
// Get Formation
// ============================================================================

import { getFormation as dbGetFormation, getMatchFormations as dbGetMatchFormations } from '@/lib/db/formations'

export async function getFormationAction(matchId: string, isHome: boolean = true) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  try {
    const formation = await dbGetFormation(matchId, isHome)
    return formation
  } catch (error) {
    console.error('[FormationAction] Get formation error:', error)
    throw new Error('Failed to get formation')
  }
}

// ============================================================================
// Get Match Formations
// ============================================================================

export async function getMatchFormationsAction(matchId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  try {
    const formations = await dbGetMatchFormations(matchId)
    return formations
  } catch (error) {
    console.error('[FormationAction] Get match formations error:', error)
    throw new Error('Failed to get match formations')
  }
}

// ============================================================================
// Get Match Participants
// ============================================================================

export async function getMatchParticipantsAction(matchId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  try {
    const participants = await dbGetMatchParticipants(matchId)
    return participants
  } catch (error) {
    console.error('[FormationAction] Get match participants error:', error)
    throw new Error('Failed to get match participants')
  }
}
