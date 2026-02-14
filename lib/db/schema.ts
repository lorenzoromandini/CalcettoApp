/**
 * IndexedDB Schema for Calcetto Manager
 * 
 * Provides TypeScript type definitions for offline-first data storage.
 * All entities include sync_status for tracking local vs server state.
 * 
 * @see RESEARCH.md Pattern 2 for offline-first architecture
 */

import type { DBSchema } from 'idb';

/**
 * Sync status for tracking entity state
 * - 'synced': Data is synchronized with server
 * - 'pending': Local changes waiting to sync
 * - 'error': Sync failed, needs retry
 */
export type SyncStatus = 'synced' | 'pending' | 'error';

/**
 * Team entity - a group of players
 */
export interface Team {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  sync_status: SyncStatus;
}

/**
 * Player role within a team
 */
export type PlayerRole = 'goalkeeper' | 'defender' | 'midfielder' | 'forward' | 'flexible';

/**
 * Player entity - member of a team
 */
export interface Player {
  id: string;
  team_id: string;
  name: string;
  surname: string;
  nickname?: string;
  jersey_number?: number;
  avatar_url?: string;
  roles: PlayerRole[];
  created_at: string;
  updated_at: string;
  sync_status: SyncStatus;
}

/**
 * Match status
 */
export type MatchStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

/**
 * Match mode/formation
 */
export type MatchMode = '5vs5' | '6vs6' | '7vs7' | '8vs8' | '11vs11';

/**
 * Match entity - a football game
 */
export interface Match {
  id: string;
  team_id: string;
  date: string;
  location?: string;
  mode: MatchMode;
  status: MatchStatus;
  home_score?: number;
  away_score?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  sync_status: SyncStatus;
}

/**
 * Action type for offline queue
 */
export type OfflineActionType = 'create' | 'update' | 'delete';

/**
 * Table names that support offline actions
 */
export type OfflineTable = 'teams' | 'players' | 'matches';

/**
 * Offline action - queued mutation to sync later
 */
export interface OfflineAction {
  id: string;
  type: OfflineActionType;
  table: OfflineTable;
  data: Record<string, unknown>;
  timestamp: number;
  retry_count: number;
  error_message?: string;
}

/**
 * IndexedDB schema definition for type safety
 * Uses idb library's DBSchema interface
 */
export interface CalcettoDB extends DBSchema {
  teams: {
    key: string;
    value: Team;
    indexes: {
      'by-sync-status': string;
      'by-created-at': string;
    };
  };
  players: {
    key: string;
    value: Player;
    indexes: {
      'by-team-id': string;
      'by-sync-status': string;
    };
  };
  matches: {
    key: string;
    value: Match;
    indexes: {
      'by-team-id': string;
      'by-status': string;
      'by-sync-status': string;
    };
  };
  offline_actions: {
    key: string;
    value: OfflineAction;
    indexes: {
      'by-timestamp': number;
      'by-table': string;
    };
  };
}
