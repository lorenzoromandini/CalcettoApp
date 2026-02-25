/**
 * Database Types - Prisma Version
 * 
 * Aligned with the reference Prisma schema from AGENTS.md.
 * All properties use camelCase to match Prisma Client output.
 */

import { MatchStatus, MatchMode, ClubPrivilege, PlayerRole } from '@prisma/client';

// Re-export Prisma enums
export { MatchStatus, MatchMode, ClubPrivilege, PlayerRole };

// ============================================================================
// BASE ENTITY TYPES (camelCase, matching Prisma schema)
// ============================================================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  image: string | null;
  password: string | null;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
}

export interface Club {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ClubMember {
  id: string;
  clubId: string;
  userId: string;
  privileges: ClubPrivilege;
  joinedAt: string;
  primaryRole: PlayerRole;
  secondaryRoles: PlayerRole[];
  jerseyNumber: number;
}

export interface ClubInvite {
  id: string;
  clubId: string;
  createdBy: string;
  token: string;
  expiresAt: string | null;
  createdAt: string;
}

export interface Match {
  id: string;
  clubId: string;
  scheduledAt: string;
  location: string | null;
  mode: MatchMode;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  scoreFinalizedBy: string | null;
  ratingsCompletedBy: string | null;
  scoreFinalizedAt: string | null;
  ratingsCompletedAt: string | null;
  sharedToken: string | null;
  sharedAt: string | null;
}

export interface Formation {
  id: string;
  matchId: string;
  isHome: boolean;
  formationName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FormationPosition {
  id: string;
  formationId: string;
  clubMemberId: string;
  positionX: number;
  positionY: number;
  positionLabel: string;
  isSubstitute: boolean;
  played: boolean;
}

export interface Goal {
  id: string;
  matchId: string;
  scorerId: string;
  assisterId: string | null;
  isOwnGoal: boolean;
  order: number;
  createdAt: string;
}

export interface PlayerRating {
  id: string;
  matchId: string;
  clubMemberId: string;
  rating: string;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// EXTENDED TYPES WITH RELATIONS
// ============================================================================

export interface UserWithMemberships extends User {
  memberships: ClubMemberWithClub[];
  ownedClubs: Club[];
}

export interface ClubMemberWithUser extends ClubMember {
  user: User;
}

export interface ClubMemberWithClub extends ClubMember {
  club: Club;
}

export interface ClubWithMembers extends Club {
  members: ClubMemberWithUser[];
}

export interface ClubWithCreator extends Club {
  creator: User;
}

export interface MatchWithClub extends Match {
  club: Club;
}

export interface MatchWithFormations extends Match {
  homeFormation?: Formation & { positions: FormationPositionWithMember[] };
  awayFormation?: Formation & { positions: FormationPositionWithMember[] };
}

export interface FormationPositionWithMember extends FormationPosition {
  clubMember: ClubMemberWithUser;
}

export interface GoalWithMembers extends Goal {
  scorer: ClubMemberWithUser;
  assister: ClubMemberWithUser | null;
}

export interface PlayerRatingWithMember extends PlayerRating {
  clubMember: ClubMemberWithUser;
}

// ============================================================================
// API INPUT/OUTPUT TYPES
// ============================================================================

export interface CreateClubInput {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
}

export interface UpdateClubInput {
  name?: string;
  description?: string | null;
  imageUrl?: string | null;
}

export interface CreateMatchInput {
  scheduledAt: string;
  location?: string | null;
  mode: MatchMode;
  notes?: string | null;
}

export interface UpdateMatchInput {
  scheduledAt?: string;
  location?: string | null;
  mode?: MatchMode;
  notes?: string | null;
}

export interface AddGoalInput {
  matchId: string;
  scorerId: string;
  assisterId?: string;
  isOwnGoal?: boolean;
}

export interface RatingInput {
  matchId: string;
  clubMemberId: string;
  rating: string;
  comment?: string;
}

// ============================================================================
// BACKWARD COMPATIBILITY ALIASES
// ============================================================================

/** @deprecated Use ClubMember */
export type Player = ClubMember;

/** @deprecated Use ClubMemberWithUser */
export type PlayerWithUser = ClubMemberWithUser;

/** @deprecated Use GoalWithMembers */
export type GoalWithPlayers = GoalWithMembers;

/** @deprecated Use PlayerRatingWithMember */
export type PlayerRatingWithPlayer = PlayerRatingWithMember;

/** @deprecated Use FormationPositionWithMember */
export type FormationPositionWithPlayer = FormationPositionWithMember;

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type Tables = 
  | 'users' 
  | 'clubs' 
  | 'club_members' 
  | 'club_invites' 
  | 'matches' 
  | 'formations' 
  | 'formation_positions' 
  | 'goals' 
  | 'player_ratings';

export type TableRow<T extends Tables> = 
  T extends 'users' ? User :
  T extends 'clubs' ? Club :
  T extends 'club_members' ? ClubMember :
  T extends 'club_invites' ? ClubInvite :
  T extends 'matches' ? Match :
  T extends 'formations' ? Formation :
  T extends 'formation_positions' ? FormationPosition :
  T extends 'goals' ? Goal :
  T extends 'player_ratings' ? PlayerRating :
  never;
