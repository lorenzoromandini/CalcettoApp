# Domain Pitfalls: Sports Team Management Mobile Web Apps

**Project:** Calcetto Manager  
**Domain:** Sports team management, mobile-first PWA with real-time features  
**Researched:** February 13, 2026  
**Overall Confidence:** MEDIUM (WebSearch + CodeSearch verified)

---

## Critical Pitfalls

Mistakes that cause rewrites, major data loss, or complete feature failure.

### 1. WebSocket Reliability Without Fallback
**What goes wrong:**  
Building live match tracking (score, timer, events) purely on WebSockets without handling mobile network instability leads to missed events, stale scores, and users seeing incorrect match states. Mobile browsers aggressively throttle background tabs, terminate connections after 5+ minutes of inactivity, and struggle with WiFi/cellular handoffs.

**Why it happens:**  
- WebSocket has **no built-in reconnection**—developers must implement it manually  
- Mobile Safari suspends WebSocket connections when app goes to background  
- Corporate networks and mobile carriers often block or drop WebSocket connections  
- Browser tab throttling reduces heartbeat frequency, causing server-side timeouts

**Consequences:**  
- Lost goal events, incorrect match statistics  
- Multiple users seeing different scores simultaneously  
- Failed match state recovery after reconnection  
- Users lose trust in real-time features

**Prevention:**  
1. **Implement exponential backoff reconnection** with jitter (start at 1s, max 30s)
2. **Use heartbeat/ping-pong** every 30 seconds to detect stale connections
3. **Queue missed events** client-side with timestamps; request replay on reconnect
4. **Implement HTTP polling fallback** for unreliable networks
5. **Store authoritative state server-side**—treat client as cache, not source of truth
6. **Use visibilitychange API** to aggressively reconnect when tab becomes active

**Detection warning signs:**  
- WebSocket disconnects every 3-5 minutes in testing  
- Score updates stop when switching apps on mobile  
- Multiple concurrent connections from same user visible in logs

**Phase to address:** Phase 2 (Real-time features) — must be designed in from the start, not retrofitted.

---

### 2. Drag-and-Drop Formation Builder as Only Input Method
**What goes wrong:**  
Implementing drag-and-drop as the sole method for team formation on mobile creates a frustrating, error-prone experience. Users struggle with "fat finger" precision, accidental drops, and no way to correct mistakes without starting over.

**Why it happens:**  
- Touch screens lack hover states to indicate draggable items  
- Fingers obscure visual feedback during drag (can't see what's under finger)  
- Collision detection thresholds are hard to tune for mobile  
- No undo mechanism leads to destructive accidental drops  
- Scrolling conflicts with dragging on small screens

**Consequences:**  
- High abandonment rate during match setup  
- Users accidentally place wrong players in positions  
- Accessibility failures (motor impairments, screen readers)  
- Negative app store reviews citing "broken formation editor"

**Prevention:**  
1. **Always provide non-drag alternatives:** tap-to-select + tap-to-place, +/- position buttons
2. **Use large touch targets** (minimum 44x44px for drag handles, 60x60px for football pitch positions)
3. **Implement haptic feedback** on grab and valid drop
4. **Show ghost/preview of dragged item above finger** (offset by 40px)
5. **Add magnetic snapping** with generous drop zones (30% larger than visual target)
6. **Support keyboard navigation** for accessibility (Tab to select, arrows to move, Enter to place)
7. **Always allow undo** (Ctrl+Z and dedicated undo button)

**Detection warning signs:**  
- User testing shows 3+ attempts to place single player  
- Analytics show 40%+ drop-off at formation screen  
- Support tickets mentioning "can't move players"

**Phase to address:** Phase 3 (Match management) — design both interactions in parallel.

---

### 3. Offline-First Without Conflict Resolution Strategy
**What goes wrong:**  
Allowing offline match data entry (scores, stats, ratings) without a conflict resolution strategy leads to data loss when multiple offline users sync. The "last write wins" default overwrites legitimate updates.

**Why it happens:**  
- Match observers (captains) may both record scores offline  
- Default IndexedDB → Server sync uses timestamp-only comparison  
- No operational transform or CRDT (Conflict-free Replicated Data Types) logic  
- Background sync fires independently for each user

**Consequences:**  
- Lost player statistics and ratings  
- Inconsistent leaderboards  
- Users lose trust after "my stats disappeared"  
- Support nightmare reconciling match histories

**Prevention:**  
1. **Implement operational transform or event sourcing** for match events (each goal, card, sub is an immutable event)
2. **Use server-side event log as source of truth**—clients append events, never overwrite
3. **Detect conflicts** (same match, overlapping time window) and flag for manual review
4. **Show sync status prominently**—users must know if their data is pending, synced, or conflicted
5. **Implement optimistic locking** with version vectors per match
6. **Keep local "pending operations" queue** with retry logic, not just raw state

