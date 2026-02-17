# Phase 04: Live Match Experience - Research

**Researched:** 2026-02-17  
**Domain:** Real-time sports tracking, mobile PWA, offline-first architecture  
**Confidence:** HIGH

## Summary

The Live Match Experience is the most technically complex phase, requiring coordination of real-time synchronization, accurate timing, offline resilience, and mobile-optimized UX. Research confirms Supabase Realtime uses WebSocket (not SSE) under the hood, with known mobile-specific challenges around background/sleep states that require careful heartbeat management. Timer accuracy demands `performance.now()` or elapsed-time calculation rather than simple `setInterval` counting. Background Sync API provides reliable offline mutation queuing, while Screen Wake Lock API prevents device sleep during active matches.

**Primary recommendation:** Build on Supabase Realtime with heartbeat monitoring, use `performance.now()`-based elapsed time calculation for match timer, implement Background Sync for offline mutations, and employ Screen Wake Lock + `touch-action: none` CSS for mobile UX.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Supabase Realtime | supabase-js v2.x | Real-time sync for scores/events | Uses Phoenix Channels/WebSocket, handles millions of connections |
| Screen Wake Lock API | Native Web API | Prevent device sleep during matches | Native browser API, no library needed |
| Background Sync API | Native Web API | Queue mutations when offline | PWA standard, supported in Chrome/Edge/Samsung |
| performance.now() | Native Web API | High-precision elapsed time | Monotonic clock, immune to system time changes |

### Supporting
| Library | Purpose | When to Use |
|---------|---------|-------------|
| react-use-precision-timer | Alternative timer hook | If custom timer hook becomes complex |
| NoSleep.js | Wake lock fallback | For Safari <16.4 wake lock support |
| lodash/debounce | Input throttling | Prevent rapid event spam |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Supabase Realtime | Socket.io + Redis | Lose built-in Postgres integration, gain more control |
| Background Sync API | IndexedDB + manual retry | More complex, but broader browser support |
| Screen Wake Lock | NoSleep.js shim | Shim plays invisible video; less efficient |

## Architecture Patterns

### Recommended Project Structure
```
app/
├── match/
│   ├── [id]/
│   │   ├── page.tsx              # Match tracking UI
│   │   ├── layout.tsx            # Match-specific providers
│   │   └── components/
│   │       ├── Scoreboard.tsx    # Live score display
│   │       ├── MatchTimer.tsx    # Timer with controls
│   │       ├── EventRecorder.tsx # Goal/assist/card buttons
│   │       └── LockMode.tsx      # One-handed lock overlay
├── hooks/
│   ├── useMatchTimer.ts          # Accurate pause/resume timer
│   ├── useRealtimeMatch.ts       # Supabase channel management
│   ├── useBackgroundSync.ts      # Offline mutation queue
│   └── useWakeLock.ts            # Screen wake lock management
├── lib/
│   ├── match-events.ts           # Event recording types & helpers
│   ├── sync-queue.ts             # Background sync queue logic
│   └── optimistic-updates.ts     # Optimistic UI patterns
└── service-worker.ts             # Background sync event handlers
```

### Pattern 1: Accurate Match Timer with Pause/Resume
**What:** Calculate elapsed time from `performance.now()` deltas, not `setInterval` counting
**When to use:** Any timer that must be accurate across pauses, background tabs, and device sleep
**Example:**
```typescript
// Source: Verified from multiple timing best practices
function useMatchTimer() {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const pausedElapsedRef = useRef(0);

  const start = useCallback(() => {
    startTimeRef.current = performance.now();
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    if (startTimeRef.current) {
      pausedElapsedRef.current += performance.now() - startTimeRef.current;
      setElapsedMs(pausedElapsedRef.current);
    }
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    startTimeRef.current = performance.now();
    setIsRunning(true);
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      if (startTimeRef.current) {
        const current = performance.now() - startTimeRef.current + pausedElapsedRef.current;
        setElapsedMs(current);
      }
    }, 100); // Update every 100ms for smooth UI

    return () => clearInterval(interval);
  }, [isRunning]);

  // Handle visibility change (tab backgrounding)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && isRunning) {
        // Store current elapsed when going to background
        pausedElapsedRef.current = elapsedMs;
        startTimeRef.current = null;
      } else if (!document.hidden && isRunning && !startTimeRef.current) {
        // Resume calculation when tab becomes visible
        startTimeRef.current = performance.now();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isRunning, elapsedMs]);

  return { elapsedMs, isRunning, start, pause, resume };
}
```

