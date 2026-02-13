# Architecture Research: Sports Team Management Apps

**Domain:** Mobile-first sports team management (football/futsal)
**Researched:** 2026-02-13
**Confidence:** HIGH

## Executive Summary

Sports team management apps require a Progressive Web App (PWA) architecture that prioritizes mobile performance, offline resilience, and real-time collaboration. Based on current ecosystem research, the optimal architecture combines:

- **Frontend:** React-based PWA with Service Workers for offline-first experience
- **Real-time:** Socket.io for live match score updates
- **Storage:** IndexedDB for offline data + MongoDB/Firestore for persistence
- **Image handling:** Cloudinary for automatic optimization and CDN delivery
- **Notifications:** Web Push API with Service Workers

The architecture follows an "offline-first" philosophy where the app works without connectivity first, then syncs when possible.

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Match UI   │  │  Team Mgmt   │  │  Dashboard   │  │  Formation   │    │
│  │   (Live)     │  │   (CRUD)     │  │   (Stats)    │  │   Builder    │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                 │                 │            │
├─────────┴─────────────────┴─────────────────┴─────────────────┴────────────┤
│                         SERVICE WORKER LAYER                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Cache API (App Shell + Assets)  │  IndexedDB (User Data/Queue)    │    │
│  │  ├─ Cache-First for shell         │  ├─ Teams, Players, Matches     │    │
│  │  ├─ Stale-While-Revalidate        │  ├─ Offline mutations queue     │    │
│  │  └─ Background Sync API           │  └─ Conflicts resolution        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────────────────┤
│                          CLIENT STATE LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    React Context / Zustand Store                     │    │
│  │  ├─ Auth State (JWT)                                                │    │
│  │  ├─ Match State (Live scores, timer)                                │    │
│  │  ├─ UI State (Forms, modals)                                        │    │
│  │  └─ Sync Status (Online/Offline indicator)                          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼ (HTTPS/WS)
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Node.js + Express Server                        │    │
│  │  ├─ REST API (CRUD operations)                                       │    │
│  │  ├─ Socket.io Handler (Real-time events)                             │    │
│  │  ├─ Push Notification Service (Web Push)                             │    │
│  │  └─ Image Upload Handler (Cloudinary)                                │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
┌───────────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│    MongoDB/Firestore   │ │   Redis (Cache)    │ │   Cloudinary CDN  │
│  ├─ Users             │ │ ├─ Sessions        │ │ ├─ Avatars        │
│  ├─ Teams             │ │ ├─ Leaderboard     │ │ ├─ Match Photos   │
│  ├─ Matches           │ │ └─ Rate Limiting   │ │ └─ Optimized URLs │
│  ├─ Players           │ └───────────────────┘ └───────────────────┘
│  └─ Statistics        │
└───────────────────────┘
```

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| **Match UI** | Live timer, score input, real-time updates | Service Worker, Socket.io client, State Store |
| **Formation Builder** | Drag-drop interface for team lineups | State Store, Cloudinary (for avatars) |
| **Team Management** | CRUD for teams, players, roles | REST API, IndexedDB, State Store |
| **Dashboard** | Statistics, leaderboards, history | REST API, IndexedDB, State Store |
| **Service Worker** | Caching, background sync, push handling | Cache API, IndexedDB, Push API |
| **Socket.io Client** | Real-time connection for live matches | Socket.io Server (via WS) |
| **Auth Service** | JWT management, login/logout | REST API, LocalStorage (token) |
| **Sync Engine** | Detect conflicts, queue offline operations | IndexedDB, REST API |

## Recommended Project Structure

### Frontend (React PWA)

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Atomic: Button, Input, Card
│   ├── layout/          # Header, Navigation, PageShell
│   └── features/        # Feature-specific components
│       ├── match/
│       │   ├── LiveTimer.tsx
│       │   ├── ScoreBoard.tsx
│       │   └── MatchActions.tsx
│       ├── team/
│       │   ├── PlayerCard.tsx
│       │   ├── FormationCanvas.tsx
│       │   └── TeamSelector.tsx
│       └── dashboard/
│           ├── StatsChart.tsx
│           └── Leaderboard.tsx
├── hooks/               # Custom React hooks
│   ├── useOnlineStatus.ts
│   ├── useSync.ts
│   ├── useLiveMatch.ts
│   └── useLocalStorage.ts
├── services/            # API and external service wrappers
│   ├── api/             # REST API clients
│   │   ├── teams.ts
│   │   ├── matches.ts
│   │   └── players.ts
│   ├── realtime/        # Socket.io integration
│   │   └── socket.ts
│   ├── storage/         # IndexedDB wrapper
│   │   └── db.ts
│   └── push/            # Push notification service
│       └── notifications.ts
├── stores/              # State management (Zustand/Context)
│   ├── authStore.ts
│   ├── matchStore.ts
│   └── syncStore.ts
├── workers/             # Service Worker files
│   ├── service-worker.ts
│   └── background-sync.ts
├── utils/               # Helpers and utilities
│   ├── validators.ts
│   ├── formatters.ts
│   └── constants.ts
├── types/               # TypeScript definitions
│   └── index.ts
└── assets/              # Static assets
    ├── icons/
    └── manifest.json
```

