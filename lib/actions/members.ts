'use server'

/**
 * Member Management Server Actions
 * 
 * Mobile-optimized Server Actions for club member operations.
 */

import { auth } from '@/lib/auth'
import { 
  updateClubMember as dbUpdateClubMember,
  removeClubMember as dbRemoveClubMember
} from '@/lib/db/clubs'
import { isTeamAdmin } from '@/lib/db/clubs'
import type { ClubMember, PlayerRole } from '@/types/database'
import { revalidatePath } from 'next/cache'

// ============================================================================
// Error Messages (Italian)
// ============================================================================

const ERRORS = {
  UNAUTHORIZED: 'Devi essere autenticato per eseguire questa azione',
  NOT_ADMIN: 'Solo gli amministratori possono gestire i membri',
}

// ============================================================================
// Update Member
// ============================================================================

export async function updateMemberAction(
  clubId: string,
  memberId: string,
  data: Partial<ClubMember>
) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  const isAdmin = await isTeamAdmin(clubId, session.user.id)
  if (!isAdmin) {
    throw new Error(ERRORS.NOT_ADMIN)
  }

  try {
    await dbUpdateClubMember(clubId, memberId, {
      jerseyNumber: data.jerseyNumber,
      primaryRole: data.primaryRole,
      secondaryRoles: data.secondaryRoles,
    })
    
    revalidatePath(`/clubs/${clubId}/members`)
    revalidatePath(`/clubs/${clubId}/roster`)
    revalidatePath(`/clubs/${clubId}`)
    
    return { success: true }
  } catch (error) {
    console.error('[MemberAction] Update error:', error)
    throw new Error('Failed to update member')
  }
}

// ============================================================================
// Remove Member
// ============================================================================

export async function removeMemberAction(clubId: string, memberId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  const isAdmin = await isTeamAdmin(clubId, session.user.id)
  if (!isAdmin) {
    throw new Error(ERRORS.NOT_ADMIN)
  }

  try {
    await dbRemoveClubMember(clubId, memberId)
    
    revalidatePath(`/clubs/${clubId}/members`)
    revalidatePath(`/clubs/${clubId}/roster`)
    revalidatePath(`/clubs/${clubId}`)
    
    return { success: true }
  } catch (error) {
    console.error('[MemberAction] Remove error:', error)
    throw new Error('Failed to remove member')
  }
}
