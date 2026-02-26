'use server'

/**
 * Club Server Actions
 * 
 * Mobile-optimized Server Actions for club operations.
 * Provides mutations with automatic revalidation.
 */

import { auth } from '@/lib/auth'
import { createClub, updateClub as dbUpdateClub, deleteClub as dbDeleteClub, isTeamAdmin, getClub } from '@/lib/db/clubs'
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
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  try {
    const clubId = await createClub(data, session.user.id)
    
    // Revalidate club lists
    revalidatePath('/clubs')
    revalidatePath('/dashboard')
    
    return { success: true, id: clubId }
  } catch (error) {
    console.error('[ClubAction] Create error:', error)
    throw new Error('Failed to create club')
  }
}

// ============================================================================
// Update Club
// ============================================================================

export async function updateClubAction(clubId: string, data: UpdateClubInput) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  // Check admin permission
  const isAdmin = await isTeamAdmin(clubId, session.user.id)
  if (!isAdmin) {
    throw new Error(ERRORS.NOT_ADMIN)
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
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(ERRORS.UNAUTHORIZED)
  }

  // Check admin permission
  const isAdmin = await isTeamAdmin(clubId, session.user.id)
  if (!isAdmin) {
    throw new Error(ERRORS.NOT_ADMIN)
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
