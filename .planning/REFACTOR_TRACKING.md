# Codebase Refactor Tracking

**Started:** 2026-02-25
**Goal:** Fix Critical TypeScript Errors (Option A)
**Branch:** db-restructure
**Total Errors:** ~100+ TypeScript errors

---

## Current Status

### Overall Progress: 0% Complete
### Phase: Analysis Complete, Ready to Begin Fixes

---

## Critical Error Categories

### Category 1: ClubPrivilege String Comparisons (HIGH) ⏳ IN PROGRESS
**Problem:** Using string literals `'owner'`, `'manager'`, `'member'` instead of enum values

**Files affected:**
- [x] `app/api/clubs/[clubId]/invite/route.ts` - Line 23 ✅ FIXED
- [x] `app/api/clubs/[clubId]/members/[memberId]/route.ts` - Lines 23, 45 ✅ FIXED
- [x] `app/api/clubs/[clubId]/members/[memberId]/role/route.ts` - Lines 24, 41, 49 ✅ FIXED (also fixed `privilege` → `privileges`)
- [x] `app/api/clubs/[clubId]/cleanup-test-members/route.ts` - Line 24 ✅ ALREADY CORRECT
- [x] `app/[locale]/clubs/[clubId]/roster/page.tsx` - Lines 301, 310, 317 ✅ FIXED (also updated handlePrivilegeChange function type)

**Fix:** Replace `'owner'` with `ClubPrivilege.OWNER`, etc.
**Started:** 2026-02-25

---

### Category 2: Property Name Mismatches (CRITICAL)
**Problem:** Mixing camelCase and snake_case property names

**Pattern:** Components expect `first_name` but get `firstName`, etc.

**Files affected (15+ files):**
- [ ] `app/[locale]/clubs/[clubId]/club-page-client.tsx` - `imageUrl` vs `image_url`
- [ ] `app/[locale]/clubs/clubs-page-client.tsx` - `memberCount` doesn't exist
- [ ] `app/[locale]/clubs/[clubId]/matches/[matchId]/match-detail-page-client.tsx` - `name`, `surname`, `nickname`, `avatar_url`
- [ ] `app/[locale]/clubs/[clubId]/matches/[matchId]/ratings/match-ratings-client.tsx` - Multiple property issues
- [ ] `app/[locale]/clubs/[clubId]/matches/[matchId]/results/match-results-client.tsx` - Type mismatch
- [ ] `app/[locale]/clubs/[clubId]/members/players-page-client.tsx` - `user.first_name` vs `user.firstName`
- [ ] `app/api/clubs/me/route.ts` - `privilege` vs `privileges`
- [ ] `components/matches/completed-match-detail.tsx` - Multiple property issues
- [ ] `components/dashboard/dashboard-player-card.tsx` - Module export issues
- [ ] `lib/db/matches.ts` - `scheduledAt` vs `scheduled_at`

---

### Category 3: Missing Properties in Types (HIGH)
**Problem:** Types don't match actual database structure

**Files affected:**
- [ ] `app/api/auth/login/route.ts` - `emailVerified` doesn't exist
- [ ] `app/api/auth/signup/route.ts` - `emailVerified` and `player` don't exist
- [ ] `app/api/user/clubs/route.ts` - `player` and `playerClub` don't exist
- [ ] `app/api/user/profile/route.ts` - `playerProfile` and `playerClub` don't exist
- [ ] `components/clubs/club-dashboard.tsx` - `sync_status` doesn't exist

---

### Category 4: Formation/Player ID Issues (MEDIUM)
**Problem:** `playerId` vs `clubMemberId` mismatch

**Files affected:**
- [ ] `app/[locale]/clubs/[clubId]/matches/[matchId]/match-detail-page-client.tsx` - Lines 645, 659
- [ ] `app/[locale]/clubs/[clubId]/matches/[matchId]/formation/page.tsx` - Type issues

---

### Category 5: Missing/Incorrect Module Exports (MEDIUM)
**Problem:** Modules import things that don't exist

**Files affected:**
- [ ] `app/[locale]/clubs/[clubId]/matches/[matchId]/ratings/match-ratings-client.tsx` - `@/lib/db/player-participation` doesn't exist
- [ ] `components/dashboard/dashboard-player-card.tsx` - `DashboardPlayerData` not exported
- [ ] `components/matches/availability-counter.tsx` - `MatchMode` not exported

---

### Category 6: Database Operation Arguments (MEDIUM)
**Problem:** Wrong number of arguments or wrong property names

**Files affected:**
- [ ] `app/api/clubs/[clubId]/invite/route.ts` - Line 30: Expected 2 arguments, got 3
- [ ] `app/api/clubs/[clubId]/members/[memberId]/role/route.ts` - Line 48: `privilege` vs `privileges`

---

## Working Notes

### Root Cause
The codebase is in transition from old schema (with `player`, `team`, snake_case) to new schema (with `clubMember`, `club`, camelCase). Some parts are updated, others still reference old structure.

### Strategy
1. Fix Category 1 (ClubPrivilege) - Simple string replacements
2. Fix Category 4 (Formation IDs) - Simple renames
3. Fix Categories 2-3 together - Requires understanding the actual data flow
4. Fix Categories 5-6 - Remove stubs or update exports

### Blockers
None yet

---

## Session Log

### Session 1 - 2026-02-25 20:53
**Status:** Analysis complete, tracking file created
**Next:** Start fixing Category 1 (ClubPrivilege comparisons)
**Uncommitted changes:** None
**Notes:** ~100 TypeScript errors found across ~30 files. Ready to begin fixes.

### Session 1 - 2026-02-25 21:06
**Status:** In progress - Category 1
**Files fixed:** 1/5
**Uncommitted changes:** `app/api/clubs/[clubId]/invite/route.ts`
**Notes:** Fixed ClubPrivilege enum comparisons. Also fixed createInvite call (removed maxUses parameter that no longer exists in schema).

---

## Quick Resume Guide

If you need to stop and resume:

1. Check this file for current progress
2. Look at the last entry in "Session Log"
3. Check git status: `git status`
4. Check uncommitted changes: `git diff`
5. Resume from the next unchecked item above

---

## Commands to Run

```bash
# Check TypeScript errors
cd /home/ubuntu/projects/CalcettoApp
npx tsc --noEmit 2>&1 | grep ".ts(" | wc -l

# Check specific error patterns
npx tsc --noEmit 2>&1 | grep "ClubPrivilege"
npx tsc --noEmit 2>&1 | grep "does not exist"

# Build to see all errors
npm run build 2>&1 | head -100
```

---

## Files Modified So Far

*(Will be updated as work progresses)*
