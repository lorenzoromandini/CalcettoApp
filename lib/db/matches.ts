/**
 * Match Database Operations
 * 
 * Provides CRUD operations for matches with offline-first support.
 * Integrates with Supabase for server sync and IndexedDB for local caching.
 * 
 * @see RESEARCH.md Pattern 2 for offline-first architecture
 */

import { getDB } from './index';
import { queueOfflineAction } from './actions';
import type { Match, SyncStatus } from './schema';
import type { CreateMatchInput, UpdateMatchInput } from '@/lib/validations/match';
import type { Tables } from '@/types/database';

// ============================================================================
// Supabase Client (Dynamic Import for SSR compatibility)
// ============================================================================

async function getSupabaseClient() {
  const { createClient } = await import('@/lib/supabase/client');
  return createClient();
}

// ============================================================================
// Type Helpers
// ============================================================================

/**
 * Convert Supabase Match type to IndexedDB Match type
 */
function toLocalMatch(dbMatch: Tables<'matches'>): Match {
  return {
    id: dbMatch.id,
    team_id: dbMatch.team_id,
    scheduled_at: dbMatch.scheduled_at,
    location: dbMatch.location ?? undefined,
    mode: dbMatch.mode as Match['mode'],
    status: dbMatch.status as Match['status'],
    home_score: dbMatch.home_score ?? undefined,
    away_score: dbMatch.away_score ?? undefined,
    notes: dbMatch.notes ?? undefined,
    created_by: dbMatch.created_by,
    created_at: dbMatch.created_at,
    updated_at: dbMatch.updated_at,
    sync_status: 'synced',
  };
}

// ============================================================================
// Match CRUD Operations
// ============================================================================

/**
 * Create a new match
 * 
 * @param data - Match creation data (scheduled_at, location, mode, notes)
 * @param teamId - ID of the team the match belongs to
 * @param userId - ID of the user creating the match
 * @returns The created match ID
 */
export async function createMatch(
  data: CreateMatchInput,
  teamId: string,
  userId: string
): Promise<string> {
  const matchId = crypto.randomUUID();
  const now = new Date().toISOString();

  // Build match object for IndexedDB
  const match: Match = {
    id: matchId,
    team_id: teamId,
    scheduled_at: data.scheduled_at,
    location: data.location,
    mode: data.mode,
    status: 'scheduled',
    notes: data.notes,
    created_by: userId,
    created_at: now,
    updated_at: now,
    sync_status: 'pending',
  };

  try {
    // Try to sync with Supabase first
    const supabase = await getSupabaseClient();
    
    // Check if online by attempting a lightweight operation
    const { error: connectionError } = await supabase.from('matches').select('id').limit(1);
    
    if (!connectionError) {
      // Online - insert to Supabase
      const { error: matchError } = await supabase.from('matches').insert({
        id: matchId,
        team_id: teamId,
        scheduled_at: data.scheduled_at,
        location: data.location ?? null,
        mode: data.mode,
        status: 'scheduled',
        notes: data.notes ?? null,
        created_by: userId,
        created_at: now,
        updated_at: now,
      });

      if (matchError) throw matchError;

      // Mark as synced in local cache
      match.sync_status = 'synced';
      
      console.log('[MatchDB] Match created and synced:', matchId);
    } else {
      // Offline - queue for later sync
      throw new Error('Offline');
    }
  } catch (error) {
    // Offline or error - save locally and queue for sync
    console.log('[MatchDB] Creating match offline:', matchId);
    
    // Queue offline action for match creation
    await queueOfflineAction('create', 'matches', {
      id: matchId,
      team_id: teamId,
      scheduled_at: data.scheduled_at,
      location: data.location ?? null,
      mode: data.mode,
      status: 'scheduled',
      notes: data.notes ?? null,
      created_by: userId,
      created_at: now,
      updated_at: now,
    });
  }

  // Save to IndexedDB (works in both online and offline cases)
  const db = await getDB();
  await db.put('matches', match);

  return matchId;
}

/**
 * Get all matches for a team
 * 
 * @param teamId - Team ID to get matches for
 * @returns Array of matches
 */
