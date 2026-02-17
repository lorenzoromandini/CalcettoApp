# Roadmap: Calcetto Manager

**Project:** Calcetto Manager — Mobile-first PWA for amateur football team management  
**Version:** v1.0  
**Last Updated:** 2026-02-13  

## Overview

This roadmap delivers Calcetto Manager in **8 phases**, progressing from offline-first foundation through core features to social engagement. Each phase builds on the previous, with clear success criteria that define observable user outcomes (not implementation tasks).

**Phase depth:** Standard (8 phases derived from natural requirement boundaries)  
**Total v1 requirements:** 68  
**Coverage:** 100% — all requirements mapped to exactly one phase ✓

---

## Phase 1: Foundation & Auth

**Goal:** Users can securely access the app and use it offline with instant loading

**Dependencies:** None (foundation phase)

**Requirements:**
- AUTH-01 through AUTH-06 (authentication system)
- OFFL-01 through OFFL-05 (offline support)
- UIUX-03, UIUX-04, UIUX-05 (theme, i18n, onboarding)

**Success Criteria (5 criteria):**

1. **User can sign up and log in via email or Google OAuth** — Authentication flow works end-to-end with email verification and password reset
2. **User stays logged in across browser sessions** — Session persistence works after refresh, logout available from any screen
3. **App loads instantly on repeat visits (<1s)** — Service Worker caches app shell, no white screen on launch
4. **User can view cached data when offline** — Teams, players, matches visible without connection; UI indicates offline status
5. **User actions queue when offline and sync automatically when connection restored** — Background sync works for match statistics and other mutations

**Plans:** 7 plans in 4 waves

