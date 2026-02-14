/**
 * IndexedDB CRUD Operations and Offline Queue
 * 
 * Provides data operations with automatic sync status tracking
 * and offline action queue management for background sync.
 * 
 * @see RESEARCH.md Pattern 2 for offline-first architecture
 */

import { getDB } from './index';
import type {
  Team,
  Player,
  Match,
  OfflineAction,
  OfflineActionType,
  OfflineTable,
  SyncStatus,
} from './schema';

// ============================================================================
// Offline Action Queue
// ============================================================================

/**
 * Queue an action for background sync
 * Called when mutation fails due to being offline
 */
export async function queueOfflineAction(
  type: OfflineActionType,
  table: OfflineTable,
  data: Record<string, unknown>
): Promise<OfflineAction> {
  const db = await getDB();
  
  const action: OfflineAction = {
    id: crypto.randomUUID(),
    type,
    table,
    data,
    timestamp: Date.now(),
    retry_count: 0,
  };

  await db.put('offline_actions', action);
  console.log(`[OfflineQueue] Queued ${type} on ${table}:`, action.id);
  
  // Trigger background sync if available
  await triggerBackgroundSync();
  
  return action;
}

/**
 * Get all pending offline actions sorted by timestamp
 */
export async function getPendingActions(): Promise<OfflineAction[]> {
  const db = await getDB();
  const actions = await db.getAllFromIndex('offline_actions', 'by-timestamp');
  return actions.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Get count of pending offline actions
 */
export async function getPendingActionCount(): Promise<number> {
  const db = await getDB();
  return db.count('offline_actions');
}

/**
 * Mark an action as synced (remove from queue)
 */
export async function markActionSynced(actionId: string): Promise<void> {
  const db = await getDB();
  await db.delete('offline_actions', actionId);
  console.log(`[OfflineQueue] Action synced and removed:`, actionId);
}

/**
 * Mark an action as failed (increment retry count)
 */
export async function markActionFailed(
  actionId: string,
  errorMessage: string
): Promise<void> {
  const db = await getDB();
  const action = await db.get('offline_actions', actionId);
  
  if (action) {
    action.retry_count += 1;
    action.error_message = errorMessage;
    await db.put('offline_actions', action);
    console.warn(`[OfflineQueue] Action failed (retry ${action.retry_count}):`, actionId, errorMessage);
  }
}

/**
 * Clear all offline actions
 * ⚠️ Use with caution - may lose unsynced data
 */
export async function clearOfflineActions(): Promise<void> {
  const db = await getDB();
  await db.clear('offline_actions');
  console.log('[OfflineQueue] All actions cleared');
}

// ============================================================================
// Team Operations
// ============================================================================

/**
 * Get all teams
 */
export async function getTeams(): Promise<Team[]> {
  const db = await getDB();
  return db.getAll('teams');
}

/**
 * Get teams by sync status
 */
export async function getTeamsBySyncStatus(status: SyncStatus): Promise<Team[]> {
  const db = await getDB();
  return db.getAllFromIndex('teams', 'by-sync-status', status);
}

/**
 * Get a single team by ID
 */
export async function getTeam(id: string): Promise<Team | undefined> {
  const db = await getDB();
  return db.get('teams', id);
}

/**
 * Save a team (create or update)
 * Sets sync_status to 'pending' for new local changes
 */
export async function saveTeam(
  team: Omit<Team, 'created_at' | 'updated_at' | 'sync_status'> & Partial<Pick<Team, 'sync_status'>>
): Promise<Team> {
  const db = await getDB();
  const now = new Date().toISOString();
  
  const existing = await db.get('teams', team.id);
  
  const fullTeam: Team = {
    ...team,
    created_at: existing?.created_at ?? now,
    updated_at: now,
    sync_status: team.sync_status ?? 'pending',
  };

  await db.put('teams', fullTeam);
  return fullTeam;
}

/**
 * Delete a team
 */
export async function deleteTeam(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('teams', id);
}

/**
 * Mark team as synced
 */
export async function markTeamSynced(id: string): Promise<void> {
  const db = await getDB();
  const team = await db.get('teams', id);
  if (team) {
    team.sync_status = 'synced';
    team.updated_at = new Date().toISOString();
    await db.put('teams', team);
  }
}

// ============================================================================
// Player Operations
// ============================================================================

/**
 * Get all players
 */
export async function getPlayers(): Promise<Player[]> {
  const db = await getDB();
  return db.getAll('players');
}

/**
 * Get players by team ID
 */
export async function getPlayersByTeam(teamId: string): Promise<Player[]> {
  const db = await getDB();
  return db.getAllFromIndex('players', 'by-team-id', teamId);
}

/**
 * Get a single player by ID
 */
export async function getPlayer(id: string): Promise<Player | undefined> {
  const db = await getDB();
  return db.get('players', id);
}

/**
 * Save a player (create or update)
 */
export async function savePlayer(
  player: Omit<Player, 'created_at' | 'updated_at' | 'sync_status'> & Partial<Pick<Player, 'sync_status'>>
): Promise<Player> {
  const db = await getDB();
  const now = new Date().toISOString();
  
  const existing = await db.get('players', player.id);
  
  const fullPlayer: Player = {
    ...player,
    created_at: existing?.created_at ?? now,
    updated_at: now,
    sync_status: player.sync_status ?? 'pending',
  };

  await db.put('players', fullPlayer);
  return fullPlayer;
}

/**
 * Delete a player
 */
export async function deletePlayer(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('players', id);
}

// ============================================================================
// Match Operations
// ============================================================================

/**
 * Get all matches
 */
export async function getMatches(): Promise<Match[]> {
  const db = await getDB();
  return db.getAll('matches');
}

/**
 * Get matches by team ID
 */
export async function getMatchesByTeam(teamId: string): Promise<Match[]> {
  const db = await getDB();
  return db.getAllFromIndex('matches', 'by-team-id', teamId);
}

/**
 * Get matches by status
 */
export async function getMatchesByStatus(status: Match['status']): Promise<Match[]> {
  const db = await getDB();
  return db.getAllFromIndex('matches', 'by-status', status);
}

/**
 * Get a single match by ID
 */
export async function getMatch(id: string): Promise<Match | undefined> {
  const db = await getDB();
  return db.get('matches', id);
}

/**
 * Save a match (create or update)
 */
export async function saveMatch(
  match: Omit<Match, 'created_at' | 'updated_at' | 'sync_status'> & Partial<Pick<Match, 'sync_status'>>
): Promise<Match> {
  const db = await getDB();
  const now = new Date().toISOString();
  
  const existing = await db.get('matches', match.id);
  
  const fullMatch: Match = {
    ...match,
    created_at: existing?.created_at ?? now,
    updated_at: now,
    sync_status: match.sync_status ?? 'pending',
  };

  await db.put('matches', fullMatch);
  return fullMatch;
}

/**
 * Delete a match
 */
export async function deleteMatch(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('matches', id);
}

// ============================================================================
// Background Sync Helper
// ============================================================================

/**
 * Trigger background sync for offline mutations
 * Uses Service Worker Background Sync API if available
 */
async function triggerBackgroundSync(): Promise<void> {
  if (!navigator.serviceWorker?.ready) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check for Background Sync API support
    if ('sync' in registration) {
      await (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register('offline-mutations');
      console.log('[BackgroundSync] Registered sync event');
    }
  } catch (error) {
    // Background sync not supported or failed - will retry on next online event
    console.warn('[BackgroundSync] Registration failed:', error);
  }
}
