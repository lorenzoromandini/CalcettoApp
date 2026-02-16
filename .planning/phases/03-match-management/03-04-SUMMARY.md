---
phase: 03-match-management
plan: 04
subsystem: formations
tags: [dnd-kit, drag-and-drop, tactical, mobile, touch]

# Dependency graph
requires:
  - phase: 03-03
    provides: RSVP system for player availability
  - phase: 03-02
    provides: Match CRUD operations
provides:
  - Formation builder with drag-and-drop
  - Tap-to-place alternative interaction
  - Formation presets for 5vs5 and 8vs8
  - Formation persistence to database
  - Touch-optimized UI (44px+ targets)
affects:
  - 04-live-match
  - formation-display
  - offline-sync

# Tech tracking
tech-stack:
  added: [@dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, sonner]
  patterns:
    - dnd-kit with custom sensors for mobile touch
    - Tap-to-place as accessibility alternative
    - Formation presets with position preservation
    - Grid-based pitch positioning (9x7)

key-files:
  created:
    - lib/formations/index.ts - Formation presets and utilities
    - lib/db/formations.ts - Database operations
    - hooks/use-formation.ts - Formation state management
    - components/formations/formation-selector.tsx - Preset selector
    - components/formations/pitch-grid.tsx - Visual pitch with drop zones
    - components/formations/player-pool.tsx - Draggable player list
    - components/formations/formation-builder.tsx - Main builder
    - app/[locale]/teams/[teamId]/matches/[matchId]/formation/page.tsx - Formation page
  modified:
    - messages/it.json - Italian translations
    - messages/en.json - English translations
    - components/ui/alert-dialog.tsx - Added shadcn component
    - components/ui/badge.tsx - Added shadcn component
    - components/ui/separator.tsx - Added shadcn component
    - components/ui/tabs.tsx - Added shadcn component
    - components/ui/textarea.tsx - Added shadcn component
    - components/ui/select.tsx - Added shadcn component
    - components/ui/avatar.tsx - Added shadcn component

key-decisions:
  - "Use @dnd-kit over react-beautiful-dnd for better touch support"
  - "Grid system (9x7) for responsive pitch positioning"
  - "Portrait orientation (3:4 ratio) optimized for mobile"
  - "Dual input: drag-and-drop + tap-to-place for accessibility"
  - "Preserve assignments when switching formation presets"

patterns-established:
  - "dnd-kit with TouchSensor (200ms delay) for mobile"
  - "Tap-to-place as drag-and-drop alternative"
  - "Magnetic snapping via grid positioning"
  - "Large touch targets (56px+) for pitch positions"
  - "Visual feedback during drag operations"

# Metrics
duration: 45min
completed: 2026-02-16
---

# Phase 3 Plan 4: Formation Builder Summary

**Formation builder with drag-and-drop and tap-to-place alternatives using @dnd-kit, featuring 9x7 grid positioning, magnetic snapping, and mobile-optimized touch targets (56px+).**

## Performance

- **Duration:** 45 min
- **Started:** 2026-02-16
- **Completed:** 2026-02-16
- **Tasks:** 4
- **Files modified:** 20

## Accomplishments

- Complete formation builder with virtual pitch visualization
- Drag-and-drop player positioning with @dnd-kit
- Tap-to-place alternative for mobile accessibility
- Formation presets for 5vs5 (1-2-1, 2-1-1, 1-1-2) and 8vs8 (3-3-1, 2-3-2, 3-2-2)
- Formation persistence to database with positions
- Mobile-optimized UI with 56px+ touch targets
- Magnetic snapping to grid positions
- Real-time formation completion status
- Drag overlay with player initials

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dnd-kit and create formation utilities** - `b72f221` (feat)
2. **Task 2: Create formation database operations and hook** - `ae13471` (feat)
3. **Task 3: Create formation builder components** - `23b32e5` (feat)
4. **Task 4: Create formation builder container and page** - `e4e28c3` (feat)

