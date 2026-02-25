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

### Category 2: Property Name Mismatches (CRITICAL) ⏳ IN PROGRESS
**Problem:** Mixing camelCase and snake_case property names

**Pattern:** Components expect `first_name` but get `firstName`, etc.

**Files affected (15+ files):**
- [ ] `app/[locale]/clubs/[clubId]/club-page-client.tsx` - `imageUrl` vs `image_url`
- [ ] `app/[locale]/clubs/clubs-page-client.tsx` - `memberCount` doesn't exist
- [ ] `app/[locale]/clubs/[clubId]/matches/[matchId]/match-detail-page-client.tsx` - `name`, `surname`, `nickname`, `avatar_url`
- [ ] `app/[locale]/clubs/[clubId]/matches/[matchId]/ratings/match-ratings-client.tsx` - Multiple property issues
- [ ] `app/[locale]/clubs/[clubId]/matches/[matchId]/results/match-results-client.tsx` - Type mismatch
- [ ] `app/[locale]/clubs/[clubId]/members/players-page-client.tsx` - `user.first_name` vs `user.firstName`
- [x] `app/api/clubs/me/route.ts` - `privilege` vs `privileges` ✅ FIXED
- [x] `components/matches/completed-match-detail.tsx` - Multiple property issues ✅ FIXED
  - Fixed scorer/assister: .name → .user.firstName, .surname → .user.lastName, .avatarUrl → .user.image
  - Removed clubId from Goal - schema doesn't have this field
  - Fixed rating properties: clubMember → direct properties (first_name, last_name, jersey_number)
- [ ] `components/dashboard/dashboard-player-card.tsx` - `DashboardPlayerData` not exported
- [ ] `components/matches/availability-counter.tsx` - `MatchMode` not exported

---

### Category 6: Database Operation Arguments (MEDIUM) ✅ COMPLETE
**Problem:** Wrong number of arguments or wrong property names

**Files affected:**
- [x] `app/api/clubs/[clubId]/invite/route.ts` - Line 30: Expected 2 arguments, got 3 ✅ FIXED
- [x] `app/api/clubs/[clubId]/members/[memberId]/role/route.ts` - Line 48: `privilege` vs `privileges` ✅ FIXED

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

### Session 1 - 2026-02-25 21:55
**Status:** Category 1 complete, started Category 2
**Files fixed:** 3/5 Category 1, 2/10 Category 2
**Uncommitted changes:** None (just committed)
**Notes:** Fixed completed-match-detail.tsx and match-detail-page-client.tsx with all property access issues. Major component now type-safe.

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