export async function getTeamMatches(teamId: string): Promise<Match[]> {
  const db = await getDB();

  try {
    // Try to fetch from Supabase first
    const supabase = await getSupabaseClient();
    
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('team_id', teamId)
      .order('scheduled_at', { ascending: false });

    if (!error && data) {
      // Update cache
      const matches: Match[] = data.map(toLocalMatch);
      for (const match of matches) {
        await db.put('matches', match);
      }
      return matches;
    }
  } catch (error) {
    console.log('[MatchDB] Using cached matches for team:', teamId);
  }

  // Fallback: Get from IndexedDB
  const matches = await db.getAllFromIndex('matches', 'by-team-id', teamId);
  
  return matches.sort((a, b) => 
    new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
  );
}

/**
 * Get a single match by ID
 * 
 * @param matchId - Match ID to fetch
 * @returns Match object or null if not found
 */
export async function getMatch(matchId: string): Promise<Match | null> {
  const db = await getDB();

  try {
    // Try Supabase first
    const supabase = await getSupabaseClient();
    
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (!error && data) {
      // Update cache
      const match = toLocalMatch(data);
      await db.put('matches', match);
      return match;
    }
  } catch (error) {
    console.log('[MatchDB] Using cached match:', matchId);
  }

  // Fallback: Get from IndexedDB
  const match = await db.get('matches', matchId);
  
  return match ?? null;
}

/**
 * Get upcoming matches for a team
 * Matches where scheduled_at >= NOW() AND status = 'scheduled'
 * 
 * @param teamId - Team ID to get matches for
 * @returns Array of upcoming matches, ordered by scheduled_at ASC
 */
