# Project State: Calcetto Manager

**Project:** Calcetto Manager  
**Core Value:** Enable groups of friends to organize, play, and track their football matches easily, with automatic statistics and shared ratings  
**Current Focus:** Player Card UI - FIFA Ultimate Team style cards
**Last Updated:** 2026-03-04

---

## 🎯 Current Task: Player Card Implementation

We're implementing FIFA Ultimate Team style player cards:

### What's Done
- ✅ Card template images in `/public/icons/cards/` (8 types: bronze_base, bronze_rare, silver, golden, if, player_of_the_match, player_of_the_month, ultimate_scream)
- ✅ Created `fut-player-card.tsx` component with card overlay system
- ✅ Added background removal service (`lib/background-removal.ts`) using remove.bg API

### Next Steps
1. Integrate FUT player card into dashboard and player pages
2. Add card type selection based on player rating/stats
3. Connect background removal to avatar upload flow
4. Test and polish card display

### Files Created/Modified
- `components/players/fut-player-card.tsx` - New FUT-style card component
- `lib/background-removal.ts` - Background removal server action
- `lib/image-utils.ts` - Updated with background removal integration
- `public/icons/cards/` - Card template images

---

## Current Position

| Property | Value |
|----------|-------|
| **Focus** | Player Card UI - FIFA Ultimate Team style cards |
| **Status** | 🟡 In Progress |
| **Branch** | cards |

### Player Cards Progress

```
[████████████░░░░░░░░░] ~60%
```

*Implementing FIFA-style player cards with card templates, background removal, and dashboard integration*

---

## Project Reference

### Quick Links
- 📊 STATE.md - This file
- 📋 REQUIREMENTS.md - Feature requirements with status
- 🗺️ ROADMAP.md - Phase roadmap
- 📋 PROJECT.md - Project overview

### Tech Stack (Confirmed)
| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | React 19 + Next.js 15 | Modern PWA foundation, Turbopack, Actions API |
| Database | Prisma + PostgreSQL | Type-safe ORM with NextAuth integration |
| Auth | NextAuth.js | Flexible authentication with credentials + OAuth |
| Offline | idb + Workbox | IndexedDB wrapper, Service Worker management |
| Styling | Tailwind CSS 4.x + shadcn/ui | Mobile-first, accessible components |
| Real-time | To be determined | WebSockets, SSE, or polling (Phase 4) |
| State Management | TanStack Query | Server state caching, offline support, optimistic updates |

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
| 4 | Match Results & Ratings | 8 | 🟢 Complete | 100% |
| 5 | Post-Match Statistics | 9 | 🟢 Complete | 100% |
| 6 | Player Ratings | 6 | 🟢 Complete | 100% |
| 7 | Mobile Optimization | 5 | 🟢 Complete | 100% |
| 8 | Dashboard & Leaderboards | 8 | 🔴 Not Started | 0% |
| 9 | Social & Sharing | 4 | 🔴 Not Started | 0% |

