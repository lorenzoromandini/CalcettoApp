---
phase: 04-match-results-ratings
plan: "05"
subsystem: ratings
tags: [ratings, validation, ui, hooks, i18n, decimal]

requires:
  - phase: 04-match-results-ratings/04-04
    provides: played=true flag for rateable players
provides:
  - 38-value rating scale with decimal storage
  - Rating CRUD operations with validation
  - Rating UI components (selector, card, list)
  - Ratings page for match
affects: [statistics, player-profiles]

tech-stack:
  added: []
  patterns:
    - Decimal storage for nuanced ratings (6.25, 6.5, 6.75)
    - Two-part selector for mobile UX
    - Optimistic updates with rollback

key-files:
  created:
    - lib/rating-utils.ts
    - lib/db/player-ratings.ts
    - lib/validations/rating.ts
    - hooks/use-player-ratings.ts
    - components/matches/rating-selector.tsx
    - components/matches/player-rating-card.tsx
    - components/matches/ratings-list.tsx
    - app/[locale]/teams/[teamId]/matches/[matchId]/ratings/page.tsx
    - app/[locale]/teams/[teamId]/matches/[matchId]/ratings/match-ratings-client.tsx
  modified:
    - messages/it.json
    - messages/en.json

key-decisions:
  - "Store ratings as Decimal(3,2) for easy averaging, map to display strings"
  - "Two-part selector (base + modifier) for better mobile UX"
  - "Only FINISHED matches can be rated, COMPLETED matches are read-only"
  - "Only players with played=true can be rated"

patterns-established:
  - "Rating conversion: string ↔ decimal (6- → 6.25, 6+ → 6.75)"
  - "Optimistic updates with toast notifications"
  - "Progress tracking: rated/played count"

duration: 23 min
completed: 2026-02-17
---

# Phase 4 Plan 05: Player Ratings Summary

**38-value rating scale with Italian school-style grading, decimal storage, and optional comments per player**

## Performance

- **Duration:** 23 min
- **Started:** 2026-02-17T18:54:56Z
- **Completed:** 2026-02-17T19:18:07Z
- **Tasks:** 9
- **Files modified:** 11

## Accomplishments

- Implemented 38-value rating scale (1-10 with -, +, .5 modifiers)
- Created rating utilities with decimal conversion functions
- Built player rating CRUD with admin/played/finished validation
- Created RatingSelector with two-part mobile-friendly UI
- Built PlayerRatingCard with collapsible comments
- Created RatingsList with average display and ranking
- Added ratings page with edit/read-only modes

## Task Commits

Each task was committed atomically:

1. **Task 1: Rating utility constants** - `87208ef` (feat)
2. **Task 2: Player rating CRUD** - `6957b2c` (feat)
3. **Task 3: Rating validation schema** - `cf0b840` (feat)
4. **Task 4: usePlayerRatings hook** - `346034c` (feat)
5. **Task 5: RatingSelector component** - `83e4109` (feat)
6. **Task 6: PlayerRatingCard component** - `88a750d` (feat)
7. **Task 7: RatingsList component** - `54eed9f` (feat)
8. **Task 8: Ratings page** - `13ad7bf` (feat)
9. **Task 9: Translations** - `b408879` (feat)

**Plan metadata:** Pending

## Files Created/Modified

- `lib/rating-utils.ts` - Rating constants and conversion functions (38 values, decimal mapping)
- `lib/db/player-ratings.ts` - CRUD operations with validation (upsertPlayerRating, getMatchRatings, etc.)
- `lib/validations/rating.ts` - Zod schemas for rating validation
- `hooks/use-player-ratings.ts` - React hook with optimistic updates
- `components/matches/rating-selector.tsx` - Two-part selector for rating input
- `components/matches/player-rating-card.tsx` - Card for rating a single player
- `components/matches/ratings-list.tsx` - Read-only ratings list with average
- `app/[locale]/teams/[teamId]/matches/[matchId]/ratings/page.tsx` - Server component
- `app/[locale]/teams/[teamId]/matches/[matchId]/ratings/match-ratings-client.tsx` - Client component
- `messages/it.json` - Italian translations for ratings
- `messages/en.json` - English translations for ratings

## Decisions Made

- **Decimal storage**: Store ratings as DECIMAL(3,2) for easy averaging (6.0, 6.25, 6.5, 6.75)
- **Two-part selector**: Base (1-10) + modifier (''/'-'/'+'/'.5') for better mobile UX vs single dropdown with 38 values
- **10's limited modifiers**: Only '' and '-' for 10 (no 10+ or 10.5)
- **FINISHED vs COMPLETED**: Ratings editable only in FINISHED state, read-only in COMPLETED

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Rating system fully functional for FINISHED matches
- Ratings page accessible at `/teams/[teamId]/matches/[matchId]/ratings`
- Ready for Phase 5 (Post-Match Statistics) to aggregate ratings

---

## Self-Check: PASSED

**Created files verified:**
- ✅ lib/rating-utils.ts
- ✅ lib/db/player-ratings.ts
- ✅ lib/validations/rating.ts
- ✅ hooks/use-player-ratings.ts
- ✅ components/matches/rating-selector.tsx
- ✅ components/matches/player-rating-card.tsx
- ✅ components/matches/ratings-list.tsx
- ✅ app/[locale]/teams/[teamId]/matches/[matchId]/ratings/page.tsx
- ✅ app/[locale]/teams/[teamId]/matches/[matchId]/ratings/match-ratings-client.tsx

**Commits verified:**
- ✅ 87208ef - feat(04-05): create rating utility constants
- ✅ 6957b2c - feat(04-05): create player rating CRUD operations
- ✅ cf0b840 - feat(04-05): create rating validation schema
- ✅ 346034c - feat(04-05): create usePlayerRatings hook
- ✅ 83e4109 - feat(04-05): create RatingSelector component
- ✅ 88a750d - feat(04-05): create PlayerRatingCard component
- ✅ 54eed9f - feat(04-05): create RatingsList component
- ✅ 13ad7bf - feat(04-05): create Ratings page
- ✅ b408879 - feat(04-05): add translations for ratings UI

---

*Phase: 04-match-results-ratings*
*Completed: 2026-02-17*
