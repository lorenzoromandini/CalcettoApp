/**
 * Service Worker Source
 * 
 * Workbox-based service worker for Calcetto Manager.
 * Features:
 * - Precaching of app shell for instant loads
 * - Runtime caching strategies for different content types
 * - Background Sync for offline mutations
 * - NetworkFirst for live data (NEVER cache stale scores)
 * 
 * @see RESEARCH.md Pattern 1 for Workbox configuration
 * @see https://developer.chrome.com/docs/workbox
 */

/// <reference lib="webworker" />

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { 
  StaleWhileRevalidate, 
  CacheFirst, 
  NetworkOnly, 
  NetworkFirst 
} from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { clientsClaim } from 'workbox-core';

declare const self: ServiceWorkerGlobalScope;

/**
 * Claim clients immediately for instant control
 */
clientsClaim();

/**
 * Precache app shell - injected by Workbox build
 * The __WB_MANIFEST will be replaced with actual precache manifest at build time
 */
precacheAndRoute(self.__WB_MANIFEST || []);

/**
 * Cleanup outdated caches on activation
 */
cleanupOutdatedCaches();

// ============================================================================
// Caching Strategies
// ============================================================================

/**
 * Pages: StaleWhileRevalidate
 * Instant load from cache, update in background
 * Best for Next.js pages - always fresh but instant
 */
registerRoute(
  ({ request }) => request.destination === 'document',
  new StaleWhileRevalidate({
    cacheName: 'pages-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
  })
);

/**
 * Static assets: CacheFirst
 * JS, CSS, fonts rarely change - serve from cache
 */
registerRoute(
  ({ request }) => 
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font',
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

/**
 * Images: CacheFirst with size limits
 * Logos, avatars, etc. - cache but limit storage
 */
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
  })
);

/**
 * API mutations: NetworkOnly with BackgroundSync
 * Queue failed mutations for later retry
 */
const bgSyncPlugin = new BackgroundSyncPlugin('offline-mutations', {
  maxRetentionTime: 24 * 60, // 24 hours in minutes
  onSync: async ({ queue }) => {
    console.log('[SW] Processing background sync queue');
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request);
        console.log('[SW] Sync succeeded:', entry.request.url);
      } catch (error) {
        console.error('[SW] Sync failed, re-queueing:', entry.request.url);
        await queue.unshiftRequest(entry);
        throw error;
      }
    }
    
    // Notify clients that sync completed
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(client => {
      client.postMessage({ type: 'SYNC_COMPLETE' });
    });
  },
});

// Register routes for API mutations with background sync
(['POST', 'PUT', 'DELETE', 'PATCH'] as const).forEach(method => {
  registerRoute(
    ({ url }) => url.pathname.startsWith('/api/'),
    new NetworkOnly({
      plugins: [bgSyncPlugin],
    }),
    method
  );
});

/**
 * API reads: StaleWhileRevalidate
 * Cache API responses for offline access
 * Exclude live data routes (handled separately)
 */
registerRoute(
  ({ url, request }) => 
    url.pathname.startsWith('/api/') &&
    !url.pathname.includes('/live/') &&
    request.method === 'GET',
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 5 * 60, // 5 minutes
      }),
    ],
  })
);

/**
 * Live match data: NetworkFirst with short TTL
 * CRITICAL: Never serve stale live scores
 * Per RESEARCH.md Pitfall #4
 */
registerRoute(
  ({ url }) => url.pathname.includes('/live/'),
  new NetworkFirst({
    cacheName: 'live-data-cache',
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60, // 60 seconds - very short TTL
      }),
    ],
  })
);

// ============================================================================
// Service Worker Events
// ============================================================================

/**
 * Install: Precache assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  self.skipWaiting();
});

/**
 * Activate: Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
});

/**
 * Background Sync Event
 * Handle sync events for offline mutations
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'offline-mutations') {
    console.log('[SW] Received sync event for offline mutations');
    event.waitUntil(
      (async () => {
        // The BackgroundSyncPlugin handles the actual syncing
        // This event ensures sync happens even if page is closed
        console.log('[SW] Background sync triggered');
      })()
    );
  }
});

// ============================================================================
// Push Notification Event Handlers
// ============================================================================

/**
 * Push notification handler
 * Handles match reminders with actions
 */
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: data.tag || 'match-reminder',
    requireInteraction: false,
    actions: data.actions || [
      { action: 'confirm', title: 'Ci sono!' },
      { action: 'view', title: 'Vedi dettagli' },
    ],
    data: {
      url: data.url || '/',
      matchId: data.matchId,
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

/**
 * Notification click handler
 * Handles action button clicks from push notifications
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data;
  let url = data?.url || '/';

  // Handle actions
  if (event.action === 'confirm') {
    // Could track confirmation or navigate to RSVP
    url = data?.url ? `${data.url}?rsvp=in` : '/';
  } else if (event.action === 'view') {
    url = data?.url || '/';
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

/**
 * Message Event: Handle messages from main thread
 */
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data?.type === 'GET_VERSION') {
    event.ports[0]?.postMessage({ version: self.registration.scope });
  }
});
