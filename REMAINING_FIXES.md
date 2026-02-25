# Remaining TypeScript Fixes - Database Restructure

This document tracks all files that still need fixes following the database restructure from the old schema to the new unified schema.

## Overview

**Total Files:** 22

---

## API Routes (15 files)

### 1. app/api/auth/login/route.ts
**Issue:** Remove `emailVerified` references
- The new schema doesn't have `emailVerified` field in User model
- Update login logic to not reference this field

### 2. app/api/auth/signup/route.ts
**Issue:** Remove `player`/`playerClub` references
- Old schema created player profile during signup
- New schema uses ClubMember instead - remove old player creation logic

### 3. app/api/clubs/[clubId]/admin/route.ts
**Issue:** Change `privilege` to `privileges`
- Field renamed from singular `privilege` to plural `privileges` in ClubMember model
- Update all references to use `privileges`

### 4. app/api/clubs/[clubId]/cleanup-test-members/route.ts
**Issue:** Change `privilege` to `privileges`
- Field renamed from singular `privilege` to plural `privileges` in ClubMember model
- Update all references to use `privileges`

### 5. app/api/clubs/[clubId]/debug-members/route.ts
**Issue:** Change `privilege` to `privileges`
- Field renamed from singular `privilege` to plural `privileges` in ClubMember model
- Update all references to use `privileges`

### 6. app/api/clubs/[clubId]/invite/route.ts
**Issues:**
1. Change `privilege` to `privileges` in ClubMember references
2. Fix `invite.useCount`/`maxUses` references
   - New schema doesn't have `useCount` or `maxUses` fields on ClubInvite
   - Remove or replace with new token-based invite logic

### 7. app/api/clubs/[clubId]/members/[memberId]/role/route.ts
**Issue:** Change `privilege` to `privileges`
- Field renamed from singular `privilege` to plural `privileges` in ClubMember model
- Update role/privilege update logic

### 8. app/api/clubs/[clubId]/members/[memberId]/route.ts
**Issue:** Change `privilege` to `privileges`
- Field renamed from singular `privilege` to plural `privileges` in ClubMember model
- Update member management logic

### 9. app/api/clubs/me/route.ts
**Issue:** Change `privilege` to `privileges`
- Field renamed from singular `privilege` to plural `privileges` in ClubMember model
- Update club membership queries

### 10. app/api/invites/[token]/route.ts
**Issues:**
1. Fix `expiresAt` null check
   - New schema allows `expiresAt` to be nullable
   - Ensure proper null handling
2. Remove `useCount`/`maxUses` references
   - New schema doesn't track invite usage counts
   - Simplify to single-use token logic

### 11. app/api/user/clubs/route.ts
**Issue:** Remove `player`/`playerClub` references
- Old schema queried player profile and playerClub memberships
- New schema uses ClubMember - update queries accordingly

### 12. app/api/user/profile/route.ts
**Issue:** Remove `playerProfile` references
- Old schema returned player profile data
- New schema uses ClubMember - remove player-specific fields

---

## Components (7 files)

### 13. components/clubs/club-dashboard.tsx
**Issue:** Remove `sync_status` references
- New schema doesn't have `sync_status` field on Club
- Remove sync-related UI and logic

### 14. components/dashboard/dashboard-player-card.tsx
**Issue:** Fix `DashboardPlayerData` import
- Type import path or definition needs updating
- Verify type matches new schema structure

### 15. components/matches/availability-counter.tsx
**Issue:** Fix `MatchMode` import
- Import path or enum reference needs correction
- Verify MatchMode enum values match new schema

### 16. components/matches/completed-match-detail.tsx
**Issues:**
1. Fix `goal.clubId` reference
   - New Goal model doesn't have `clubId` field
   - Goals are linked to ClubMember via `scorerId`/`assisterId`
2. Fix player property references
   - Update to use ClubMember structure

### 17. components/matches/match-detail-page-client.tsx
**Issues:**
1. Fix member property references
   - Update to use ClubMember structure instead of old Player
2. Fix `formationPosition.playerId` reference
   - New FormationPosition uses `clubMemberId` not `playerId`

### 18. components/matches/ratings/match-ratings-client.tsx
**Issue:** Fix `player_id` references
- Update to use `clubMemberId` instead of `player_id`
- MatchPlayerRating now references ClubMember

### 19. components/matches/results/match-results-client.tsx
**Issue:** Fix `members` prop type
- Update type definition to match new ClubMember structure
- Ensure all member property references are updated

---

## Pages (3 files)

### 20. app/[locale]/clubs/clubs-page-client.tsx
**Issue:** Fix `memberCount`
- Update how member counts are calculated or displayed
- New schema may require different aggregation approach

---

## Deprecated Player Routes (4 additional files)

These files reference the old Player system that has been replaced by ClubMember:

### 21. app/api/clubs/[clubId]/players/route.ts
**Issues:**
- Cannot find module `@/lib/auth-token`
- Cannot find module `@/lib/db/players` (old players database layer)
- Cannot find module `@/lib/validations/player`
- **Action:** Remove or migrate to ClubMember-based endpoints

### 22. app/[locale]/clubs/[clubId]/players/page.tsx
**Issue:** Cannot find module `./players-page-client`
- Page imports non-existent client component
- **Action:** Remove or redirect to new members page

### 23. app/[locale]/clubs/[clubId]/players/players-page-client.tsx
**Issues:**
- Cannot find module `@/components/ui/button`
- Cannot find module `@/components/players/player-card` (old component)
- Cannot find module `@/hooks/use-players` (old hook)
- Cannot find module `@/hooks/use-clubs`
- Cannot find module `@/components/ui/card`
- **Action:** Remove - replaced by members system

### 24. app/[locale]/clubs/[clubId]/players/[playerId]/page.tsx
**Issues:**
- Cannot find module `@/lib/db/players` (old database layer)
- Cannot find module `./player-profile-client`
- **Action:** Remove or redirect to member profile

---

## Summary by Category

| Category | Count | Main Issue Types |
|----------|-------|------------------|
| API Routes | 15 | `privilege`→`privileges`, remove old player refs, fix invite fields |
| Components | 7 | Import fixes, player→clubMember refs, sync_status removal |
| Pages | 3 | Member counting, club data structure |

---

## Common Patterns to Fix

1. **`privilege` → `privileges`** (9 files)
   - Most common change across API routes
   - Simple field rename in ClubMember model

2. **Remove old Player/PlayerProfile references** (5 files)
   - Signup, user clubs, user profile routes affected
   - Replace with ClubMember queries

3. **Fix invite fields** (2 files)
   - Remove `useCount`, `maxUses`
   - Handle nullable `expiresAt`

4. **Update component type imports** (3 files)
   - DashboardPlayerData, MatchMode types

5. **Fix goal/match references** (3 files)
   - `clubId` on Goal removed
   - `playerId` → `clubMemberId` in FormationPosition
   - `player_id` → `clubMemberId` in ratings

---

## Notes

- All fixes should align with the LOCKED Prisma schema defined in AGENTS.md
- Do NOT modify the schema - only fix application code to match
- Test each file after fixing to ensure functionality is preserved
- Consider creating shared types for common structures to reduce duplication
