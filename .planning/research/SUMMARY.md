# Project Research Summary

**Project:** Calcetto Manager  
**Domain:** Mobile-first PWA for amateur football (5-a-side/8-a-side) team management  
**Researched:** 2026-02-13  
**Confidence:** HIGH

## Executive Summary

Calcetto Manager is a **mobile-first Progressive Web App** for casual friend groups playing 5-a-side or 8-a-side football. Research shows this domain requires an **offline-first architecture** with real-time collaboration features—users expect the app to work pitch-side with intermittent connectivity while enabling live match tracking when online.

The recommended approach combines **React 19 + Next.js 15** for the frontend, **Supabase** as the Backend-as-a-Service (PostgreSQL, Auth, Realtime, Storage), and **IndexedDB + Workbox** for offline resilience. Research strongly favors **Server-Sent Events (SSE)** over WebSockets for real-time updates due to simpler connection management and automatic reconnection—critical for mobile environments where tabs get suspended and networks fluctuate.

Key risks center on **real-time reliability** (connection drops, stale data), **mobile UX** (drag-and-drop precision, accidental inputs), and **offline conflict resolution** (multiple users recording offline). Mitigation strategies include network-first caching for live data, alternative tap-to-place interactions for formations, and event-sourcing for match events.

## Key Findings

### Recommended Stack

Research confirms **React 19 + Next.js 15** as the optimal foundation for 2026 PWAs. Next.js 15 provides Turbopack for fast development, App Router for modern React patterns, and built-in PWA capabilities. **Supabase** emerges as the clear BaaS choice—offering PostgreSQL with row-level security, built-in authentication, file storage with CDN delivery, and Supabase Realtime (SSE-based) for live updates. This stack eliminates the need for separate infrastructure while maintaining data ownership.

For offline functionality, the **idb** library (promise-based IndexedDB wrapper) combined with **Workbox** provides production-ready service worker management without manual caching complexity. **Tailwind CSS 4.x** with **shadcn/ui** components delivers mobile-first styling with excellent developer experience.

**Core technologies:**
- **React 19 + Next.js 15** — Modern PWA foundation with Actions API, useOptimistic, and Turbopack  
- **Supabase** — Backend-as-a-Service with PostgreSQL, Auth, Storage, and Realtime (SSE)  
- **idb + Workbox** — Offline-first data persistence and service worker management  
- **Tailwind CSS 4.x + shadcn/ui** — Mobile-first styling with accessible components  
- **browser-image-compression** — Client-side image optimization before upload  

### Expected Features

**Must have (table stakes):**
- Team/Player management — Core identity; users expect basic CRUD  
- Match scheduling with RSVP — "Who's coming?" is the #1 question every week  
- Basic match scoring with live timer — Even simple apps have this; offline-capable essential  
- Basic statistics (goals, assists, appearances) — Season aggregation expected  
- Formation/lineup display — Visual representation; drag-and-drop preferred but not required  
- Multiple team support (5vs5 and 8vs8) — Critical for Calcetto's specific use case  

**Should have (differentiators):**
- Drag-and-drop formation builder — Capo and Tactico highlight this as key differentiator  
- Live match timer + event tracking — One-thumb operable, rain-friendly, offline-capable  
- Player ratings (1-10) — HIGH engagement driver; creates banter  
- Fantasy-style points system — "Makes kickabout something they talk about all week"  
- Streaks and badges — Gamification essential for retention  
- WhatsApp integration — Share lineups, results; critical for adoption  

**Defer (v2+):**
- Payment processing — Adds friction; friends prefer informal settlement  
- AI team balancing — Cool but complex; nail manual formation first  
- Club multi-team management — Target single groups initially  
- Training session planning — Friend groups don't plan formal training  

### Architecture Approach

The architecture follows an **"offline-first" philosophy** where every feature works without connectivity, then syncs when possible. The Service Worker layer handles caching strategies with Workbox, while IndexedDB stores user data and queues offline mutations. Real-time updates flow through Supabase Realtime (SSE-based) with optimistic UI updates for instant feedback.