### Backend (Node.js + Express)

```
src/
├── config/              # Configuration files
│   ├── database.ts
│   ├── cloudinary.ts
│   └── push.ts
├── routes/              # API route definitions
│   ├── teams.ts
│   ├── matches.ts
│   ├── players.ts
│   └── auth.ts
├── controllers/         # Request handlers
│   ├── teamController.ts
│   ├── matchController.ts
│   └── playerController.ts
├── services/            # Business logic
│   ├── matchService.ts
│   ├── syncService.ts
│   └── notificationService.ts
├── models/              # Database models
│   ├── Team.ts
│   ├── Match.ts
│   └── Player.ts
├── middleware/          # Express middleware
│   ├── auth.ts
│   ├── errorHandler.ts
│   └── rateLimiter.ts
├── realtime/            # Socket.io handlers
│   ├── matchHandlers.ts
│   └── connection.ts
├── utils/               # Utilities
│   ├── validators.ts
│   └── helpers.ts
└── app.ts               # Application entry
```

## Architectural Patterns

### Pattern 1: Offline-First with Service Workers

**What:** The app functions without network connectivity by caching assets in the Service Worker and storing user data in IndexedDB. Network requests are intercepted and served from cache when offline, with changes queued for sync.

**When to use:** Essential for mobile-first apps where users may have intermittent connectivity during matches or on the move.

**Trade-offs:**
- **Pros:** App works anywhere, faster perceived performance, reduced server load
- **Cons:** Complexity in conflict resolution, larger bundle size, cache management overhead

**Implementation:**
```typescript
// Service Worker with Workbox
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// Precache app shell
precacheAndRoute(self.__WB_MANIFEST);

// Cache-first for static assets
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({ maxEntries: 60 }),
    ],
  })
);

// Network-first for API with background sync
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new BackgroundSyncPlugin('api-queue', {
        maxRetentionTime: 24 * 60, // Retry for 24 hours
      }),
    ],
  })
);
```

### Pattern 2: App Shell Pattern

**What:** Cache the minimal HTML, CSS, and JavaScript needed to render the UI structure (shell) immediately, then load content dynamically.

**When to use:** Critical for PWAs to achieve instant first paint, especially on mobile with slow connections.

**Trade-offs:**
- **Pros:** Instant UI, native-app feel, works offline immediately
- **Cons:** Requires careful cache versioning, potential for stale shell

**Implementation:**
```typescript
// The shell is cached during SW install
const SHELL_CACHE = 'app-shell-v1';
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css',
  '/icons/icon-192x192.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => {
      return cache.addAll(SHELL_ASSETS);
    })
  );
});
```

### Pattern 3: Real-Time State Synchronization

**What:** Use Socket.io for bidirectional real-time communication during live matches. Server maintains authoritative state, clients subscribe to updates.

**When to use:** Essential for live match tracking where multiple users need instant score updates.

**Trade-offs:**
- **Pros:** Instant updates, handles reconnection automatically, rooms for match isolation
- **Cons:** Socket.io library overhead, requires connection management

**Implementation:**
```typescript
// Server-side: Match room management
io.on('connection', (socket) => {
  socket.on('join-match', (matchId) => {
    socket.join(`match:${matchId}`);
  });

  socket.on('score-update', async (data) => {
    // Validate and update in database
    const updatedMatch = await updateMatchScore(data);
    // Broadcast to all clients in the match room
    io.to(`match:${data.matchId}`).emit('score-changed', updatedMatch);
  });
});

// Client-side: React hook for live matches
function useLiveMatch(matchId: string) {
  const [match, setMatch] = useState(null);
  
  useEffect(() => {
    socket.emit('join-match', matchId);
    socket.on('score-changed', (updatedMatch) => {
      setMatch(updatedMatch);
    });
    return () => {
      socket.off('score-changed');
    };
  }, [matchId]);
  
  return match;
}
```

