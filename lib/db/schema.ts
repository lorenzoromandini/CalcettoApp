export type { Team, ClubMember, Player, PlayerClub, Match, MatchPlayer } from '@/types/database';

// Extend Club type with runtime properties
export interface Club {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  sync_status: string | null;
  memberCount?: number;
}

export type PlayerRole = 'goalkeeper' | 'defender' | 'midfielder' | 'attacker';

export type MatchStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED' | 'COMPLETED' | 'CANCELLED';

export type MatchMode = '5vs5' | '8vs8';

export type RSVPStatus = 'in' | 'out' | 'maybe';

export type SyncStatus = 'synced' | 'pending' | 'error';