### Pattern 2: Robust Supabase Realtime with Heartbeat Monitoring
**What:** Monitor connection health via `heartbeatCallback` and handle mobile sleep/background states
**When to use:** Real-time features where connection drops cause data loss or poor UX
**Example:**
```typescript
// Source: https://supabase.com/docs/guides/troubleshooting/realtime-handling-silent-disconnections
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  realtime: {
    heartbeatIntervalMs: 15000, // Send heartbeat every 15s (default: 25s)
    heartbeatCallback: (status) => {
      if (status === 'timeout') {
        console.warn('Realtime heartbeat timeout - connection may be lost');
        // Trigger reconnection or show offline indicator
      } else if (status === 'ok') {
        console.log('Realtime connection healthy');
      }
    }
  }
});

// Channel subscription with reconnection handling
function useRealtimeMatch(matchId: string) {
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  
  useEffect(() => {
    const channel = supabase
      .channel(`match:${matchId}`, {
        config: {
          broadcast: { self: true }, // Receive own broadcasts for confirmation
        }
      })
      .on('broadcast', { event: 'score_update' }, (payload) => {
        // Handle score updates
      })
      .on('broadcast', { event: 'match_event' }, (payload) => {
        // Handle goals/assists/cards
      })
      .subscribe((status) => {
        setConnectionState(status === 'SUBSCRIBED' ? 'connected' : 'disconnected');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  return { connectionState };
}
```

### Pattern 3: Background Sync for Offline Mutations
**What:** Queue mutations in IndexedDB, sync via service worker when online
**When to use:** Critical data entry that must not be lost during connectivity issues
**Example:**
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API
// In component/service
async function recordMatchEvent(event: MatchEvent) {
  // Optimistic update locally
  addLocalEvent(event);
  
  if (navigator.onLine) {
    try {
      await supabase.from('match_events').insert(event);
    } catch (error) {
      // Failed - queue for background sync
      await queueForSync(event);
    }
  } else {
    // Offline - queue immediately
    await queueForSync(event);
    
    // Register background sync
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register(`match-event-${event.match_id}`);
  }
}

// In service-worker.ts
self.addEventListener('sync', (event) => {
  if (event.tag.startsWith('match-event-')) {
    event.waitUntil(syncPendingEvents());
  }
});

async function syncPendingEvents() {
  const pending = await getQueuedEvents();
  for (const event of pending) {
    try {
      await supabase.from('match_events').insert(event);
      await removeFromQueue(event.id);
    } catch (error) {
      // Keep in queue for next sync attempt
      console.error('Sync failed for event:', error);
    }
  }
}
```

### Pattern 4: Mobile-Optimized One-Handed UI
**What:** Large touch targets, lock mode to prevent accidental navigation, wet-finger support
**When to use:** Active gameplay scenarios where precision is difficult
**Example:**
```typescript
// CSS touch-action prevents browser gestures
// Source: https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action
const lockModeStyles = {
  touchAction: 'none', // Disable all browser touch gestures
  userSelect: 'none',  // Prevent text selection
  WebkitUserSelect: 'none',
};

function MatchRecorder({ isLocked }: { isLocked: boolean }) {
  return (
    <div style={isLocked ? lockModeStyles : {}} className="match-recorder">
      {/* Large 64x64dp minimum touch targets */}
      <button 
        className="event-button"
        style={{ minWidth: 64, minHeight: 64 }}
        onClick={() => recordGoal()}
      >
        ⚽ Goal
      </button>
      
      <button 
        className="event-button assist"
        style={{ minWidth: 64, minHeight: 64 }}
        onClick={() => recordAssist()}
      >
        🎯 Assist
      </button>
      
      {/* Lock mode overlay */}
      {isLocked && (
        <div className="lock-overlay">
          <button onClick={() => unlock()}>Unlock (hold 2s)</button>
        </div>
      )}
    </div>
  );
}
```

### Pattern 5: Screen Wake Lock During Active Match
**What:** Prevent device screen from dimming/locking during gameplay
**When to use:** Any activity requiring continuous screen visibility without user interaction
**Example:**
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API
function useWakeLock(enabled: boolean) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!enabled || !('wakeLock' in navigator)) return;

    const requestLock = async () => {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        
        wakeLockRef.current.addEventListener('release', () => {
          console.log('Wake lock released');
        });
      } catch (err) {
        // May fail if battery low or other restrictions
        console.error('Wake lock failed:', err);
      }
    };

    requestLock();

    // Re-acquire lock when tab becomes visible again
    const handleVisibility = () => {
      if (!document.hidden && enabled) {
        requestLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      wakeLockRef.current?.release();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [enabled]);
}
```

