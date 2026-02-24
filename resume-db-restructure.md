# Database Restructure - Resume Document

## Status: IN PROGRESS

This document describes the state of the Prisma schema restructure project and provides instructions for continuing the work.

---

## What Has Been Completed

### 1. Prisma Schema Rewritten ✅
**File**: `prisma/schema.prisma`

The schema has been completely rewritten to match the AGENTS.md reference schema. Key changes:

#### ELIMINATED Models:
- ❌ **Player** - Removed entirely, data now lives in ClubMember
- ❌ **PlayerClub** - Removed entirely, data now lives in ClubMember
- ❌ **MatchPlayer** - Removed entirely (RSVP system eliminated)
- ❌ **Account** (NextAuth) - Removed
- ❌ **Session** (NextAuth) - Removed
- ❌ **VerificationToken** (NextAuth) - Removed

#### CHANGED Models:
- **Club**: Removed `syncStatus` field
- **ClubMember**: Now contains player data directly:
  - `privileges`: enum (MEMBER, MANAGER, OWNER) - was `privilege` (string)
  - `primaryRole`: enum (POR, DIF, CEN, ATT)
  - `secondaryRoles`: PlayerRole[]
  - `jerseyNumber`: Int
  - Removed `playerId` (Player model eliminated)
  - `userId`: now required (was optional)
- **Match**:
  - `mode`: enum (FIVE_V_FIVE, EIGHT_V_EIGHT, ELEVEN_V_ELEVEN) - was string
  - Removed `syncStatus`
  - Removed `homeFormation`/`awayFormation` relations
- **Formation**:
  - Added `isHome`: Boolean
  - Added `formationName`: String?
  - Removed `teamFormation`: Json
- **FormationPosition**:
  - Changed `playerId` to `clubMemberId`
  - Removed `side` field
  - Added `played`: Boolean
- **Goal**:
  - Removed `clubId` field
  - Changed `scorerId`/`assisterId` to reference ClubMember (was Player)
- **PlayerRating**:
  - Changed `playerId` to `clubMemberId`

#### NEW Enums (available from @prisma/client):
- `ClubPrivilege`: MEMBER, MANAGER, OWNER
- `PlayerRole`: POR, DIF, CEN, ATT
- `MatchMode`: FIVE_V_FIVE, EIGHT_V_EIGHT, ELEVEN_V_ELEVEN
- `MatchStatus`: SCHEDULED, IN_PROGRESS, FINISHED, COMPLETED, CANCELLED

### 2. Prisma Client Generated ✅
Run: `npx prisma generate` - Completed successfully

### 3. Type Definitions Updated ✅
**File**: `types/database.ts`

Completely rewritten to match the new schema structure with:
- Updated enum definitions
- New table structures
- Removed Player, PlayerClub, MatchPlayer types
- Updated relations to use clubMemberId instead of playerId

### 4. Database Layer Updated ✅
**Files Updated**:
- `lib/db/clubs.ts` - Updated to use ClubPrivilege enum, removed syncStatus
- `lib/db/matches.ts` - Updated to use MatchMode enum, removed syncStatus
- `lib/db/formations.ts` - Updated for new Formation/FormationPosition structure
- `lib/db/goals.ts` - Updated Goal to use ClubMember references
- `lib/db/player-ratings.ts` - Updated to use clubMemberId
- `lib/db/invites.ts` - Removed Player/PlayerClub references
- `lib/db/statistics.ts` - Updated to use ClubMember
- `lib/db/player-evolution.ts` - Updated to use clubMemberId
- `lib/db/match-lifecycle.ts` - Updated formation logic
- `lib/db/schema.ts` - Removed eliminated model exports
- `lib/db/index.ts` - Updated exports

**Files Deleted**:
- `lib/db/players.ts` - Player model eliminated
- `lib/db/rsvps.ts` - MatchPlayer model eliminated
- `lib/db/player-participation.ts` - MatchPlayer model eliminated

### 5. Validation Schemas Updated ✅
**Files Updated**:
- `lib/validations/player.ts` - Updated to use new PlayerRole enum values
- `lib/validations/match.ts` - Uses MatchMode enum (needs manual update for enum values)
- `lib/validations/goal.ts` - May need updates
- `lib/validations/rating.ts` - May need updates
- `lib/validations/club.ts` - May need updates

