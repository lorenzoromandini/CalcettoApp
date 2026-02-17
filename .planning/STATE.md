# Project State: Calcetto Manager

**Project:** Calcetto Manager  
**Core Value:** Enable groups of friends to organize, play, and track their football matches easily, with automatic statistics and shared ratings  
**Current Focus:** Phase 3 — Match Management  
**Last Updated:** 2026-02-17 (Phase 3 Match Management complete)  

---

## Current Position

| Property | Value |
|----------|-------|
| **Phase** | 3 — Match Management |
| **Phase Goal** | Users can schedule matches, track RSVPs, and build tactical formations |
| **Plan** | 05 — Push Notification Reminders |
| **Status** | ✅ Complete |
| **Progress** | 100% |

### Phase 3 Progress Bar

```
[████████████████████] 100%
```

*Plan 01 ✅ Complete, Plan 02 ✅ Complete, Plan 03 ✅ Complete, Plan 04 ✅ Complete, Plan 05 ✅ Complete*

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
| 2 | Team Management | 10 | 🟢 Complete | 100% |
| 3 | Match Management | 14 | 🟢 Complete | 100% |
| 4 | Live Match Experience | 8 | 🔴 Not Started | 0% |
| 5 | Post-Match Statistics | 9 | 🔴 Not Started | 0% |
| 6 | Player Ratings | 6 | 🔴 Not Started | 0% |
| 7 | Dashboard & Leaderboards | 8 | 🔴 Not Started | 0% |
| 8 | Social & Sharing | 4 | 🔴 Not Started | 0% |

**Overall:** 14/68 requirements complete (~21%)

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
| 2026-02-15 | Match mode limited to 5vs5 and 8vs8 | Aligns with team_mode from Phase 2, simplifies formation options | ✅ Confirmed |
| 2026-02-15 | Scheduled_at uses TIMESTAMPTZ | Combined date/time with timezone for accurate scheduling | ✅ Confirmed |
| 2026-02-15 | One formation per match via UNIQUE(match_id) | Simplifies data model, formations are match-specific | ✅ Confirmed |
| 2026-02-15 | Grid coordinates (0-9 x, 0-6 y) for pitch | Integer grid enables responsive pitch visualization | ✅ Confirmed |
| 2026-02-15 | RSVP status enum (in/out/maybe) | Clear availability tracking with Italian-friendly labels | ✅ Confirmed |
| 2026-02-16 | @dnd-kit for drag-and-drop | Better touch support than react-beautiful-dnd, modern API | ✅ Confirmed |
| 2026-02-16 | Dual input: drag-and-drop + tap-to-place | Essential for mobile accessibility, works with wet fingers | ✅ Confirmed |
| 2026-02-16 | 9x7 grid for pitch positioning | Enables magnetic snapping, responsive across screen sizes | ✅ Confirmed |
| 2026-02-17 | VAPID for web push authentication | Industry standard, prevents unauthorized push servers | ✅ Confirmed |
| 2026-02-17 | Permission request after first match | Better UX than immediate request, user sees value first | ✅ Confirmed |
| 2026-02-17 | One subscription per user (simplified) | Covers 95% of use cases, reduces complexity | ✅ Confirmed |

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

### From Plan 02-02 (Team CRUD)

**Implemented:**
- ✅ Team creation form with validation (name, description, team mode)
- ✅ Support for 3 team modes: 5-a-side, 8-a-side, and 11-a-side
- ✅ Team list page with loading states and empty state
- ✅ Team card component with team mode badge and member count
- ✅ useTeams hook for data fetching with offline fallback
- ✅ useCreateTeam, useUpdateTeam, useDeleteTeam mutation hooks
- ✅ Complete translations (IT/EN) for team management UI
- ✅ Admin role auto-assignment on team creation
- ✅ Offline-first support with IndexedDB caching

**Key Files:**
- `lib/validations/team.ts` - Zod schemas with Italian error messages
- `lib/db/teams.ts` - CRUD operations with offline queue integration
- `hooks/use-teams.ts` - React hooks for team data management
- `components/teams/team-form.tsx` - Reusable team creation form
- `components/teams/team-card.tsx` - Team list item component
- `app/[locale]/teams/page.tsx` - Team list page
- `app/[locale]/teams/create/page.tsx` - Team creation page

**New Routes:**
- `/[locale]/teams` - List user's teams
- `/[locale]/teams/create` - Create new team

### From Plan 02-03 (Player Management)