### Anti-Patterns to Avoid

**1. Relying on `setInterval` counting for match time**
- **Why it's bad:** Timer drift accumulates, pauses/resumes lose accuracy, background tabs throttle to 1s intervals
- **What to do instead:** Calculate elapsed time from `performance.now()` or `Date.now()` deltas

**2. WebSocket-only reliability assumptions**
- **Why it's bad:** Mobile browsers aggressively suspend WebSockets in background; connections silently drop without errors
- **What to do instead:** Implement heartbeat monitoring, offline queuing, and reconnection with exponential backoff

**3. Optimistic updates without conflict resolution**
- **Why it's bad:** Race conditions when multiple users record events simultaneously lead to inconsistent state
- **What to do instead:** Use server timestamps, operation ordering, or CRDTs for conflict resolution

**4. Small touch targets (<44x44dp)**
- **Why it's bad:** Difficult to tap accurately, especially with wet fingers or in motion
- **What to do instead:** Minimum 44x44dp touch targets, 64x64dp for critical actions

**5. Not handling visibilitychange events**
- **Why it's bad:** Timer calculations break when tab backgrounds; wake locks release
- **What to do instead:** Listen for visibilitychange, re-acquire resources when visible again

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Connection state monitoring | Custom ping/pong | Supabase heartbeatCallback | Built into SDK, handles mobile sleep states |
| Offline mutation queue | LocalStorage array | IndexedDB + Background Sync | Handles complex retry logic, persists across sessions |
| Screen wake prevention | Video/audio shim | Screen Wake Lock API | Native API, battery-efficient, works on modern browsers |
| Match event timestamps | Client Date.now() | Server-generated timestamps | Avoids clock skew between devices |
| Conflict resolution | Simple last-write-wins | Operational ordering / timestamps | Prevents data loss in concurrent edits |

**Key insight:** Mobile browsers introduce failure modes (background suspension, aggressive throttling, wake lock policies) that don't exist on desktop. Using standard APIs and battle-tested patterns protects against these edge cases.

## Common Pitfalls

### Pitfall 1: Silent WebSocket Disconnections in Background
**What goes wrong:** When mobile browser tabs background or device sleeps, WebSocket heartbeats stop, server times out connection, client doesn't receive error
**Why it happens:** Browsers throttle JavaScript timers in background tabs; heartbeat intervals are missed
**How to avoid:** 
- Set shorter heartbeat interval (15s vs default 25s)
- Implement `heartbeatCallback` to detect timeouts
- Reconnect on `visibilitychange` when tab becomes visible
**Warning signs:** Events stop arriving without error messages; connection shows as "connected" but no data flows

### Pitfall 2: Timer Drift Over Long Matches
**What goes wrong:** 45-minute match timer shows 44:52 or 45:08 due to accumulated drift
**Why it happens:** `setInterval` callbacks don't fire at exact intervals; browser throttling in background
**How to avoid:**
- Calculate elapsed time from `performance.now()` delta
- Store `startTime` and subtract from current time on each tick
- Don't increment a counter

### Pitfall 3: Lost Events During Brief Offline Periods
**What goes wrong:** User records goal while connection flaky; event never reaches server
**Why it happens:** No retry mechanism; optimistic update confirmed locally but server never received it
**How to avoid:**
- Queue all mutations to IndexedDB first
- Use Background Sync API for automatic retry
- Show pending state indicator to user

