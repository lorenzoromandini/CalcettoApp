/**
 * Database Types - Prisma Version
 * 
 * Generated types for the Calcetto Manager database schema.
 * Aligned with the reference Prisma schema from AGENTS.md.
 * 
 * Key changes in this schema:
 * - ClubMember now contains player data (no separate Player entity)
 * - MatchMode is an enum with specific values (FIVE_V_FIVE, EIGHT_V_EIGHT, ELEVEN_V_ELEVEN)
 * - ClubPrivilege is an enum (MEMBER, MANAGER, OWNER)
 * - PlayerRole is an enum (POR, DIF, CEN, ATT)
 * - Formation has isHome boolean and formationName
 * - FormationPosition links to ClubMember instead of Player
 * - Goal links to ClubMember instead of Player
 * - PlayerRating links to ClubMember instead of Player
 */

// ============================================================================
// ENUMS
// ============================================================================

export type MatchStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED' | 'COMPLETED' | 'CANCELLED';

export type MatchMode = 'FIVE_V_FIVE' | 'EIGHT_V_EIGHT' | 'ELEVEN_V_ELEVEN';

export type ClubPrivilege = 'MEMBER' | 'MANAGER' | 'OWNER';

export type PlayerRole = 'POR' | 'DIF' | 'CEN' | 'ATT';

// ============================================================================
// DATABASE TABLES
// ============================================================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          nickname: string | null;
          image: string | null;
          password: string | null;
          created_at: string;
          updated_at: string;
          last_login: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          nickname?: string | null;
          image?: string | null;
          password?: string | null;
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          nickname?: string | null;
          image?: string | null;
          password?: string | null;
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
        };
        Relationships: [];
      };
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
          user_id: string;
          privileges: ClubPrivilege;
          joined_at: string;
          primary_role: PlayerRole;
          secondary_roles: PlayerRole[];
          jersey_number: number;
        };
        Insert: {
          id?: string;
          club_id: string;
          user_id: string;
          privileges?: ClubPrivilege;
          joined_at?: string;
          primary_role: PlayerRole;
          secondary_roles?: PlayerRole[];
          jersey_number: number;
        };
        Update: {
          id?: string;
          club_id?: string;
          user_id?: string;
          privileges?: ClubPrivilege;
          joined_at?: string;
          primary_role?: PlayerRole;
          secondary_roles?: PlayerRole[];
          jersey_number?: number;
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
          }
        ];
      };
      club_invites: {
        Row: {
          id: string;
          club_id: string;
          created_by: string;
          token: string;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          club_id: string;
          created_by: string;
          token: string;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string;
          created_by?: string;
          token?: string;
          expires_at?: string | null;
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
          created_at: string;
          updated_at: string;
          created_by: string;
          score_finalized_by: string | null;
          ratings_completed_by: string | null;
          score_finalized_at: string | null;
          ratings_completed_at: string | null;
          shared_token: string | null;
          shared_at: string | null;
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
          created_at?: string;
          updated_at?: string;
          created_by: string;
          score_finalized_by?: string | null;
          ratings_completed_by?: string | null;
          score_finalized_at?: string | null;
          ratings_completed_at?: string | null;
          shared_token?: string | null;
          shared_at?: string | null;
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
          created_at?: string;
          updated_at?: string;
          created_by?: string;
          score_finalized_by?: string | null;
          ratings_completed_by?: string | null;
          score_finalized_at?: string | null;
          ratings_completed_at?: string | null;
          shared_token?: string | null;
          shared_at?: string | null;
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
          },
          {
            foreignKeyName: "matches_score_finalized_by_fkey";
            columns: ["score_finalized_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_ratings_completed_by_fkey";
            columns: ["ratings_completed_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      formations: {
        Row: {
          id: string;
          match_id: string;
          is_home: boolean;
          formation_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          is_home: boolean;
          formation_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          is_home?: boolean;
          formation_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "formations_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          }
        ];
      };
      formation_positions: {
        Row: {
          id: string;
          formation_id: string;
          club_member_id: string;
          position_x: number;
          position_y: number;
          position_label: string;
          is_substitute: boolean;
          played: boolean;
        };
        Insert: {
          id?: string;
          formation_id: string;
          club_member_id: string;
          position_x: number;
          position_y: number;
          position_label: string;
          is_substitute?: boolean;
          played?: boolean;
        };
        Update: {
          id?: string;
          formation_id?: string;
          club_member_id?: string;
          position_x?: number;
          position_y?: number;
          position_label?: string;
          is_substitute?: boolean;
          played?: boolean;
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
            foreignKeyName: "formation_positions_club_member_id_fkey";
            columns: ["club_member_id"];
            isOneToOne: false;
            referencedRelation: "club_members";
            referencedColumns: ["id"];
          }
        ];
      };
      goals: {
        Row: {
          id: string;
          match_id: string;
          scorer_id: string;
          assister_id: string | null;
          is_own_goal: boolean;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          scorer_id: string;
          assister_id?: string | null;
          is_own_goal?: boolean;
          order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
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
            foreignKeyName: "goals_scorer_id_fkey";
            columns: ["scorer_id"];
            isOneToOne: false;
            referencedRelation: "club_members";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "goals_assister_id_fkey";
            columns: ["assister_id"];
            isOneToOne: false;
            referencedRelation: "club_members";
            referencedColumns: ["id"];
          }
        ];
      };
      player_ratings: {
        Row: {
          id: string;
          match_id: string;
          club_member_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          club_member_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          club_member_id?: string;
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
            foreignKeyName: "player_ratings_club_member_id_fkey";
            columns: ["club_member_id"];
            isOneToOne: false;
            referencedRelation: "club_members";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Specific table types
export type User = Tables<'users'>;
export type Club = Tables<'clubs'>;
export type ClubMember = Tables<'club_members'>;
export type ClubInvite = Tables<'club_invites'>;
export type Match = Tables<'matches'>;
export type Formation = Tables<'formations'>;
export type FormationPosition = Tables<'formation_positions'>;
export type Goal = Tables<'goals'>;
export type PlayerRating = Tables<'player_ratings'>;

// Backward compatibility aliases
export type Team = Club;

// Extended types with relations
export interface ClubMemberWithUser extends ClubMember {
  user: User;
}

export interface ClubMemberWithClub extends ClubMember {
  club: Club;
}

export interface ClubWithMembers extends Club {
  members: ClubMemberWithUser[];
  memberCount: number;
}

export interface MatchWithFormations extends Match {
  homeFormation?: Formation & { positions: FormationPositionWithMember[] };
  awayFormation?: Formation & { positions: FormationPositionWithMember[] };
}

export interface FormationPositionWithMember extends FormationPosition {
  clubMember: ClubMemberWithUser;
}