---

## What Still Needs To Be Done

### Priority 1: Fix Type Errors
There are still TypeScript errors related to enum imports from @prisma/client. The issue is that the generated client exports types differently.

**Fix**: In files importing enums, use this pattern:
```typescript
// Instead of:
import { MatchStatus, MatchMode } from '@prisma/client';

// Use:
import { MatchStatus, MatchMode, ClubPrivilege, PlayerRole } from '@prisma/client';
```

**Files to fix**:
- `lib/db/matches.ts` - Line 16: Import MatchStatus and MatchMode
- `lib/db/clubs.ts` - Import ClubPrivilege and PlayerRole
- `lib/db/formations.ts` - Check enum imports
- `lib/db/goals.ts` - Import MatchStatus
- `lib/db/player-ratings.ts` - Check enum imports
- `lib/db/statistics.ts` - Check enum imports
- `lib/db/player-evolution.ts` - Check enum imports
- `lib/db/invites.ts` - Check enum imports

### Priority 2: Update API Routes
**Directory**: `app/api/`

All API routes need to be updated to work with the new schema:

1. **Club Routes**:
   - `app/api/clubs/[clubId]/players/route.ts` - Remove or repurpose (no Player model)
   - `app/api/clubs/[clubId]/players/[playerId]/route.ts` - Change to use memberId
   - `app/api/clubs/[clubId]/players/[playerId]/add/route.ts` - Remove
   - `app/api/clubs/[clubId]/players/[playerId]/remove/route.ts` - Remove
   - `app/api/clubs/[clubId]/members/route.ts` - Update for new ClubMember structure
   - `app/api/clubs/[clubId]/members/[memberId]/route.ts` - Update
   - `app/api/clubs/[clubId]/members/[memberId]/role/route.ts` - Update to use ClubPrivilege enum
   - `app/api/clubs/[clubId]/setup-player/route.ts` - Update to create ClubMember with roles

2. **User Routes**:
   - `app/api/user/clubs/route.ts` - Remove Player/PlayerClub references
   - `app/api/user/jersey/route.ts` - Remove Player/PlayerClub references
   - `app/api/user/profile/route.ts` - Remove Player references
   - `app/api/auth/signup/route.ts` - Remove Player creation on signup

3. **Invite Routes**:
   - `app/api/invites/[token]/redeem/route.ts` - Remove Player references, create ClubMember directly
   - `app/api/invites/[token]/route.ts` - Verify functionality
   - `app/api/clubs/[clubId]/invite/route.ts` - Verify functionality

4. **Match Routes** (check all in `app/api/clubs/[clubId]/matches/`):
   - Update to use new MatchMode enum
   - Update formation endpoints for new Formation structure
   - Update goals endpoints for new Goal structure
   - Update ratings endpoints for new PlayerRating structure

### Priority 3: Update React Hooks
**Directory**: `hooks/`

- `use-players.ts` - Major rewrite to work with ClubMember
- `use-player-ratings.ts` - Change playerId to clubMemberId
- `use-player-participation.ts` - MatchPlayer eliminated, use FormationPosition
- `use-rsvps.ts` - MatchPlayer eliminated, reimplement or remove
- `use-formation.ts` - Change playerId to clubMemberId
- `use-statistics.ts` - Change playerId to clubMemberId
- `use-player-evolution.ts` - Change playerId to clubMemberId
- `use-rating-history.ts` - Change playerId to clubMemberId
- `use-matches.ts` - Update for MatchMode enum
- `use-goals.ts` - Update for new Goal structure

### Priority 4: Update Components
**Directory**: `components/`

Key components requiring updates:

- **Player Components** (`components/players/`):
  - `player-card.tsx` - Use ClubMember data
  - `player-form.tsx` - Update to new role enum (POR/DIF/CEN/ATT)
  - `role-selector.tsx` - Update to new role enum values

- **Formation Components** (`components/formations/`):
  - `player-pool.tsx` - Use ClubMember instead of Player
  - `formation-builder.tsx` - Change playerId to clubMemberId
  - `formation-selector.tsx` - Update for new formation structure
  - `pitch-grid.tsx` - Remove side references