### Pitfall 4: Touch Gesture Conflicts with Browser Navigation
**What goes wrong:** User swipes to record event but browser interprets as back navigation; match page closes
**Why it happens:** Default browser swipe gestures (back/forward) conflict with app gestures
**How to avoid:**
- Use `touch-action: none` CSS during match
- Implement lock mode requiring long-press to unlock
- Disable pull-to-refresh

### Pitfall 5: Screen Sleep During Active Match
**What goes wrong:** Device screen dims/locks mid-match; user must constantly tap to keep awake
**Why it happens:** Default OS power management doesn't know app needs continuous display
**How to avoid:**
- Request Screen Wake Lock when match starts
- Re-acquire on visibilitychange (locks auto-release when tab hidden)
- Provide fallback for unsupported browsers

### Pitfall 6: Race Conditions with Multiple Recorders
**What goes wrong:** Two users record events simultaneously; one overwrites the other or events appear out of order
**Why it happens:** No coordination between clients; optimistic updates assume single writer
**How to avoid:**
- Include client-generated UUIDs with each event
- Use server timestamps as source of truth
- Implement event replay/ordering on client

## Code Examples

### Match Event Data Model
```typescript
// Standard sports event schema based on research
// Source: Marcotti Events, IPTC Sport Schema, Sportmonks

interface MatchEvent {
  id: string;                    // UUID v4, client-generated
  match_id: string;              // Reference to match
  event_type: 'goal' | 'assist' | 'yellow_card' | 'red_card' | 
              'substitution' | 'own_goal' | 'penalty';
  player_id: string;             // Primary player involved
  player_id_secondary?: string;  // Assist provider, substituted player, etc.
  team_id: string;               // Which team
  match_time_seconds: number;    // Elapsed match time (for display)
  match_time_display: string;    // Formatted MM:SS
  timestamp: string;             // ISO 8601 server timestamp
  client_timestamp: string;      // ISO 8601 client timestamp (for ordering)
  position?: {                   // Optional pitch position
    x: number;                   // 0-100 percentage
    y: number;                   // 0-100 percentage
  };
  metadata?: {                   // Event-specific data
    body_part?: 'left_foot' | 'right_foot' | 'head' | 'other';
    goal_type?: 'open_play' | 'penalty' | 'free_kick' | 'corner';
    card_reason?: string;
  };
  recorded_by: string;           // User ID who recorded
  sync_status: 'pending' | 'synced' | 'failed'; // For optimistic UI
}

interface MatchTimer {
  match_id: string;
  started_at: string | null;     // Server timestamp when started
  paused_at: string | null;      // Server timestamp when paused
  total_elapsed_seconds: number; // Accumulated time before current run
  is_running: boolean;
  updated_by: string;
  updated_at: string;
}
```

