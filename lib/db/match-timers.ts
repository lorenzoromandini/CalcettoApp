/**
 * Match Timer Database Operations
 * 
 * Provides CRUD operations for match timers with offline-first support.
 * Integrates with Supabase for server sync and IndexedDB for local caching.
 * 
 * @see RESEARCH.md Pattern 1 for timer state management
 */

import { getDB, DB_VERSION } from './index';
import { queueOfflineAction } from './actions';
import type { MatchTimer } from './schema';

// ============================================================================
// Supabase Client (Dynamic Import for SSR compatibility)
// ============================================================================

async function getSupabaseClient() {
  const { createClient } = await import('@/lib/supabase/client');
  return createClient();
}

// ============================================================================
// Match Timer CRUD Operations
// ============================================================================

/**
 * Get match timer from IndexedDB (offline-first access)
 * 
 * @param matchId - Match ID to get timer for
 * @returns MatchTimer or null if not found
 */
export async function getTimerFromIndexedDB(matchId: string): Promise<MatchTimer | null> {
  const db = await getDB();
  
  // Check if match_timers store exists (DB v4+)
  if (!db.objectStoreNames.contains('match_timers')) {
    console.log('[MatchTimerDB] match_timers store not available yet');
    return null;
  }
  
  try {
    const timer = await db.get('match_timers', matchId);
    return timer ?? null;
  } catch (error) {
    console.error('[MatchTimerDB] Error reading from IndexedDB:', error);
    return null;
  }
}

/**
 * Get match timer - tries server first, falls back to IndexedDB
 * 
 * @param matchId - Match ID to get timer for
 * @returns MatchTimer or null if not found
 */
export async function getMatchTimer(matchId: string): Promise<MatchTimer | null> {
  // Try IndexedDB first for immediate response
  const localTimer = await getTimerFromIndexedDB(matchId);
  
  try {
    // Try to fetch from Supabase
    const supabase = await getSupabaseClient();
    
    const { data, error } = await supabase
      .from('match_timers')
      .select('*')
      .eq('match_id', matchId)
      .single();

    if (!error && data) {
      // Convert server data to local format
      const timer: MatchTimer = {
        match_id: data.match_id,
        started_at: data.started_at,
        paused_at: data.paused_at,
        total_elapsed_seconds: data.total_elapsed_seconds ?? 0,
        is_running: data.is_running ?? false,
        updated_by: data.updated_by,
        updated_at: data.updated_at,
        sync_status: 'synced',
      };
      
      // Update local cache
      await saveTimerToIndexedDB(timer);
      
      return timer;
    }
  } catch (error) {
    console.log('[MatchTimerDB] Using cached timer for match:', matchId);
  }

  // Return local cache if server fails
  return localTimer;
}

/**
 * Start match timer
 * Creates new timer record or resets existing
 * 
 * @param matchId - Match ID to start timer for
 */
export async function startMatchTimer(matchId: string): Promise<void> {
  const now = new Date().toISOString();
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const timer: MatchTimer = {
    match_id: matchId,
    started_at: now,
    paused_at: null,
    total_elapsed_seconds: 0,
    is_running: true,
    updated_by: userId,
    updated_at: now,
    sync_status: 'pending',
  };

  try {
    // Try to sync with Supabase
    const supabase = await getSupabaseClient();
    
    const { error } = await supabase
      .from('match_timers')
      .upsert({
        match_id: matchId,
        started_at: now,
        paused_at: null,
        total_elapsed_seconds: 0,
        is_running: true,
        updated_by: userId,
        updated_at: now,
      }, {
        onConflict: 'match_id',
      });

    if (error) throw error;

    // Mark as synced
    timer.sync_status = 'synced';
    console.log('[MatchTimerDB] Timer started and synced for match:', matchId);
  } catch (error) {
    // Offline - queue for sync
    console.log('[MatchTimerDB] Starting timer offline for match:', matchId);
    
    await queueOfflineAction('create', 'match_timers', {
      match_id: matchId,
      started_at: now,
      paused_at: null,
      total_elapsed_seconds: 0,
      is_running: true,
      updated_by: userId,
      updated_at: now,
    });
  }

  // Save to IndexedDB
  await saveTimerToIndexedDB(timer);
}

/**
 * Pause match timer
 * Updates elapsed time and sets is_running to false
 * 
 * @param matchId - Match ID to pause timer for
 * @param elapsedSeconds - Current elapsed seconds to save
 */
export async function pauseMatchTimer(matchId: string, elapsedSeconds: number): Promise<void> {
  const now = new Date().toISOString();
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const timer: MatchTimer = {
    match_id: matchId,
    started_at: null,
    paused_at: now,
    total_elapsed_seconds: elapsedSeconds,
    is_running: false,
    updated_by: userId,
    updated_at: now,
    sync_status: 'pending',
  };

  try {
    // Try to sync with Supabase
    const supabase = await getSupabaseClient();
    
    const { error } = await supabase
      .from('match_timers')
      .upsert({
        match_id: matchId,
        started_at: null,
        paused_at: now,
        total_elapsed_seconds: elapsedSeconds,
        is_running: false,
        updated_by: userId,
        updated_at: now,
      }, {
        onConflict: 'match_id',
      });

    if (error) throw error;

    // Mark as synced
    timer.sync_status = 'synced';
    console.log('[MatchTimerDB] Timer paused and synced for match:', matchId, 'elapsed:', elapsedSeconds);
  } catch (error) {
    // Offline - queue for sync
    console.log('[MatchTimerDB] Pausing timer offline for match:', matchId);
    
    await queueOfflineAction('update', 'match_timers', {
      match_id: matchId,
      started_at: null,
      paused_at: now,
      total_elapsed_seconds: elapsedSeconds,
      is_running: false,
      updated_by: userId,
      updated_at: now,
    });
  }

  // Save to IndexedDB
  await saveTimerToIndexedDB(timer);
}