### Pattern 4: Background Sync for Offline Mutations

**What:** Queue user actions (create match, update score) when offline, automatically sync when connection restored.

**When to use:** Critical for data integrity when users lose connectivity during match recording.

**Trade-offs:**
- **Pros:** No data loss, transparent to users, automatic retry
- **Cons:** Conflict resolution complexity, potential for duplicate operations

**Implementation:**
```typescript
// IndexedDB setup for offline queue
const db = await openDB('calcetto-db', 1, {
  upgrade(db) {
    db.createObjectStore('offline-actions', { keyPath: 'id' });
    db.createObjectStore('teams', { keyPath: '_id' });
    db.createObjectStore('matches', { keyPath: '_id' });
  },
});

// Queue action when offline
async function queueAction(action) {
  await db.add('offline-actions', {
    id: crypto.randomUUID(),
    action,
    timestamp: Date.now(),
    retryCount: 0
  });
  
  // Register for background sync
  const registration = await navigator.serviceWorker.ready;
  await registration.sync.register('sync-matches');
}

// Service Worker processes queue
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-matches') {
    event.waitUntil(syncOfflineActions());
  }
});
```

### Pattern 5: Optimistic UI Updates

**What:** Update UI immediately on user action, rollback if server rejects. Combined with offline-first, gives instant feedback.

**When to use:** For match actions (goals, substitutions) where users expect immediate visual feedback.

**Trade-offs:**
- **Pros:** Instant feedback, feels responsive
- **Cons:** Must handle rollback edge cases

**Implementation:**
```typescript
function MatchScoreBoard() {
  const [score, setScore] = useOptimistic(
    match.score,
    (current, newGoal) => ({
      ...current,
      [newGoal.team]: current[newGoal.team] + 1
    })
  );

  const handleGoal = async (team) => {
    // Optimistic update
    setScore({ team });
    
    try {
      await api.recordGoal(match.id, team);
    } catch (error) {
      // Rollback on failure
      toast.error('Failed to record goal');
    }
  };

  return (
    <div className="scoreboard">
      <span>{score.home}</span> - <span>{score.away}</span>
    </div>
  );
}
```

## Data Flow

### Request Flow (Standard CRUD)

```
User Action
    ↓
Component → Action Creator → Optimistic Update → UI reflects change
    ↓
API Service → Service Worker (cache check) → Network Request
    ↓
Server Controller → Service → Database
    ↓
Response → Service Worker (update cache) → Update State → UI finalizes
```

### Offline Write Flow

```
User Action (Offline)
    ↓
Component → Action Creator → Optimistic Update → UI reflects change
    ↓
API Service detects offline
    ↓
Queue in IndexedDB → Show "Pending sync" indicator
    ↓
[Network restored]
    ↓
Background Sync triggered
    ↓
Process queue → Send to server → Resolve conflicts
    ↓
Update local state → Clear indicator
```

### Real-Time Match Flow

```
User opens match
    ↓
Join Socket.io room
    ↓
Load initial state from IndexedDB → Render immediately
    ↓
Fetch fresh state from API → Merge updates
    ↓
[Another user scores]
    ↓
Server broadcasts to room
    ↓
Socket.io event received → Update state → UI updates instantly
```

## Key Data Flows

1. **Match Creation:** User creates match → Offline queue if needed → POST /api/matches → Response includes matchId → Join Socket.io room → Ready for live tracking

2. **Live Score Update:** User taps goal button → Optimistic UI update → POST /api/matches/:id/goals or Socket.io emit → Server validates → Broadcast to room → All connected clients update

3. **Team Management:** User edits team → Form validation → PATCH /api/teams/:id → Background sync if offline → Other users see updates on next refresh

4. **Image Upload:** User selects avatar → Client-side resize/compress → Upload to Cloudinary → Get optimized URL → Save to database → Cache in Service Worker

5. **Push Notification:** Server detects match reminder time → Query subscriptions → Send via Web Push API → Service Worker receives → Display notification → Click opens match

## Anti-Patterns to Avoid

### Anti-Pattern 1: "Online-First" Design

