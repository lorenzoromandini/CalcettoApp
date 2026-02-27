# Fix Prisma Client Browser Errors - Comprehensive Migration Plan

## Current State

**Problem:** Multiple client-side hooks and components import directly from `@/lib/db/*` modules, which use the Prisma Client. This causes the error:
```
PrismaClient is unable to run in this browser environment
```

**Root Cause:** Prisma Client can only run on the server (Node.js environment). When Next.js client components import from `lib/db/*` files, the Prisma Client code is bundled and executed in the browser, causing the error.

**Solution:** All database operations must be moved to Server Actions (`lib/actions/*`), and client hooks must use these Server Actions instead of direct database imports.

---

## Files Requiring Migration

### Priority 1: Critical (Blocking)
These hooks directly import Prisma operations and are actively breaking:

| Hook File | Imports From | DB Functions Used |
|-----------|--------------|-------------------|
| `hooks/use-matches.ts` | `@/lib/db/matches` | `getClubMatches`, `getMatch`, `updateMatchDB`, `cancelMatchDB`, `uncancelMatchDB`, `getUpcomingMatchesDB`, `getPastMatchesDB` |
| `hooks/use-rsvps.ts` | `@/lib/db/rsvps` | `getMatchRSVPs`, `getRSVPCounts`, `updateRSVPDB`, `getMyRSVP`, `subscribeToRSVPs` |
| `hooks/use-goals.ts` | `@/lib/db/goals` | `getMatchGoals` |
| `hooks/use-formation.ts` | `@/lib/db/formations` | `getFormation`, `saveFormation` |
| `hooks/use-match-lifecycle.ts` | `@/lib/db/match-lifecycle` | `startMatch`, `endMatch`, `completeMatch`, `inputFinalResults` |
| `hooks/use-statistics.ts` | `@/lib/db/statistics` | `getMemberStats`, `getTopScorers`, `getTopAssisters`, `getTopAppearances`, `getTopWins`, `getTopLosses`, `getTopRatedMembers`, `getTopGoalsConceded` |
| `hooks/use-player-ratings.ts` | `@/lib/db/player-ratings` | `getMatchRatings`, `upsertPlayerRating`, `deletePlayerRating`, `getRatingsCount`, `bulkUpsertRatings` |
| `hooks/use-player-participation.ts` | `@/lib/db/player-participation` | `getMatchParticipants`, `updatePlayerParticipation`, `bulkUpdateParticipation`, `getParticipationCounts` |
| `hooks/use-rating-history.ts` | `@/lib/db/player-ratings` | `getPlayerRatingHistory` |
| `hooks/use-player-evolution.ts` | `@/lib/db/player-evolution` | `getPlayerEvolution` |

### Priority 2: React Query Hooks
These hooks use Server Actions for mutations but still import types from DB modules:

| Hook File | Imports From | Issue |
|-----------|--------------|-------|
| `hooks/use-matches-react-query.ts` | `@/lib/actions/matches` | Uses Server Actions ✓, but imports types from schema |
| `hooks/use-ratings-react-query.ts` | `@/lib/actions/ratings` | Uses Server Actions ✓, but imports types from DB module |
| `hooks/use-goals-react-query.ts` | `@/lib/actions/goals` | Uses Server Actions ✓, but imports types from DB module |
| `hooks/use-clubs-react-query.ts` | `@/lib/actions/clubs` | Uses Server Actions ✓, but imports types from DB module |
| `hooks/use-clubs.ts` | `@/lib/actions/clubs` | Uses Server Actions ✓, but imports types from schema |

### Priority 3: Client Components
Pages that import these hooks need to be verified after migration:

| Page | Uses Hooks | Risk Level |
|------|------------|------------|
| `clubs/[clubId]/matches/page.tsx` | useMatches, useCreateMatch | High |
| `clubs/[clubId]/matches/[matchId]/page.tsx` | useMatch, useMatchLifecycle, useRSVPs | High |
| `clubs/[clubId]/matches/[matchId]/formation/page.tsx` | useFormation | High |
| `clubs/[clubId]/matches/[matchId]/results/page.tsx` | useGoals, useMatchLifecycle | High |
| `clubs/[clubId]/matches/[matchId]/ratings/page.tsx` | usePlayerRatings | High |
| `clubs/[clubId]/stats/page.tsx` | useClubLeaderboards | High |
| `clubs/[clubId]/players/[memberId]/page.tsx` | usePlayerStats, useRatingHistory, usePlayerEvolution | High |

---

## Database Modules Analysis

### lib/db/matches.ts
**Status:** ❌ Exports server-only functions
**Required Server Actions:** Already exist in `lib/actions/matches.ts` but some query functions are missing

