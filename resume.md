# Calcetto App - Session Resume Config

## Session Info
session_date: 2026-02-15
project: Calcetto Manager
phase: 1-foundation-auth
phase_progress: ~90%
current_plan: 01-07

## Completed Plans (Phase 1)
# 01-01 to 01-06: All completed

## Major Refactor (Feb 15)
- **Removed Supabase** - Too complex for self-hosted
- **Added NextAuth v5** - Simple JWT-based auth
- **Added Prisma** - Type-safe ORM for PostgreSQL
- **PostgreSQL** - Running in Docker (calcetto-db on port 5432)
- **Build fixed** - Node 20, Turbopack, async params

## Current State
- App builds successfully (npm run build ✓)
- Auth: NextAuth with credentials provider (email/password)
- DB: PostgreSQL + Prisma (schema pushed)
- Offline: IndexedDB + Service Worker (Workbox)
- i18n: next-intl (Italian/English)
- Theme: next-themes (dark/light)

## What's Next (Plan 01-07)
1. Integrate all providers in layouts
2. Create protected dashboard at /[locale]/dashboard
3. Add navigation header with theme/locale switchers
4. Final build verification
5. Human verification checkpoint

## Prerequisites Before Continuing
- PostgreSQL: docker run --name calcetto-db ... (already running)
- Database: npx prisma db push
- Node.js 20+ (installed)

## Commands to Resume
# cd /home/ubuntu/calcetto-app
# npm run dev
# Read .planning/STATE.md
# Read .planning/phases/01-foundation-auth/01-07-PLAN.md
