/**
 * Supabase Database Types
 * 
 * Generated types for the Calcetto Manager database schema.
 * Includes tables for team management, players, matches, and invites.
 * 
 * @see supabase/migrations/20260215000001_teams_players_invites.sql
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          image_url: string | null;
          team_mode: '5-a-side' | '8-a-side' | '11-a-side' | null;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          sync_status: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          image_url?: string | null;
          team_mode?: '5-a-side' | '8-a-side' | '11-a-side' | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          sync_status?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          image_url?: string | null;
          team_mode?: '5-a-side' | '8-a-side' | '11-a-side' | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          sync_status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "teams_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      team_members: {
        Row: {
          id: string;
          team_id: string;
          user_id: string | null;
          player_id: string | null;
          role: 'admin' | 'co-admin' | 'member';
          joined_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          user_id?: string | null;
          player_id?: string | null;
          role?: 'admin' | 'co-admin' | 'member';
          joined_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          user_id?: string | null;
          player_id?: string | null;
          role?: 'admin' | 'co-admin' | 'member';
          joined_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_members_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          }
        ];
      };
      players: {
        Row: {
          id: string;
          name: string;
          surname: string | null;
          nickname: string | null;
          avatar_url: string | null;
          user_id: string | null;
          roles: string[];
          created_at: string;
          updated_at: string;
          sync_status: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          surname?: string | null;
          nickname?: string | null;
          avatar_url?: string | null;
          user_id?: string | null;
          roles?: string[];
          created_at?: string;
          updated_at?: string;
          sync_status?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          surname?: string | null;
          nickname?: string | null;
          avatar_url?: string | null;
          user_id?: string | null;
          roles?: string[];
          created_at?: string;
          updated_at?: string;
          sync_status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "players_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      player_teams: {
        Row: {
          id: string;
          player_id: string;
          team_id: string;
          jersey_number: number;
          joined_at: string;
          created_at: string;
          sync_status: string | null;
        };
        Insert: {
          id?: string;
          player_id: string;
          team_id: string;
          jersey_number: number;
          joined_at?: string;
          created_at?: string;
          sync_status?: string | null;
        };
        Update: {
          id?: string;
          player_id?: string;
          team_id?: string;
          jersey_number?: number;
          joined_at?: string;
          created_at?: string;
          sync_status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "player_teams_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "player_teams_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          }
        ];
      };
      team_invites: {
        Row: {
          id: string;
          team_id: string;
          created_by: string;
          token: string;
          email: string | null;
          expires_at: string;
          used_at: string | null;
          used_by: string | null;
          max_uses: number;
          use_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          created_by: string;
          token: string;
          email?: string | null;
          expires_at: string;
          used_at?: string | null;
          used_by?: string | null;
          max_uses?: number;
          use_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          created_by?: string;
          token?: string;
          email?: string | null;
          expires_at?: string;
          used_at?: string | null;
          used_by?: string | null;
          max_uses?: number;
          use_count?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "team_invites_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_invites_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_invites_used_by_fkey";
            columns: ["used_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      matches: {
        Row: {
          id: string;
          team_id: string;
          scheduled_at: string;
          location: string | null;
          mode: '5vs5' | '8vs8';
          status: 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED' | 'COMPLETED' | 'CANCELLED';
          home_score: number | null;
          away_score: number | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          scheduled_at: string;
          location?: string | null;
          mode: '5vs5' | '8vs8';
          status?: 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED' | 'COMPLETED' | 'CANCELLED';
          home_score?: number | null;
          away_score?: number | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          scheduled_at?: string;
          location?: string | null;
          mode?: '5vs5' | '8vs8';
          status?: 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED' | 'COMPLETED' | 'CANCELLED';
          home_score?: number | null;
          away_score?: number | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "matches_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      match_players: {
        Row: {
          id: string;
          match_id: string;
          player_id: string;
          rsvp_status: 'in' | 'out' | 'maybe';
          rsvp_at: string | null;
          position_on_pitch: string | null;
        };
        Insert: {
          id?: string;
          match_id: string;
          player_id: string;
          rsvp_status?: 'in' | 'out' | 'maybe';
          rsvp_at?: string | null;
          position_on_pitch?: string | null;
        };
        Update: {
          id?: string;
          match_id?: string;
          player_id?: string;
          rsvp_status?: 'in' | 'out' | 'maybe';
          rsvp_at?: string | null;
          position_on_pitch?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "match_players_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "match_players_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          }
        ];
      };
      formations: {
        Row: {
          id: string;
          match_id: string;
          team_formation: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          team_formation?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          team_formation?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "formations_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: true;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          }
        ];
      };
      formation_positions: {
        Row: {
          id: string;
          formation_id: string;
          player_id: string | null;
          position_x: number;
          position_y: number;
          position_label: string;
          is_substitute: boolean;
        };
        Insert: {
          id?: string;
          formation_id: string;
          player_id?: string | null;
          position_x: number;
          position_y: number;
          position_label: string;
          is_substitute?: boolean;
        };
        Update: {
          id?: string;
          formation_id?: string;
          player_id?: string | null;
          position_x?: number;
          position_y?: number;
          position_label?: string;
          is_substitute?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "formation_positions_formation_id_fkey";
            columns: ["formation_id"];
            isOneToOne: false;
            referencedRelation: "formations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "formation_positions_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          }
        ];
      };
      match_timers: {
        Row: {
          match_id: string;
          started_at: string | null;
          paused_at: string | null;
          total_elapsed_seconds: number;
          is_running: boolean;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          match_id: string;
          started_at?: string | null;
          paused_at?: string | null;
          total_elapsed_seconds?: number;
          is_running?: boolean;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          match_id?: string;
          started_at?: string | null;
          paused_at?: string | null;
          total_elapsed_seconds?: number;
          is_running?: boolean;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "match_timers_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: true;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "match_timers_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      match_events: {
        Row: {
          id: string;
          match_id: string;
          event_type: 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'own_goal' | 'penalty';
          player_id: string;
          player_id_secondary: string | null;
          team_id: string;
          match_time_seconds: number;
          match_time_display: string;
          recorded_by: string | null;
          timestamp: string;
          client_timestamp: string;
          metadata: Json | null;
          sync_status: string | null;
        };
        Insert: {
          id: string;
          match_id: string;
          event_type: 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'own_goal' | 'penalty';
          player_id: string;
          player_id_secondary?: string | null;
          team_id: string;
          match_time_seconds: number;
          match_time_display: string;
          recorded_by?: string | null;
          timestamp?: string;
          client_timestamp: string;
          metadata?: Json | null;
          sync_status?: string | null;
        };
        Update: {
          id?: string;
          match_id?: string;
          event_type?: 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'own_goal' | 'penalty';
          player_id?: string;
          player_id_secondary?: string | null;
          team_id?: string;
          match_time_seconds?: number;
          match_time_display?: string;
          recorded_by?: string | null;
          timestamp?: string;
          client_timestamp?: string;
          metadata?: Json | null;
          sync_status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "match_events_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "match_events_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "match_events_player_id_secondary_fkey";
            columns: ["player_id_secondary"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "match_events_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "match_events_recorded_by_fkey";
            columns: ["recorded_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_team_admin: {
        Args: {
          team_uuid: string;
        };
        Returns: boolean;
      };
      is_team_member: {
        Args: {
          team_uuid: string;
        };
        Returns: boolean;
      };
      is_player_in_team: {
        Args: {
          player_uuid: string;
          team_uuid: string;
        };
        Returns: boolean;
      };
      is_match_admin: {
        Args: {
          match_uuid: string;
        };
        Returns: boolean;
      };
      is_match_participant: {
        Args: {
          match_uuid: string;
        };
        Returns: boolean;
      };
      can_record_match_events: {
        Args: {
          match_uuid: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helper types for common use cases
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Specific table types
export type Team = Tables<'teams'>;
export type TeamMember = Tables<'team_members'>;
export type Player = Tables<'players'>;
export type PlayerTeam = Tables<'player_teams'>;
export type TeamInvite = Tables<'team_invites'>;
export type Match = Tables<'matches'>;
export type MatchPlayer = Tables<'match_players'>;
export type Formation = Tables<'formations'>;
export type FormationPosition = Tables<'formation_positions'>;
