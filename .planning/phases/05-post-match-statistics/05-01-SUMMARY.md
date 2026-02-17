---
phase: 05-post-match-statistics
plan: 01
subsystem: statistics
tags: [prisma, statistics, aggregation, leaderboards, goalkeeper]

requires:
  - phase: 04-match-results-ratings
    provides: Goals, PlayerRatings, Match completion with scores

provides:
  - FormationPosition.side field for team assignment tracking
  - RoleSelector with primary/other roles separation
  - Complete statistics aggregation module with 9 functions
  - Leaderboards for top performers (top 3 each)

affects: [player-profiles, team-dashboard, match-history]

tech-stack:
  added: []
  patterns:
    - "Prisma $queryRaw for complex aggregations"
    - "roles[0] = primary role, roles[1:] = other roles"
    - "positionX < 5 = home, positionX >= 5 = away"
    - "Win/loss based on side and match scores"

key-files:
  created:
    - lib/db/statistics.ts
  modified:
    - prisma/schema.prisma
    - lib/db/match-lifecycle.ts
    - components/players/role-selector.tsx
    - components/players/player-form.tsx
    - lib/validations/player.ts
    - messages/it.json
    - messages/en.json

key-decisions:
  - "Side field set in completeMatch (not inputFinalResults) to record final team assignment"
  - "Primary role stored as roles[0], other roles as roles[1:] in existing roles array"
  - "Goals conceded only tracked for players with 'goalkeeper' role in GK position"
  - "All statistics from COMPLETED matches only"
  - "Top rated players require minimum 3 ratings to appear"

patterns-established:
  - "Leaderboard functions return top 3 by default"
  - "Goals conceded leaderboard sorted ASC (fewer = better)"
  - "LegacyRoleSelector wrapper for backward compatibility with existing forms"

duration: 8 min
completed: 2026-02-17T23:15:35Z
---

# Phase 5 Plan 01: Statistics Foundation Summary

**Added side field to FormationPosition, redesigned RoleSelector with primary/other role separation, and implemented complete statistics aggregation module with 9 functions.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-17T23:07:52Z
- **Completed:** 2026-02-17T23:15:35Z
- **Tasks:** 4
- **Files modified:** 7

## Accomplishments
- FormationPosition now tracks which team each player was on (home/away) for individual win/loss statistics
- RoleSelector separates primary role (required) from secondary roles (optional) for better player categorization
- Complete statistics module enables querying goals, assists, appearances, wins, losses, draws, and goals conceded
- Goalkeeper-specific statistics (goals conceded) only tracked when GK plays in goalkeeper position
- All 7 leaderboard functions return top 3 by default

## Task Commits

Each task was committed atomically:

1. **Task 1: Add side field to FormationPosition schema** - `32a8369` (feat)
2. **Task 2: Set side field on match completion** - `cb517c2` (feat)
3. **Task 3: Redesign RoleSelector with primary role separation** - `e8b17c1` (feat)
4. **Task 4: Create statistics aggregation module** - `3689d7d` (feat)

**Plan metadata:** (pending)

## Files Created/Modified
- `prisma/schema.prisma` - Added side field to FormationPosition with index
- `lib/db/match-lifecycle.ts` - Added setPositionSides helper, called in completeMatch
- `components/players/role-selector.tsx` - Redesigned with primary/other roles, added LegacyRoleSelector wrapper
- `components/players/player-form.tsx` - Updated to use LegacyRoleSelector
- `lib/validations/player.ts` - Added minimum 1 role validation
- `lib/db/statistics.ts` - NEW: Complete statistics aggregation module with 9 functions
- `messages/it.json` - Added primaryRole, otherRoles, otherRolesHint translations
- `messages/en.json` - Added primaryRole, otherRoles, otherRolesHint translations

## Decisions Made
1. **Side field timing:** Set in `completeMatch` rather than `inputFinalResults` because:
   - Final scores and participation must be confirmed first
   - Represents permanent record of team assignment for statistics
   
2. **Role storage:** Kept existing `roles` array structure but established convention:
   - `roles[0]` = primary role (always present)
   - `roles[1:]` = other roles (optional)
   - This allows backward compatibility while enabling role prioritization

3. **Goals conceded logic:** Only counted when:
   - Player has 'goalkeeper' in roles array (any position)
   - Player was positioned at GK (positionLabel = 'GK')
   - This ensures we don't track goals conceded for outfield players

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None - all tasks completed successfully without blockers.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Statistics foundation complete, ready for player profile pages and team statistics views
- Plan 05-02 can now build UI using the statistics functions
- FormationPosition.side enables individual player win/loss tracking

---
*Phase: 05-post-match-statistics*
*Completed: 2026-02-17*

## Self-Check: PASSED
- lib/db/statistics.ts: FOUND
- SUMMARY.md: FOUND
- All 4 task commits verified in git log