**Implemented:**
- ✅ Player creation form with avatar upload and cropping
- ✅ react-easy-crop integration for client-side avatar cropping
- ✅ Multi-role selector (goalkeeper, defender, midfielder, attacker)
- ✅ Jersey number input with validation
- ✅ Player list page with player cards showing avatar, name, roles
- ✅ Player card component with jersey number badge
- ✅ usePlayers hook for player data management
- ✅ Complete translations (IT/EN) for player management UI
- ✅ Multi-team player support via player_teams junction table
- ✅ Avatar upload to Supabase Storage with 95% JPEG quality

**Key Files:**
- `lib/validations/player.ts` - Zod schemas for player validation
- `lib/db/players.ts` - Player CRUD with multi-team support
- `lib/image-utils.ts` - Canvas-based image cropping utilities
- `hooks/use-players.ts` - React hooks for player data
- `components/players/player-form.tsx` - Player creation/editing form
- `components/players/player-card.tsx` - Player list item component
- `components/players/avatar-cropper.tsx` - Avatar cropping UI
- `components/players/role-selector.tsx` - Multi-select role component
- `app/[locale]/teams/[teamId]/players/page.tsx` - Player list page
- `app/[locale]/teams/[teamId]/players/create/page.tsx` - Add player page

**New Routes:**
- `/[locale]/teams/[teamId]/players` - List team players
- `/[locale]/teams/[teamId]/players/create` - Add new player to team

### From Plan 02-04 (Invite System)

**Implemented:**
- ✅ Invite generation with secure SHA256-like tokens (32-char hex)
- ✅ Configurable max uses (1-100) and 7-day expiration
- ✅ WhatsApp sharing with pre-filled Italian/English message
- ✅ Email sharing with subject/body templates
- ✅ Copy to clipboard with visual feedback
- ✅ Invite redemption page with token validation
- ✅ All states handled: loading, invalid, unauthenticated, success, already-member
- ✅ Team settings page with admin-only invite generator
- ✅ Duplicate join prevention

**Key Files:**
- `lib/db/invites.ts` - Invite CRUD operations and join logic
- `components/teams/invite-generator.tsx` - Invite generation UI with slider
- `app/[locale]/teams/invite/page.tsx` - Invite redemption page
- `app/[locale]/teams/[teamId]/settings/page.tsx` - Team settings with invite management

**New Routes:**
- `/[locale]/teams/invite?token=xxx` - Join team via invite link
- `/[locale]/teams/[teamId]/settings` - Team settings (admin only)

**Patterns Established:**
- Token-based invites with expiration and usage tracking
- Social sharing integration (WhatsApp, Email)
- Query param token validation on public pages
- Admin-only settings pages with role checks

### From Plan 02-05 (Team Admin Features)

**Implemented:**
- ✅ Member management functions: getTeamMembers, updateMemberRole, removeTeamMember, transferOwnership
- ✅ Team roster manager with role selection (member/co-admin/admin)
- ✅ Member removal with confirmation dialogs
- ✅ Role-based UI (admin/co-admin see controls, members see read-only)
- ✅ Roster page with Players/Members tabs
- ✅ Cannot remove admin without ownership transfer
- ✅ Hard delete for memberships (no soft delete needed)

**Key Files:**
- `lib/db/teams.ts` - Member management functions (lines 469-609)
- `components/teams/team-roster-manager.tsx` - Roster management UI
- `app/[locale]/teams/[teamId]/roster/page.tsx` - Team roster page with tabs

**New Routes:**
- `/[locale]/teams/[teamId]/roster` - Team roster with players and members

**Patterns Established:**
- Role hierarchy: admin > co-admin > member
- Confirmation dialogs for destructive actions
- Tab-based organization for related content
- Inline role editing with button toggle
- "You" label for current user identification

---

### From Plan 03-02 (Match CRUD Operations)

**Implemented:**
- ✅ Match validation schemas with Italian error messages (createMatchSchema, updateMatchSchema)
- ✅ Database operations with offline-first support (createMatch, getTeamMatches, getMatch, updateMatch, cancelMatch, uncancelMatch)
- ✅ React hooks: useMatches, useMatch, useCreateMatch, useUpdateMatch, useCancelMatch
- ✅ Match form component with datetime-local picker, location, mode selector
- ✅ Match card component with date box, status badges, mode display
- ✅ Match list page with upcoming/past tabs and admin-only create button
- ✅ Match creation page with admin access control
- ✅ Match detail page with edit, cancel, uncancel actions
- ✅ Complete Italian/English translations for match UI

**Key Files for Future Phases:**
- `lib/validations/match.ts` - Validation schemas for match forms
- `lib/db/matches.ts` - Match CRUD operations with offline support
- `hooks/use-matches.ts` - React hooks for match data management
- `components/matches/match-form.tsx` - Reusable match creation/editing form
- `components/matches/match-card.tsx` - Match list item component
- `app/[locale]/teams/[teamId]/matches/page.tsx` - Match list with tabs
- `app/[locale]/teams/[teamId]/matches/create/page.tsx` - Create match page
- `app/[locale]/teams/[teamId]/matches/[matchId]/page.tsx` - Match detail page

