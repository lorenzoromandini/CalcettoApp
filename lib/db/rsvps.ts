/**
 * RSVP Database Operations
 * 
 * Provides CRUD operations for match RSVPs with real-time support.
 * Integrates with Supabase Realtime for live updates and IndexedDB for offline storage.
 * 
 * @see RESEARCH.md Pattern 2 for offline-first architecture
 */

import { getDB } from './index';
import { queueOfflineAction } from './actions';
import type { MatchPlayer, RSVPStatus, SyncStatus } from './schema';
import type { Tables } from '@/types/database';

// ============================================================================
// Supabase Client (Dynamic Import for SSR compatibility)
// ============================================================================

async function getSupabaseClient() {
  const { createClient } = await import('@/lib/supabase/client');
  return createClient();
}

// ============================================================================
// Types
// ============================================================================

/**
 * RSVP counts aggregated by status
 */
export interface RSVPCounts {
  in: number;
  out: number;
  maybe: number;
  total: number;
}

/**
 * Match RSVP with player details
 */
export interface MatchRSVP {
  id: string;
  match_id: string;
  player_id: string;
  player_name: string;
  player_avatar?: string;
  rsvp_status: RSVPStatus;
  rsvp_at: string;
}

// ============================================================================
// Type Helpers
// ============================================================================

/**
 * Convert Supabase match_players joined with players to MatchRSVP
 */
function toMatchRSVP(row: {
  id: string;
  match_id: string;
  player_id: string;
  rsvp_status: RSVPStatus;
  rsvp_at: string;
  players: {
    name: string;
    avatar_url: string | null;
  };
}): MatchRSVP {
  return {
    id: row.id,
    match_id: row.match_id,
    player_id: row.player_id,
    player_name: row.players.name,
    player_avatar: row.players.avatar_url ?? undefined,
    rsvp_status: row.rsvp_status,
    rsvp_at: row.rsvp_at,
  };
}

/**
 * Convert Supabase match_players to IndexedDB MatchPlayer
 */
function toLocalMatchPlayer(dbMatchPlayer: Tables<'match_players'>): MatchPlayer {
  return {
    id: dbMatchPlayer.id,
    match_id: dbMatchPlayer.match_id,
    player_id: dbMatchPlayer.player_id,
    rsvp_status: dbMatchPlayer.rsvp_status as RSVPStatus,
    rsvp_at: dbMatchPlayer.rsvp_at ?? new Date().toISOString(),
    position_on_pitch: dbMatchPlayer.position_on_pitch ?? undefined,
    sync_status: 'synced',
  };
}

// ============================================================================
// RSVP Operations
// ============================================================================

/**
 * Update or create an RSVP for a player
 * Uses upsert to handle both new and existing RSVPs
 * 
 * @param matchId - Match ID
 * @param playerId - Player ID
 * @param status - RSVP status ('in' | 'out' | 'maybe')
 */
export async function updateRSVP(
  matchId: string,
  playerId: string,
  status: RSVPStatus
): Promise<void> {
  const now = new Date().toISOString();
  const rsvpId = crypto.randomUUID();

  // Build match player object for IndexedDB
  const matchPlayer: MatchPlayer = {
    id: rsvpId,
    match_id: matchId,
    player_id: playerId,
    rsvp_status: status,
    rsvp_at: now,
    sync_status: 'pending',
  };

  try {
    // Try to sync with Supabase first
    const supabase = await getSupabaseClient();
    
    // Check if online by attempting a lightweight operation
    const { error: connectionError } = await supabase.from('match_players').select('id').limit(1);
    
    if (!connectionError) {
      // Online - upsert to Supabase
      // First, try to find existing RSVP for this match/player
      const { data: existing, error: findError } = await supabase
        .from('match_players')
        .select('id')
        .eq('match_id', matchId)
        .eq('player_id', playerId)
        .single();

      if (findError && findError.code !== 'PGRST116') {
        throw findError;
      }

      if (existing) {
        // Update existing RSVP
        const { error } = await supabase
          .from('match_players')
          .update({
            rsvp_status: status,
            rsvp_at: now,
          })
          .eq('id', existing.id);

        if (error) throw error;
        matchPlayer.id = existing.id;
      } else {
        // Insert new RSVP
        const { error } = await supabase.from('match_players').insert({
          id: rsvpId,
          match_id: matchId,
          player_id: playerId,
          rsvp_status: status,
          rsvp_at: now,
        });

        if (error) throw error;
      }

      // Mark as synced in local cache
      matchPlayer.sync_status = 'synced';
      console.log('[RSVPDB] RSVP updated and synced:', matchId, playerId, status);
    } else {
      // Offline - queue for later sync
      throw new Error('Offline');
    }
  } catch (error) {
    // Offline or error - save locally and queue for sync
    console.log('[RSVPDB] Queuing RSVP update for sync:', matchId, playerId, status);
    
    await queueOfflineAction('create', 'match_players', {
      id: rsvpId,
      match_id: matchId,
      player_id: playerId,
      rsvp_status: status,
      rsvp_at: now,
    });
  }

  // Save to IndexedDB (works in both online and offline cases)
  const db = await getDB();
  
  // Check if there's an existing entry for this match/player
  const existingIndex = await db.getAllFromIndex('match_players', 'by-match-id', matchId);
  const existing = existingIndex.find(mp => mp.player_id === playerId);
  
  if (existing) {
    // Update existing
    existing.rsvp_status = status;
    existing.rsvp_at = now;
    existing.sync_status = matchPlayer.sync_status;
    await db.put('match_players', existing);
  } else {
    // Insert new
    await db.put('match_players', matchPlayer);
  }
}

