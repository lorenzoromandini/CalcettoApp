# Calcetto App - Session Resume Config

## Session Info
session_date: 2026-02-15
project: Calcetto Manager
phase: 2-team-management
phase_progress: ~30%
current_plan: 02-02 and 02-03 (Wave 2)

## Completed Plans
- Phase 1: All plans complete (01-01 to 01-07)
- Phase 2:
  - 02-01: Database schema ✓ (teams, players, invites, RLS)
  - 02-02: Team CRUD (in progress)
  - 02-03: Player management (in progress)

## Current State
- Auth: Supabase Auth (PKCE flow)
- DB: Supabase PostgreSQL + Prisma (if migrated) / Supabase
- Offline: IndexedDB + Service Worker (Workbox)
- i18n: next-intl (Italian/English)
- Theme: next-themes (dark/light)
- PWA: Next.js 15 manifest

## What's Next (Phase 2)
1. Complete 02-02: Team CRUD (create, list, team mode selection)
2. Complete 02-03: Player management (add, avatar crop, roles)
3. Wave 3: 02-04 - Invite system
4. Wave 4: 02-05 - Admin features
5. Wave 5: 02-06 - Integration and verification

## Prerequisites
- Supabase project linked
- Database migrated (supabase migrations applied)
- Node.js 20+

## Commands to Resume
# cd C:\CalcettoApp
# npm run dev
# Read .planning/STATE.md
# Read .planning/phases/02-team-management/