**Patterns Established:**
- datetime-local input for native mobile date/time picker
- Min date validation prevents scheduling in the past
- Mode selector with large touch targets (72px)
- Client-side admin checks for role-based UI
- Tab-based separation (upcoming vs past matches)
- AlertDialog for destructive action confirmation
- Date box component: month abbreviation + day number

---

### From Plan 03-03 (RSVP System)

**Implemented:**
- ✅ RSVP database operations with real-time support (lib/db/rsvps.ts)
  - updateRSVP() with upsert logic for IN/OUT/Maybe responses
  - getMatchRSVPs() with player details and status sorting
  - getRSVPCounts() for efficient aggregation
  - getMyRSVP() for current user's status
  - subscribeToRSVPs() using Supabase Realtime
- ✅ RSVP React hooks with optimistic updates (hooks/use-rsvps.ts)
  - useRSVPs() with real-time subscription
  - useRSVPCounts() derived from RSVP data
  - useUpdateRSVP() with toast notifications
  - useUpdateRSVPWithOptimistic() for instant UI feedback
  - useMyRSVP() for current player status
  - useRSVPData() combined hook for all state
- ✅ RSVP UI components
  - RSVPButton: Three-state segmented button with color coding
  - AvailabilityCounter: Progress bar with status colors
  - RSVPList: Grouped player responses with avatars
- ✅ Integrated RSVP system into match detail page
  - Availability counter prominently displayed
  - RSVP button for current player
  - RSVP list with real-time updates
  - Mobile-optimized touch targets (48px+)
- ✅ Complete Italian/English translations for RSVP features

**Key Files for Future Phases:**
- `lib/db/rsvps.ts` - RSVP CRUD operations with offline queue
- `hooks/use-rsvps.ts` - React hooks for RSVP management
- `components/matches/rsvp-button.tsx` - Three-state RSVP button
- `components/matches/rsvp-list.tsx` - Grouped RSVP list
- `components/matches/availability-counter.tsx` - Availability counter

**Patterns Established:**
- Optimistic updates: Update UI immediately, rollback on error
- Real-time subscriptions: supabase.channel() with postgres_changes
- Derived state: Calculate counts from array to avoid double-fetch
- Three-state UI: IN (green), OUT (red), MAYBE (yellow)
- Progress bar with color coding based on fill percentage
- Grouped lists with visual separation and counters
- Time formatting: "2 hours ago" style relative timestamps

**Requirements Covered:**
- MATCH-04: Player RSVP assignment (IN/OUT/Maybe) ✅
- MATCH-05: Availability count display ✅

---

### From Plan 03-01 (Match Management Database Schema)

**Implemented:**
- ✅ Database migration with 4 tables: matches, match_players, formations, formation_positions
- ✅ RLS policies with helper functions: is_match_admin, is_match_participant
- ✅ IndexedDB schema v3 with match_players, formations, formation_positions stores
- ✅ TypeScript types for all match-related tables
- ✅ Match mode support: 5vs5 and 8vs8 with CHECK constraints
- ✅ RSVP tracking with status: in, out, maybe
- ✅ Formation grid positioning with 0-9 x, 0-6 y coordinates

**Key Files for Future Phases:**
- `supabase/migrations/20260215000002_matches_rsvps_formations.sql` - Database schema reference
- `lib/db/schema.ts` - Match, MatchPlayer, Formation, FormationPosition interfaces
- `lib/db/index.ts` - DB_VERSION 3 with match management stores
- `types/database.ts` - Supabase types for match queries

**Patterns Established:**
- Match scheduling: matches table with scheduled_at TIMESTAMPTZ
- RSVP pattern: match_players junction with rsvp_status enum
- Formation builder: JSONB team_formation + formation_positions grid
- Match authorization: is_match_admin() checks team membership via match.team_id
- Substitute tracking: is_substitute boolean on formation_positions

---

### From Plan 03-05 (Push Notification Reminders)

**Implemented:**
- ✅ Database migration for push subscriptions, notification preferences, and notification logs
- ✅ Web Push API integration with VAPID authentication (public/private keys)
- ✅ Service Worker push event handler with notification display
- ✅ Service Worker notification click handler with action buttons (confirm/view)
- ✅ React hook `useNotifications` for permission management and preferences
- ✅ Permission request UI component (non-intrusive bottom banner)
- ✅ Italian/English translations for notification features
- ✅ Database function `get_users_for_match_reminder()` for scheduled queries
- ✅ VAPID keys configured in .env.local