/**
 * Get all RSVPs for a match with player details
 * 
 * @param matchId - Match ID to get RSVPs for
 * @returns Array of RSVPs with player details
 */
export async function getMatchRSVPs(matchId: string): Promise<MatchRSVP[]> {
  const db = await getDB();

  try {
    // Try to fetch from Supabase first with player join
    const supabase = await getSupabaseClient();
    
    const { data, error } = await supabase
      .from('match_players')
      .select(`
        id,
        match_id,
        player_id,
        rsvp_status,
        rsvp_at,
        players:player_id (
          name,
          avatar_url
        )
      `)
      .eq('match_id', matchId);

    if (!error && data) {
      // Update cache
      const rsvps: MatchRSVP[] = data.map((row: unknown) => toMatchRSVP(row as Parameters<typeof toMatchRSVP>[0]));
      
      // Update IndexedDB with fetched data
      for (const rsvp of data) {
        const localPlayer: MatchPlayer = {
          id: (rsvp as { id: string }).id,
          match_id: matchId,
          player_id: (rsvp as { player_id: string }).player_id,
          rsvp_status: (rsvp as { rsvp_status: RSVPStatus }).rsvp_status,
          rsvp_at: (rsvp as { rsvp_at: string }).rsvp_at ?? now,
          sync_status: 'synced',
        };
        await db.put('match_players', localPlayer);
      }

      // Sort by status priority: in > maybe > out, then by rsvp_at
      return rsvps.sort((a, b) => {
        const statusPriority = { in: 0, maybe: 1, out: 2 };
        if (statusPriority[a.rsvp_status] !== statusPriority[b.rsvp_status]) {
          return statusPriority[a.rsvp_status] - statusPriority[b.rsvp_status];
        }
        return new Date(a.rsvp_at).getTime() - new Date(b.rsvp_at).getTime();
      });
    }
  } catch (error) {
    console.log('[RSVPDB] Using cached RSVPs for match:', matchId);
  }

  // Fallback: Get from IndexedDB
  const matchPlayers = await db.getAllFromIndex('match_players', 'by-match-id', matchId);
  
  // Get player details
  const rsvps: MatchRSVP[] = [];
  for (const mp of matchPlayers) {
    const player = await db.get('players', mp.player_id);
    if (player) {
      rsvps.push({
        id: mp.id,
        match_id: mp.match_id,
        player_id: mp.player_id,
        player_name: player.name,
        player_avatar: player.avatar_url,
        rsvp_status: mp.rsvp_status,
        rsvp_at: mp.rsvp_at,
      });
    }
  }

  // Sort: IN first, then Maybe, then OUT
  return rsvps.sort((a, b) => {
    const statusPriority = { in: 0, maybe: 1, out: 2 };
    if (statusPriority[a.rsvp_status] !== statusPriority[b.rsvp_status]) {
      return statusPriority[a.rsvp_status] - statusPriority[b.rsvp_status];
    }
    return new Date(a.rsvp_at).getTime() - new Date(b.rsvp_at).getTime();
  });
}

const now = new Date().toISOString();

/**
 * Get RSVP counts for a match
 * 
 * @param matchId - Match ID
 * @returns Counts for each status and total
 */
