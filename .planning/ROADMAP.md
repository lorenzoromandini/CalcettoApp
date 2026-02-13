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

---

## Phase 4: Live Match Experience

**Goal:** Users can track live matches with timer, scores, and events optimized for mobile

**Dependencies:** Phase 3 (matches must exist to go live)

**Requirements:**
- LIVE-01 through LIVE-08 (timer, scoring, cards, real-time updates, offline recording)

**Success Criteria (5 criteria):**

1. **Designated user can start/pause/resume live match timer** — Timer controls accessible during match; time displays clearly
2. **User can record goals, assists, and cards during match** — Each event captured with player attribution; scoreboard updates
3. **Scoreboard updates in real-time for all connected users** — Other users see goals/cards instantly via Supabase Realtime (SSE)
4. **Live match UI works offline and syncs when reconnected** — Match continues recording without connection; data syncs automatically
5. **Interface optimized for one-handed mobile use in any condition** — Large buttons, no accidental inputs, works with wet fingers; swipe navigation disabled during matches

**Research Alignment:** "High-engagement differentiator that must be designed carefully to avoid UX pitfalls. Critical phase with highest pitfall density."

**Technical Notes:**
- Stack: Supabase Realtime (SSE), Background Sync API
- Avoid: WebSocket-only reliability (Pitfall #1), touch gesture conflicts (Pitfall #5)
- Critical: Match 'lock mode' to prevent accidental inputs

---

## Phase 5: Post-Match Statistics

**Goal:** Users can view comprehensive match and player statistics with media support

**Dependencies:** Phase 4 (match events required to calculate statistics)

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

## Phase 6: Player Ratings

**Goal:** Users can submit and view player ratings with comments and trends

**Dependencies:** Phase 5 (matches and player data required for ratings context)

**Requirements:**
- RATE-01 through RATE-06 (ratings, comments, averages, anonymity, trends)

**Success Criteria (4 criteria):**

1. **Users can submit ratings (1-10) for each player post-match** — Rating interface available after match ends; all players rateable
2. **Users can add optional comment with rating** — Comments stored and displayed with ratings
3. **System calculates average ratings per match and overall** — Match average and career average visible on player profiles
4. **Users can view rating history with trends** — Rating evolution over time displayed as chart/list; anonymous option works when enabled

**Research Alignment:** "Player ratings are HIGH engagement driver; creates banter and 'obsession' as seen in competitors."

**Technical Notes:**
- Critical: Conflict resolution for offline ratings (Pitfall #3)
- Consider: Event sourcing pattern for match events

---

## Phase 7: Dashboard & Leaderboards

**Goal:** Users can discover top performers and track player evolution through visual dashboards

**Dependencies:** Phase 5-6 (statistics and ratings required for leaderboards)

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
| Phase 4 | SSE vs WebSocket verification | Mobile suspend/reconnection |
| Phase 6 | Conflict resolution for offline ratings | Data loss with "last write wins" |

Phases with standard patterns (skip extra research):
- Phase 2: Standard CRUD with Supabase
- Phase 3: Standard scheduling/RSVP patterns
- Phase 5: Standard statistics aggregation
- Phase 7: Standard dashboard queries
- Phase 8: Standard Web APIs (Push, Share)

---

## Progress Tracking

| Phase | Status | Start Date | Complete Date |
|-------|--------|------------|---------------|
| Phase 1: Foundation & Auth | 🔴 Not Started | — | — |
| Phase 2: Team Management | 🔴 Not Started | — | — |
| Phase 3: Match Management | 🔴 Not Started | — | — |
| Phase 4: Live Match Experience | 🔴 Not Started | — | — |
| Phase 5: Post-Match Statistics | 🔴 Not Started | — | — |
| Phase 6: Player Ratings | 🔴 Not Started | — | — |
| Phase 7: Dashboard & Leaderboards | 🔴 Not Started | — | — |
| Phase 8: Social & Sharing | 🔴 Not Started | — | — |

**Overall Progress:** 0/8 phases (0%)

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