**Key Files for Future Phases:**
- `supabase/migrations/20260215000003_push_subscriptions.sql` - Push notification tables
- `lib/notifications/push.ts` - Push subscription utilities
- `hooks/use-notifications.ts` - Notification state management
- `components/notifications/permission-request.tsx` - Permission request UI
- `app/sw.ts` - Push event and notification click handlers

**Patterns Established:**
- Request notification permission after user demonstrates value (creates/joins match)
- VAPID authentication for secure web push
- Service Worker handles push events with action buttons
- Granular notification preferences (24h, 2h, 30m reminders)
- Database-driven notification scheduling with helper function

**Requirements Covered:**
- MATCH-10: Push notification reminders before match ✅

---

### From Plan 03-04 (Formation Builder)

**Implemented:**
- ✅ @dnd-kit integration for drag-and-drop with touch support
- ✅ Formation presets for 5vs5 (1-2-1 Diamante, 2-1-1 Piramide, 1-1-2 Attacco)
- ✅ Formation presets for 8vs8 (3-3-1 Bilanciato, 2-3-2 Offensivo, 3-2-2 Difensivo)
- ✅ Formation database operations (getFormation, saveFormation, deleteFormation)
- ✅ useFormation hook with optimistic updates
- ✅ FormationSelector component with preset dropdown
- ✅ PitchGrid component with visual pitch and drop zones
- ✅ PlayerPool component with draggable players
- ✅ FormationBuilder container with dnd-kit context
- ✅ Tap-to-place alternative interaction mode
- ✅ Formation page at `/teams/[teamId]/matches/[matchId]/formation`
- ✅ Touch-optimized UI (56px+ targets, 200ms touch delay)
- ✅ Magnetic snapping via 9x7 grid positioning
- ✅ Formation persistence with position assignments

**Key Files for Future Phases:**
- `lib/formations/index.ts` - Formation presets, grid utilities, role colors
- `lib/db/formations.ts` - Formation CRUD operations
- `hooks/use-formation.ts` - Formation state management
- `components/formations/formation-builder.tsx` - Main formation builder
- `components/formations/pitch-grid.tsx` - Visual pitch with dnd-kit droppables
- `components/formations/player-pool.tsx` - Draggable player list
- `app/[locale]/teams/[teamId]/matches/[matchId]/formation/page.tsx` - Formation page

**Patterns Established:**
- dnd-kit with TouchSensor (200ms delay) for mobile
- Tap-to-place as drag-and-drop alternative
- Grid-based positioning (9 columns x 7 rows)
- Portrait orientation (3:4 ratio) for mobile
- Preserve assignments when switching formation presets
- Drag overlay with player initials
- Visual feedback during drag operations

**Requirements Covered:**
- MATCH-03: Formation module based on match mode ✅
- MATCH-06: Drag-and-drop formation builder ✅
- MATCH-06-alt: Tap-to-place interaction ✅

---

## Session Continuity

### Last Session
- **Date:** 2026-02-17
- **Activity:** Executed Plan 03-05 (Push Notification Reminders)
- **Outcome:** 
  - Created database schema for push subscriptions and notification preferences
  - Implemented Web Push API with VAPID authentication
  - Added push event handlers to Service Worker
  - Created useNotifications hook for permission management
  - Built PermissionRequest UI component
  - Configured VAPID keys in environment
  - Plan 03-05 SUMMARY.md created
  - Phase 3 complete: 100% (5 of 5 plans)

### Next Session
- **Status:** Phase 3 Complete
- **Action:** Execute Phase 4: Live Match Experience
- **When ready:** Run `/gsd-plan-phase 04` to plan next phase

### Context for Claude
When resuming this project:
1. Read this STATE.md first
2. Check current phase status
3. Read ROADMAP.md for phase goals and success criteria
4. Read 03-05-SUMMARY.md for push notification details
5. Run `/gsd-plan-phase 04` to start next phase

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
- ✅ User consent for notifications (implemented in 03-05)
- Minimal data collection principle

### Phase 3 Completion Notes
All Match Management requirements implemented:
- MATCH-01: Match scheduling with date/time/location
- MATCH-02: Match listing with upcoming/past separation  
- MATCH-03: Formation module with presets for 5vs5/8vs8
- MATCH-04: RSVP system with IN/OUT/Maybe
- MATCH-05: Availability count with progress indicator
- MATCH-06: Drag-and-drop formation builder
- MATCH-07: Match cancellation with reason
- MATCH-08: Team-based match access control
- MATCH-09: Match detail with all information
- MATCH-10: Push notification reminders (24h, 2h, 30m)

---

*State file created: 2026-02-13*  
*Next update: After Phase 1 planning completes*
