# Technology Stack Research

**Project:** Calcetto Manager - Football Team Management Web App  
**Domain:** Mobile-first PWA for sports team management  
**Researched:** 2026-02-13  
**Overall Confidence:** HIGH

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **React** | 19.0.0 | UI component library | React 19 is now stable (Dec 2024) with Actions, useOptimistic, improved Suspense, and better form handling. Essential for modern interactive UIs. |
| **Next.js** | 15.x | Full-stack React framework | Production-ready with React 19 support, Turbopack (stable), improved caching semantics, and App Router. Best-in-class DX and performance for PWAs. |
| **TypeScript** | 5.7.x | Type safety | Industry standard. Next.js 15 has full TypeScript support including typed config files. |

### Database & Backend

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Supabase** | Latest | Backend-as-a-Service | PostgreSQL + Realtime + Auth + Storage in one platform. Excellent free tier, row-level security, and native TypeScript support. |
| **PostgreSQL** | 15+ | Primary database | Via Supabase. ACID-compliant, handles relational data (teams, matches, players) perfectly. |
| **Supabase Realtime** | Built-in | Live updates | Server-Sent Events-based. Perfect for live match scoring without WebSocket complexity. |

### Offline-First Architecture

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **idb** | 8.0.x | IndexedDB wrapper | Tiny (~1.19kB), promise-based wrapper by Jake Archibald. Makes IndexedDB actually usable. |
| **Workbox** | 7.x | Service Worker management | Google-backed, production-ready. Handles caching strategies, background sync, and precaching. |
| **Background Sync API** | Native | Deferred sync | Native browser API (via Workbox) to queue actions when offline and sync when reconnected. |

### Real-Time Features

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Server-Sent Events (SSE)** | Native | One-way real-time | Via Supabase Realtime or native EventSource. Simpler than WebSockets for 95% of use cases (score updates, notifications). HTTP-based, auto-reconnects. |
| **Push API** | Native | Push notifications | Native browser API for match reminders. Requires service worker. |

### Image Handling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **browser-image-compression** | 2.0.x | Client-side compression | Compresses avatars/match photos before upload. Reduces bandwidth, faster uploads on mobile. |
| **next/image** | Built-in | Optimized image delivery | Automatic WebP/AVIF conversion, lazy loading, responsive sizing. |
| **Supabase Storage** | Built-in | Image storage | Built-in image transformations, CDN delivery, public/private buckets. |

### Styling & UI

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Tailwind CSS** | 4.x | Utility-first styling | Mobile-first by design. Excellent DX, small bundle size with JIT. |
| **shadcn/ui** | Latest | Component library | Copy-paste components built on Radix UI. Fully customizable, accessible, works with Tailwind. |
| **Framer Motion** | 11.x | Animations | Great for mobile gestures, drag-and-drop formations, smooth transitions. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **Vite** (via Next.js) | Build tool | Next.js 15 uses Turbopack for dev (stable) - extremely fast HMR. |
| **ESLint 9** | Linting | Next.js 15 supports ESLint 9 with flat config. |
| **PWA Assets Generator** | Icon generation | Generate all required PWA icon sizes from a single source. |
| **ngrok** (dev) | HTTPS tunneling | Required for testing Push API and Service Workers locally (requires HTTPS). |

---

## Installation Commands

```bash
# Create new Next.js 15 project with TypeScript
npx create-next-app@latest calcetto-manager --typescript --tailwind --app --no-src-dir

# Core dependencies
npm install react@latest react-dom@latest next@latest

# Database & Backend
npm install @supabase/supabase-js @supabase/ssr

# Offline support
npm install idb workbox-window workbox-precaching workbox-routing workbox-strategies

# Real-time (if not using Supabase Realtime exclusively)
npm install eventsource-parser

# Image handling
npm install browser-image-compression

# UI & Animations
npm install framer-motion clsx tailwind-merge
npx shadcn@latest init

# Development
npm install -D @types/node @types/react @types/react-dom typescript eslint
```

---

## Alternatives Considered

