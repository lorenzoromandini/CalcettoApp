/**
 * Database Types - Prisma Version
 * 
 * Generated types for the Calcetto Manager database schema.
 * Includes tables for club management, players, matches, and invites.
 * 
 * Aligned with Prisma schema.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type MatchStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED' | 'COMPLETED' | 'CANCELLED';
export type MatchMode = '5vs5' | '8vs8';
export type RSVPStatus = 'in' | 'out' | 'maybe';
export type FormationMode = '5vs5' | '8vs8';

export interface Database {
  public: {
    Tables: {
      clubs: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          image_url: string | null;
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
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          sync_status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "clubs_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      club_members: {
        Row: {
          id: string;
          club_id: string;
          user_id: string | null;
          player_id: string | null;
          role: 'admin' | 'co-admin' | 'member';
          joined_at: string;
        };
        Insert: {
          id?: string;
          club_id: string;
          user_id?: string | null;
          player_id?: string | null;
          role?: 'admin' | 'co-admin' | 'member';
          joined_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string;
          user_id?: string | null;
          player_id?: string | null;
          role?: 'admin' | 'co-admin' | 'member';
          joined_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "club_members_club_id_fkey";
            columns: ["club_id"];
            isOneToOne: false;
            referencedRelation: "clubs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "club_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "club_members_player_id_fkey";
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
      player_clubs: {
        Row: {
          id: string;
          player_id: string;
          club_id: string;
          jersey_number: number;
          primary_role: string;
          secondary_roles: string[];
          joined_at: string;
          created_at: string;
          sync_status: string | null;
        };
        Insert: {
          id?: string;
          player_id: string;
          club_id: string;
          jersey_number: number;
          primary_role: string;
          secondary_roles?: string[];
          joined_at?: string;
          created_at?: string;
          sync_status?: string | null;
        };
        Update: {
          id?: string;
          player_id?: string;
          club_id?: string;
          jersey_number?: number;
          primary_role?: string;
          secondary_roles?: string[];
          joined_at?: string;
          created_at?: string;
          sync_status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "player_clubs_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "player_clubs_club_id_fkey";
            columns: ["club_id"];
            isOneToOne: false;
            referencedRelation: "clubs";
            referencedColumns: ["id"];
          }
        ];
      };
      club_invites: {
        Row: {
          id: string;
          club_id: string;
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
          club_id: string;
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
          club_id?: string;
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
            foreignKeyName: "club_invites_club_id_fkey";
            columns: ["club_id"];
            isOneToOne: false;
            referencedRelation: "clubs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "club_invites_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "club_invites_used_by_fkey";
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
          club_id: string;
          scheduled_at: string;
          location: string | null;
          mode: MatchMode;
          status: MatchStatus;
          home_score: number | null;
          away_score: number | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          sync_status: string | null;
        };
        Insert: {
          id?: string;
          club_id: string;
          scheduled_at: string;
          location?: string | null;
          mode: MatchMode;
          status?: MatchStatus;
          home_score?: number | null;
          away_score?: number | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          sync_status?: string | null;
        };
        Update: {
          id?: string;
          club_id?: string;
          scheduled_at?: string;
          location?: string | null;
          mode?: MatchMode;
          status?: MatchStatus;
          home_score?: number | null;
          away_score?: number | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          sync_status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "matches_club_id_fkey";
            columns: ["club_id"];
            isOneToOne: false;
            referencedRelation: "clubs";
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
          rsvp_status: RSVPStatus;
          rsvp_at: string | null;
          position_on_pitch: string | null;
          played: boolean;
          sync_status: string | null;
        };
        Insert: {
          id?: string;
          match_id: string;
          player_id: string;
          rsvp_status?: RSVPStatus;
          rsvp_at?: string | null;
          position_on_pitch?: string | null;
          played?: boolean;
          sync_status?: string | null;
        };
        Update: {
          id?: string;
          match_id?: string;
          player_id?: string;
          rsvp_status?: RSVPStatus;
          rsvp_at?: string | null;
          position_on_pitch?: string | null;
          played?: boolean;
          sync_status?: string | null;
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
          side: string | null;
        };
        Insert: {
          id?: string;
          formation_id: string;
          player_id?: string | null;
          position_x: number;
          position_y: number;
          position_label: string;
          is_substitute?: boolean;
          side?: string | null;
        };
        Update: {
          id?: string;
          formation_id?: string;
          player_id?: string | null;
          position_x?: number;
          position_y?: number;
          position_label?: string;
          is_substitute?: boolean;
          side?: string | null;
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
      goals: {
        Row: {
          id: string;
          match_id: string;
          club_id: string;
          scorer_id: string;
          assister_id: string | null;
          is_own_goal: boolean;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          club_id: string;
          scorer_id: string;
          assister_id?: string | null;
          is_own_goal?: boolean;
          order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          club_id?: string;
          scorer_id?: string;
          assister_id?: string | null;
          is_own_goal?: boolean;
          order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "goals_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "goals_club_id_fkey";
            columns: ["club_id"];
            isOneToOne: false;
            referencedRelation: "clubs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "goals_scorer_id_fkey";
            columns: ["scorer_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "goals_assister_id_fkey";
            columns: ["assister_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          }
        ];
      };
      player_ratings: {
        Row: {
          id: string;
          match_id: string;
          player_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          player_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          player_id?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "player_ratings_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "player_ratings_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_club_admin: {
        Args: {
          club_uuid: string;
        };
        Returns: boolean;
      };
      is_club_member: {
        Args: {
          club_uuid: string;
        };
        Returns: boolean;
      };
      is_player_in_club: {
        Args: {
          player_uuid: string;
          club_uuid: string;
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
export type Club = Tables<'clubs'>;
export type ClubMember = Tables<'club_members'>;
export type Player = Tables<'players'>;
export type PlayerClub = Tables<'player_clubs'>;
export type ClubInvite = Tables<'club_invites'>;
export type Match = Tables<'matches'>;
export type MatchPlayer = Tables<'match_players'>;
export type Formation = Tables<'formations'>;
export type FormationPosition = Tables<'formation_positions'>;
export type Goal = Tables<'goals'>;
export type PlayerRating = Tables<'player_ratings'>;

// Backward compatibility aliases (deprecated - use Club instead)
export type Team = Club;
