# Project State: Calcetto Manager

**Project:** Calcetto Manager  
**Core Value:** Enable groups of friends to organize, play, and track their football matches easily, with automatic statistics and shared ratings  
**Current Focus:** Phase 1 — Foundation & Auth  
**Last Updated:** 2026-02-15 (after Plan 02-01 completion)  

---

## Current Position

| Property | Value |
|----------|-------|
| **Phase** | 2 — Team Management |
| **Phase Goal** | Users can create and manage teams, add players, and organize match participants |
| **Plan** | 01 — Database Schema for Teams |
| **Status** | ✅ Complete |
| **Progress** | ~17% |

### Phase 2 Progress Bar

```
[██░░░░░░░░░░░░░░░░] ~17%
```

*Plan 01 ✅ Complete, Plan 02 ⏳ Pending, Plan 03 ⏳ Pending, Plan 04 ⏳ Pending, Plan 05 ⏳ Pending, Plan 06 ⏳ Pending*

---

## Project Reference

### Quick Links
- 📋 [Requirements](./REQUIREMENTS.md)
- 🗺️ [Roadmap](./ROADMAP.md)
- 📊 This file (STATE.md)
- 🔬 [Research Summary](./research/SUMMARY.md)

### Tech Stack (Confirmed)
| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | React 19 + Next.js 15 | Modern PWA foundation, Turbopack, Actions API |
| Backend | Supabase | BaaS with PostgreSQL, Auth, Storage, Realtime |
| Offline | idb + Workbox | IndexedDB wrapper, Service Worker management |
| Styling | Tailwind CSS 4.x + shadcn/ui | Mobile-first, accessible components |
| Real-time | Supabase Realtime (SSE) | Better than WebSockets for mobile |

### v1 Requirements Summary
- **Total:** 68 requirements
- **Categories:** 10 (AUTH, TEAM, MATCH, LIVE, STAT, RATE, DASH, SOCL, OFFL, UIUX)
- **Coverage:** 100% mapped to 8 phases

---

## Phase Status Overview

| Phase | Goal | Requirements | Status | Progress |
|-------|------|--------------|--------|----------|
| 1 | Foundation & Auth | 14 | 🟢 Complete | 100% |
| 2 | Team Management | 10 | 🟡 In Progress | 17% |
| 3 | Match Management | 14 | 🔴 Not Started | 0% |
| 4 | Live Match Experience | 8 | 🔴 Not Started | 0% |
| 5 | Post-Match Statistics | 9 | 🔴 Not Started | 0% |
| 6 | Player Ratings | 6 | 🔴 Not Started | 0% |
| 7 | Dashboard & Leaderboards | 8 | 🔴 Not Started | 0% |
| 8 | Social & Sharing | 4 | 🔴 Not Started | 0% |

**Overall:** 2/68 requirements complete (~3%)

---

## Decisions Log

