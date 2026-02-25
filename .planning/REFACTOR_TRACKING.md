# Codebase Refactor Tracking

**Started:** 2026-02-25
**Goal:** Fix Critical TypeScript Errors (Option A)
**Branch:** db-restructure
**Total Errors:** ~12 remaining (down from ~100)

---

## Current Status

### Overall Progress: ~85% Complete

### Categories Completed:
1. ✅ Category 1: ClubPrivilege String Comparisons (5 files)
2. ✅ Category 6: Database Operation Arguments (2 files)

---

## Completed Fixes

### Category 1: ClubPrivilege String Comparisons (COMPLETE)
- [x] `app/api/clubs/[clubId]/invite/route.ts` - Line 23
- [x] `app/api/clubs/[clubId]/members/[memberId]/route.ts` - Lines 23, 45
- [x] `app/api/clubs/[clubId]/members/[memberId]/role/route.ts` - Lines 24, 41, 49
- [x] `app/api/clubs/[clubId]/cleanup-test-members/route.ts` - Line 24
- [x] `app/[locale]/clubs/[clubId]/roster/page.tsx` - Lines 301, 310, 317

### Category 2: Property Name Mismatches (IN PROGRESS)
- [x] `app/api/clubs/me/route.ts` - `privilege` vs `privileges`
- [x] `components/matches/completed-match-detail.tsx` - Multiple property issues
- [x] `components/dashboard/dashboard-player-card.tsx` - `DashboardPlayerData` type
- [x] `lib/db/schema.ts` - Added `MatchMode` export
- [x] `app/[locale]/clubs/clubs-page-client.tsx` - `memberCount`
- [x] `app/api/clubs/route.ts` - Debug logging type issue

### Category 3: Missing Properties (COMPLETE)
- [x] `app/api/auth/login/route.ts` - Removed `emailVerified` check
- [x] `app/api/auth/signup/route.ts` - Removed `player` creation

### Category 6: Database Operation Arguments (COMPLETE)
- [x] `app/api/clubs/[clubId]/invite/route.ts` - maxUses parameter
- [x] `app/api/clubs/[clubId]/members/[memberId]/role/route.ts` - `privilege` vs `privileges`

---

## Remaining Issues (12 errors)

### app/api/user/clubs/route.ts (2 errors)
- [ ] Line 30: Property 'player' does not exist
- [ ] Line 40: Property 'playerClub' does not exist

### app/api/user/profile/route.ts (10 errors)
- [ ] Lines 57, 60, 61, 63, 82, 88: Property 'playerProfile' does not exist
- [ ] Lines 62, 82, 88: Property 'player' does not exist
- [ ] Lines 104, 114, 119: Property 'playerClub' does not exist

---

## Working Notes

### Root Cause
The codebase is in transition from old schema (with `player`, `team`, snake_case) to new schema (with `clubMember`, `club`, camelCase).

### Strategy Applied
1. ✅ Category 1: String replacements for ClubPrivilege
2. ✅ Category 2: Property naming standardization (camelCase)
3. ✅ Category 3: Remove references to old schema fields
4. ⏳ Category 4-5: Remaining API route cleanup

### Key Decisions
- Club/ClubMember naming now consistent
- Removed Player/PlayerClub references (tables don't exist)
- Email verification feature removed (field doesn't exist in schema)
- Goal home/away filtering disabled (clubId not in Goal model)

---

## Session Log

### Session 1 - 2026-02-25
**Status:** Started Category 1
**Files fixed:** 5 ClubPrivilege enum comparisons

### Session 2 - 2026-02-25
**Status:** Category 2 progress
**Files fixed:** 10+ property naming issues across components
**Remaining:** 12 errors in user API routes

---

## Commands to Run

```bash
# Check remaining TypeScript errors
cd /home/ubuntu/projects/CalcettoApp
npx tsc --noEmit 2>&1 | grep "app.*\.ts(" | wc -l

# Check specific errors
npx tsc --noEmit 2>&1 | grep "playerProfile\|playerClub\|does not exist" | head -20

# Build to see remaining issues
npm run build 2>&1 | head -50
```

---

## Files Modified So Far

- app/api/clubs/[clubId]/invite/route.ts
- app/api/clubs/[clubId]/members/[memberId]/route.ts
- app/api/clubs/[clubId]/members/[memberId]/role/route.ts
- app/api/clubs/[clubId]/roster/page.tsx
- app/api/clubs/me/route.ts
- app/api/clubs/route.ts
- app/api/auth/login/route.ts
- app/api/auth/signup/route.ts
- app/api/user/clubs/route.ts (in progress)
- app/api/user/profile/route.ts (in progress)
- components/matches/completed-match-detail.tsx
- components/dashboard/dashboard-player-card.tsx
- app/[locale]/clubs/clubs-page-client.tsx
- lib/validations/match.ts
- lib/db/schema.ts
- hooks/use-clubs.ts