export async function getUpcomingMatches(teamId: string): Promise<Match[]> {
  const matches = await getTeamMatches(teamId);
  const now = new Date().toISOString();
  
  return matches
    .filter(m => m.scheduled_at >= now && m.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
}

/**
 * Get past matches for a team
 * Matches where scheduled_at < NOW() OR status IN ('completed', 'cancelled')
 * 
 * @param teamId - Team ID to get matches for
 * @returns Array of past matches, ordered by scheduled_at DESC
 */
export async function getPastMatches(teamId: string): Promise<Match[]> {
  const matches = await getTeamMatches(teamId);
  const now = new Date().toISOString();
  
  return matches
    .filter(m => m.scheduled_at < now || m.status === 'completed' || m.status === 'cancelled')
    .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
}

/**
 * Update a match
 * Can only update if status = 'scheduled'
 * 
 * @param matchId - Match ID to update
 * @param data - Update data (partial match fields)
 */
export async function updateMatch(
  matchId: string,
  data: UpdateMatchInput
): Promise<void> {
  const db = await getDB();
  const now = new Date().toISOString();

  // Check if match exists and can be updated
  const existing = await db.get('matches', matchId);
  if (!existing) {
    throw new Error('Match not found');
  }
  
  if (existing.status !== 'scheduled') {
    throw new Error('Cannot update match that has already started or been cancelled');
  }

  try {
    // Try to update in Supabase first
    const supabase = await getSupabaseClient();
    
    const { error } = await supabase
      .from('matches')
      .update({
        ...data,
        updated_at: now,
      })
      .eq('id', matchId)
      .eq('status', 'scheduled'); // Only update if still scheduled

    if (error) throw error;

    console.log('[MatchDB] Match updated in Supabase:', matchId);
  } catch (error) {
    // Offline - queue for sync
    console.log('[MatchDB] Queueing match update for sync:', matchId);
    
    await queueOfflineAction('update', 'matches', {
      id: matchId,
      ...data,
      updated_at: now,
    });
  }

  // Update local cache
  const updated: Match = {
    ...existing,
    ...data,
    updated_at: now,
    sync_status: 'pending',
  };
  await db.put('matches', updated);
}

/**
 * Cancel a match (set status to 'cancelled')
 * Can only cancel if status = 'scheduled'
 * 
 * @param matchId - Match ID to cancel
 */
export async function cancelMatch(matchId: string): Promise<void> {
  const db = await getDB();
  const now = new Date().toISOString();

  // Check if match exists and can be cancelled
  const existing = await db.get('matches', matchId);
  if (!existing) {
    throw new Error('Match not found');
  }
  
  if (existing.status !== 'scheduled') {
    throw new Error('Cannot cancel match that has already started or been cancelled');
  }

  try {
    // Try to update in Supabase first
    const supabase = await getSupabaseClient();
    
    const { error } = await supabase
      .from('matches')
      .update({
        status: 'cancelled',
        updated_at: now,
      })
      .eq('id', matchId)
      .eq('status', 'scheduled');

    if (error) throw error;

    console.log('[MatchDB] Match cancelled in Supabase:', matchId);
  } catch (error) {
    // Offline - queue for sync
    console.log('[MatchDB] Queueing match cancellation for sync:', matchId);
    
    await queueOfflineAction('update', 'matches', {
      id: matchId,
      status: 'cancelled',
      updated_at: now,
    });
  }

  // Update local cache
  existing.status = 'cancelled';
  existing.updated_at = now;
  existing.sync_status = 'pending';
  await db.put('matches', existing);
}

/**
 * Uncancel a match (set status back to 'scheduled')
 * 
 * @param matchId - Match ID to uncancel
 */
export async function uncancelMatch(matchId: string): Promise<void> {
  const db = await getDB();
  const now = new Date().toISOString();

  // Check if match exists
  const existing = await db.get('matches', matchId);
  if (!existing) {
    throw new Error('Match not found');
  }
  
  if (existing.status !== 'cancelled') {
    throw new Error('Cannot uncancel match that is not cancelled');
  }

  try {
    // Try to update in Supabase first
    const supabase = await getSupabaseClient();
    
    const { error } = await supabase
      .from('matches')
      .update({
        status: 'scheduled',
        updated_at: now,
      })
      .eq('id', matchId);

    if (error) throw error;

    console.log('[MatchDB] Match uncancelled in Supabase:', matchId);
  } catch (error) {
    // Offline - queue for sync
    console.log('[MatchDB] Queueing match uncancellation for sync:', matchId);
    
    await queueOfflineAction('update', 'matches', {
      id: matchId,
      status: 'scheduled',
      updated_at: now,
    });
  }

  // Update local cache
  existing.status = 'scheduled';
  existing.updated_at = now;
  existing.sync_status = 'pending';
  await db.put('matches', existing);
}

// ============================================================================
// Sync Status Helpers
// ============================================================================

/**
 * Mark a match as synced (called after successful background sync)
 * 
 * @param matchId - Match ID to mark as synced
 */
export async function markMatchSynced(matchId: string): Promise<void> {
  const db = await getDB();
  const match = await db.get('matches', matchId);
  
  if (match) {
    match.sync_status = 'synced' as SyncStatus;
    match.updated_at = new Date().toISOString();
    await db.put('matches', match);
    console.log('[MatchDB] Marked match as synced:', matchId);
  }
}

/**
 * Get matches by sync status (for sync UI)
 * 
 * @param status - Sync status to filter by
 * @returns Array of matches with the given sync status
 */
export async function getMatchesBySyncStatus(status: SyncStatus): Promise<Match[]> {
  const db = await getDB();
  return db.getAllFromIndex('matches', 'by-sync-status', status);
}

// ============================================================================
// Admin Check Helper
// ============================================================================

/**
 * Check if a user is an admin of the team that owns a match
 * 
 * @param matchId - Match ID to check
 * @param userId - User ID to check
 * @returns true if user is admin of the match's team
 */
export async function isMatchAdmin(matchId: string, userId: string): Promise<boolean> {
  const db = await getDB();

  // Get the match
  const match = await db.get('matches', matchId);
  if (!match) return false;

  // Check team membership in team_members
  try {
    const supabase = await getSupabaseClient();
    
    const { data, error } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', match.team_id)
      .eq('user_id', userId)
      .single();

    if (!error && data) {
      return data.role === 'admin';
    }
  } catch (error) {
    console.log('[MatchDB] Using cached membership data');
  }

  // Fallback: Check IndexedDB
  const memberships = await db.getAllFromIndex('team_members', 'by-team-id', match.team_id);
  const membership = memberships.find(m => m.user_id === userId);
  
  return membership?.role === 'admin';
}
