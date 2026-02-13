# Phase 1: Foundation & Auth - Research

**Researched:** 2026-02-13
**Domain:** PWA, Offline-First Architecture, Authentication
**Confidence:** HIGH

## Summary

Phase 1 establishes the foundational offline-first architecture for the Calcetto Manager PWA. Research confirms that React 19 + Next.js 15 provides first-class PWA support without external dependencies like `next-pwa`. The official Next.js PWA guide (fall 2024) enables service workers, manifest, and installability directly.

**Key architectural decisions verified:**
- **Workbox** is the Google-backed standard for service worker management—don't write SW manually
- **idb** (~1.19kB) makes IndexedDB actually usable with promises and TypeScript support
- **Supabase Auth** with PKCE flow is required for SSR/Server Components in Next.js 15
- **@supabase/ssr** package handles cookie-based session persistence automatically
- **Background Sync API** via Workbox enables offline mutation queuing with automatic replay
- **next-themes** + Tailwind CSS v4 provides system-aware dark mode
- **next-intl** is the standard for Next.js 15 App Router i18n

**Critical finding:** Next.js 15 has built-in PWA support—no `next-pwa` package needed. The legacy `next-pwa` is unmaintained as of July 2024. Use official Next.js patterns instead.

**Primary recommendation:** Implement Workbox-based service worker with precaching for app shell, StaleWhileRevalidate for pages, and BackgroundSyncPlugin for offline mutations. Use @supabase/ssr for auth with automatic session refresh via middleware proxy.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.x | PWA framework | Built-in PWA support, Turbopack, App Router |
| React | 19.x | UI library | Actions API, useOptimistic, stable release |
| Supabase | 2.x | Auth + Database | PostgreSQL, PKCE flow, @supabase/ssr package |
| Workbox | 7.x | Service Worker | Google-backed, production-ready, Background Sync |
| idb | 8.x | IndexedDB wrapper | Promise-based, TypeScript, ~1.19kB brotli |
| Tailwind CSS | 4.x | Styling | CSS-first config, built-in dark mode |
| shadcn/ui | latest | Components | Accessible, customizable, Radix-based |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next-themes | 0.4.x | Theme management | System + user preference persistence |
| next-intl | 3.x | i18n | Italian/English translations |
| workbox-background-sync | 7.x | Offline queue | POST/PUT/DELETE retry when online |
| workbox-precaching | 7.x | App shell cache | Instant load on repeat visits |
| workbox-strategies | 7.x | Caching strategies | Network-first for live, cache-first for static |
| lucide-react | latest | Icons | Consistent iconography |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Workbox | Serwist | Serwist is next-pwa successor but adds complexity; Workbox is more mature |
| idb | Dexie.js | Dexie adds sync/cloud features (~16kB); idb is lighter for local-only |
| next-intl | react-i18next | next-intl is built for App Router; react-i18next needs adapter |
| @supabase/ssr | Manual cookie handling | @supabase/ssr handles edge cases, refresh token rotation automatically |

**Installation:**
```bash
# Core
npm install next@latest react@latest react-dom@latest
npm install @supabase/supabase-js @supabase/ssr
npm install idb
npm install next-themes next-intl

# Workbox (build-time)
npm install -D workbox-cli workbox-build workbox-webpack-plugin
# OR use CDN in SW:
# importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js')

# UI
npx shadcn@latest init
npm install lucide-react
```

## Architecture Patterns

### Recommended Project Structure
```
my-app/
├── app/
│   ├── [locale]/           # i18n routing
│   │   ├── layout.tsx      # Root layout with providers
│   │   ├── page.tsx        # Home
│   │   ├── offline/page.tsx # Offline fallback
│   │   └── auth/
│   │       ├── login/page.tsx
│   │       └── callback/route.ts
│   ├── manifest.ts         # PWA manifest
│   ├── sw.ts               # Service worker (builds to public/sw.js)
│   └── layout.tsx          # Wraps [locale]
├── components/
│   ├── providers/
│   │   ├── theme-provider.tsx
│   │   └── auth-provider.tsx
│   ├── ui/                 # shadcn components
│   └── service-worker-register.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Browser client
│   │   ├── server.ts       # Server Component client
│   │   └── middleware.ts   # Session refresh
│   ├── db/
│   │   ├── index.ts        # idb initialization
│   │   ├── schema.ts       # TypeScript types
│   │   └── actions.ts      # CRUD operations
│   └── i18n/
│       ├── request.ts      # next-intl request config
│       └── routing.ts      # Locale routing
├── messages/
│   ├── en.json
│   └── it.json
├── public/
│   ├── icons/              # PWA icons
│   └── sw.js               # Built service worker
├── next.config.ts
└── middleware.ts           # i18n + auth middleware
```