**Detection warning signs:**  
- Testing with two offline devices shows data loss on sync  
- Match history shows impossible states (score goes backward)  
- Users report "stats keep resetting"

**Phase to address:** Phase 4 (Statistics & sync) — architectural decision requiring server-side support.

---

### 4. Service Worker Caching Breaking Live Match Data
**What goes wrong:**  
Over-aggressive service worker caching serves stale match data (score, time remaining) from cache instead of fetching fresh data, leading to users seeing outdated scores.

**Why it happens:**  
- Default "cache-first" strategy applied to all API calls  
- No differentiation between static assets (cacheable) and live data (never cache)  
- Stale-while-revalidate shows old data briefly before refresh (unacceptable for live scores)

**Consequences:**  
- Users celebrate goals that were already scored 5 minutes ago  
- Captains make wrong substitutions based on stale score  
- Live timer shows incorrect remaining time

**Prevention:**  
1. **Never cache live match endpoints** (`/api/matches/{id}/live`, `/api/matches/{id}/events`)
2. **Use network-first strategy** for match state with short timeout (2s), then fallback to "last known" with clear "offline mode" indicator
3. **Cache-bust with timestamp** in URL for API calls that should be fresh
4. **Separate cache namespaces:** `static-shell-v1`, `api-data-v1`, `live-data-NO-CACHE`
5. **Explicit no-cache headers** from server for real-time endpoints

```javascript
// Service Worker routing example
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // NEVER cache live match data
  if (url.pathname.includes('/api/matches/') && url.pathname.includes('/live')) {
    event.respondWith(fetch(event.request)); // Network only
    return;
  }
  
  // Cache-first for static assets
  if (event.request.destination === 'image' || event.request.destination === 'script') {
    event.respondWith(cacheFirst(event.request));
    return;
  }
});
```

**Detection warning signs:**  
- Score updates lag behind real-time by minutes  
- DevTools shows "(from ServiceWorker)" for live API calls  
- Multiple users report seeing different scores

**Phase to address:** Phase 1 (Foundation) — design caching strategy before implementing any service worker.

---

### 5. Touch Gesture Conflicts in Live Match Interface
**What goes wrong:**  
During live match tracking, swipe gestures (to navigate between screens) conflict with tap-to-score buttons, causing accidental inputs. Users swipe to check stats and accidentally register a goal.

**Why it happens:**  
- No gesture isolation between navigation and game controls  
- Touch targets too large or poorly positioned  
- Lack of confirmation for high-impact actions (goal, red card)  
- No "match mode" that locks navigation

**Consequences:**  
- Incorrect match statistics  
- Angry users unable to undo critical match events  
- Captains stop using app mid-match due to mistrust

**Prevention:**  
1. **Implement match "lock mode"**—once match starts, require explicit "edit mode" toggle for changes
2. **Require confirmation** for goals, cards, and final whistle (modal or "hold for 2 seconds")
3. **Isolate gesture zones**—score controls in bottom third, navigation in top third
4. **Use distinct visual states** for active match (full screen, different color scheme)
5. **Support undo** for last action (with 10-second window)
6. **Disable swipe navigation** during active match—use explicit tabs/buttons only

**Detection warning signs:**  
- Analytics show accidental goal events followed by immediate corrections  
- User testing reveals frustration with "slippery" interface  
- Support tickets for incorrect stats

**Phase to address:** Phase 3 (Match management) — critical for live tracking UX.

---

## Moderate Pitfalls

### 6. Inadequate Storage Management Leading to Quota Exceeded
**What goes wrong:**  
Storing all match history, player avatars, and statistics in IndexedDB without cleanup leads to storage quota exceeded errors, especially on iOS Safari (50MB limit).

**Prevention:**  
- Implement LRU (Least Recently Used) cache eviction  
- Compress avatars before storage (max 100KB each)  
- Store only last 10 matches locally; fetch older from server  
- Handle `QuotaExceededError` gracefully with user notification

**Phase to address:** Phase 4 (Statistics) — as data volume grows.

---

### 7. Push Notification Permission Timing
**What goes wrong:**  
Requesting push notification permission on first launch results in 90%+ denial rates. Users have no context for why they should enable notifications.

**Prevention:**  
- Request permission **after** user creates first match or team  
- Explain value proposition before showing system dialog  
- Provide settings to customize notification types (match reminders vs. team invites)  
- Gracefully handle "denied"—don't repeatedly ask

**Phase to address:** Phase 5 (Notifications) — user trust moment.

---

### 8. Image Upload Without Optimization
**What goes wrong:**  
Users upload high-resolution photos for avatars (5MB+), causing slow uploads on mobile networks and storage quota issues.