/**
 * Resume match timer
 * Sets started_at and is_running to true
 * 
 * @param matchId - Match ID to resume timer for
 * @param elapsedSeconds - Elapsed seconds before resuming (preserved)
 */
export async function resumeMatchTimer(matchId: string, elapsedSeconds: number): Promise<void> {
  const now = new Date().toISOString();
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const timer: MatchTimer = {
    match_id: matchId,
    started_at: now,
    paused_at: null,
    total_elapsed_seconds: elapsedSeconds,
    is_running: true,
    updated_by: userId,
    updated_at: now,
    sync_status: 'pending',
  };

  try {
    // Try to sync with Supabase
    const supabase = await getSupabaseClient();
    
    const { error } = await supabase
      .from('match_timers')
      .upsert({
        match_id: matchId,
        started_at: now,
        paused_at: null,
        total_elapsed_seconds: elapsedSeconds,
        is_running: true,
        updated_by: userId,
        updated_at: now,
      }, {
        onConflict: 'match_id',
      });

    if (error) throw error;

    // Mark as synced
    timer.sync_status = 'synced';
    console.log('[MatchTimerDB] Timer resumed and synced for match:', matchId, 'elapsed:', elapsedSeconds);
  } catch (error) {
    // Offline - queue for sync
    console.log('[MatchTimerDB] Resuming timer offline for match:', matchId);
    
    await queueOfflineAction('update', 'match_timers', {
      match_id: matchId,
      started_at: now,
      paused_at: null,
      total_elapsed_seconds: elapsedSeconds,
      is_running: true,
      updated_by: userId,
      updated_at: now,
    });
  }

  // Save to IndexedDB
  await saveTimerToIndexedDB(timer);
}

/**
 * Reset match timer
 * Clears timer state
 * 
 * @param matchId - Match ID to reset timer for
 */
export async function resetMatchTimer(matchId: string): Promise<void> {
  const now = new Date().toISOString();
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const timer: MatchTimer = {
    match_id: matchId,
    started_at: null,
    paused_at: null,
    total_elapsed_seconds: 0,
    is_running: false,
    updated_by: userId,
    updated_at: now,
    sync_status: 'pending',
  };

  try {
    // Try to sync with Supabase
    const supabase = await getSupabaseClient();
    
    const { error } = await supabase
      .from('match_timers')
      .upsert({
        match_id: matchId,
        started_at: null,
        paused_at: null,
        total_elapsed_seconds: 0,
        is_running: false,
        updated_by: userId,
        updated_at: now,
      }, {
        onConflict: 'match_id',
      });

    if (error) throw error;

    // Mark as synced
    timer.sync_status = 'synced';
    console.log('[MatchTimerDB] Timer reset and synced for match:', matchId);
  } catch (error) {
    // Offline - queue for sync
    console.log('[MatchTimerDB] Resetting timer offline for match:', matchId);
    
    await queueOfflineAction('update', 'match_timers', {
      match_id: matchId,
      started_at: null,
      paused_at: null,
      total_elapsed_seconds: 0,
      is_running: false,
      updated_by: userId,
      updated_at: now,
    });
  }

  // Save to IndexedDB
  await saveTimerToIndexedDB(timer);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Save timer to IndexedDB
 */
async function saveTimerToIndexedDB(timer: MatchTimer): Promise<void> {
  const db = await getDB();
  
  // Check if match_timers store exists
  if (!db.objectStoreNames.contains('match_timers')) {
    console.warn('[MatchTimerDB] match_timers store not available');
    return;
  }
  
  try {
    await db.put('match_timers', timer);
    console.log('[MatchTimerDB] Timer saved to IndexedDB:', timer.match_id);
  } catch (error) {
    console.error('[MatchTimerDB] Failed to save to IndexedDB:', error);
  }
}

/**
 * Get current user ID from session
 */
async function getCurrentUserId(): Promise<string | null> {
  try {
    // Dynamic import to avoid SSR issues
    const { getSession } = await import('next-auth/react');
    const session = await getSession();
    return session?.user?.id ?? null;
  } catch (error) {
    console.error('[MatchTimerDB] Failed to get user session:', error);
    return null;
  }
}

/**
 * Mark timer as synced (called after successful background sync)
 * 
 * @param matchId - Match ID to mark as synced
 */
export async function markTimerSynced(matchId: string): Promise<void> {
  const timer = await getTimerFromIndexedDB(matchId);
  
  if (timer) {
    timer.sync_status = 'synced';
    await saveTimerToIndexedDB(timer);
    console.log('[MatchTimerDB] Marked timer as synced:', matchId);
  }
}

/**
 * Delete timer from IndexedDB (cleanup)
 * 
 * @param matchId - Match ID to delete
 */
export async function deleteTimerFromIndexedDB(matchId: string): Promise<void> {
  const db = await getDB();
  
  if (!db.objectStoreNames.contains('match_timers')) {
    return;
  }
  
  try {
    await db.delete('match_timers', matchId);
    console.log('[MatchTimerDB] Timer deleted from IndexedDB:', matchId);
  } catch (error) {
    console.error('[MatchTimerDB] Failed to delete from IndexedDB:', error);
  }
}

export default {
  getMatchTimer,
  getTimerFromIndexedDB,
  startMatchTimer,
  pauseMatchTimer,
  resumeMatchTimer,
  resetMatchTimer,
  markTimerSynced,
  deleteTimerFromIndexedDB,
};