### Pattern 1: Service Worker with Workbox
**What:** Build-time generated SW with precaching and runtime caching strategies
**When to use:** All PWA offline functionality

**Example:**
```typescript
// app/sw.ts (source)
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkOnly } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// Precache build output (injected at build)
precacheAndRoute(self.__WB_MANIFEST || []);

// Pages: StaleWhileRevalidate for instant load + freshness
registerRoute(
  ({ request }) => request.destination === 'document',
  new StaleWhileRevalidate({
    cacheName: 'pages',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
  })
);

// Static assets: CacheFirst
registerRoute(
  ({ request }) => ['style', 'script', 'worker'].includes(request.destination),
  new CacheFirst({
    cacheName: 'static',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Images: CacheFirst with size limit
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

// API mutations: Background Sync for offline queue
const bgSyncPlugin = new BackgroundSyncPlugin('offline-mutations', {
  maxRetentionTime: 24 * 60, // Retry for 24 hours (in minutes)
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request);
        console.log('Replay successful:', entry.request.url);
      } catch (error) {
        console.error('Replay failed:', error);
        await queue.unshiftRequest(entry); // Put back for retry
        break;
      }
    }
    // Notify clients sync is complete
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'SYNC_COMPLETE' });
    });
  },
});

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkOnly({
    plugins: [bgSyncPlugin],
  }),
  'POST'
);

// Live match data: NetworkFirst (NEVER cache stale scores)
registerRoute(
  ({ url }) => url.pathname.includes('/live/'),
  new NetworkFirst({
    cacheName: 'live-data',
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60, // Only 1 minute!
      }),
    ],
  })
);

// Source: https://developer.chrome.com/docs/workbox
// https://www.ruixen.com/blog/offline-first-pwa-nextjs
```

### Pattern 2: IndexedDB with idb
**What:** Promise-based IndexedDB wrapper for offline data persistence
**When to use:** Storing teams, players, matches locally; offline action queue

**Example:**
```typescript
// lib/db/schema.ts
export interface Team {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  sync_status: 'synced' | 'pending' | 'error';
}

export interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: unknown;
  timestamp: number;
  retry_count: number;
}

// lib/db/index.ts
import { openDB, DBSchema } from 'idb';
import { Team, OfflineAction } from './schema';

interface CalcettoDB extends DBSchema {
  teams: {
    key: string;
    value: Team;
    indexes: { 'by-sync-status': string };
  };
  offline_actions: {
    key: string;
    value: OfflineAction;
    indexes: { 'by-timestamp': number };
  };
  // ... other stores
}

const DB_NAME = 'calcetto-manager';
const DB_VERSION = 1;

export async function getDB() {
  return openDB<CalcettoDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const teamStore = db.createObjectStore('teams', {
          keyPath: 'id',
        });
        teamStore.createIndex('by-sync-status', 'sync_status');

        const actionStore = db.createObjectStore('offline_actions', {
          keyPath: 'id',
        });
        actionStore.createIndex('by-timestamp', 'timestamp');
      }
    },
  });
}

// CRUD helpers
export async function saveTeam(team: Team) {
  const db = await getDB();
  await db.put('teams', { ...team, sync_status: 'pending' });
}

export async function getTeams() {
  const db = await getDB();
  return db.getAll('teams');
}

export async function getPendingActions() {
  const db = await getDB();
  return db.getAllFromIndex('offline_actions', 'by-timestamp');
}

export async function queueOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp'>) {
  const db = await getDB();
  const id = crypto.randomUUID();
  await db.add('offline_actions', {
    ...action,
    id,
    timestamp: Date.now(),
  });
  return id;
}

// Source: https://github.com/jakearchibald/idb
// https://www.npmjs.com/package/idb
```

### Pattern 3: Supabase Auth with SSR
**What:** Cookie-based auth for Next.js 15 Server Components
**When to use:** All auth flows with SSR support

**Example:**
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}

// middleware.ts
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

// lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser();

  // Optional: Protect routes
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

// Source: https://supabase.com/docs/guides/auth/server-side/nextjs
```

### Pattern 4: Dark Mode with next-themes
**What:** System-aware theme switching with Tailwind CSS v4
**When to use:** User preference persistence for light/dark mode

**Example:**
```typescript
// app/layout.tsx
import { ThemeProvider } from '@/components/providers/theme-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

// components/providers/theme-provider.tsx
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ReactNode } from 'react';

export function ThemeProvider({ children, ...props }: { children: ReactNode } & React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

// components/theme-toggle.tsx
'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

// globals.css (Tailwind v4)
@import 'tailwindcss';

@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));

:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... other light theme vars */
}

[data-theme='dark'] {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... other dark theme vars */
}

