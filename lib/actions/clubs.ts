'use server'

/**
 * Club Server Actions
 * 
 * Mobile-optimized Server Actions for club operations.
 * Provides mutations with automatic revalidation.
 */

import { getSession } from '@/lib/session'
import { createClub, updateClub as dbUpdateClub, deleteClub as dbDeleteClub, isTeamAdmin, isClubOwner, getClub } from '@/lib/db/clubs'
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