**What people do:** Build app assuming constant connectivity, add offline handling as afterthought.

**Why it's wrong:** Results in broken user experience in areas with poor connectivity (locker rooms, basements, outdoor fields).

**Do this instead:** Design for offline-first from day one. Every feature should work without network, sync as enhancement.

### Anti-Pattern 2: Monolithic Service Worker

**What people do:** Single large service-worker.js file handling all caching logic manually.

**Why it's wrong:** Hard to maintain, error-prone cache management, difficult to update.

**Do this instead:** Use Workbox for production-ready caching strategies, separate concerns into modules.

### Anti-Pattern 3: Polling for Real-Time Updates

**What people do:** Use setInterval to fetch updates every few seconds.

**Why it's wrong:** Wastes battery and bandwidth, creates unnecessary server load, updates aren't truly real-time.

**Do this instead:** Use Socket.io or WebSockets for true real-time bidirectional communication.

### Anti-Pattern 4: Storing Everything in LocalStorage

**What people do:** Use localStorage for all client-side data persistence.

**Why it's wrong:** 5MB limit, synchronous (blocks UI), no indexing, string-only storage.

**Do this instead:** Use IndexedDB for structured data, Cache API for assets, localStorage only for small config/tokens.

### Anti-Pattern 5: Ignoring Cache Versioning

**What people do:** Cache assets without versioning strategy.

**Why it's wrong:** Users see stale code after deployments, difficult to force updates.

**Do this instead:** Implement cache-busting with versioned filenames (main.[hash].js), use CacheStorage API to clean old caches.

## Scalability Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-100 users (MVP) | Single Node.js server, MongoDB Atlas free tier, Cloudinary free tier, Socket.io single instance. Use Workbox precaching. |
| 100-1,000 users | Add Redis for session store and Socket.io adapter, MongoDB dedicated cluster, implement API rate limiting, CDN for static assets. |
| 1,000-10,000 users | Horizontal scaling with load balancer, separate Socket.io servers with Redis adapter, database read replicas, implement database connection pooling. |
| 10,000+ users | Microservices split (auth, matches, teams), database sharding, edge caching with Cloudflare, separate push notification service, analytics pipeline. |

### Scaling Priorities for This Domain

1. **First bottleneck:** Socket.io connections (horizontal scaling with Redis adapter)
2. **Second bottleneck:** Database reads on leaderboards (add Redis caching layer)
3. **Third bottleneck:** Image delivery (Cloudinary paid tier with more transformations)

## Build Order Implications

Based on component dependencies, recommended build order:

### Phase 1: Foundation (Offline-First)
1. **Service Worker setup** - Enables offline capability
2. **IndexedDB layer** - Local data persistence
3. **API client** - REST communication with offline queue

### Phase 2: Core Features
4. **Auth system** - Required for all user data
5. **Team management** - CRUD with offline support
6. **Player management** - Depends on team

### Phase 3: Match Experience
7. **Match creation** - Depends on teams/players
8. **Live timer** - Client-side only, can be early
9. **Real-time sync** - Socket.io integration

### Phase 4: Enhancements
10. **Push notifications** - Service Worker enhancement
11. **Image uploads** - Cloudinary integration
12. **Dashboard/analytics** - Depends on match data

## Sources

- [Ably: Design patterns for sports apps](https://ably.com/blog/design-patterns-sports-live-events) - HIGH confidence
- [MDN: Offline and background operation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation) - HIGH confidence
- [WebKit: Declarative Web Push](https://webkit.org/blog/16535/meet-declarative-web-push) - HIGH confidence (March 2025)
- [W3C: Push API](https://www.w3.org/TR/push-api/) - HIGH confidence (December 2025)
- [Google Workbox Documentation](https://developer.chrome.com/docs/workbox) - HIGH confidence
- [OneUptime: PWA is the future](https://oneuptime.com/blog/post/2025-08-19-native-apps-had-a-good-run-but-pwa-has-caught-up-and-is-the-future/view) - MEDIUM confidence
- [Netguru: React project structure 2025](https://www.netguru.com/blog/react-project-structure) - MEDIUM confidence
- [Robin Wieruch: React folder structure](https://www.robinwieruch.de/react-folder-structure/) - MEDIUM confidence
- [Cloudinary vs S3 comparison](https://cloudinary.com/guides/ecosystems/cloudinary-vs-s3) - MEDIUM confidence
