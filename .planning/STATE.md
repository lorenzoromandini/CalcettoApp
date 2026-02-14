# Project State: Calcetto Manager

**Project:** Calcetto Manager  
**Core Value:** Enable groups of friends to organize, play, and track their football matches easily, with automatic statistics and shared ratings  
**Current Focus:** Phase 1 — Foundation & Auth  
**Last Updated:** 2026-02-13 (after Plan 01-02 completion)  

---

## Current Position

| Property | Value |
|----------|-------|
| **Phase** | 1 — Foundation & Auth |
| **Phase Goal** | Users can securely access the app and use it offline with instant loading |
| **Plan** | 02 — Supabase Auth with SSR Support |
| **Status** | 🟡 In Progress |
| **Progress** | ~29% |

### Phase 1 Progress Bar

```
[███░░░░░░░░░░░░░░░] ~29%
```

*Plan 01 (Project Init) ✅ Complete with SUMMARY.md, Plan 02 (Supabase Auth) ✅ Complete*
*Next: Plan 03 (Database Schema)*

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
| 1 | Foundation & Auth | 14 | 🟡 In Progress | ~29% |
| 2 | Team Management | 10 | 🔴 Not Started | 0% |
| 3 | Match Management | 14 | 🔴 Not Started | 0% |
| 4 | Live Match Experience | 8 | 🔴 Not Started | 0% |
| 5 | Post-Match Statistics | 9 | 🔴 Not Started | 0% |
| 6 | Player Ratings | 6 | 🔴 Not Started | 0% |
| 7 | Dashboard & Leaderboards | 8 | 🔴 Not Started | 0% |
| 8 | Social & Sharing | 4 | 🔴 Not Started | 0% |

**Overall:** 0/68 requirements complete (0%)

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

---

## Open Questions

| Question | Blocking | Context |
|----------|----------|---------|
| Service Worker caching strategy? | No | Phase 1 planning needs cache invalidation approach |
| SSE reconnection behavior on iOS? | No | Phase 4 needs testing on Safari mobile |
| Conflict resolution for offline edits? | No | Phase 6 needs event sourcing decision |

---

## Known Blockers

**None currently.** All prerequisites met:
- ✅ Requirements defined
- ✅ Research complete
- ✅ Tech stack confirmed
- ✅ Roadmap created

---

## Accumulated Context

### From Research (Critical for Phase 1)

**Architecture Must-Haves:**
1. Service Worker with Workbox (don't roll your own)
2. IndexedDB via `idb` library for offline storage
3. Network-first for live data, cache-first for static assets
4. NEVER cache real-time match data in SW
5. Background sync for queued actions

**Pitfalls to Avoid (Phase 1):**
- Pitfall #4: Service Worker caching live match data
- Pitfall #3: Offline-first without conflict resolution (deferred to Phase 6)

**Critical for Mobile:**
- App shell caching for instant loads
- Offline indicator in UI
- Graceful degradation when offline

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

---

## Session Continuity

### Last Session
- **Date:** 2026-02-13
- **Activity:** Completed Plan 01-01 SUMMARY.md (project initialization was already done, summary was missing)
- **Outcome:** Plan 01 now has complete documentation with all 3 tasks, 24 files created, and commit history recorded

### Next Session
- **Command:** Continue to Plan 03 (Database Schema) or verify current work
- **Goal:** Create database schema for users, teams, matches, and statistics
- **Expected Output:** Prisma schema with all required models

### Context for Claude
When resuming this project:
1. Read this STATE.md first
2. Check current phase status
3. Read ROADMAP.md for phase goals and success criteria
4. Read research/SUMMARY.md for technical context
5. Run planning command for current phase

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