export async function getRSVPCounts(matchId: string): Promise<RSVPCounts> {
  try {
    // Try Supabase first for efficient aggregation
    const supabase = await getSupabaseClient();
    
    const { data, error } = await supabase
      .from('match_players')
      .select('rsvp_status')
      .eq('match_id', matchId);

    if (!error && data) {
      const counts = {
        in: 0,
        out: 0,
        maybe: 0,
        total: data.length,
      };
      
      for (const row of data) {
        const status = (row as { rsvp_status: RSVPStatus }).rsvp_status;
        if (status === 'in') counts.in++;
        else if (status === 'out') counts.out++;
        else if (status === 'maybe') counts.maybe++;
      }
      
      return counts;
    }
  } catch (error) {
    console.log('[RSVPDB] Using cached counts for match:', matchId);
  }

  // Fallback: Calculate from IndexedDB
  const db = await getDB();
  const matchPlayers = await db.getAllFromIndex('match_players', 'by-match-id', matchId);
  
  return matchPlayers.reduce(
    (acc, mp) => {
      acc.total++;
      if (mp.rsvp_status === 'in') acc.in++;
      else if (mp.rsvp_status === 'out') acc.out++;
      else if (mp.rsvp_status === 'maybe') acc.maybe++;
      return acc;
    },
    { in: 0, out: 0, maybe: 0, total: 0 }
  );
}

/**
 * Get current user's RSVP for a match
 * 
 * @param matchId - Match ID
 * @param playerId - Player ID
 * @returns RSVP status or null if not responded
 */
export async function getMyRSVP(
  matchId: string,
  playerId: string
): Promise<RSVPStatus | null> {
  const db = await getDB();

  try {
    // Try Supabase first
    const supabase = await getSupabaseClient();
    
    const { data, error } = await supabase
      .from('match_players')
      .select('rsvp_status')
      .eq('match_id', matchId)
      .eq('player_id', playerId)
      .single();

    if (!error && data) {
      return (data as { rsvp_status: RSVPStatus }).rsvp_status;
    }
  } catch (error) {
    console.log('[RSVPDB] Using cached RSVP status');
  }

  // Fallback: Check IndexedDB
  const matchPlayers = await db.getAllFromIndex('match_players', 'by-match-id', matchId);
  const myRSVP = matchPlayers.find(mp => mp.player_id === playerId);
  
  return myRSVP?.rsvp_status ?? null;
}

// ============================================================================
// Real-time Subscription
// ============================================================================

/**
 * Subscribe to RSVP changes for a match
 * Uses Supabase Realtime for live updates
 * 
 * @param matchId - Match ID to subscribe to
 * @param onUpdate - Callback function when RSVPs change
 * @returns Unsubscribe function
 */
export function subscribeToRSVPs(
  matchId: string,
  onUpdate: (rsvps: MatchRSVP[]) => void
): () => void {
  let channel: ReturnType<ReturnType<typeof import('@/lib/supabase/client').createClient>['channel']> | null = null;
  let isActive = true;

  async function setupSubscription() {
    try {
      const supabase = await getSupabaseClient();
      
      channel = supabase
        .channel(`match_rsvps:${matchId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'match_players',
            filter: `match_id=eq.${matchId}`,
          },
          async () => {
            // Fetch updated RSVPs when any change occurs
            if (isActive) {
              try {
                const rsvps = await getMatchRSVPs(matchId);
                if (isActive) {
                  onUpdate(rsvps);
                }
              } catch (error) {
                console.error('[RSVPDB] Error fetching updated RSVPs:', error);
              }
            }
          }
        )
        .subscribe((status) => {
          console.log('[RSVPDB] Realtime subscription status:', status);
        });
    } catch (error) {
      console.error('[RSVPDB] Error setting up realtime subscription:', error);
    }
  }

  setupSubscription();

  // Return unsubscribe function
  return () => {
    isActive = false;
    if (channel) {
      channel.unsubscribe();
    }
  };
}

// ============================================================================
// Sync Status Helpers
// ============================================================================

/**
 * Mark a match player as synced (called after successful background sync)
 * 
 * @param matchPlayerId - Match player ID to mark as synced
 */
export async function markMatchPlayerSynced(matchPlayerId: string): Promise<void> {
  const db = await getDB();
  const matchPlayer = await db.get('match_players', matchPlayerId);
  
  if (matchPlayer) {
    matchPlayer.sync_status = 'synced' as SyncStatus;
    await db.put('match_players', matchPlayer);
    console.log('[RSVPDB] Marked match player as synced:', matchPlayerId);
  }
}

/**
 * Get match players by sync status (for sync UI)
 * 
 * @param status - Sync status to filter by
 * @returns Array of match players with the given sync status
 */
export async function getMatchPlayersBySyncStatus(status: SyncStatus): Promise<MatchPlayer[]> {
  const db = await getDB();
  return db.getAllFromIndex('match_players', 'by-sync-status', status);
}