- **Match Components** (`components/matches/`):
  - `goal-form.tsx` - Change scorer/assister to ClubMember
  - `goal-list.tsx` - Change player references
  - `player-rating-card.tsx` - Change playerId to clubMemberId
  - `player-participation-list.tsx` - MatchPlayer eliminated
  - `rsvp-list.tsx` - MatchPlayer eliminated
  - `rsvp-button.tsx` - MatchPlayer eliminated
  - `match-form.tsx` - Update mode to enum values
  - `availability-counter.tsx` - Remove MatchPlayer references

- **Club Components** (`components/clubs/`):
  - `setup-player-form.tsx` - Update to create ClubMember directly
  - `club-roster-manager.tsx` - Use ClubMember instead of Player

- **Statistics Components** (`components/statistics/`):
  - `player-stats-card.tsx` - Change playerId to clubMemberId
  - `player-leaderboard.tsx` - Change player references

- **Dashboard Components** (`components/dashboard/`):
  - `dashboard-player-card.tsx` - Change player references
  - `player-evolution-chart.tsx` - Change playerId to clubMemberId

### Priority 5: Update Pages
**Directory**: `app/[locale]/`

Update all pages that reference the old schema:
- Club pages
- Player pages (repurpose for ClubMember)
- Match pages (formations, ratings, results)
- Statistics pages

### Priority 6: Update Seed Script
**File**: `prisma/seed.ts`

Complete rewrite needed to:
- Remove Player creation
- Create ClubMembers with embedded player data
- Remove MatchPlayer references
- Update formation seeding for new structure

### Priority 7: Run Database Migration
Once all code is updated, run:
```bash
npx prisma migrate dev --name schema_restructure
```

**WARNING**: This will delete data from removed tables (Player, PlayerClub, MatchPlayer) and modify existing tables. Make sure you have backups if needed.

---

## Next Steps to Resume Work

1. **Fix enum imports** in database files
2. **Update API routes** one by one, testing as you go
3. **Update hooks** to work with new data structure
4. **Update components** (start with critical ones like player forms, formation builder)
5. **Update seed script** for development
6. **Run database migration**
7. **Test thoroughly** - the RSVP system needs to be rethought since MatchPlayer was eliminated

---

## Critical Notes

### ⚠️ Breaking Changes
1. **RSVP System Eliminated**: MatchPlayer model is gone. You'll need to implement a new RSVP system using FormationPosition or another approach.

2. **Player Data Consolidated**: Player info is now in ClubMember. User profile info comes from User model. There's no separate Player entity.

3. **Formation Changes**: Formations now have explicit home/away designations. FormationPositions link to ClubMember, not Player.

4. **Goal Scoring**: Goals now reference ClubMember directly, not Player.

### 🔧 Build Commands
```bash
# Generate Prisma client
npx prisma generate

# Check TypeScript errors
npx tsc --noEmit

# Run dev server
npm run dev

# Run database migration (when ready)
npx prisma migrate dev --name schema_restructure
```

### 🧪 Testing Checklist
- [ ] User signup works (no Player creation)
- [ ] Club creation works
- [ ] Invite redemption creates ClubMember correctly
- [ ] Club members can be viewed/updated
- [ ] Matches can be created/updated with new mode enum
- [ ] Formations can be created with new structure
- [ ] Goals can be recorded with new ClubMember references
- [ ] Ratings can be submitted with new ClubMember references
- [ ] Statistics calculate correctly

---

## Files Changed So Far

### Modified:
- `prisma/schema.prisma`
- `types/database.ts`
- `lib/db/clubs.ts`
- `lib/db/matches.ts`
- `lib/db/formations.ts`
- `lib/db/goals.ts`
- `lib/db/player-ratings.ts`
- `lib/db/invites.ts`
- `lib/db/statistics.ts`
- `lib/db/player-evolution.ts`
- `lib/db/match-lifecycle.ts`
- `lib/db/schema.ts`
- `lib/db/index.ts`
- `lib/validations/player.ts`

### Deleted:
- `lib/db/players.ts`
- `lib/db/rsvps.ts`
- `lib/db/player-participation.ts`

---

*Last updated: 2024-02-24*
*Status: Schema updated, database layer updated, validation schemas updated. API routes, hooks, components still need updating.*