**Overall:** 50/73 requirements complete (~68%)

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
| 2026-02-17 | Migrated database layer from Supabase to Prisma | Project uses NextAuth + Prisma, Supabase was architectural mismatch | ✅ Complete |
| 2026-02-17 | MatchStatus uses uppercase Prisma enum values | Type safety alignment with database schema (SCHEDULED, IN_PROGRESS, FINISHED, COMPLETED, CANCELLED) | ✅ Confirmed |
| 2026-02-17 | Add FINISHED status for lifecycle transitions | Supports in_progress → finished → completed flow per CONTEXT.md | ✅ Confirmed |
| 2026-02-17 | AlertDialog for all lifecycle confirmations | Prevents accidental match state transitions | ✅ Confirmed |
| 2026-02-17 | initializeParticipation on match end | Sets played=true for RSVP 'in' players automatically, admin can adjust | ✅ Confirmed |
| 2026-02-17 | Rating storage as Decimal(3,2) | Enables easy averaging, maps to 38 display values (6.0, 6.25, 6.5, 6.75) | ✅ Confirmed |
| 2026-02-17 | Two-part rating selector (base + modifier) | Better mobile UX than single dropdown with 38 values | ✅ Confirmed |
| 2026-02-17 | Ratings editable only in FINISHED status | COMPLETED matches have read-only ratings | ✅ Confirmed |
| 2026-02-17 | COMPLETED status shows CompletedMatchDetail | Read-only view with all match info (goals, ratings, formation) | ✅ Confirmed |
| 2026-02-17 | History page filters by result type | Users can filter by wins, losses, draws | ✅ Confirmed |
| 2026-02-17 | Match detail adapts to status | SCHEDULED (RSVP), IN_PROGRESS (score), FINISHED (ratings), COMPLETED (read-only) | ✅ Confirmed |
| 2026-02-17 | FormationPosition.side field for team assignment | positionX < 5 = home, positionX >= 5 = away, set in completeMatch | ✅ Confirmed |
| 2026-02-17 | RoleSelector primary/other role separation | roles[0] = primary role (required), roles[1:] = other roles (optional) | ✅ Confirmed |
| 2026-02-17 | Goals conceded only for GKs in GK position | Player must have 'goalkeeper' in roles AND play at positionLabel='GK' | ✅ Confirmed |
| 2026-02-17 | All statistics from COMPLETED matches only | Statistics aggregation filters by MatchStatus.COMPLETED | ✅ Confirmed |
| 2026-02-17 | Goals conceded leaderboard: lower = better | Shows best goalkeeper (fewest goals conceded) first | ✅ Confirmed |
| 2026-02-17 | PlayerStatsCard shows goals_conceded only for GKs | Conditional display based on null check for goals_conceded field | ✅ Confirmed |
| 2026-02-17 | All leaderboards show top 3 with medal badges | Gold/silver/bronze position badges, consistent visual design | ✅ Confirmed |
| 2026-02-17 | Player cards link to player profile | Clickable cards wrap in Next.js Link, navigate to /teams/[teamId]/players/[playerId] | ✅ Confirmed |
| 2026-02-17 | Match history shows multiple scorers | Up to 3 scorers with goal counts, '+N' for additional | ✅ Confirmed |
| 2026-02-17 | Scorer format in match history | "Name (count), Name2 (count)" for clarity | ✅ Confirmed |
| 2026-02-18 | Recharts for chart visualization | Most popular React charting library (3.6M+ downloads) | ✅ Confirmed |
| 2026-02-18 | Rating history from COMPLETED matches | Historical accuracy, matches ordered by scheduledAt | ✅ Confirmed |
| 2026-02-18 | useRatingHistory hook pattern | Follows use-statistics.ts with isLoading/error/refetch | ✅ Confirmed |
| 2026-02-18 | Chart only for 3+ ratings | LineChart with fewer points looks wrong | ✅ Confirmed |
| 2026-02-18 | ResponsiveContainer with initialDimension | Prevents width/height warning on first render | ✅ Confirmed |
| 2026-02-18 | Y-axis domain [1, 10] with reference at 6 | Italian school passing grade visualization | ✅ Confirmed |
| 2026-02-26 | TanStack Query for server state | Mobile-optimized caching, offline support, optimistic updates | ✅ Confirmed |
| 2026-02-26 | Server Actions for mutations | Next.js native mutations with automatic revalidation | ✅ Confirmed |
| 2026-02-26 | 5-min stale time default | Reduces network requests on mobile, better battery life | ✅ Confirmed |
| 2026-02-26 | Optimistic updates for mutations | Instant UI feedback, rollback on error | ✅ Confirmed |
| 2026-02-26 | React Query hooks pattern | use-*-react-query.ts naming convention for all data hooks | ✅ Confirmed |

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

### From Plan 03-06 (Feature Integration and Verification)

**Implemented:**
- ✅ Team navigation updated with Matches tab (second position after Overview)
- ✅ Dashboard upcoming matches section showing matches across all teams
- ✅ Match cards with RSVP count badges (IN/needed format with color coding)
- ✅ Formation section on match detail with preview and edit links
- ✅ Notification permission request shown after creating first match
- ✅ Complete Italian/English translations for matches, dashboard, notifications

**Key Files for Future Phases:**
- `components/dashboard/upcoming-matches-section.tsx` - Dashboard matches display
- `components/navigation/team-nav.tsx` - Updated team navigation
- `components/matches/match-card.tsx` - Match card with RSVP badge
- `app/[locale]/teams/[teamId]/matches/[matchId]/match-detail-page-client.tsx` - Match detail with formation

**Patterns Established:**
- Navigation: Matches tab in primary team navigation
- Dashboard aggregation: Show upcoming matches across all teams, sorted by date
- RSVP display: "confirmed/needed" format with green/yellow/red color coding
- Permission timing: Request after user demonstrates value (creates content)
- Formation UI: Admin sees edit/create, members see view/empty state

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

### From Plan 04-04 (Player Participation Tracking)

**Implemented:**
- ✅ Player participation server actions (updatePlayerParticipation, getMatchParticipants, bulkUpdateParticipation, initializeParticipation)
- ✅ usePlayerParticipation hook with optimistic updates and rollback
- ✅ PlayerParticipationList component with toggle switches
- ✅ Switch UI component from shadcn for boolean toggles
- ✅ Automatic participation initialization on match end (both endMatch and inputFinalResults)
- ✅ Jersey number display from player_teams junction table
- ✅ Italian/English translations for participation UI

