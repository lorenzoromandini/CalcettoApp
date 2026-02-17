/**
 * Database Layer for Calcetto Manager
 * 
 * Provides Prisma client for server-side database operations
 * and IndexedDB for client-side offline storage.
 * 
 * @see https://github.com/jakearchibald/idb for IndexedDB
 * @see https://www.prisma.io/docs for Prisma
 */

import { PrismaClient } from '@prisma/client';
import { openDB, type IDBPDatabase } from 'idb';
import type { CalcettoDB } from './schema';

// ============================================================================
// Prisma Client Singleton
// ============================================================================

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;

/**
 * Database name
 */
export const DB_NAME = 'calcetto-manager';

/**
 * Database version - increment when schema changes
 */
export const DB_VERSION = 4;

/**
 * Database instance cache
 */
let dbInstance: IDBPDatabase<CalcettoDB> | null = null;

/**
 * Initialize and get database connection
 * Creates object stores and indexes if needed (upgrade path)
 */
export async function getDB(): Promise<IDBPDatabase<CalcettoDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<CalcettoDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion) {
      console.log(`[IndexedDB] Upgrading from v${oldVersion} to v${newVersion}`);

      // Teams store
      if (!db.objectStoreNames.contains('teams')) {
        const teamsStore = db.createObjectStore('teams', { keyPath: 'id' });
        teamsStore.createIndex('by-sync-status', 'sync_status');
        teamsStore.createIndex('by-created-at', 'created_at');
        teamsStore.createIndex('by-created-by', 'created_by');
        console.log('[IndexedDB] Created teams store');
      }

      // Players store
      if (!db.objectStoreNames.contains('players')) {
        const playersStore = db.createObjectStore('players', { keyPath: 'id' });
        playersStore.createIndex('by-user-id', 'user_id');
        playersStore.createIndex('by-sync-status', 'sync_status');
        console.log('[IndexedDB] Created players store');
      }

      // Player teams store
      if (!db.objectStoreNames.contains('player_teams')) {
        const playerTeamsStore = db.createObjectStore('player_teams', { keyPath: 'id' });
        playerTeamsStore.createIndex('by-player-id', 'player_id');
        playerTeamsStore.createIndex('by-team-id', 'team_id');
        playerTeamsStore.createIndex('by-sync-status', 'sync_status');
        console.log('[IndexedDB] Created player_teams store');
      }

      // Team members store
      if (!db.objectStoreNames.contains('team_members')) {
        const teamMembersStore = db.createObjectStore('team_members', { keyPath: 'id' });
        teamMembersStore.createIndex('by-team-id', 'team_id');
        teamMembersStore.createIndex('by-user-id', 'user_id');
        teamMembersStore.createIndex('by-player-id', 'player_id');
        teamMembersStore.createIndex('by-sync-status', 'sync_status');
        console.log('[IndexedDB] Created team_members store');
      }

      // Team invites store
      if (!db.objectStoreNames.contains('team_invites')) {
        const teamInvitesStore = db.createObjectStore('team_invites', { keyPath: 'id' });
        teamInvitesStore.createIndex('by-team-id', 'team_id');
        teamInvitesStore.createIndex('by-token', 'token');
        console.log('[IndexedDB] Created team_invites store');
      }

      // Matches store
      if (!db.objectStoreNames.contains('matches')) {
        const matchesStore = db.createObjectStore('matches', { keyPath: 'id' });
        matchesStore.createIndex('by-team-id', 'team_id');
        matchesStore.createIndex('by-status', 'status');
        matchesStore.createIndex('by-sync-status', 'sync_status');
        console.log('[IndexedDB] Created matches store');
      }

      // v3: Add match management stores
      if (oldVersion < 3) {
        // Add match_players store
        if (!db.objectStoreNames.contains('match_players')) {
          const matchPlayersStore = db.createObjectStore('match_players', { keyPath: 'id' });
          matchPlayersStore.createIndex('by-match-id', 'match_id');
          matchPlayersStore.createIndex('by-player-id', 'player_id');
          matchPlayersStore.createIndex('by-sync-status', 'sync_status');
          console.log('[IndexedDB] Created match_players store');
        }

        // Add formations store
        if (!db.objectStoreNames.contains('formations')) {
          const formationsStore = db.createObjectStore('formations', { keyPath: 'id' });
          formationsStore.createIndex('by-match-id', 'match_id');
          console.log('[IndexedDB] Created formations store');
        }

        // Add formation_positions store
        if (!db.objectStoreNames.contains('formation_positions')) {
          const positionsStore = db.createObjectStore('formation_positions', { keyPath: 'id' });
          positionsStore.createIndex('by-formation-id', 'formation_id');
          console.log('[IndexedDB] Created formation_positions store');
        }

        console.log('[IndexedDB] Upgraded to v3 - added match management stores');
      }

      // v4: Add live match experience stores
      if (oldVersion < 4) {
        // Add match_events store
        if (!db.objectStoreNames.contains('match_events')) {
          const matchEventsStore = db.createObjectStore('match_events', { keyPath: 'id' });
          matchEventsStore.createIndex('by-match-id', 'match_id');
          matchEventsStore.createIndex('by-player-id', 'player_id');
          matchEventsStore.createIndex('by-event-type', 'event_type');
          matchEventsStore.createIndex('by-sync-status', 'sync_status');
          console.log('[IndexedDB] Created match_events store');
        }

        // Add match_timers store
        if (!db.objectStoreNames.contains('match_timers')) {
          db.createObjectStore('match_timers', { keyPath: 'match_id' });
          console.log('[IndexedDB] Created match_timers store');
        }

        console.log('[IndexedDB] Upgraded to v4 - added live match stores');
      }

      // Offline actions queue
      if (!db.objectStoreNames.contains('offline_actions')) {
        const actionsStore = db.createObjectStore('offline_actions', { keyPath: 'id' });
        actionsStore.createIndex('by-timestamp', 'timestamp');
        actionsStore.createIndex('by-table', 'table');
        console.log('[IndexedDB] Created offline_actions store');
      }
    },
    blocked() {
      console.warn('[IndexedDB] Database blocked - another tab has it open');
    },
    blocking() {
      console.warn('[IndexedDB] Database blocking - closing to allow upgrade');
      dbInstance?.close();
      dbInstance = null;
    },
  });

  return dbInstance;
}

/**
 * Close database connection
 * Useful for cleanup in tests or when resetting
 */
export function closeDB(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    console.log('[IndexedDB] Database connection closed');
  }
}

/**
 * Delete entire database
 * ⚠️ Destructive - use with caution
 */
export async function deleteDB(): Promise<void> {
  closeDB();
  const { deleteDB: idbDeleteDB } = await import('idb');
  await idbDeleteDB(DB_NAME);
  console.log(`[IndexedDB] Database '${DB_NAME}' deleted`);
}
