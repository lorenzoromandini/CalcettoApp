---
phase: 02-team-management
plan: 01
subsystem: database
tags: [supabase, postgresql, rls, indexeddb, typescript]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: offline-first IndexedDB infrastructure, TypeScript setup, authentication
provides:
  - Database schema with teams, team_members, players, player_teams, team_invites tables
  - Row Level Security policies for team-based access control
  - IndexedDB schema v2 with multi-team player support
  - TypeScript database types for type-safe queries
affects:
  - 02-02-team-creation
  - 02-03-player-management
  - 02-04-team-invites
  - 02-05-match-management

# Tech tracking
tech-stack:
  added: [supabase RLS, PostgreSQL junction tables, SECURITY DEFINER functions]
  patterns:
    - "Junction tables for many-to-many relationships (team_members, player_teams)"
    - "Soft delete pattern with deleted_at column for data preservation"
    - "RLS helper functions for reusable authorization logic"
    - "Multi-entity player support through player_teams junction"

key-files:
  created:
    - supabase/migrations/20260215000001_teams_players_invites.sql
    - types/database.ts
  modified:
    - lib/db/schema.ts
    - lib/db/index.ts

key-decisions:
  - "Player profiles are team-agnostic; jersey numbers tracked in player_teams junction table"
  - "Soft delete on teams preserves match history while allowing team deactivation"
  - "SECURITY DEFINER functions for RLS checks to avoid query plan overhead"
  - "Unique constraints on (team_id, jersey_number) enforce jersey number uniqueness per team"

patterns-established:
  - "Multi-team players: player_teams junction enables players in multiple teams with different jersey numbers"
  - "Role-based access: team_members.role with admin/co-admin/member hierarchy"
  - "Token-based invites: team_invites with expiration and use limits"
  - "Offline-first sync: sync_status field on all entities for tracking local vs server state"

# Metrics
duration: 25min
completed: 2026-02-15
---

# Phase 2 Plan 1: Team Management Database Schema Summary

**Complete database schema for team management with RLS policies, multi-team player support, and offline-first IndexedDB backing**

## Performance

- **Duration:** 25 min
- **Started:** 2026-02-15T01:50:46Z
- **Completed:** 2026-02-15T02:15:46Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Database migration with 5 tables supporting team management, player profiles, memberships, and invitations
- Row Level Security policies ensuring users only access their own team data
- IndexedDB schema v2 with player_teams and team_members stores for offline-first operation
- TypeScript types mirroring database schema for end-to-end type safety
- Helper functions (is_team_admin, is_team_member, is_player_in_team) for efficient authorization checks

## Task Commits

Each task was committed atomically:

1. **Task 1: Create database migration** - `a70ed40` (feat)
2. **Task 2: Extend IndexedDB schema** - `b0c9063` (feat)
3. **Task 3: Generate Supabase database types** - `0314ebd` (feat)

**Plan metadata:** `a70ed40` (docs: complete plan)

## Files Created/Modified

- `supabase/migrations/20260215000001_teams_players_invites.sql` - Complete database schema with RLS policies (410 lines)
- `lib/db/schema.ts` - Extended IndexedDB schema with TeamMember, PlayerTeam, TeamInvite interfaces
- `lib/db/index.ts` - Database v2 with new object stores (player_teams, team_members, team_invites)
- `types/database.ts` - Supabase-generated TypeScript types for all 5 tables

## Decisions Made

- **Player profiles are team-agnostic**: Players exist independently of teams; jersey numbers and team membership tracked in player_teams junction table. This enables the same player to be in multiple teams with different jersey numbers.
- **Soft delete on teams**: Using deleted_at timestamp rather than hard delete preserves match history when teams are "deleted".
- **SECURITY DEFINER helper functions**: RLS policies call is_team_admin(), is_team_member() for consistent authorization logic and better query planning.
- **Unique jersey numbers per team**: Constraint UNIQUE(team_id, jersey_number) prevents duplicate jersey numbers within a team while allowing same numbers across different teams.
- **Token-based invites**: team_invites table uses random tokens with expiration and optional use limits for flexible invitation workflows.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed old migration logic to fix TypeScript errors**
- **Found during:** Task 2
- **Issue:** Migration code for v1 -> v2 upgrade had TypeScript errors with index name types
- **Fix:** Simplified to fresh store creation without legacy migration paths
- **Files modified:** lib/db/index.ts
- **Committed in:** b0c9063 (Task 2 commit)

**2. [Rule 2 - Missing Critical] Added missing types/database.ts exports**
- **Found during:** Task 3
- **Issue:** Plan referenced generating types via Supabase CLI but project isn't linked yet
- **Fix:** Manually created comprehensive types/database.ts with all table types
- **Files modified:** types/database.ts (new file)
- **Committed in:** 0314ebd (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 missing critical)
**Impact on plan:** Minor - ensured type safety and compilation without blocking development

## Issues Encountered

- Existing `lib/db/actions.ts` references old `by-team-id` index on players store (from previous schema). This is a separate file not in plan scope and will need updating when implementing player-related features.

## User Setup Required

None - no external service configuration required. Database migration should be applied with:
```bash
supabase migration up
```

## Next Phase Readiness

- ✅ Database schema ready for team creation features
- ✅ IndexedDB supports offline team management
- ✅ RLS policies enforce security boundaries
- ⚠️ Player management actions (lib/db/actions.ts) need schema update for new structure

Ready for Plan 02-02: Team Creation UI

---
*Phase: 02-team-management*
*Completed: 2026-02-15*