**Prevention:**  
- Client-side resize before upload (max 500x500px for avatars)  
- Convert to WebP format  
- Show upload progress and allow cancellation  
- Implement server-side compression and CDN delivery

**Phase to address:** Phase 1 (Foundation) — implement in file upload component.

---

### 9. GDPR Compliance Afterthought
**What goes wrong:**  
Storing player data (names, photos, match history) without proper consent mechanisms, data export, or deletion capabilities.

**Prevention:**  
- Implement explicit consent checkbox during team invitation  
- Provide "Download my data" feature  
- Implement soft delete with 30-day retention, then hard delete  
- Anonymize statistics when player account deleted (keep match result, remove personal link)

**Phase to address:** Phase 1 (Foundation) — legal requirement.

---

### 10. Formation State Not Persisted During Interruptions
**What goes wrong:**  
User spends 5 minutes setting up formation, receives phone call, browser kills background tab, formation is lost.

**Prevention:**  
- Auto-save formation to IndexedDB every 5 seconds  
- Restore from draft on page load  
- Warn before closing tab if unsaved changes exist (`beforeunload` event)

**Phase to address:** Phase 3 (Match management) — prevents user frustration.

---

## Phase-Specific Warnings

| Phase | Topic | Likely Pitfall | Mitigation |
|-------|-------|----------------|------------|
| 1 | Service Worker Setup | Caching live API data | Explicit network-only routing for `/live` endpoints |
| 1 | Image Upload | Uncompressed uploads | Client-side resize + WebP conversion |
| 2 | WebSocket Integration | No reconnection logic | Exponential backoff + heartbeat |
| 2 | Real-time Sync | Missing conflict resolution | Event sourcing with server-side log |
| 3 | Drag-and-Drop | Only input method | Provide tap-to-place alternative |
| 3 | Live Match UI | Accidental inputs | Match lock mode + confirmations |
| 4 | Offline Storage | Quota exceeded | LRU eviction + server offload |
| 4 | Statistics | Data inconsistency | Version vectors + conflict flags |
| 5 | Push Notifications | Permission spam | Contextual request after value demonstrated |

---

## Sources

**WebSocket Reliability:**
- OneUptime Blog: "How to Implement Reconnection Logic for WebSockets" (Jan 2026) — https://oneuptime.com/blog/post/2026-01-27-websocket-reconnection/view
- StackOverflow: "WebSocket support on mobile devices" — connection failures on mobile networks
- Reddit r/AskProgramming: "Why WebSockets haven't seen much adoption" — real-world reliability issues
- MaybeWorks: "WebSocket: Pros, Cons, and Limitations" — no built-in reconnection
- Ably Blog: "Do you still need a WebSocket fallback in 2024?" — mobile and firewall issues

**Drag-and-Drop Mobile UX:**
- Pencil & Paper: "Drag & Drop UX Design Best Practices" (April 2024) — touch precision, affordance issues
- Nielsen Norman Group: "Drag–and–Drop: How to Design for Ease of Use" (Feb 2020) — mobile alternatives, accessibility
- Digia Tech: "The Hidden Complexity Behind Drag-and-Drop UI Systems" (Nov 2025) — 60fps requirements, collision detection
- LogRocket Blog: "Designing drag and drop UIs: Best practices and patterns" (July 2025) — mobile alternatives, 44px touch targets

**Offline-First & PWA:**
- Medium: "Building an Offline-First PWA Notes App with Next.js, IndexedDB, and Supabase" — sync queues, conflict resolution
- MagicBell: "Offline-First PWAs: Service Worker Caching Strategies" — network-first vs cache-first
- SignalDB: "Offline-First Approach with Reactive JavaScript Databases" — conflict resolution strategies
- GTCSys: "Data Synchronization in PWAs" — Last-Write-Wins limitations
- MDN: "Offline and background operation" — Background Sync API limitations
- Rishi Chawda: "Advanced PWA Playbook" (Nov 2025) — cache hygiene, IndexedDB patterns

**Confidence Assessment:**
| Area | Confidence | Notes |
|------|------------|-------|
| WebSocket pitfalls | MEDIUM | Multiple community sources + code examples |
| Drag-and-drop mobile | HIGH | NNGroup + Pencil & Paper authoritative UX research |
| Offline-first | MEDIUM | Multiple sources, consistent patterns |
| Service Workers | MEDIUM | MDN + Advanced PWA Playbook |

---

## Research Gaps

These areas need validation during implementation:

1. **Sport-specific patterns:** Research on football (soccer) formation UX specifically limited—general D&D research applied
2. **iOS Safari throttling:** Exact behavior changes between iOS versions; requires device testing
3. **GDPR for sports apps:** Specific precedents for amateur sports data not found—general GDPR guidance applied