**Functions to Migrate:**
- [ ] `getClubMatches(clubId)` → Create `getClubMatchesAction`
- [ ] `getMatch(matchId)` → Create `getMatchAction`
- [ ] `getUpcomingMatches(clubId)` → Create `getUpcomingMatchesAction`
- [ ] `getPastMatches(clubId)` → Create `getPastMatchesAction`
- [ ] `updateMatch(matchId, data)` → Already in `updateMatchAction` ✓
- [ ] `cancelMatch(matchId)` → Already in `cancelMatchAction` ✓
- [ ] `uncancelMatch(matchId)` → Already in `uncancelMatchAction` ✓

### lib/db/rsvps.ts
**Status:** ⚠️ Stub implementation - RSVP feature removed in new schema
**Action:** Review if hooks using RSVPs can be simplified or removed

### lib/db/goals.ts
**Status:** ⚠️ Already has 'use server' directive, but `getMatchGoals` is being called from client
**Required Actions:**
- [ ] Move `getMatchGoals` to Server Action or create `getMatchGoalsAction`
- [ ] `addGoal` → Already in `addGoalAction` ✓
- [ ] `removeGoal` → Already in `removeGoalAction` ✓

### lib/db/formations.ts
**Status:** ❌ Exports server-only functions, no 'use server' directive
**Required Server Actions:**
- [ ] `getFormation(matchId, isHome)` → Create `getFormationAction`
- [ ] `saveFormation(matchId, data)` → Create `saveFormationAction` (already exists in `lib/actions/formations.ts`?)
- [ ] `getMatchFormations(matchId)` → Create `getMatchFormationsAction`
- [ ] `getMatchParticipants(matchId)` → Create `getMatchParticipantsAction`
- [ ] `getClubMembersWithRolePriority(clubId, targetRole)` → Create action

### lib/db/match-lifecycle.ts
**Status:** ✓ Has 'use server' directive
**Required Actions:** Already Server Actions, but hooks import them directly which won't work
- [ ] Create wrapper actions in `lib/actions/match-lifecycle.ts` that re-export these

### lib/db/statistics.ts
**Status:** ✓ Has 'use server' directive
**Required Server Actions:**
- [ ] `getMemberStats(clubMemberId, clubId)` → Create `getMemberStatsAction`
- [ ] `getTopScorers(clubId, limit)` → Create `getTopScorersAction`
- [ ] `getTopAssisters(clubId, limit)` → Create `getTopAssistersAction`
- [ ] `getTopAppearances(clubId, limit)` → Create `getTopAppearancesAction`
- [ ] `getTopWins(clubId, limit)` → Create `getTopWinsAction`
- [ ] `getTopLosses(clubId, limit)` → Create `getTopLossesAction`
- [ ] `getTopRatedMembers(clubId, limit)` → Create `getTopRatedMembersAction`
- [ ] `getTopGoalsConceded(clubId, limit)` → Create `getTopGoalsConcededAction`

### lib/db/player-ratings.ts
**Status:** ✓ Has 'use server' directive
**Required Server Actions:**
- [ ] `getMatchRatings(matchId)` → Create `getMatchRatingsAction`
- [ ] `upsertPlayerRating(data)` → Already in `upsertRatingAction` ✓
- [ ] `deletePlayerRating(matchId, clubMemberId)` → Already in `deleteRatingAction` ✓
- [ ] `getRatingsCount(matchId)` → Create `getRatingsCountAction`
- [ ] `bulkUpsertRatings(ratings)` → Already in `bulkUpsertRatingsAction` ✓
- [ ] `getPlayerRatingHistory(clubMemberId, clubId)` → Create `getPlayerRatingHistoryAction`

### lib/db/player-participation.ts
**Status:** ❌ No 'use server' directive
**Required Server Actions:**
- [ ] `getMatchParticipants(matchId)` → Create `getMatchParticipantsAction`
- [ ] `updatePlayerParticipation(matchId, playerId, played)` → Create action
- [ ] `bulkUpdateParticipation(matchId, updates)` → Create action
- [ ] `getParticipationCounts(matchId)` → Create `getParticipationCountsAction`

### lib/db/player-evolution.ts
**Status:** ✓ Has 'use server' directive
**Required Server Actions:**
- [ ] `getMemberEvolution(clubMemberId, clubId, limit)` → Create `getMemberEvolutionAction`

---

## Migration Strategy

### Phase 1: Foundation (1-2 hours)
**Goal:** Create all missing Server Actions