**Plan metadata:** (included in final state commit)

## Files Created/Modified

### Core Formation System
- `lib/formations/index.ts` - Formation presets, grid utilities, role colors
- `lib/db/formations.ts` - getFormation, saveFormation, deleteFormation
- `hooks/use-formation.ts` - Formation state management with optimistic updates

### Components
- `components/formations/formation-selector.tsx` - Formation preset dropdown
- `components/formations/pitch-grid.tsx` - Visual pitch with dnd-kit droppables
- `components/formations/player-pool.tsx` - Draggable player list
- `components/formations/formation-builder.tsx` - Main builder with dnd context

### Page
- `app/[locale]/teams/[teamId]/matches/[matchId]/formation/page.tsx` - Formation route

### UI Components Added
- `components/ui/alert-dialog.tsx` - Confirmation dialogs
- `components/ui/badge.tsx` - Status badges
- `components/ui/separator.tsx` - Visual separators
- `components/ui/tabs.tsx` - Tab navigation
- `components/ui/textarea.tsx` - Multi-line input
- `components/ui/select.tsx` - Dropdown selection
- `components/ui/avatar.tsx` - Player avatars

### Translations
- `messages/it.json` - Italian formation labels
- `messages/en.json` - English formation labels

## Decisions Made

- Used @dnd-kit instead of react-beautiful-dnd for superior touch support
- Implemented 9x7 grid system for precise responsive positioning
- Portrait orientation (3:4) optimized for mobile viewing
- Dual input methods: drag-and-drop + tap-to-place for accessibility
- Formation presets preserve existing assignments when switching
- TouchSensor with 200ms delay to distinguish from taps
- Large 56px touch targets for position markers
- Drag overlay shows player initials for visual feedback

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added missing shadcn components**
- **Found during:** Task 2
- **Issue:** Build failed due to missing alert-dialog, badge, separator, tabs, textarea components
- **Fix:** Added all missing shadcn/ui components via CLI
- **Files modified:** components/ui/*.tsx
- **Committed in:** ae13471

**2. [Rule 3 - Blocking] Installed sonner toast library**
- **Found during:** Task 2
- **Issue:** hooks/use-rsvps.ts imports 'sonner' which wasn't installed
- **Fix:** Installed sonner package
- **Files modified:** package.json, package-lock.json
- **Committed in:** ae13471

**3. [Rule 1 - Bug] Fixed pre-existing TypeScript type errors**
- **Found during:** Task 2
- **Issue:** Multiple type mismatches in existing codebase (Team mode, Match created_by, RSVP currentPlayerId)
- **Fix:** Added proper null handling and type conversions
- **Files modified:**
  - app/[locale]/teams/[teamId]/page.tsx
  - app/[locale]/teams/[teamId]/matches/[matchId]/match-detail-page-client.tsx
  - lib/db/matches.ts
- **Committed in:** ae13471

**4. [Rule 1 - Bug] Fixed match mode type conversion**
- **Found during:** Task 4
- **Issue:** Database stores mode as '5vs5' | '8vs8' but code assumed '5-a-side' format
- **Fix:** Removed incorrect conversion, use mode directly
- **Files modified:** app/[locale]/teams/[teamId]/matches/[matchId]/formation/page.tsx
- **Committed in:** e4e28c3

---

**Total deviations:** 4 auto-fixed (3 blocking, 1 bug)
**Impact on plan:** All fixes necessary for build to pass. No scope creep.

## Issues Encountered

- Pre-existing TypeScript type mismatches in codebase required fixes
- Missing shadcn components from previous plans needed installation
- Initial misunderstanding of match mode format (database uses '5vs5' not '5-a-side')

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Formation builder complete and ready for use
- Players can now build tactical formations for matches
- Foundation complete for live match tracking (Phase 4)
- Formation persistence ready for offline sync (future phase)

---
*Phase: 03-match-management*
*Completed: 2026-02-16*