| Plan | Objective | Wave | Dependencies | Files |
|------|-----------|------|--------------|-------|
| 01-01 | Initialize Next.js 15 project with shadcn/ui and dependencies | 1 | None | next.config.ts, package.json, .env.local, lib/supabase/, lib/db/, lib/i18n/ |
| 01-02 | Configure Supabase Auth with SSR (clients, middleware, callback) | 1 | None | lib/supabase/client.ts, lib/supabase/server.ts, lib/supabase/middleware.ts, middleware.ts, app/auth/callback/route.ts |
| 01-03 | Implement offline infrastructure (IndexedDB, Service Worker, Background Sync) | 2 | 01-01 | lib/db/schema.ts, lib/db/index.ts, lib/db/actions.ts, app/sw.ts, components/service-worker-register.tsx, hooks/use-offline-queue.ts, components/offline-banner.tsx |
| 01-04 | Configure PWA manifest, icons, and offline fallback page | 3 | 01-01, 01-03 | app/manifest.ts, public/icons/*, app/offline/page.tsx |
| 01-05 | Build authentication UI (login, signup, password reset, Google OAuth) | 3 | 01-01, 01-02 | app/auth/login/page.tsx, app/auth/signup/page.tsx, components/auth/*, lib/validations/auth.ts |
| 01-06 | Implement theme, i18n (IT/EN), and onboarding tutorial | 3 | 01-01, 01-02 | lib/i18n/*, messages/*.json, components/providers/theme-provider.tsx, components/theme-toggle.tsx, components/onboarding/tutorial.tsx |
| 01-07 | Integration, protected routes, and user verification checkpoint | 4 | All | app/[locale]/dashboard/page.tsx, components/navigation/*, lib/supabase/actions.ts |

**Wave Structure:**
- **Wave 1 (Parallel):** 01-01 + 01-02 — Project foundation + Supabase config
- **Wave 2:** 01-03 — Offline infrastructure (needs project structure)
- **Wave 3 (Parallel):** 01-04 + 01-05 + 01-06 — PWA + Auth UI + Theme/i18n
- **Wave 4:** 01-07 — Integration and verification checkpoint

**Research Alignment:** Research flags this as the most critical phase — "Everything depends on reliable offline capability. Service Worker and IndexedDB must be in place before any user-facing features."

**Technical Notes:**
- Stack: Next.js 15, Supabase Auth, Workbox, idb
- Avoid: Service Worker caching live match data (Pitfall #4)
- Critical for: All subsequent phases

---

## Phase 2: Team Management

**Goal:** Users can create and manage teams with players, roles, and invite links

**Dependencies:** Phase 1 (authentication required for team ownership)

**Requirements:**
- TEAM-01 through TEAM-10 (team CRUD, players, roles, invites, admin privileges)

**Success Criteria (5 criteria):**

1. **User can create a team with name and description** — Team created appears in user's team list
2. **User can add players with details (name, surname, nickname, jersey number, avatar)** — Player profiles display correctly with cropped square avatars
3. **User can assign multiple roles to players** — Goalkeeper, defender, midfielder, attacker roles visible and editable
4. **User can generate and share invite links** — Links work when shared via WhatsApp/email; invited users can join team
5. **Team admin can manage roster and permissions** — Admin can remove players and assign co-admin privileges; roster view shows all player details

**Research Alignment:** "Table stakes features establish credibility. These are dependencies for all other features. User research shows missing these makes the product 'feel broken.'"

**Technical Notes:**
- Stack: Supabase PostgreSQL, row-level security
- Implement: REST API patterns, optimistic UI updates
- Avoid: Complex permission systems (anti-feature)

**Plans:** 6 plans in 5 waves

| Plan | Objective | Wave | Dependencies | Files |
|------|-----------|------|--------------|-------|
| 02-01 | Database schema (teams, players, invites, RLS) | 1 | 01-07 | supabase/migrations/*, lib/db/schema.ts |
| 02-02 | Team CRUD (create, list, team mode selection) | 2 | 02-01 | lib/db/teams.ts, app/[locale]/teams/* |
| 02-03 | Player management (add, avatar crop, roles) | 2 | 02-01 | lib/db/players.ts, components/players/* |
| 02-04 | Invite system (generate links, join via invite) | 3 | 02-01, 02-02 | lib/db/invites.ts, app/[locale]/teams/invite/* |
| 02-05 | Admin features (remove players, co-admin, roster) | 4 | 02-01, 02-02, 02-03 | lib/db/teams.ts, app/[locale]/teams/[teamId]/roster/* |
| 02-06 | Integration, dashboard, and verification checkpoint | 5 | All | app/[locale]/teams/[teamId]/page.tsx, dashboard |

**Wave Structure:**
- **Wave 1:** 02-01 — Database foundation (teams, team_members, players, invites tables)
- **Wave 2 (Parallel):** 02-02 + 02-03 — Team CRUD + Player management (independent features)
- **Wave 3:** 02-04 — Invite system (needs teams from Wave 2)
- **Wave 4:** 02-05 — Admin features (needs players and memberships)
- **Wave 5:** 02-06 — Integration and verification

---

## Phase 3: Match Management

**Goal:** Users can schedule matches, manage RSVPs, and build formations

**Dependencies:** Phase 2 (teams and players required to create matches)

**Requirements:**
- MATCH-01 through MATCH-10 (match CRUD, RSVPs, formations, notifications)
- UIUX-01, UIUX-02, UIUX-06, UIUX-07 (mobile-first, touch targets, performance)

**Success Criteria (5 criteria):**

1. **User can create match with date, time, location and mode (5vs5 or 8vs8)** — Match appears in team schedule with all details
2. **Players can RSVP to matches (IN/OUT/Maybe)** — Availability count updates in real-time; list shows who's coming
3. **User can build formations with drag-and-drop** — Formation module selectable per match mode; players draggable to positions on virtual pitch
4. **Alternative tap-to-place interaction works for formations** — Users can also tap player then tap position (accessible alternative to drag-and-drop)
5. **User receives push notification reminders before match** — Notification fires at configurable time before match start

**Research Alignment:** "User research shows 'Who's coming?' is the #1 question every week. Drag-and-drop preferred but tap-to-place alternatives essential for mobile."

**Technical Notes:**
- Critical: Touch targets 44px+, large drag handles, magnetic snapping
- Avoid: Drag-and-drop as only input method (Pitfall #2)

**Plans:** 6 plans in 6 waves

| Plan | Objective | Wave | Dependencies | Files |
|------|-----------|------|--------------|-------|
| 03-01 | Database schema (matches, match_players, formations, RLS) | 1 | 02-06 | supabase/migrations/20260215000002_*.sql, lib/db/schema.ts |
| 03-02 | Match CRUD (create, list, edit, cancel) | 2 | 03-01 | lib/db/matches.ts, hooks/use-matches.ts, components/matches/* |
| 03-03 | RSVP system (IN/OUT/Maybe, real-time counts) | 3 | 03-01, 03-02 | lib/db/rsvps.ts, hooks/use-rsvps.ts, components/matches/rsvp-*.tsx |
| 03-04 | Formation builder (drag-and-drop + tap-to-place) | 4 | 03-01, 03-02, 03-03 | components/formations/*, hooks/use-formation.ts, @dnd-kit |
| 03-05 | Push notifications | 5 | 03-01, 03-02 | lib/notifications/*, app/sw.ts, VAPID setup |
| 03-06 | Integration and verification | 6 | All | Dashboard, navigation, translations |

**Wave Structure:**
- **Wave 1:** 03-01 — Database foundation (matches, RSVPs, formations tables)
- **Wave 2:** 03-02 — Match CRUD (depends on schema)
- **Wave 3:** 03-03 — RSVP system (depends on matches)
- **Wave 4:** 03-04 — Formation builder (depends on matches + RSVPs)
- **Wave 5:** 03-05 — Push notifications (depends on matches, parallel-possible with 4)
- **Wave 6:** 03-06 — Integration and verification (depends on all)

---

## Phase 4: Match Results & Player Ratings

**Goal:** Users can manage match lifecycle, record goals/assists, and rate players with nuanced scores

**Dependencies:** Phase 3 (matches must exist to add results)

**Requirements:**
- LIVE-02, LIVE-03 (score recording, goal attribution - adapted)
- RATE-01, RATE-02, RATE-03 (ratings, comments, averages - moved from Phase 6)

**Success Criteria (7 criteria):**

1. **Admin can choose "Start Match" or "Final Results"** — Two entry modes for different workflows
2. **Admin can record goal scorers and optional assists** — Each goal linked to player with own-goal flag
3. **Admin can mark which players actually played** — Only played players can be rated
4. **Admin can rate players with nuanced scale** — 38 values: X, X-, X+, X.5 (e.g., 6, 6-, 6+, 6.5)
5. **Admin can add optional comments per player** — Free text alongside rating
6. **Admin can complete match** — Locks match, moves to team history (read-only)
7. **Users can view match history** — Completed matches visible with full details

**Key Design Decisions (from user discussion):**
- No timer/clock tracking (simplified from original design)
- Two entry modes: live updates during play OR final results at end
- Match lifecycle: scheduled → in_progress → finished → completed
- Nuanced rating scale matches Italian school grading style
- No real-time sync (users refresh to see updates)

**Technical Notes:**
- Stack: Prisma + PostgreSQL (standard CRUD, no real-time infrastructure)
- Rating storage: Decimal(3,2) for averaging (6.25 = 6-, 6.5, 6.75 = 6+)
- Match status enum: SCHEDULED, IN_PROGRESS, FINISHED, COMPLETED, CANCELLED

**Plans:** 6 plans in 3 waves

| Plan | Objective | Wave | Dependencies | Files |
|------|-----------|------|--------------|-------|
| 04-01 | Database schema (MatchStatus enum, Goal, PlayerRating models) | 1 | None | prisma/schema.prisma, prisma/migrations/... |
| 04-02 | Match lifecycle (Start, End, Complete, Final Results) | 1 | None | lib/db/match-lifecycle.ts, components/matches/match-lifecycle-buttons.tsx |
| 04-03 | Goal tracking (add/remove goals with scorer, assist) | 2 | 04-01 | lib/db/goals.ts, components/matches/goal-*.tsx |
| 04-04 | Player participation (mark who played) | 2 | 04-01 | lib/db/player-participation.ts, components/matches/player-participation-list.tsx |
| 04-05 | Player ratings (38-value scale, comments) | 3 | 04-01, 04-04 | lib/db/player-ratings.ts, components/matches/rating-*.tsx |
| 04-06 | Match history and integration | 3 | 04-02, 04-03, 04-05 | app/[locale]/teams/[teamId]/history/page.tsx, integration |

**Wave Structure:**
- **Wave 1 (Parallel):** 04-01 + 04-02 — Database schema + Match lifecycle (independent)
- **Wave 2 (Parallel):** 04-03 + 04-04 — Goal tracking + Participation (both need schema)
- **Wave 3:** 04-05 + 04-06 — Ratings + History/integration (needs all prior work)

---

## Phase 5: Post-Match Statistics

**Goal:** Users can view comprehensive match and player statistics with media support

**Dependencies:** Phase 4 (goals and ratings required to calculate statistics)

**Requirements:**
- STAT-01 through STAT-08 (match stats, player aggregation, history, photos)
- UIUX-07 (lazy loading for images/statistics)

**Success Criteria (4 criteria):**

1. **System calculates and displays match statistics** — Goals, assists, cards per match visible in match history
2. **Player statistics aggregated over time** — Career totals for goals, assists, appearances; goalkeeper saves tracked separately
3. **User can view win/loss/draw records and averages** — Team record displayed; goals per match average calculated
4. **User can upload match highlight photos** — Photos upload with client-side compression; visible in match gallery

**Research Alignment:** "Season aggregation expected by users; offline match recording enables stats even without connectivity."

**Technical Notes:**
- Stack: browser-image-compression, Supabase Storage
- Implement: Lazy loading for performance
- Critical: Client-side image compression before upload

---

## Phase 6: Rating Trends & History

**Goal:** Users can view rating evolution and trends over time

**Dependencies:** Phase 4 (ratings now entered as part of match completion)

**Requirements:**
- RATE-04, RATE-06 (rating history, trend visualization - remaining from original Phase 6)

**Success Criteria (2 criteria):**

1. **Users can view rating history** — All past ratings visible per player
2. **Users can view rating trends** — Rating evolution over time displayed as chart

**Note:** Core rating functionality (RATE-01, RATE-02, RATE-03) moved to Phase 4 as part of post-match workflow.

**Research Alignment:** "Trend visualization adds engagement - players can see improvement or decline over time."

**Technical Notes:**
- Stack: Recharts or similar charting library
- Implement: Rating timeline per player

---

## Phase 7: Dashboard & Leaderboards

**Goal:** Users can discover top performers and track player evolution through visual dashboards

**Dependencies:** Phase 4-5 (ratings and statistics required for leaderboards)

**Requirements:**
- DASH-01 through DASH-08 (top scorers, assists, clean sheets, MVP, profiles, streaks, charts)

**Success Criteria (5 criteria):**

1. **Dashboard displays category leaders** — Top scorer, top assister, best goalkeeper (clean sheets), MVP (highest rating) prominently shown
2. **User can view detailed player profiles** — Complete statistics, ratings, match history per player
3. **System displays attendance streaks** — Consecutive matches attended tracked and displayed
4. **User can filter statistics by time period** — Season view, monthly view selectable; stats recalculate per period
5. **System displays charts for player evolution** — Visual trend lines for goals, ratings, appearances over time

**Research Alignment:** "Fantasy-style points and leaderboards drive retention and 'obsession' — essential for gamification."

**Technical Notes:**
- Stack: Supabase PostgreSQL aggregations
- Implement: Efficient querying for leaderboards; caching strategies

---

## Phase 8: Social & Sharing

**Goal:** Users can share results, invites, and formations via social channels

**Dependencies:** Phase 2-7 (teams, matches, statistics required for sharing content)

**Requirements:**
- SOCL-01 through SOCL-04 (WhatsApp sharing, invites, formations as image, match summaries)

**Success Criteria (4 criteria):**

1. **User can share match results to WhatsApp** — Formatted message with score, scorers, highlights ready to share
2. **User can share team invite link** — Link generates preview card when shared
3. **User can share formations as image** — Formation exports to PNG/image for sharing on social media
4. **System generates shareable match summary** — Auto-generated summary text with key stats for copying/sharing

**Research Alignment:** "WhatsApp integration is critical for adoption; friend groups use WhatsApp as primary communication channel."

**Technical Notes:**
- Stack: html-to-image or similar for formation exports
- Critical: WhatsApp sharing works with formatted text and images
- Note: Push permission timing — request after value demonstrated (avoid asking too early)

---

## Cross-Cutting Requirements

**UI/UX Requirements (All Phases):**
- UIUX-01: Mobile-first responsive design (all phases)
- UIUX-02: Touch-friendly interface with 44px+ touch targets (all phases)
- UIUX-06: Loading times under 2 seconds (all phases)

These are embedded in every phase's success criteria rather than isolated phases.

---

## Phase Dependencies Diagram

```
Phase 1: Foundation & Auth
    ↓
Phase 2: Team Management
    ↓
Phase 3: Match Management
    ↓
Phase 4: Live Match Experience
    ↓
Phase 5: Post-Match Statistics
    ↓
Phase 6: Player Ratings
    ↓
Phase 7: Dashboard & Leaderboards
    ↓
Phase 8: Social & Sharing
```

**Critical Path:** 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8  
**No Parallel Phases:** Each phase depends on the previous for data/model foundations

---

## Research Flags

Phases requiring deeper research during planning (per research/SUMMARY.md):

| Phase | Research Flag | Risk |
|-------|--------------|------|
| Phase 1 | Service Worker cache invalidation | Cache corruption, stale data |

Phases with standard patterns (skip extra research):
- Phase 2: Standard CRUD with Prisma
- Phase 3: Standard scheduling/RSVP patterns
- Phase 4: Standard CRUD (simplified from original real-time design)
- Phase 5: Standard statistics aggregation
- Phase 6: Standard charting/trends
- Phase 7: Standard dashboard queries
- Phase 8: Standard Web APIs (Push, Share)

---

## Progress Tracking

| Phase | Status | Start Date | Complete Date |
|-------|--------|------------|---------------|
| Phase 1: Foundation & Auth | ✅ Complete | 2026-02-13 | 2026-02-14 |
| Phase 2: Team Management | ✅ Complete | 2026-02-14 | 2026-02-15 |
| Phase 3: Match Management | ✅ Complete | 2026-02-15 | 2026-02-17 |
| Phase 4: Match Results & Ratings | ✅ Complete | 2026-02-17 | 2026-02-17 |
| Phase 5: Post-Match Statistics | 🔴 Not Started | — | — |
| Phase 6: Rating Trends & History | 🔴 Not Started | — | — |
| Phase 7: Dashboard & Leaderboards | 🔴 Not Started | — | — |
| Phase 8: Social & Sharing | 🔴 Not Started | — | — |

**Overall Progress:** 4/8 phases (50%)

---

## Definition of Done (v1.0)

Calcetto Manager v1.0 is complete when:

1. ✅ All 8 phases are implemented and tested
2. ✅ All 68 v1 requirements are satisfied
3. ✅ All success criteria for each phase are demonstrable
4. ✅ App works offline with background sync
5. ✅ Real-time live match experience functions on mobile
6. ✅ Social sharing to WhatsApp works end-to-end
7. ✅ Load times consistently under 2 seconds
8. ✅ GDPR compliance implemented (privacy, data deletion)

---

*Roadmap created: 2026-02-13*  
*Next step: Run `/gsd-plan-phase 1` to begin Phase 1 planning*