1. **Create/Update `lib/actions/matches.ts`**
   - Add: `getClubMatchesAction`
   - Add: `getMatchAction`
   - Add: `getUpcomingMatchesAction`
   - Add: `getPastMatchesAction`

2. **Create/Update `lib/actions/goals.ts`**
   - Add: `getMatchGoalsAction`

3. **Create/Update `lib/actions/formations.ts`**
   - Add: `getFormationAction`
   - Add: `getMatchFormationsAction`
   - Add: `getMatchParticipantsAction`

4. **Create `lib/actions/match-lifecycle.ts`**
   - Add: `startMatchAction`
   - Add: `endMatchAction`
   - Add: `completeMatchAction`
   - Add: `inputFinalResultsAction`

5. **Create `lib/actions/statistics.ts`**
   - Add: `getMemberStatsAction`
   - Add: `getClubLeaderboardsAction` (returns all leaderboards at once)
   - Or individual: `getTopScorersAction`, `getTopAssistersAction`, etc.

6. **Create `lib/actions/player-ratings.ts`**
   - Add: `getMatchRatingsAction`
   - Add: `getRatingsCountAction`
   - Add: `getPlayerRatingHistoryAction`

7. **Create `lib/actions/player-participation.ts`**
   - Add: `getMatchParticipantsAction`
   - Add: `updatePlayerParticipationAction`
   - Add: `bulkUpdateParticipationAction`
   - Add: `getParticipationCountsAction`

8. **Create `lib/actions/player-evolution.ts`**
   - Add: `getMemberEvolutionAction`

### Phase 2: Hook Migration (3-4 hours)
**Goal:** Update all hooks to use Server Actions

1. **hooks/use-matches.ts**
   - Replace direct DB imports with Server Actions
   - Update `useMatches` to call `getClubMatchesAction`
   - Update `useMatch` to call `getMatchAction`
   - Keep using existing `createMatchAction` for mutations

2. **hooks/use-rsvps.ts**
   - This is a stub (RSVP feature removed)
   - Decision needed: Remove file or keep returning empty data?

3. **hooks/use-goals.ts**
   - Replace `getMatchGoals` import with `getMatchGoalsAction`
   - Keep using `addGoalAction` and `removeGoalAction`

4. **hooks/use-formation.ts**
   - Replace `getFormation` with `getFormationAction`
   - Replace `saveFormation` with `saveFormationAction`

5. **hooks/use-match-lifecycle.ts**
   - Replace direct imports with actions from `lib/actions/match-lifecycle.ts`

6. **hooks/use-statistics.ts**
   - Replace all direct DB imports with Server Actions
   - Update `usePlayerStats` to use `getMemberStatsAction`
   - Update `useClubLeaderboards` to use new action

7. **hooks/use-player-ratings.ts**
   - Replace direct imports with Server Actions
   - Keep using mutation actions from `lib/actions/ratings.ts`

8. **hooks/use-player-participation.ts**
   - Replace all direct imports with Server Actions

9. **hooks/use-rating-history.ts**
   - Replace with `getPlayerRatingHistoryAction`

10. **hooks/use-player-evolution.ts**
    - Replace with `getMemberEvolutionAction`

### Phase 3: Type Safety (1 hour)
**Goal:** Ensure type-only imports are used where appropriate

1. Move shared types to `lib/types/` or `types/` directory
2. Update all hooks to use `import type` for types
3. Ensure no runtime code is imported from DB modules in client code

### Phase 4: Testing (2-3 hours)
**Goal:** Verify each migrated component works

1. **Test Matches:**
   - Create match
   - View match list
   - View single match
   - Update match
   - Cancel/uncancel match

2. **Test Formations:**
   - View formation
   - Save formation
   - View participants

3. **Test Goals:**
   - View goals
   - Add goal
   - Remove goal

4. **Test Ratings:**
   - View ratings
   - Add rating
   - Remove rating
   - Bulk save ratings

5. **Test Statistics:**
   - View player stats
   - View club leaderboards
   - View player evolution chart

6. **Test Match Lifecycle:**
   - Start match
   - End match
   - Complete match
   - Input final results

---

## Success Criteria

### Technical Requirements
- [ ] No imports from `@/lib/db/*` in any hook file (except type imports)
- [ ] All hooks use Server Actions for data fetching
- [ ] Type-only imports use `import type` syntax
- [ ] No "PrismaClient is unable to run in this browser environment" errors

### Functional Requirements
- [ ] All match CRUD operations work
- [ ] All goal operations work
- [ ] All formation operations work
- [ ] All rating operations work
- [ ] All statistics queries work
- [ ] All match lifecycle transitions work
- [ ] All player participation operations work