**Major components:**
1. **Service Worker Layer** — App shell caching, background sync, push handling; network-first for live data, cache-first for static assets  
2. **IndexedDB Storage** — Teams, players, matches locally; offline action queue with conflict resolution  
3. **Real-time Sync (SSE)** — Server-Sent Events via Supabase Realtime for score updates; simpler than WebSockets for mobile  
4. **Optimistic UI Layer** — Instant feedback on actions with rollback capability  
5. **Image Pipeline** — Client-side compression → Supabase Storage → CDN delivery with transformations  

### Critical Pitfalls

Research identifies five critical pitfalls that cause rewrites or feature failure:

1. **WebSocket reliability without fallback** — Mobile browsers throttle/suspend connections. **Avoid:** Use Supabase Realtime (SSE) with automatic reconnection or implement exponential backoff + heartbeat + HTTP polling fallback  
2. **Drag-and-drop as only input method** — "Fat finger" precision issues on mobile. **Avoid:** Always provide tap-to-select + tap-to-place alternatives; large touch targets (44px+); magnetic snapping; undo support  
3. **Offline-first without conflict resolution** — Multiple users recording offline causes data loss with "last write wins." **Avoid:** Event sourcing with server-side event log as source of truth; version vectors; conflict flagging  
4. **Service Worker caching live match data** — Serves stale scores from cache. **Avoid:** Network-first for `/live` endpoints; never cache real-time data; separate cache namespaces  
5. **Touch gesture conflicts in live match UI** — Swipe navigation triggers accidental goal inputs. **Avoid:** Match "lock mode"; confirmation for goals/cards; isolate gesture zones; disable swipe during matches  

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation (Offline-First Infrastructure)
**Rationale:** Everything depends on reliable offline capability. Service Worker and IndexedDB must be in place before any user-facing features. Architecture research shows this is the most common point of failure if deferred.
**Delivers:** PWA shell with offline support, IndexedDB schema, API client with offline queue, basic auth
**Uses:** Next.js 15, Supabase Auth, Workbox, idb
**Implements:** Service Worker layer, IndexedDB storage layer
**Avoids:** SW caching live data (Pitfall #4)

### Phase 2: Core Team & Match Management
**Rationale:** Table stakes features establish credibility. These are dependencies for all other features. User research shows missing these makes the product "feel broken."
**Delivers:** Team CRUD, player profiles, match scheduling, RSVP system, basic match creation
**Uses:** Supabase PostgreSQL, row-level security
**Implements:** REST API patterns, optimistic UI updates
**Avoids:** Complex permission systems (anti-feature)

### Phase 3: Live Match Experience
**Rationale:** High-engagement differentiator that must be designed carefully to avoid UX pitfalls. Depends on Phase 1 (offline) and Phase 2 (teams/matches).
**Delivers:** Live timer, score tracking, match events (goals/assists), formation display, offline match recording
**Uses:** Supabase Realtime (SSE), Optimistic UI patterns
**Implements:** Real-time state synchronization, Background Sync API
**Avoids:** WebSocket-only reliability (Pitfall #1), touch gesture conflicts (Pitfall #5), D&D-only input (Pitfall #2)

### Phase 4: Engagement Layer (Gamification)
**Rationale:** Drives retention and word-of-mouth. Competitors (Capo, SENTR) show these features create "obsession." Depends on match data from Phase 3.
**Delivers:** Player ratings, fantasy points, streaks/badges, statistics dashboard, leaderboards
**Uses:** Supabase PostgreSQL aggregations
**Implements:** Statistics computation, badge awarding system
**Avoids:** Offline conflict resolution failures (Pitfall #3)

### Phase 5: Polish & Growth
**Rationale:** Nice-to-have features that improve experience but aren't blockers. Can be deferred if needed.
**Delivers:** WhatsApp integration, social sharing, push notifications, image uploads/avatars
**Uses:** Push API, browser-image-compression, Supabase Storage
**Implements:** Push notification service, image pipeline
**Avoids:** Push permission timing issues (request after value demonstrated)

### Phase Ordering Rationale

- **Offline-first foundation first:** Every subsequent phase depends on reliable local storage and sync. Research shows retrofitting offline support causes rewrites.
- **Core features before differentiators:** Users expect table stakes (scheduling, RSVP) before engaging with gamification. Without basics, differentiators feel hollow.
- **Live match before gamification:** Statistics, ratings, and fantasy points require match data. Building these first creates "empty state" problems.
- **UX-critical phases need extra care:** Phases 1 and 3 have the highest pitfall density—allocate time for testing mobile interactions and network failure scenarios.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** Service Worker cache invalidation strategies—needs testing with real deployments
- **Phase 3:** SSE vs WebSocket decision—verify Supabase Realtime handles mobile suspends adequately
- **Phase 4:** Conflict resolution implementation—event sourcing pattern needs validation for match events

Phases with standard patterns (skip research-phase):
- **Phase 2:** Standard CRUD with Supabase—well-documented patterns
- **Phase 5:** Push notifications and image uploads—established Web APIs

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official React 19 + Next.js 15 stable releases; Supabase production-ready; mature libraries (idb, Workbox) |
| Features | HIGH | Multiple authoritative sources (Tactico, TeamStats, Capo, SENTR); verified 2025-2026 data; clear market consensus |
| Architecture | HIGH | Established PWA patterns; official MDN/WebKit documentation; Google Workbox guidelines |
| Pitfalls | MEDIUM-HIGH | Multiple community sources confirm patterns; some gaps in sport-specific UX research (general D&D applied) |

**Overall confidence:** HIGH

All major decisions (React 19 + Next.js 15, Supabase, offline-first, SSE over WebSockets) are supported by multiple authoritative sources. The feature landscape is well-understood from competitor analysis. Architecture patterns are mature and battle-tested. Only minor gaps exist in sport-specific formation UX (general mobile D&D research applied).

### Gaps to Address

- **Sport-specific formation UX:** General drag-and-drop mobile research applied; needs validation with football-specific positioning during implementation
- **iOS Safari behavior:** Exact throttling/suspension behavior between iOS versions; requires device testing in Phase 3
- **GDPR for amateur sports:** Applied general GDPR guidance; verify specific requirements during Phase 1 auth implementation
- **Supabase Realtime limits:** Confirm connection limits and retry behavior for mobile scenarios before Phase 3

## Sources

### Primary (HIGH confidence)
- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19) — Official stable release, Actions API, useOptimistic
- [Next.js 15 Blog Post](https://nextjs.org/blog/next-15) — Turbopack stable, React 19 support, caching changes
- [Supabase Documentation](https://supabase.com/docs) — Backend, Auth, Storage, Realtime official docs
- [Workbox Documentation](https://developer.chrome.com/docs/workbox) — Google-backed service worker library
- [MDN Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) — Core offline capabilities
- [Tactico Sport: Best Football Team Management Apps UK 2026](https://tacticoapp.com) — Comprehensive competitor review
- [Capo Product Documentation](https://caposport.com) — Closest comparable for 5-a-side friend groups
- [Nielsen Norman Group: Drag-and-Drop UX](https://nngroup.com) — Authoritative mobile UX research

### Secondary (MEDIUM confidence)
- [Mingle Sport Blog: Gamification Research](https://minglesport.com) — Academic-backed gamification principles
- [SENTR Product Website](https://sentrfootball.com) — Stats and fantasy points focus
- [TeamStats Feature Documentation](https://teamstats.net) — Detailed feature breakdown
- [idb Library (GitHub)](https://github.com/jakearchibald/idb) — IndexedDB wrapper by Jake Archibald
- [OneUptime: WebSocket Reconnection](https://oneuptime.com) — Real-world reliability patterns

### Tertiary (LOW confidence / Applied)
- Reddit r/SideProject: "We built a stats tracker for weekly football games" — Real user validation
- LogRocket: Offline-first frontend apps in 2025 — General patterns applied to domain

---

*Research completed: 2026-02-13*  
*Ready for roadmap: yes*