// Source: https://github.com/pacocoursey/next-themes
// https://dev.to/khanrabiul/nextjs-tailwindcss-v4-how-to-add-darklight-theme-with-next-themes-3c6l
```

### Pattern 5: Internationalization with next-intl
**What:** Type-safe i18n for Next.js 15 App Router
**When to use:** Italian/English language support

**Example:**
```typescript
// i18n/routing.ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'it'],
  defaultLocale: 'it',
});

// i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  
  // Ensure a valid locale is used
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});

// middleware.ts (add i18n)
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};

// app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

// Usage in components
import { useTranslations } from 'next-intl';

export function Hero() {
  const t = useTranslations('home');
  return <h1>{t('title')}</h1>;
}

// Source: https://next-intl.dev/docs/getting-started/app-router
```

### Anti-Patterns to Avoid
- **Using `next-pwa` package:** Unmaintained since July 2024. Use Next.js built-in PWA support instead.
- **Writing service workers manually:** Error-prone, no precaching, hard to maintain. Use Workbox.
- **Storing auth tokens in localStorage:** XSS vulnerable. Use cookies via @supabase/ssr.
- **Caching live match data with long TTL:** Stale scores kill user trust. Use NetworkFirst with short TTL.
- **Manual IndexedDB without wrapper:** Callback hell, no TypeScript. Use idb library.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Service Worker caching | Write SW manually | Workbox | Handles precaching, cache cleanup, edge cases |
| IndexedDB operations | Raw IDB API | idb | Promises, TypeScript, 1.19kB, handles transactions |
| Offline mutation queue | Custom queue logic | Workbox BackgroundSync | Automatic retry, exponential backoff, persistence |
| Auth session refresh | Manual token refresh | @supabase/ssr + middleware | PKCE flow, automatic refresh, secure cookies |
| Theme switching | Manual class toggling | next-themes | System preference, persistence, no hydration mismatch |
| i18n routing | Manual locale detection | next-intl | Type-safe, App Router optimized, automatic routing |
| PWA manifest | Static JSON only | Next.js manifest.ts | Dynamic generation, TypeScript, icon optimization |

**Key insight:** Offline-first PWAs have many edge cases (cache quota, network flakiness, sync conflicts). Production-tested libraries handle these; custom code will miss critical scenarios.

## Common Pitfalls

### Pitfall 1: Service Worker Caching Live Data
**What goes wrong:** App shows stale scores from cache when user expects live match data
**Why it happens:** Using CacheFirst or StaleWhileRevalidate for `/live/*` endpoints
**How to avoid:** Use NetworkFirst strategy for live data with short maxAgeSeconds (60s)
**Warning signs:** "I updated the score on my phone but my friend's phone still shows the old score"

### Pitfall 2: Auth Session Expires Offline
**What goes wrong:** User gets logged out when device is offline because refresh token fails
**Why it happens:** Supabase client attempts to refresh and fails, clears session
**How to avoid:** Configure @supabase/ssr with cookie persistence; session stays valid until explicit logout or token expiration (days/weeks)
**Warning signs:** "I was offline for an hour and had to log in again"

### Pitfall 3: Background Sync Never Triggers
**What goes wrong:** Offline mutations never sync even when back online
**Why it happens:** Chrome DevTools "offline" checkbox only affects page requests, not service worker
**How to avoid:** Test with actual network disconnect (airplane mode) not DevTools offline
**Warning signs:** "It works in dev but not on my phone"

### Pitfall 4: Cache Quota Exceeded
**What goes wrong:** App stops working when storage is full; iOS Safari is most restrictive (~50MB)
**Why it happens:** No cache size limits; images accumulate indefinitely
**How to avoid:** Use ExpirationPlugin with maxEntries; implement cache cleanup on app update
**Warning signs:** "App works on desktop but crashes on iPhone"

### Pitfall 5: Hydration Mismatch with Theme
**What goes wrong:** Flash of wrong theme on page load; React hydration error
**Why it happens:** Server renders light, client prefers dark; mismatch
**How to avoid:** Use suppressHydrationWarning on html element; use next-themes which handles this
**Warning signs:** "Page flashes white then switches to dark mode"

### Pitfall 6: i18n Locale in URL Not Synced
**What goes wrong:** User switches language but URL stays old locale; breaks share links
**Why it happens:** Locale stored in state/cookie but not reflected in routing
**How to avoid:** Use next-intl with [locale] route segment; locale always in URL
**Warning signs:** "I shared the Italian link but my friend sees English"

## Code Examples

### Service Worker Registration
```typescript
// components/service-worker-register.tsx
'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        })
        .then((registration) => {
          console.log('SW registered:', registration.scope);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker?.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                if (confirm('New version available! Reload to update?')) {
                  window.location.reload();
                }
              }
            });
          });
        })
        .catch((error) => {
          console.error('SW registration failed:', error);
        });
    }
  }, []);

  return null;
}
```

### Offline Queue with UI Feedback
```typescript
// hooks/use-offline-queue.ts
import { useState, useEffect } from 'react';

export function useOfflineQueue() {
  const [queueCount, setQueueCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_COMPLETE') {
        setQueueCount(0);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    navigator.serviceWorker?.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, []);

  return { isOnline, queueCount };
}

// components/offline-banner.tsx
'use client';

import { useOfflineQueue } from '@/hooks/use-offline-queue';
import { CloudOff, CloudCheck } from 'lucide-react';

export function OfflineBanner() {
  const { isOnline, queueCount } = useOfflineQueue();

  if (isOnline && queueCount === 0) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 p-3 text-center text-sm ${
      isOnline ? 'bg-green-500' : 'bg-amber-500'
    } text-white`}>
      {isOnline ? (
        <span className="flex items-center justify-center gap-2">
          <CloudCheck className="h-4 w-4" />
          {queueCount > 0 ? `Syncing ${queueCount} changes...` : 'All changes synced'}
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <CloudOff className="h-4 w-4" />
          You're offline. Changes will sync when you're back online.
        </span>
      )}
    </div>
  );
}
```

### Google OAuth with PKCE
```typescript
// app/auth/login/page.tsx
'use client';

import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const handleGoogleSignIn = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (data.url) {
      window.location.href = data.url;
    }
  };

  return (
    <button onClick={handleGoogleSignIn}>
      Sign in with Google
    </button>
  );
}

// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| next-pwa package | Next.js built-in PWA | Fall 2024 | No external dependency, official support |
| localStorage for auth | Cookie-based (@supabase/ssr) | 2024 | SSR support, XSS protection |
| Implicit auth flow | PKCE flow | 2024 | Required for SSR, more secure |
| Custom SW | Workbox | 2017+ | Standard, well-tested, maintained |
| Manual IDB | idb library | 2020+ | Promise-based, TypeScript |
| Redux for offline | Background Sync API | 2018+ | Native, more reliable |

**Deprecated/outdated:**
- `next-pwa` (shadowwalker/next-pwa): Unmaintained since July 2024
- Implicit auth flow: Deprecated for SSR apps; use PKCE
- localStorage for tokens: Insecure; use httpOnly cookies
- WebSQL: Deprecated; use IndexedDB

## Open Questions

1. **Background Sync retry strategy**
   - What we know: Workbox supports maxRetentionTime and custom onSync
   - What's unclear: Optimal retry count before marking as failed
   - Recommendation: Start with 3 retries, exponential backoff, then surface to user

2. **Cache invalidation on app update**
   - What we know: Workbox precache handles this automatically
   - What's unclear: Runtime cache (pages, API) invalidation strategy
   - Recommendation: Use versioned cache names, purge old caches in activate event

3. **iOS Safari storage limits**
   - What we know: iOS Safari has ~50MB limit for IndexedDB
   - What's unclear: Exact behavior when limit exceeded
   - Recommendation: Implement storage estimation API, warn user at 80% capacity

4. **Conflict resolution for offline edits**
   - What we know: Last-write-wins is default but problematic
   - What's unclear: Best strategy for match events (goals, cards)
   - Recommendation: Event sourcing with server-side event log as source of truth

## Sources

### Primary (HIGH confidence)
- [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps) - Official Next.js 15 PWA documentation
- [Workbox Documentation](https://developer.chrome.com/docs/workbox) - Google Chrome team official docs
- [idb GitHub](https://github.com/jakearchibald/idb) - Jake Archibald's IndexedDB wrapper
- [Supabase Auth Server-Side](https://supabase.com/docs/guides/auth/server-side/nextjs) - Official SSR setup
- [next-themes](https://github.com/pacocoursey/next-themes) - Theme provider for Next.js
- [next-intl](https://next-intl.dev/docs/getting-started/app-router) - i18n for Next.js App Router

### Secondary (MEDIUM confidence)
- [Ruixen UI Offline-First PWA](https://www.ruixen.com/blog/offline-first-pwa-nextjs) - Workbox + Next.js patterns (Oct 2025)
- [Next.js PWA 2025](https://medium.com/@jakobwgnr/how-to-build-a-next-js-pwa-in-2025-f334cd9755df) - Community guide confirming built-in support (Aug 2025)
- [idb npm](https://www.npmjs.com/package/idb) - Package info, v8.0.3
- [Workbox Background Sync](https://developer.chrome.com/docs/workbox/modules/workbox-background-sync) - Official module docs

### Tertiary (LOW confidence)
- Multiple web search results for background sync patterns - Cross-verified with Workbox docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries are current, official, and widely adopted
- Architecture: HIGH - Patterns from official Next.js and Workbox docs
- Pitfalls: MEDIUM-HIGH - Based on community reports + official guidance

**Research date:** 2026-02-13
**Valid until:** 2026-04-13 (60 days for stable libraries, 30 for fast-moving)