### Optimistic Update with Conflict Resolution
```typescript
function useOptimisticMatchEvents(matchId: string) {
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const pendingRef = useRef<Map<string, MatchEvent>>(new Map());

  const addEvent = useCallback(async (eventData: Omit<MatchEvent, 'id' | 'timestamp' | 'sync_status'>) => {
    const clientId = crypto.randomUUID();
    const optimisticEvent: MatchEvent = {
      ...eventData,
      id: clientId,
      client_timestamp: new Date().toISOString(),
      sync_status: 'pending',
    };

    // Optimistic update
    pendingRef.current.set(clientId, optimisticEvent);
    setEvents(prev => [...prev, optimisticEvent].sort(byTimestamp));

    try {
      const { data, error } = await supabase
        .from('match_events')
        .insert(optimisticEvent)
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic with server-confirmed
      pendingRef.current.delete(clientId);
      setEvents(prev => prev.map(e => e.id === clientId ? { ...data, sync_status: 'synced' } : e));
    } catch (error) {
      // Mark as failed, allow retry
      setEvents(prev => prev.map(e => 
        e.id === clientId ? { ...e, sync_status: 'failed' } : e
      ));
    }
  }, [matchId]);

  // Subscribe to other clients' events
  useEffect(() => {
    const channel = supabase
      .channel(`match-events:${matchId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'match_events', filter: `match_id=eq.${matchId}` },
        (payload) => {
          const serverEvent = payload.new as MatchEvent;
          // Only add if not already present (avoid duplicates from optimistic)
          setEvents(prev => {
            if (prev.some(e => e.id === serverEvent.id)) return prev;
            return [...prev, { ...serverEvent, sync_status: 'synced' }].sort(byTimestamp);
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [matchId]);

  return { events, addEvent };
}

const byTimestamp = (a: MatchEvent, b: MatchEvent) => 
  new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `Date.now()` for timing | `performance.now()` | 2012+ (browser support) | Monotonic clock, unaffected by system time changes |
| WebSocket with custom reconnection | Supabase Realtime with heartbeatCallback | 2023+ | Built-in mobile sleep handling |
| LocalStorage for offline queue | IndexedDB + Background Sync API | 2019+ (Chromium) | Reliable, larger storage, works with service worker |
| Video shim for wake lock | Screen Wake Lock API | Safari 16.4+ (2023) | Native, battery-efficient |
| Pull-to-refresh prevention hacks | `touch-action: none` CSS | CSS Pointer Events Level 2 | Standard, cleaner solution |

**Deprecated/outdated:**
- **Video-based wake locks:** Replaced by Screen Wake Lock API on modern browsers
- **Simple `setInterval` counters:** Replaced by elapsed-time calculations
- **WebSocket without heartbeat monitoring:** Insufficient for mobile web apps

## Open Questions

1. **How to handle split-brain scenarios where match timer diverges across clients?**
   - What we know: Supabase Realtime provides eventual consistency
   - What's unclear: Best pattern for authoritative timer source (server vs. primary recorder)
   - Recommendation: Implement server-authoritative timer with periodic sync, use CRDT-style merge for conflicts

2. **What's the browser support matrix for Screen Wake Lock?**
   - What we know: Chrome 84+, Edge 84+, Opera 70+, Safari 16.4+
   - What's unclear: Behavior on Samsung Internet, Firefox
   - Recommendation: Feature detect, fall back to NoSleep.js for unsupported browsers

3. **How aggressive is iOS Safari's WebSocket throttling in background?**
   - What we know: iOS suspends JavaScript timers in background tabs
   - What's unclear: Exact timing thresholds before suspension kicks in
   - Recommendation: Test with short heartbeat intervals, implement visibilitychange handlers

4. **What's the optimal heartbeat interval for mobile vs desktop?**
   - What we know: Default is 25s, can be customized
   - What's unclear: Battery impact vs. reconnection speed tradeoffs
   - Recommendation: Use 15s for mobile, 25s for desktop, measure real-world battery drain

## Sources

### Primary (HIGH confidence)
- Supabase Realtime Documentation - https://supabase.com/docs/guides/realtime
- MDN Screen Wake Lock API - https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API
- MDN Background Sync API - https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API
- W3C Screen Wake Lock Spec - https://w3.org/TR/screen-wake-lock
- Supabase Troubleshooting: Silent Disconnections - https://supabase.com/docs/guides/troubleshooting/realtime-handling-silent-disconnections-in-backgrounded-applications-592794

### Secondary (MEDIUM confidence)
- SitePoint: Creating Accurate Timers in JavaScript - https://www.sitepoint.com/creating-accurate-timers-in-javascript/
- React Native Gesture Handler docs (touch patterns applicable to web) - https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/gesture-detector/
- Marcotti Events (sports data model reference) - https://github.com/soccermetrics/marcotti-events
- IPTC Sport Schema - https://sportschema.org/

### Tertiary (LOW confidence)
- Reddit/Discord community discussions on Supabase Realtime reliability - indicate real-world issues but need validation
- GitHub issues on supabase/realtime-js - useful for identifying edge cases

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Based on official Supabase docs, MDN, W3C specs
- Architecture patterns: HIGH - Verified with multiple authoritative sources
- Pitfalls: HIGH - Documented in official Supabase troubleshooting, community reports corroborate
- Code examples: MEDIUM-HIGH - Based on verified patterns but adapted for this use case

**Research date:** 2026-02-17  
**Valid until:** 2026-05-17 (3 months for stable APIs, monitor for Supabase Realtime updates)

**Key updates to monitor:**
- Supabase Realtime protocol versions (currently 2.0.0)
- Safari wake lock support improvements
- Background Sync API support expansion to Firefox/Safari
