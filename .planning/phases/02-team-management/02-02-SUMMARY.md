# Plan 02-02 Summary: Team CRUD

**Phase:** 02-team-management  
**Plan:** 02  
**Wave:** 2  
**Status:** ✅ Complete  
**Date:** 2026-02-15

---

## Objective

Implement team creation and listing functionality with offline-first support. Enables users to create teams and view their team list with proper role assignment and team mode selection.

---

## What Was Implemented

### Core Features
1. **Team Creation Form**
   - Name field (2-100 characters, required)
   - Description field (optional, max 500 characters)
   - Team mode selector with 3 options: 5-a-side, 8-a-side, 11-a-side
   - Form validation with Italian error messages
   - Mobile-friendly touch targets (48px+)

2. **Team List Page**
   - Displays all user's teams with loading skeleton
   - Empty state with CTA for first-time users
   - Team cards showing name, description, mode badge, member count
   - "Create Team" button with navigation

3. **Data Layer**
   - `lib/db/teams.ts` - Full CRUD operations with Supabase integration
   - `hooks/use-teams.ts` - React hooks for data fetching and mutations
   - Offline-first: IndexedDB caching with automatic sync
   - Admin role auto-assignment on team creation

### New Files Created

```
lib/validations/team.ts          # Zod schemas with Italian validation messages
hooks/use-teams.ts               # React hooks: useTeams, useTeam, useCreateTeam, etc.
components/teams/team-form.tsx   # Reusable team creation form
components/teams/team-card.tsx   # Team list item component
app/[locale]/teams/page.tsx      # Teams list page
app/[locale]/teams/teams-page-client.tsx  # Client component for teams list
app/[locale]/teams/create/page.tsx        # Create team page
app/[locale]/teams/create/create-team-page-client.tsx  # Client component for creation
```

### Modified Files

```
lib/db/schema.ts                 # Added 11-a-side to TeamMode type
lib/validations/team.ts          # Added 11-a-side to teamModeEnum
lib/validations/player.ts        # Fixed roles schema (removed default)
lib/db/actions.ts                # Fixed getPlayersByTeam to use proper junction table query
types/database.ts                # Added 11-a-side to team_mode enum
messages/it.json                 # Added team translations (IT)
messages/en.json                 # Added team translations (EN)
```

---

## Key Design Decisions

### 11-a-side Support
Added 11-a-side as a third team mode option in addition to 5-a-side and 8-a-side, as requested. This required updates to:
- Schema types
- Database types
- Validation enums
- UI components
- Translation files

### Mobile-First Design
- 48px minimum touch targets throughout
- Stacked form layout for easy one-handed use
- Large team mode selector buttons with clear visual feedback
- Skeleton loading states for better perceived performance

### Offline-First Architecture
- All team data cached in IndexedDB
- Mutations queued when offline via `queueOfflineAction`
- Automatic sync when connection restored
- Loading states show cached data immediately while fetching updates

### Type Safety
- Full TypeScript coverage for all new code
- Proper type inference from Zod schemas
- Generic hooks with proper return types

---

## Technical Details

### Team Mode Options
```typescript
type TeamMode = '5-a-side' | '8-a-side' | '11-a-side'
```

### Team Creation Flow
1. User fills form and selects team mode
2. Form validates with Zod schema
3. `createTeam()` creates team + admin membership in IndexedDB
4. If online: syncs to Supabase immediately
5. If offline: queues for background sync
6. User redirected to new team page on success

### Routes Added
- `GET /[locale]/teams` - List all user's teams
- `GET /[locale]/teams/create` - Create new team form

---

## Testing Checklist

- [x] Build passes (`npm run build`) with no TypeScript errors
- [x] Team creation form validates inputs correctly
- [x] All 3 team modes selectable (5/8/11-a-side)
- [x] Created team appears immediately in list
- [x] Creator assigned admin role automatically
- [x] Teams persist in IndexedDB when offline
- [x] Translations work in both Italian and English
- [x] Mobile-responsive with 48px+ touch targets
- [x] Empty state displays when no teams exist
- [x] Loading skeleton shown during fetch

---

## Success Criteria Met

✅ Team creation form accepts name, description, team mode  
✅ Created team appears in user's team list immediately  
✅ Creator is assigned admin role automatically  
✅ Teams cached offline and sync when online  
✅ UI is mobile-responsive with 48px+ touch targets  
✅ All text is translated (IT/EN)  
✅ Build completes successfully  

---

## Known Issues / TODOs

1. **Player count on team cards** - Currently hardcoded to 1, needs to query actual member count
2. **Team detail page** - Route `/teams/[teamId]` referenced but not yet implemented (will be in 02-03)
3. **Team editing** - Update functionality implemented but no UI yet

---

## Dependencies Installed

```bash
npm install @supabase/ssr
```

---

## Next Steps

Proceed to **Plan 02-03: Player Management**
- Player creation form
- Avatar upload with cropper
- Role assignment (goalkeeper, defender, midfielder, attacker)
- Jersey number assignment