**Key Files for Future Phases:**
- `lib/db/player-participation.ts` - Participation CRUD operations
- `hooks/use-player-participation.ts` - Participation state management
- `components/matches/player-participation-list.tsx` - Participation UI component
- `components/ui/switch.tsx` - Reusable switch component

**Patterns Established:**
- Participation tied to match lifecycle (init on FINISHED status)
- Default played=true for RSVP 'in' players, admin can adjust
- Switch component for boolean toggles with optimistic updates
- Grouped player list by RSVP status (in > maybe > out)
- Only played players can be rated (prerequisite for ratings)

**Requirements Covered:**
- D13: Rate only players who played ✅

---

### From Plan 04-05 (Player Ratings)

**Implemented:**
- ✅ 38-value rating scale (1-10 with -, +, .5 modifiers)
- ✅ Rating utilities with decimal conversion functions
- ✅ Player rating server actions (upsertPlayerRating, getMatchRatings, getPlayerAverageRating)
- ✅ usePlayerRatings hook with optimistic updates
- ✅ RatingSelector component with two-part UI (base + modifier)
- ✅ PlayerRatingCard with collapsible comments
- ✅ RatingsList with average display and ranking
- ✅ Ratings page at `/teams/[teamId]/matches/[matchId]/ratings`
- ✅ Italian/English translations for ratings

**Key Files for Future Phases:**
- `lib/rating-utils.ts` - Rating conversion utilities
- `lib/db/player-ratings.ts` - Rating CRUD operations
- `hooks/use-player-ratings.ts` - Rating state management
- `components/matches/rating-selector.tsx` - Rating input component
- `components/matches/ratings-list.tsx` - Read-only ratings display

**Patterns Established:**
- Decimal storage for ratings (6.0, 6.25, 6.5, 6.75) for easy averaging
- Two-part selector for mobile-friendly rating input
- Optimistic updates with toast notifications
- Progress tracking (rated/played count)
- Only FINISHED matches can be rated, COMPLETED are read-only

**Requirements Covered:**
- RATE-01: Submit ratings with 38-value scale ✅
- RATE-02: Optional comments per player ✅
- RATE-03: Average ratings calculation ✅

---

### From Plan 04-06 (Match Completion & History)

**Implemented:**
- ✅ MatchHistoryCard component with color-coded results (win/loss/draw)
- ✅ CompletedMatchDetail read-only view for completed matches
- ✅ Match history page with result filtering and stats summary
- ✅ History tab added to team navigation
- ✅ Match detail page updated for status-based rendering
- ✅ RecentResultsSection for dashboard showing last 3 completed matches
- ✅ Italian/English translations for history UI

**Key Files for Future Phases:**
- `components/matches/match-history-card.tsx` - Card for history list
- `components/matches/completed-match-detail.tsx` - Read-only completed match view
- `app/[locale]/teams/[teamId]/history/page.tsx` - History page
- `app/[locale]/teams/[teamId]/history/match-history-page-client.tsx` - History client component
- `components/dashboard/recent-results-section.tsx` - Dashboard recent results

**Patterns Established:**
- Status-based conditional rendering in match detail
- Color-coded result indicators (green/red/gray for W/L/D)
- Filter by result type in history view
- Read-only CompletedMatchDetail for COMPLETED status
- Stats summary (total matches, wins, losses, goals)

**Requirements Covered:**
- D08: View completed matches in history ✅
- D09: Match detail shows all info based on status ✅

---

## Session Continuity

### Last Session
- **Date:** 2026-02-26
- **Activity:** Executed Mobile Optimization Phase
- **Outcome:** 
  - Integrated TanStack Query for server state management
  - Established hooks naming pattern (use-*-react-query.ts)
  - Configured 5-minute stale time for mobile battery optimization
  - Implemented optimistic updates pattern for mutations
  - Phase Mobile Optimization: 100% Complete

### Next Session
- **Status:** Phase 7 (Mobile Optimization) Complete
- **Action:** Begin Phase 8 (Dashboard & Leaderboards)
- **When ready:** Run `/gsd-plan-phase 8` to plan dashboard features

### Context for Claude
When resuming this project:
1. Read this STATE.md first
2. Phase Mobile Optimization complete - TanStack Query fully integrated
3. All data hooks now follow use-*-react-query.ts pattern
4. Server Actions handle mutations with automatic revalidation
5. 5-minute stale time reduces network requests on mobile
6. Run `/gsd-plan-phase 8` to continue with Dashboard & Leaderboards

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