| Category | Recommended | Alternative | When to Use Alternative |
|----------|-------------|-------------|------------------------|
| **Framework** | Next.js 15 | Remix/Vite | Choose Remix if you prefer progressive enhancement over SSR. Choose Vite if you want framework-agnostic flexibility. |
| **Backend** | Supabase | Firebase | Use Firebase if you need the broadest ecosystem or are already in Google Cloud. Supabase has better SQL/Postgres compatibility and pricing. |
| **Database** | PostgreSQL (Supabase) | SQLite (PowerSync) | Use PowerSync + SQLite for complex offline-first scenarios with bi-directional sync. Overkill for simple match tracking. |
| **Real-time** | SSE (Supabase Realtime) | Socket.io | Use Socket.io if you need true bidirectional communication (chat features). SSE is simpler for one-way updates. |
| **State Management** | React Context + Server Actions | Zustand/Redux | Use Zustand for complex client-side state. Server Actions in Next.js 15 reduce need for global state. |
| **Styling** | Tailwind CSS | CSS Modules | Use CSS Modules for component encapsulation without build-time dependencies. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **WebSockets for simple updates** | Overkill for score updates and notifications. Adds complexity, harder to scale, requires separate server infrastructure. | Server-Sent Events (SSE) or Supabase Realtime |
| **LocalStorage for offline data** | Synchronous (blocks main thread), 5MB limit, no indexing, poor performance with large datasets. | IndexedDB with `idb` wrapper |
| **Manual Service Worker code** | Easy to get wrong, caching strategies are complex, hard to debug. | Workbox library |
| **Firebase (entire suite)** | Vendor lock-in, proprietary database (Firestore), less flexible than Postgres for relational data. | Supabase (open source, standard Postgres) |
| **React Query for offline** | Not designed for offline-first. No built-in sync conflict resolution. | IndexedDB + Background Sync API |
| **PWA with Angular/Vue** | React ecosystem has better PWA tooling, larger community for mobile-first apps. | Next.js + React (industry standard for PWAs in 2025) |
| **Native app (React Native/Flutter)** | Project constraints specify web-based, no installation required. Adds app store friction. | PWA with Next.js |

---

## Stack Patterns for Calcetto Manager

### If prioritizing offline-first match scoring:
- Use **idb** for local match state storage
- Queue score updates with **Background Sync API**
- Sync to Supabase when connection restored
- Show optimistic UI updates immediately

### If prioritizing real-time live matches:
- Use **Supabase Realtime** for score broadcasting
- Combine with **Server Actions** for score mutations
- Use **useOptimistic** hook for instant UI feedback

### If prioritizing image-heavy features (match highlights):
- Use **browser-image-compression** before upload
- Upload to **Supabase Storage** with transformation parameters
- Lazy load images with **next/image**

---

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| React 19 | Next.js 15.x | Required pairing. Next.js 15 is designed for React 19. |
| idb 8.x | All modern browsers | Chrome 58+, Firefox 55+, Safari 10.1+. IE not supported (intentionally). |
| Workbox 7.x | Next.js 15 | Use `next-pwa` plugin or manual Workbox integration. |
| Supabase JS 2.x | Next.js 15 App Router | Use `@supabase/ssr` for server components. |
| Tailwind CSS 4.x | Next.js 15 | Use `@tailwindcss/postcss` with Next.js 15. |

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| **Core Framework (React 19 + Next.js 15)** | HIGH | Official stable releases, production-ready, verified via official docs. |
| **Offline Support (idb + Workbox)** | HIGH | Mature libraries, widely used, Google-backed (Workbox). |
| **Database (Supabase)** | HIGH | Production-ready, extensive documentation, used by millions of projects. |
| **Real-time (SSE)** | HIGH | Native browser API, well-supported, simpler than WebSockets. |
| **Image Handling** | HIGH | Standard libraries, proven patterns. |
| **PWA/Service Workers** | MEDIUM-HIGH | Well-established but testing on real devices always reveals edge cases. |

---

## GDPR Compliance Notes

The chosen stack supports GDPR compliance:

1. **Supabase**: EU data residency options, row-level security, data deletion APIs
2. **IndexedDB**: Data stays client-side until explicitly synced
3. **Push Notifications**: Explicit opt-in required (browser-native permission model)
4. **Images**: Process client-side before upload (browser-image-compression), no third-party image services

---

## Sources

### Official Documentation
- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19) — Verified stable release, Actions API, useOptimistic
- [Next.js 15 Blog Post](https://nextjs.org/blog/next-15) — Turbopack stable, React 19 support, caching changes
- [MDN Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) — Core offline capabilities
- [MDN IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) — Client-side storage
- [MDN Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API) — Push notifications
- [MDN Background Sync API](https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API) — Deferred sync
- [Supabase Documentation](https://supabase.com/docs) — Backend, Auth, Storage, Realtime
- [Workbox Documentation](https://developer.chrome.com/docs/workbox) — Service worker library

### Community Resources
- [idb library (GitHub)](https://github.com/jakearchibald/idb) — IndexedDB wrapper
- [browser-image-compression (npm)](https://www.npmjs.com/package/browser-image-compression) — Client-side image compression
- [Web.dev PWA Guides](https://web.dev/progressive-web-apps) — PWA best practices

### Research Articles (2025)
- Progressive Web Apps with Next.js in 2025 (Mikul Gohil)
- Server-Sent Events vs WebSockets comparison articles (multiple sources)
- Offline-first frontend apps in 2025: IndexedDB and SQLite (LogRocket)

---

*Stack research for: Mobile-first sports team management PWA*  
*Researched: 2026-02-13*  
*Confidence: HIGH*
