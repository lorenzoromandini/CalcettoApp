---
phase: 04-match-results-ratings
plan: "03"
subsystem: goals
tags: [goals, assists, server-actions, react-hooks, ui-components, validation]

requires:
  - phase: 04-01
    provides: Match lifecycle server actions, status badges, lifecycle buttons
  - phase: 04-02
    provides: Match lifecycle transitions (start, end, complete)

provides:
  - Goal CRUD operations (add, remove, get goals)
  - Goal validation with Zod schemas
  - useGoals hook with optimistic updates
  - GoalList component with delete functionality
  - GoalForm component with team/scorer/assist/own-goal selection
  - Results page for goal management
  - Dialog and Checkbox UI components

affects:
  - 04-04: Player participation (integrates with goal tracking)
  - 04-05: Match history view (needs completed goals data)

tech-stack:
  added:
    - "@radix-ui/react-dialog"
    - "@radix-ui/react-checkbox"
  patterns:
    - Server actions with 'use server' directive
    - Admin authorization via isTeamAdmin helper
    - Optimistic updates with rollback on error
    - Sonner toast notifications
    - Goal order tracking with sequential numbering

key-files:
  created:
    - lib/db/goals.ts
    - lib/validations/goal.ts
    - hooks/use-goals.ts
    - components/matches/goal-list.tsx
    - components/matches/goal-form.tsx
    - app/[locale]/teams/[teamId]/matches/[matchId]/results/page.tsx
    - app/[locale]/teams/[teamId]/matches/[matchId]/results/match-results-client.tsx
    - components/ui/dialog.tsx
    - components/ui/checkbox.tsx
  modified:
    - messages/it.json
    - messages/en.json

key-decisions:
  - "Goals allowed during IN_PROGRESS or FINISHED match status"
  - "Goals track order field for sequence preservation"
  - "Own goals count for opposing team"
  - "Score calculated from goal records, not stored separately"
  - "Opponent goals use placeholder team ID"

patterns-established:
  - "Goal order: sequential numbering maintained on add/remove"
  - "Score calculation: count goals by team, apply own-goal logic"
  - "Form state: reset on dialog close, clear assist for own-goals"

duration: 25 min
completed: 2026-02-17
---

# Phase 4 Plan 3: Goal Tracking Summary

**Goal CRUD operations with scorer/assist/own-goal support, React hooks, UI components, and results page**

## Performance

- **Duration:** 25 min
- **Started:** 2026-02-17T17:57:47Z
- **Completed:** 2026-02-17T18:23:13Z
- **Tasks:** 6
- **Files modified:** 11

## Accomplishments
- Implemented complete goal tracking with add/remove operations
- Created goal validation schemas with Italian error messages
- Built useGoals hook with optimistic updates and toast notifications
- Created GoalList component with scorer/assist display and delete functionality
- Built GoalForm modal with team/scorer/assist/own-goal selection
- Created Results page for match goal management
- Added Dialog and Checkbox UI components from Radix

## Task Commits

Each task was committed atomically:

1. **Task 1: Create goal CRUD operations** - `4763fd3` (feat)
2. **Task 2: Create goal validation schema** - `99b76f9` (feat)
3. **Task 3: Create useGoals hook** - `27d2154` (feat)
4. **Task 4: Create GoalList component** - `77937d4` (feat)
5. **Task 5: Create GoalForm component** - `d9360ee` (feat)
6. **Task 6: Create Results page** - `1f7fd30` (feat)

**Plan metadata:** N/A (separate metadata commit not needed)

## Files Created/Modified

### Created:
- `lib/db/goals.ts` - Server actions: addGoal, removeGoal, getMatchGoals, updateMatchScore
- `lib/validations/goal.ts` - Zod schemas with Italian error messages
- `hooks/use-goals.ts` - React hook with optimistic updates
- `components/matches/goal-list.tsx` - Goal list display with delete
- `components/matches/goal-form.tsx` - Add goal modal
- `app/[locale]/teams/[teamId]/matches/[matchId]/results/page.tsx` - Server component
- `app/[locale]/teams/[teamId]/matches/[matchId]/results/match-results-client.tsx` - Client component
- `components/ui/dialog.tsx` - Radix Dialog component
- `components/ui/checkbox.tsx` - Radix Checkbox component

### Modified:
- `messages/it.json` - Added goals namespace translations
- `messages/en.json` - Added goals namespace translations

## Decisions Made

1. **Goals allowed during IN_PROGRESS or FINISHED** - Works for both live tracking and post-match entry
2. **Goal order field** - Sequential numbering maintained on add/remove for chronological display
3. **Own goal logic** - Own goals count for the opposing team in score calculation
4. **Score from goals** - homeScore/awayScore calculated from goal records, not stored separately
5. **Opponent placeholder** - Opponent goals use `opponent-{matchId}` as teamId since no player records

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- **Missing Dialog and Checkbox components:** Added via manual creation using Radix UI patterns
- **LSP caching errors:** TypeScript compilation passed despite LSP showing false errors for MatchStatus

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Ready for Plan 04-04 (Player Participation):
- Goal CRUD operations functional
- Results page accessible at `/teams/[teamId]/matches/[matchId]/results`
- Admin authorization pattern established
- Italian translations complete

---
*Phase: 04-match-results-ratings*
*Completed: 2026-02-17*

## Self-Check: PASSED

- All 9 created files verified on disk
- All 6 task commits verified in git history
- TypeScript compilation passed
