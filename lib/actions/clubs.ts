'use server'

/**
 * Club Server Actions
 * 
 * Mobile-optimized Server Actions for club operations.
 * Provides mutations with automatic revalidation.
 */

import { getSession } from '@/lib/session'
import {
  createClub,
  updateClub as dbUpdateClub,
  deleteClub as dbDeleteClub,
  isTeamAdmin,
  isClubOwner,
  getClub,
  updateMemberPrivilege as dbUpdateMemberPrivilege,
  removeClubMember as dbRemoveClubMember
} from '@/lib/db/clubs'
import type { CreateClubInput, UpdateClubInput } from '@/lib/validations/club'
import { revalidatePath } from 'next/cache'

// ============================================================================
// Error Messages (Italian)
// ============================================================================

const ERRORS = {
  UNAUTHORIZED: 'Devi essere autenticato per eseguire questa azione',
  NOT_ADMIN: 'Solo gli amministratori possono eseguire questa azione',
  CLUB_NOT_FOUND: 'Squadra non trovata',
}

// ============================================================================
// Create Club
// ============================================================================

export async function createClubAction(data: CreateClubInput) {
  const session = await getSession()
  
  if (!session?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  console.log('[ClubAction] Creating club with data:', JSON.stringify(data, null, 2))
  console.log('[ClubAction] image_url present:', data.image_url ? 'YES' : 'NO')
  console.log('[ClubAction] image_url type:', typeof data.image_url)
  console.log('[ClubAction] image_url length:', data.image_url?.length || 0)
  console.log('[ClubAction] User ID:', session.id)

  try {
    console.log('[ClubAction] Calling createClub with session.id:', session.id)
    const clubId = await createClub(data, session.id)
    console.log('[ClubAction] Club created successfully:', clubId)
    
    // Revalidate club lists
    revalidatePath('/clubs')
    revalidatePath('/dashboard')
    
    return { success: true, id: clubId }
  } catch (error) {
    console.error('[ClubAction] Create error:', error)
    console.error('[ClubAction] Error stack:', error instanceof Error ? error.stack : 'No stack')
    console.error('[ClubAction] Error type:', typeof error)
    console.error('[ClubAction] Error message:', error instanceof Error ? error.message : 'Unknown error')
    throw error instanceof Error ? error : new Error('Failed to create club')
  }
}

// ============================================================================
// Update Club
// ============================================================================

export async function updateClubAction(clubId: string, data: UpdateClubInput) {
  const session = await getSession()
  
  if (!session?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  // Only OWNER can update club details
  const isOwner = await isClubOwner(clubId, session.id)
  if (!isOwner) {
    throw new Error('Solo il proprietario può modificare il club')
  }

  try {
    await dbUpdateClub(clubId, data)
    
    // Revalidate club data
    revalidatePath('/clubs')
    revalidatePath(`/clubs/${clubId}`)
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('[ClubAction] Update error:', error)
    throw new Error('Failed to update club')
  }
}

// ============================================================================
// Delete Club
// ============================================================================

export async function deleteClubAction(clubId: string) {
  const session = await getSession()
  
  if (!session?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  // Only OWNER can delete club
  const isOwner = await isClubOwner(clubId, session.id)
  if (!isOwner) {
    throw new Error('Solo il proprietario può eliminare il club')
  }

  try {
    await dbDeleteClub(clubId)
    
    // Revalidate club lists
    revalidatePath('/clubs')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('[ClubAction] Delete error:', error)
    throw new Error('Failed to delete club')
  }
}

// ============================================================================
// Check Club Admin Status
// ============================================================================

/**
 * Check if current user is admin of a club (OWNER or MANAGER)
 */
export async function checkIsClubAdminAction(clubId: string): Promise<boolean> {
  const session = await getSession()
  
  if (!session?.id) {
    return false
  }

  return isTeamAdmin(clubId, session.id)
}

/**
 * Check if current user is owner of a club
 */
export async function checkIsClubOwnerAction(clubId: string): Promise<boolean> {
  const session = await getSession()
  
  if (!session?.id) {
    return false
  }

  return isClubOwner(clubId, session.id)
}

// ============================================================================
// Member Management
// ============================================================================

/**
 * Update a member's privilege (ADMIN only)
 */
export async function updateMemberPrivilegeAction(
  clubId: string,
  memberId: string,
  privilege: 'MEMBER' | 'MANAGER' | 'OWNER'
) {
  const session = await getSession()
  
  if (!session?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  // Check admin status
  const isAdmin = await isTeamAdmin(clubId, session.id)
  if (!isAdmin) {
    throw new Error(ERRORS.NOT_ADMIN)
  }

  try {
    await dbUpdateMemberPrivilege(clubId, memberId, privilege)
    
    revalidatePath(`/clubs/${clubId}/roster`)
    revalidatePath(`/clubs/${clubId}`)
    
    return { success: true }
  } catch (error) {
    console.error('[ClubAction] Update privilege error:', error)
    throw new Error('Failed to update member privilege')
  }
}

/**
 * Remove a member from club (ADMIN only)
 */
export async function removeClubMemberAction(clubId: string, memberId: string) {
  const session = await getSession()
  
  if (!session?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  // Check admin status
  const isAdmin = await isTeamAdmin(clubId, session.id)
  if (!isAdmin) {
    throw new Error(ERRORS.NOT_ADMIN)
  }

  try {
    await dbRemoveClubMember(clubId, memberId)
    
    revalidatePath(`/clubs/${clubId}/roster`)
    revalidatePath(`/clubs/${clubId}`)
    revalidatePath('/clubs')
    
    return { success: true }
  } catch (error) {
    console.error('[ClubAction] Remove member error:', error)
    throw new Error('Failed to remove member')
  }
}
