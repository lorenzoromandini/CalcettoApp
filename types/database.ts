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
          team_mode: '5-a-side' | '8-a-side' | null;
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
          team_mode?: '5-a-side' | '8-a-side' | null;
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
          team_mode?: '5-a-side' | '8-a-side' | null;
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
