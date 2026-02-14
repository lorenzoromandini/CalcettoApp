/**
 * IndexedDB Database Initialization
 * 
 * Provides database connection and upgrade logic for Calcetto Manager.
 * Uses idb library for promise-based IndexedDB API.
 * 
 * @see https://github.com/jakearchibald/idb
 */

import { openDB, type IDBPDatabase } from 'idb';
import type { CalcettoDB } from './schema';

/**
 * Database name
 */
export const DB_NAME = 'calcetto-manager';

/**
 * Database version - increment when schema changes
 */
export const DB_VERSION = 1;

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
        console.log('[IndexedDB] Created teams store');
      }

      // Players store
      if (!db.objectStoreNames.contains('players')) {
        const playersStore = db.createObjectStore('players', { keyPath: 'id' });
        playersStore.createIndex('by-team-id', 'team_id');
        playersStore.createIndex('by-sync-status', 'sync_status');
        console.log('[IndexedDB] Created players store');
      }

      // Matches store
      if (!db.objectStoreNames.contains('matches')) {
        const matchesStore = db.createObjectStore('matches', { keyPath: 'id' });
        matchesStore.createIndex('by-team-id', 'team_id');
        matchesStore.createIndex('by-status', 'status');
        matchesStore.createIndex('by-sync-status', 'sync_status');
        console.log('[IndexedDB] Created matches store');
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
