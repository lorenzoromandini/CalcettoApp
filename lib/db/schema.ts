export type { Team, Club, ClubMember, Player, PlayerClub, Match, MatchPlayer } from '@/types/database';

export type PlayerRole = 'goalkeeper' | 'defender' | 'midfielder' | 'attacker';

export type MatchStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED' | 'COMPLETED' | 'CANCELLED';

export type MatchMode = '5vs5' | '8vs8';

export type RSVPStatus = 'in' | 'out' | 'maybe';

export type SyncStatus = 'synced' | 'pending' | 'error';