### Performance Requirements
- [ ] No regression in page load times
- [ ] No regression in data fetching performance
- [ ] Optimistic updates still work where implemented

---

## Current Progress

### Phase 1: Foundation
- [x] Create missing Server Actions
  - [x] Matches actions (getMatchAction, getUpcomingMatchesAction, getPastMatchesAction)
  - [x] Goals actions (getMatchGoalsAction)
  - [x] Formations actions (getFormationAction, getMatchFormationsAction, getMatchParticipantsAction)
  - [x] Match-lifecycle actions (startMatchAction, endMatchAction, completeMatchAction, inputFinalResultsAction)
  - [x] Statistics actions (getMemberStatsAction, getClubLeaderboardsAction, and individual actions)
  - [x] Player-ratings actions (getMatchRatingsAction, getRatingsCountAction, getPlayerRatingHistoryAction)
  - [x] Player-participation actions (getMatchParticipantsAction, updatePlayerParticipationAction, bulkUpdateParticipationAction, getParticipationCountsAction)
  - [x] Player-evolution actions (getMemberEvolutionAction)

### Phase 2: Hook Migration
- [x] hooks/use-matches.ts
- [x] hooks/use-rsvps.ts
- [x] hooks/use-goals.ts
- [x] hooks/use-formation.ts
- [x] hooks/use-match-lifecycle.ts
- [x] hooks/use-statistics.ts
- [x] hooks/use-player-ratings.ts
- [x] hooks/use-player-participation.ts
- [x] hooks/use-rating-history.ts
- [x] hooks/use-player-evolution.ts

### Phase 3: Type Safety
- [ ] Extract shared types
- [ ] Update import statements

### Phase 4: Testing
- [ ] Test matches
- [ ] Test formations
- [ ] Test goals
- [ ] Test ratings
- [ ] Test statistics
- [ ] Test match lifecycle
- [ ] Test player participation

---

## Notes

### Existing Server Actions
These Server Actions already exist and should be used:
- `lib/actions/matches.ts`: createMatchAction, updateMatchAction, cancelMatchAction, uncancelMatchAction
- `lib/actions/goals.ts`: addGoalAction, removeGoalAction
- `lib/actions/ratings.ts`: upsertRatingAction, deleteRatingAction, bulkUpsertRatingsAction
- `lib/actions/clubs.ts`: createClubAction, updateClubAction, deleteClubAction
- `lib/actions/formations.ts`: saveFormation (check if it exists)
- `lib/actions/members.ts`: Member-related actions
- `lib/actions/invites.ts`: Invite-related actions

### Database Files with 'use server'
These files already have the server directive but are being imported by client code (which is the bug):
- `lib/db/goals.ts` - has 'use server'
- `lib/db/match-lifecycle.ts` - has 'use server'
- `lib/db/statistics.ts` - has 'use server'
- `lib/db/player-ratings.ts` - has 'use server'
- `lib/db/player-evolution.ts` - has 'use server'

### Database Files without 'use server'
These files need to be kept server-only:
- `lib/db/matches.ts` - NO 'use server'
- `lib/db/rsvps.ts` - NO 'use server' (stub)
- `lib/db/formations.ts` - NO 'use server'
- `lib/db/player-participation.ts` - NO 'use server'
- `lib/db/clubs.ts` - NO 'use server'
- `lib/db/index.ts` - NO 'use server' (exports prisma client)

### Type Exports
Types that need to be extracted to a shared location:
- `Match` from `lib/db/schema.ts` or `types/database.ts`
- `GoalWithMembers`, `AddGoalInput` from `lib/db/goals.ts`
- `FormationData`, `FormationPosition` from `lib/db/formations.ts`
- `PlayerRating`, `PlayerRatingWithMember`, `RatingInput` from `lib/db/player-ratings.ts`
- `MemberStats`, `MemberLeaderboardEntry` from `lib/db/statistics.ts`
- `MatchPlayerWithPlayer`, `ParticipationUpdate` from `lib/db/player-participation.ts`
- `EvolutionDataPoint` from `lib/db/player-evolution.ts`
- `RatingHistoryEntry` from `lib/db/player-ratings.ts`

---

## Resumption Checklist

When resuming work on this plan:

1. [ ] Check which phase was last completed
2. [ ] Run `npm run dev` and check for Prisma browser errors in console
3. [ ] Review any partial changes made
4. [ ] Continue from the next incomplete task
5. [ ] Update progress markers in this document

### To resume using gsd-resume:

```bash
# Navigate to the project
cd C:\CalcettoApp

# Check current state
cat .planning/fix-prisma-client-errors/PLAN.md

# Look for "Current Progress" section and continue from next incomplete item
```
