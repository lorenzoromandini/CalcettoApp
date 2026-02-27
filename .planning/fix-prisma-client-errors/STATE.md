# Fix Prisma Client Browser Errors - Project State

## Project Overview

**Goal:** Fix "PrismaClient is unable to run in this browser environment" errors by migrating all client-side database imports to use Server Actions.

**Start Date:** 2025-02-27
**Current Phase:** Not Started

---

## Current Status

### Overall Progress
```
[░░░░░░░░░░] 0% Complete
```

### Phase Progress
- **Phase 1: Foundation** [░░░░░░░░░░] 0%
- **Phase 2: Hook Migration** [░░░░░░░░░░] 0%
- **Phase 3: Type Safety** [░░░░░░░░░░] 0%
- **Phase 4: Testing** [░░░░░░░░░░] 0%

---

## Active Work

### Currently Working On
*None - project plan created, awaiting execution start*

### Next Task
Phase 1, Task 1: Create missing Server Actions in `lib/actions/matches.ts`
- Add `getClubMatchesAction`
- Add `getMatchAction`
- Add `getUpcomingMatchesAction`
- Add `getPastMatchesAction`

---

## Files Modified

| File | Status | Notes |
|------|--------|-------|
| `.planning/fix-prisma-client-errors/PLAN.md` | ✅ Created | Initial planning document |
| `.planning/fix-prisma-client-errors/STATE.md` | ✅ Created | This file |

---

## Blockers & Issues

### Current Blockers
*None*

### Known Issues
1. Some database modules import from `lib/db/index.ts` which exports the Prisma client - this must remain server-only
2. RSVP functionality has been removed from the schema - hooks may need refactoring
3. Type definitions are scattered across multiple files - need centralization

---

## Key Decisions

### Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-02-27 | Create Server Actions wrapper for existing DB functions | Instead of refactoring DB modules, create thin action wrappers to minimize risk |
| 2025-02-27 | Migrate hooks incrementally by domain | Group by functionality (matches, goals, ratings) to test as we go |
| 2025-02-27 | Keep type definitions in DB modules, import as types only | Types don't cause browser errors, only runtime Prisma code does |

---

## Testing Checklist

### Pre-Migration Baseline
- [ ] Document current Prisma browser errors
- [ ] List all pages showing the error
- [ ] Verify current functionality before changes

### Post-Migration Verification
- [ ] `/clubs/[clubId]/matches` - Match list loads
- [ ] `/clubs/[clubId]/matches/[matchId]` - Single match loads
- [ ] `/clubs/[clubId]/matches/[matchId]/formation` - Formation loads
- [ ] `/clubs/[clubId]/matches/[matchId]/results` - Goals and results load
- [ ] `/clubs/[clubId]/matches/[matchId]/ratings` - Ratings load
- [ ] `/clubs/[clubId]/stats` - Statistics load
- [ ] `/clubs/[clubId]/players/[memberId]` - Player profile loads

### Regression Testing
- [ ] Create new match
- [ ] Update match details
- [ ] Cancel/uncancel match
- [ ] Start match
- [ ] End match
- [ ] Complete match
- [ ] Add goal
- [ ] Remove goal
- [ ] Assign rating
- [ ] Remove rating
- [ ] Bulk save ratings
- [ ] Save formation
- [ ] View player stats
- [ ] View club leaderboards

---

## Migration Order

### Priority Queue

1. **P0 - Critical Breaking**
   - `use-matches.ts` - Core functionality
   - `use-goals.ts` - Core functionality
   - `use-formation.ts` - Core functionality
   - `use-match-lifecycle.ts` - Match state transitions

2. **P1 - Important**
   - `use-player-ratings.ts` - Ratings feature
   - `use-statistics.ts` - Stats display
   - `use-player-participation.ts` - Participation tracking

3. **P2 - Supporting**
   - `use-rating-history.ts` - History charts
   - `use-player-evolution.ts` - Evolution charts
   - `use-rsvps.ts` - RSVP (stub, low priority)

---

## Notes & Context

### Technical Context
- Next.js 16.1.6 with App Router
- Prisma ORM with PostgreSQL
- React Query for server state management
- Server Actions for mutations (already partially implemented)

### Code Patterns

**Current (Broken) Pattern:**
```typescript
// hooks/use-matches.ts
import { getClubMatches } from '@/lib/db/matches'; // ❌ Imports Prisma

export function useMatches(clubId: string) {
  useEffect(() => {
    const matches = await getClubMatches(clubId); // Runs in browser, fails
  }, [clubId]);
}
```

**Target Pattern:**
```typescript
// hooks/use-matches.ts
import { getClubMatchesAction } from '@/lib/actions/matches'; // ✅ Server Action

export function useMatches(clubId: string) {
  useEffect(() => {
    const matches = await getClubMatchesAction(clubId); // ✅ Runs on server
  }, [clubId]);
}
```

### Existing Server Actions Reference

Already implemented (can be used as pattern reference):
- `lib/actions/matches.ts` - 4 actions implemented
- `lib/actions/goals.ts` - 2 actions implemented
- `lib/actions/ratings.ts` - 3 actions implemented
- `lib/actions/clubs.ts` - 3 actions implemented
- `lib/actions/formations.ts` - Check if exists
- `lib/actions/members.ts` - Members actions
- `lib/actions/invites.ts` - Invite actions

---

## Session Log

### 2025-02-27 - Initial Planning
**Activity:** Created comprehensive migration plan
**Files:** PLAN.md, STATE.md
**Notes:** Analyzed all hooks and DB modules. Identified 15 hooks needing migration and 9 DB modules needing Server Actions. Plan structured in 4 phases over ~10 hours of work.

---

## Quick Commands

```bash
# Start development server
npm run dev

# Run build to check for errors
npm run build

# Find all imports from lib/db in hooks
grep -r "from '@/lib/db" hooks/

# Find all hooks importing from lib/db
grep -l "from '@/lib/db" hooks/*.ts
```

---

## Resources

### Documentation
- PLAN.md - Full migration plan with task breakdown
- AGENTS.md - Project-specific coding guidelines

### Key Files
- `lib/db/index.ts` - Prisma client export (server-only!)
- `lib/actions/*.ts` - Server Actions (safe for client import)
- `hooks/*.ts` - React hooks (needs migration)

### Schema Reference
- `prisma/schema.prisma` - Database schema
- `types/database.ts` - TypeScript type definitions
