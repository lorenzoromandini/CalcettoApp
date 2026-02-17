# Calcetto App - Session Resume Config

## Session Info
session_date: 2026-02-17
project: Calcetto Manager
phase: 06-rating-trends-history
phase_progress: 0% (0/3 plans)
current_plan: None (phase not started)

## Project Overview
- **Overall:** 5/8 phases complete (62.5%)
- **Phase 1:** Foundation & Auth - Complete ✓
- **Phase 2:** Team Management - Complete ✓
- **Phase 3:** Match Management - Complete ✓
- **Phase 4:** Match Results & Ratings - Complete ✓
- **Phase 5:** Post-Match Statistics - Complete ✓
- **Phase 6:** Rating Trends & History - Not Started

## Completed Plans
- Phase 1: All plans complete (01-01 to 01-07)
- Phase 2: All plans complete (02-01 to 02-06)
- Phase 3: All plans complete (03-01 to 03-06)
- Phase 4: All plans complete (04-01 to 04-06)
- Phase 5: All plans complete (05-01 to 05-03)
  - 05-01: Schema (side field) + RoleSelector + Statistics module ✓
  - 05-02: Player profile + Team stats page (7 leaderboards) ✓
  - 05-03: Navigation + clickable player cards + match history scorers ✓

## Phase 5: Post-Match Statistics (Complete ✓)
**Goal:** Users can view individual player statistics and team leaderboards (top 3)

**Implemented:**
- FormationPosition.side field for home/away team tracking
- RoleSelector redesigned: primary role (required) + other roles (optional)
- Player statistics: goals, assists, appearances, wins, losses, draws
- Goals conceded: only for players with 'goalkeeper' role playing in GK position
- 7 leaderboards (top 3 each): scorers, assists, appearances, wins, losses, MVP, best GK
- Player profile pages accessible from Roster
- Match history cards show scorers with goal counts

**Key Files:**
- lib/db/statistics.ts - 9 aggregation functions
- hooks/use-statistics.ts - usePlayerStats, useTeamLeaderboards
- components/statistics/player-stats-card.tsx
- components/statistics/player-leaderboard.tsx
- app/[locale]/teams/[teamId]/stats/page.tsx
- app/[locale]/teams/[teamId]/players/[playerId]/page.tsx

## Phase 6: Rating Trends & History (Next)
**Goal:** Users can view rating evolution and trends over time

**Requirements:**
- RATE-04: Rating history per player
- RATE-06: Trend visualization (charts)

## Current Tech Stack
- Auth: NextAuth.js with Prisma
- DB: Prisma + PostgreSQL
- Offline: IndexedDB + Service Worker (Workbox)
- i18n: next-intl (Italian/English)
- Theme: next-themes (dark/light)
- PWA: Next.js 15 manifest
- Real-time: SSE for live updates
- Notifications: Web Push with VAPID keys
- Statistics: Prisma aggregations with $queryRaw

## What's Next
1. ✅ Phase 1: Foundation & Auth - Complete
2. ✅ Phase 2: Team Management - Complete
3. ✅ Phase 3: Match Management - Complete
4. ✅ Phase 4: Match Results & Ratings - Complete
5. ✅ Phase 5: Post-Match Statistics - Complete
6. Phase 6: Rating Trends & History - NOT STARTED
   - Next: /gsd-plan-phase 6
7. Phase 7: Dashboard & Leaderboards
8. Phase 8: Social & Sharing

## Prerequisites
- PostgreSQL database
- Node.js 20+
- VAPID keys configured in .env.local (for push notifications)

## Commands to Resume
```bash
cd C:\CalcettoApp\CalcettoApp
npm run dev
# Read .planning/STATE.md
# Plan next: /gsd-plan-phase 6
```

## Key Files Created This Session
- prisma/schema.prisma (FormationPosition.side field)
- lib/db/statistics.ts (9 aggregation functions)
- lib/db/match-lifecycle.ts (setPositionSides helper)
- hooks/use-statistics.ts
- components/statistics/player-stats-card.tsx
- components/statistics/player-leaderboard.tsx
- components/players/role-selector.tsx (redesigned)
- app/[locale]/teams/[teamId]/stats/page.tsx
- app/[locale]/teams/[teamId]/players/[playerId]/page.tsx
