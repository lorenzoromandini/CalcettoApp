---
phase: 03-match-management
plan: 01
subsystem: database
tags: [supabase, postgresql, rls, indexeddb, typescript, matches, rsvp, formations]

# Dependency graph
requires:
  - phase: 02-team-management
    provides: teams, players, team_members tables and RLS patterns
provides:
  - Database schema with matches, match_players, formations, formation_positions tables
  - Row Level Security policies for match-based access control
  - IndexedDB schema v3 with match management stores for offline-first
  - TypeScript database types for all match-related entities
  - Helper functions: is_match_admin(), is_match_participant()
affects:
  - 03-02-match-creation
  - 03-03-rsvp-system
  - 03-04-formation-builder
  - 03-05-match-list
  - 03-06-match-detail

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Junction tables for match-player relationships (match_players)"
    - "One-to-one formation per match via UNIQUE constraint"
    - "Grid-based positioning (x: 0-9, y: 0-6) for pitch visualization"
    - "RSVP pattern with status tracking (in/out/maybe)"
    - "SECURITY DEFINER functions for match authorization"

key-files:
  created:
    - supabase/migrations/20260215000002_matches_rsvps_formations.sql
  modified:
    - lib/db/schema.ts
    - lib/db/index.ts
    - types/database.ts

key-decisions:
  - "Match mode limited to 5vs5 and 8vs8 (team_mode from Phase 2 maps to match mode)"
  - "scheduled_at uses TIMESTAMPTZ for combined date/time with timezone"
  - "match_players uses UNIQUE(match_id, player_id) for single RSVP per player"
  - "formations has UNIQUE(match_id) for one formation per match"
  - "formation_positions uses grid coordinates (0-9 x, 0-6 y) for pitch visualization"
  - "position_on_pitch in match_players for RSVP-level position preference"

patterns-established:
  - "RSVP tracking: match_players junction with rsvp_status enum (in/out/maybe)"
  - "Formation builder: JSONB team_formation + formation_positions for player assignment"
  - "Match authorization: is_match_admin() checks team membership via match.team_id"
  - "Grid positioning: Integer coordinates for responsive pitch rendering"
  - "Substitute tracking: is_substitute boolean on formation_positions"

# Metrics
duration: 3min
completed: 2026-02-15T15:36:51Z
---

# Phase 3 Plan 1: Match Management Database Schema Summary

**Database foundation for match scheduling with 4 tables (matches, match_players, formations, formation_positions), team-based RLS policies, IndexedDB v3 offline support, and complete TypeScript types**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-15T15:34:03Z
- **Completed:** 2026-02-15T15:36:51Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- PostgreSQL migration with 4 tables supporting match management, RSVPs, and formations
- Row Level Security policies ensuring team members only access their match data
- IndexedDB schema v3 with match_players, formations, and formation_positions stores
- TypeScript types for all match entities with proper relationships
- Helper functions (is_match_admin, is_match_participant) for efficient authorization
- 35 schema objects (tables, indexes, policies, triggers, functions)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create database migration** - `a04754c` (feat)
2. **Task 2: Extend IndexedDB schema** - `56c737c` (feat)
3. **Task 3: Generate Supabase database types** - `6c0f02a` (feat)

**Plan metadata:** `[pending]` (docs: complete plan)

## Files Created/Modified

- `supabase/migrations/20260215000002_matches_rsvps_formations.sql` - PostgreSQL schema with RLS (382 lines)
- `lib/db/schema.ts` - Added Match, MatchPlayer, Formation, FormationPosition interfaces, RSVPStatus type
- `lib/db/index.ts` - Upgraded to DB_VERSION 3 with match management stores
- `types/database.ts` - Supabase types for all match tables and helper functions

## Decisions Made

- **Match mode alignment**: Only 5vs5 and 8vs8 modes supported (aligns with team_mode from Phase 2)
- **Combined datetime**: Using scheduled_at TIMESTAMPTZ instead of separate date/time fields for timezone-aware scheduling
- **Single formation per match**: UNIQUE constraint on formations.match_id enforces one formation template per match
- **RSVP at match level**: match_players junction tracks player availability before formation assignment
- **Grid-based positioning**: Integer coordinates (0-9 horizontal, 0-6 vertical) for consistent pitch visualization across screen sizes
- **Substitute tracking**: is_substitute boolean distinguishes bench players from field positions

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. Database migration should be applied with:
```bash
supabase migration up
```

## Next Phase Readiness

- ✅ Database schema ready for match creation features
- ✅ IndexedDB supports offline match management
- ✅ RLS policies enforce match security boundaries
- ✅ TypeScript types enable type-safe match queries
- ✅ Formation foundation ready for tactical builder

Ready for Plan 03-02: Match Creation UI

---
*Phase: 03-match-management*
*Completed: 2026-02-15*
