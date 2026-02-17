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
 * Team mode/formation type
 */
export type TeamMode = '5-a-side' | '8-a-side' | '11-a-side';

/**
 * Team entity - a group of players
 */
export interface Team {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  team_mode: TeamMode;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  sync_status: SyncStatus;
}

/**
 * Player role/position
 */
export type PlayerRole = 'goalkeeper' | 'defender' | 'midfielder' | 'attacker';

/**
 * Player entity - team-agnostic player profile
 */
export interface Player {
  id: string;
  name: string;
  surname?: string;
  nickname?: string;
  avatar_url?: string;
  user_id?: string; // Link to auth user if registered
  roles: PlayerRole[];
  created_at: string;
  updated_at: string;
  sync_status: SyncStatus;
}

/**
 * Team role for members
 */
export type TeamRole = 'admin' | 'co-admin' | 'member';

/**
 * Team member junction entity
 */
export interface TeamMember {
  id: string;
  team_id: string;
  user_id?: string; // For registered users
  player_id?: string; // For non-registered players
  role: TeamRole;
  joined_at: string;
  sync_status: SyncStatus;
}

/**
 * Player-Team junction entity - supports players in multiple teams
 */
export interface PlayerTeam {
  id: string;
  player_id: string;
  team_id: string;
  jersey_number: number;
  joined_at: string;
  created_at: string;
  sync_status: SyncStatus;
}

/**
 * Team invite entity
 */
export interface TeamInvite {
  id: string;
  team_id: string;
  created_by: string;
  token: string;
  email?: string;
  expires_at: string;
  used_at?: string;
  used_by?: string;
  max_uses: number;
  use_count: number;
  created_at: string;
}

/**
 * RSVP status for match availability
 */
export type RSVPStatus = 'in' | 'out' | 'maybe';

/**
 * Match status
 * Aligned with Prisma MatchStatus enum
 */
export type MatchStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED' | 'COMPLETED' | 'CANCELLED';

/**
 * Match mode/formation
 */
export type MatchMode = '5vs5' | '8vs8';

/**
 * Match entity - a football game
 */
export interface Match {
  id: string;
  team_id: string;
  scheduled_at: string; // ISO datetime
  location?: string;
  mode: MatchMode;
  status: MatchStatus;
  home_score?: number;
  away_score?: number;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  sync_status: SyncStatus;
}

/**
 * Match player junction entity - RSVP tracking
 */
export interface MatchPlayer {
  id: string;
  match_id: string;
  player_id: string;
  rsvp_status: RSVPStatus;
  rsvp_at: string;
  position_on_pitch?: string;
  sync_status: SyncStatus;
}

/**
 * Formation entity - formation template per match
 */
export interface Formation {
  id: string;
  match_id: string;
  team_formation: {
    formation: string;
    positions: Array<{
      x: number;
      y: number;
      label: string;
    }>;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Formation position entity - player assignments on pitch
 */
export interface FormationPosition {
  id: string;
  formation_id: string;
  player_id?: string;
  position_x: number;
  position_y: number;
  position_label: string;
  is_substitute: boolean;
}

/**
 * Match event types
 */
export type MatchEventType = 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'own_goal' | 'penalty';

/**
 * Match event entity - goals, assists, cards, etc.
 */
export interface MatchEvent {
  id: string;                    // UUID, client-generated
  match_id: string;
  event_type: MatchEventType;
  player_id: string;
  player_id_secondary?: string;  // For assists, substitutions
  team_id: string;
  match_time_seconds: number;
  match_time_display: string;    // MM:SS format
  timestamp: string;             // ISO 8601
  client_timestamp: string;      // Client timestamp for ordering
  metadata?: {
    body_part?: 'left_foot' | 'right_foot' | 'head' | 'other';
    goal_type?: 'open_play' | 'penalty' | 'free_kick' | 'corner';
    card_reason?: string;
  };
  recorded_by: string;
  sync_status: SyncStatus;
}

/**
 * Match timer entity - tracks match timer state
 */
export interface MatchTimer {
  match_id: string;
  started_at: string | null;
  paused_at: string | null;
  total_elapsed_seconds: number;
  is_running: boolean;
  updated_by: string;
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
export type OfflineTable = 'teams' | 'players' | 'matches' | 'match_players' | 'formations' | 'formation_positions' | 'team_members' | 'player_teams' | 'team_invites' | 'match_events' | 'match_timers';

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
      'by-created-by': string;
    };
  };
  players: {
    key: string;
    value: Player;
    indexes: {
      'by-user-id': string;
      'by-sync-status': string;
    };
  };
  player_teams: {
    key: string;
    value: PlayerTeam;
    indexes: {
      'by-player-id': string;
      'by-team-id': string;
      'by-sync-status': string;
    };
  };
  team_members: {
    key: string;
    value: TeamMember;
    indexes: {
      'by-team-id': string;
      'by-user-id': string;
      'by-player-id': string;
      'by-sync-status': string;
    };
  };
  team_invites: {
    key: string;
    value: TeamInvite;
    indexes: {
      'by-team-id': string;
      'by-token': string;
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
  match_players: {
    key: string;
    value: MatchPlayer;
    indexes: {
      'by-match-id': string;
      'by-player-id': string;
      'by-sync-status': string;
    };
  };
  formations: {
    key: string;
    value: Formation;
    indexes: {
      'by-match-id': string;
    };
  };
  formation_positions: {
    key: string;
    value: FormationPosition;
    indexes: {
      'by-formation-id': string;
    };
  };
  match_events: {
    key: string;
    value: MatchEvent;
    indexes: {
      'by-match-id': string;
      'by-player-id': string;
      'by-event-type': string;
      'by-sync-status': string;
    };
  };
  match_timers: {
    key: string;
    value: MatchTimer;
    indexes: {};
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
