/**
 * Schema Type Exports
 * 
 * Re-exports database types from @/types/database for convenience.
 * Updated for new schema - removed eliminated model types.
 */

export type { Club, ClubMember, User, Match, Formation, FormationPosition, Goal, PlayerRating, MatchMode, MatchStatus } from '@/types/database';

// Backward compatibility - Club is the new Team
export type { Club as Team } from '@/types/database';

// RSVP Status type (no longer a database enum)
export type RSVPStatus = 'in' | 'out' | 'maybe';

// Sync Status for offline support
export type SyncStatus = 'synced' | 'pending' | 'error';