| Date | Decision | Rationale | Status |
|------|----------|-----------|--------|
| 2026-02-13 | React 19 + Next.js 15 | Latest stable, Turbopack, PWA support | ✅ Confirmed |
| 2026-02-13 | Supabase over Firebase | PostgreSQL, better offline support | ✅ Confirmed |
| 2026-02-13 | SSE over WebSockets | Better mobile reliability, auto-reconnect | ✅ Confirmed |
| 2026-02-13 | Offline-first architecture | Must work pitch-side with poor connectivity | ✅ Confirmed |
| 2026-02-13 | @supabase/ssr library | Official SSR support per RESEARCH.md Pattern 3 | ✅ Confirmed |
| 2026-02-13 | PKCE OAuth flow | Most secure for SPAs, no client secret needed | ✅ Confirmed |
| 2026-02-13 | Middleware session refresh | Server Components read-only, middleware handles refresh | ✅ Confirmed |
| 2026-02-14 | idb library for IndexedDB | Promise-based API with TypeScript support | ✅ Confirmed |
| 2026-02-14 | Workbox CDN for SW | Simpler than bundling, all features available | ✅ Confirmed |
| 2026-02-14 | NetworkFirst with 60s TTL for live data | Never serve stale match scores (Pitfall #4) | ✅ Confirmed |
| 2026-02-14 | BackgroundSyncPlugin for mutations | Automatic retry when connection restored | ✅ Confirmed |
| 2026-02-14 | sync_status field on all entities | Track local vs server state for conflict resolution | ✅ Confirmed |
| 2026-02-14 | react-hook-form + Zod for auth forms | Type-safe validation, Italian error messages, mobile-optimized | ✅ Confirmed |
| 2026-02-14 | Next.js 15 built-in manifest.ts | Automatic PWA manifest generation at /manifest.webmanifest | ✅ Confirmed |
| 2026-02-14 | Sharp for icon generation | Programmatic SVG-to-PNG for consistent MVP icons | ✅ Confirmed |
| 2026-02-14 | next-intl v4 for i18n | Built-in Next.js 15 support, App Router optimized | ✅ Confirmed |
| 2026-02-14 | Italian as default locale | Primary market is Italy, English as fallback | ✅ Confirmed |
| 2026-02-14 | next-themes with data-theme | Tailwind v4 compatible, system detection built-in | ✅ Confirmed |
| 2026-02-14 | Client-side onboarding persistence | localStorage flag avoids server complexity, resets per device | ✅ Confirmed |
| 2026-02-15 | Multi-team player support via junction table | Players can belong to multiple teams with different jersey numbers | ✅ Confirmed |
| 2026-02-15 | Soft delete pattern for teams | Preserve match history when teams are "deleted" | ✅ Confirmed |
| 2026-02-15 | SECURITY DEFINER helper functions | Reusable RLS authorization logic with better query planning | ✅ Confirmed |
| 2026-02-15 | Unique jersey numbers per team | Constraint prevents duplicates within team, allows across teams | ✅ Confirmed |

---

## Open Questions

| Question | Blocking | Context |
|----------|----------|---------|
| SSE reconnection behavior on iOS? | No | Phase 4 needs testing on Safari mobile |
| Conflict resolution for offline edits? | No | Phase 6 needs event sourcing decision |
| ~Service Worker caching strategy?~ | ~No~ | ~Resolved: StaleWhileRevalidate pages, CacheFirst static, NetworkOnly mutations, NetworkFirst live data~ |

---

## Known Blockers

**None currently.** All prerequisites met:
- ✅ Requirements defined
- ✅ Research complete
- ✅ Tech stack confirmed
- ✅ Roadmap created

---

## Accumulated Context

### From Plan 01-04 (PWA Manifest and Assets)

**Implemented:**
- ✅ PWA manifest at `app/manifest.ts` with MetadataRoute.Manifest export
- ✅ App icons in required sizes: 192x192, 512x512, apple-touch-icon (180x180)
- ✅ Favicon for browser tabs
- ✅ Offline fallback page at `/offline` with retry functionality
- ✅ Layout updated with viewport config, theme-color meta, and manifest link
- ✅ Italian (it) set as primary language

**Key Files for Future Phases:**
- `app/manifest.ts` - Update for new PWA features or app metadata changes
- `public/icons/` - Replace with branded icons when available
- `app/offline/page.tsx` - Customize offline message or add offline functionality

**Patterns Established:**
- Next.js 15 manifest.ts automatically generates `/manifest.webmanifest`
- Theme color (#22c55e green) for football field association
- Offline page uses 'use client' for interactivity (retry button)
- Programmatic icon generation with Sharp for consistent branding

### From Plan 01-06 (Theme, i18n, and Onboarding)

**Implemented:**
- ✅ next-intl configuration with Italian (default) and English locales
- ✅ Locale routing with /it/ and /en/ prefixes, middleware chaining with auth
- ✅ next-themes integration with system detection and manual toggle
- ✅ Dark/light theme CSS variables with data-theme attribute
- ✅ 4-step onboarding tutorial with localStorage persistence
- ✅ Complete translation files for navigation, auth, common, onboarding, theme, home

**Key Files for Future Phases:**
- `lib/i18n/routing.ts` - Add new locales here
- `lib/i18n/navigation.ts` - Use Link, useRouter from here for locale-aware navigation
- `messages/it.json` / `messages/en.json` - Add new translations here
- `hooks/use-onboarding.ts` - Reuse for feature-specific onboarding flows
- `components/theme-toggle.tsx` - Reuse in navigation/header components

**Patterns Established:**
- Locale routing: All routes under `/[locale]/` with redirects from root
- Theme switching: next-themes with data-theme attribute for Tailwind v4
- Onboarding: localStorage flag with useOnboarding hook for persistence
- Translations: Nested JSON structure with feature-based keys (auth, navigation, onboarding)

### From Plan 01-05 (Authentication UI)

**Implemented:**
- ✅ Zod validation schemas with Italian error messages (login, signup, forgot-password, reset-password)
- ✅ Auth form components using react-hook-form with zodResolver
- ✅ Login form with email/password and Supabase signInWithPassword
- ✅ Signup form with confirmation email flow and success state
- ✅ Google OAuth button with PKCE flow and offline access_type
- ✅ Complete auth pages: login, signup, forgot-password, reset-password, auth-code-error
- ✅ Mobile-optimized forms with 48px touch targets

**Key Files for Future Phases:**
- `lib/validations/auth.ts` - Use for auth form validation
- `components/auth/login-form.tsx` - Import for custom login flows
- `components/auth/social-buttons.tsx` - Reuse GoogleSignInButton
- `app/auth/login/page.tsx` - Reference for auth page layout

**Patterns Established:**
- Auth forms use react-hook-form + zodResolver + shadcn/ui
- Italian error messages for all user-facing validation
- Mobile-first: h-12 inputs (48px), centered layout, large touch targets
- Success states built into forms without page navigation

### From Plan 01-03 (Offline Infrastructure)

**Implemented:**
- ✅ IndexedDB schema with Team, Player, Match entities and sync_status
- ✅ Offline action queue with retry logic and error handling
- ✅ Workbox Service Worker with precaching and runtime caching
- ✅ Background Sync for automatic mutation retry
- ✅ NetworkFirst with 60s TTL for /live/* routes (Pitfall #4 prevention)
- ✅ OfflineBanner component showing connection status
- ✅ useOfflineQueue hook for tracking sync state

**Key Files for Future Phases:**
- `lib/db/actions.ts` - Use `saveTeam()`, `savePlayer()`, `saveMatch()`, `queueOfflineAction()`
- `hooks/use-offline-queue.ts` - Listen for `SYNC_COMPLETE` messages
- `components/offline-banner.tsx` - Show in root layout for offline status
- `components/service-worker-register.tsx` - Include in root layout

**Patterns Established:**
- All entities have `sync_status: 'synced' | 'pending' | 'error'`
- Offline actions queued with timestamp and retry_count
- SW sends `SYNC_COMPLETE` message to clients after successful sync

### From Research (Critical for Phase 1)

**Architecture Must-Haves:**
1. ✅ Service Worker with Workbox (don't roll your own) - DONE
2. ✅ IndexedDB via `idb` library for offline storage - DONE
3. ✅ Network-first for live data, cache-first for static assets - DONE
4. ✅ NEVER cache real-time match data in SW - DONE (60s TTL on /live/*)
5. ✅ Background sync for queued actions - DONE

**Pitfalls to Avoid (Phase 1):**
- ✅ Pitfall #4: Service Worker caching live match data - SOLVED
- Pitfall #3: Offline-first without conflict resolution (deferred to Phase 6)

**Critical for Mobile:**
- ✅ App shell caching for instant loads - DONE (precacheAndRoute)
- ✅ Offline indicator in UI - DONE (OfflineBanner component)
- ✅ Graceful degradation when offline - DONE (queueOfflineAction)

### Stack Decisions Rationale

**Why Supabase over Firebase?**
- PostgreSQL with row-level security
- Better query capabilities for statistics
- Realtime with SSE (better mobile behavior)
- Self-hostable if needed later

**Why React 19 + Next.js 15?**
- Actions API simplifies mutations
- useOptimistic for offline UI
- Turbopack for fast dev iteration
- Built-in PWA capabilities

### From Plan 02-01 (Team Management Database Schema)

**Implemented:**
- ✅ Database migration with 5 tables: teams, team_members, players, player_teams, team_invites
- ✅ RLS policies with helper functions: is_team_admin, is_team_member, is_player_in_team
- ✅ Multi-team player support via player_teams junction table
- ✅ IndexedDB schema v2 with player_teams, team_members, team_invites stores
- ✅ TypeScript types for all database tables

**Key Files for Future Phases:**
- `supabase/migrations/20260215000001_teams_players_invites.sql` - Database schema reference
- `types/database.ts` - TypeScript types for Supabase queries
- `lib/db/schema.ts` - IndexedDB schema and TypeScript interfaces
- `lib/db/index.ts` - Database initialization (DB_VERSION = 2)

**Patterns Established:**
- Junction tables for many-to-many relationships (team_members, player_teams)
- Soft delete pattern with deleted_at column for data preservation
- SECURITY DEFINER functions for efficient RLS checks
- Player profiles are team-agnostic; jersey numbers in player_teams junction
- Unique constraints enforce jersey number uniqueness per team

---

## Session Continuity

### Last Session
- **Date:** 2026-02-15
- **Activity:** Executed Plan 02-01 (Team Management Database Schema) - 3 tasks, 4 files created
- **Outcome:** Complete database schema with RLS, multi-team player support, IndexedDB v2, TypeScript types

### Next Session
- **Command:** `/gsd-execute-phase 02` to run Plan 02-02 (Team Creation UI)
- **Goal:** Implement team creation forms and UI components
- **Expected Output:** Team creation page with form validation and offline support

### Context for Claude
When resuming this project:
1. Read this STATE.md first
2. Check current phase status
3. Read ROADMAP.md for phase goals and success criteria
4. Read 02-01-SUMMARY.md for database schema details
5. Run `/gsd-execute-phase 02` to continue with Plan 02

---

## Metrics & Health

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Load Time | <2s | — | ⏳ Pending |
| Offline Functionality | Full | — | ⏳ Pending |
| Test Coverage | 80%+ | — | ⏳ Pending |
| Lighthouse PWA Score | 90+ | — | ⏳ Pending |

---

## Notes

### Mobile-First Reminder
Every feature must be designed for smartphone use first:
- Touch targets 44px minimum
- One-handed operation where possible
- Works in bright sunlight (high contrast)
- Works with wet fingers (large hit areas)
- No hover-dependent interactions

### Offline-First Reminder
Every feature must work without connectivity:
- Cache critical data locally
- Queue mutations for sync
- Show offline status clearly
- Handle sync conflicts gracefully
- Never lose user data

### GDPR Compliance (Ongoing)
- Privacy policy required
- Data deletion capability
- User consent for notifications
- Minimal data collection principle

---

*State file created: 2026-02-13*  
*Next update: After Phase 1 planning completes*
