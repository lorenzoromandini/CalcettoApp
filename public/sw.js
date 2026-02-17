
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.4.0/workbox-sw.js');

// Precache manifest (populated at build time)
self.__WB_MANIFEST = self.__WB_MANIFEST || [];

// Workbox modules available globally when using workbox-sw
const { 
  precacheAndRoute, 
  cleanupOutdatedCaches 
} = workbox.precaching;
const { 
  registerRoute 
} = workbox.routing;
const { 
  StaleWhileRevalidate, 
  CacheFirst, 
  NetworkOnly, 
  NetworkFirst 
} = workbox.strategies;
const { 
  ExpirationPlugin 
} = workbox.expiration;
const { 
  BackgroundSyncPlugin 
} = workbox.backgroundSync;
const { 
  clientsClaim 
} = workbox.core;

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

/// 
/// 

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { 
  StaleWhileRevalidate, 
  CacheFirst, 
  NetworkOnly, 
  NetworkFirst 
} from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { clientsClaim } from 'workbox-core';

declare var self;

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
 * Pages
 * Instant load from cache, update in background
 * Best for Next.js pages - always fresh but instant
 */
registerRoute(
  ({ request }) => request.destination === 'document',
  new StaleWhileRevalidate({
    cacheName: 'pages-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries,
        maxAgeSeconds * 24 * 60 * 60, // 7 days
      }),
    ],
  })
);

/**
 * Static assets
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
        maxEntries,
        maxAgeSeconds * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

/**
 * Images with size limits
 * Logos, avatars, etc. - cache but limit storage
 */
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries,
        maxAgeSeconds * 24 * 60 * 60, // 7 days
      }),
    ],
  })
);

/**
 * API mutations with BackgroundSync
 * Queue failed mutations for later retry
 */
var bgSyncPlugin = new BackgroundSyncPlugin('offline-mutations', {
  maxRetentionTime * 60, // 24 hours in minutes
  onSync ({ queue }) => {
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
    var clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(client => {
      client.postMessage({ type: 'SYNC_COMPLETE' });
    });
  },
});

// Register routes for API mutations with background sync
(['POST', 'PUT', 'DELETE', 'PATCH'] as var).forEach(method => {
  registerRoute(
    ({ url }) => url.pathname.startsWith('/api/'),
    new NetworkOnly({
      plugins: [bgSyncPlugin],
    }),
    method
  );
});

/**
 * API reads
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
        maxEntries,
        maxAgeSeconds * 60, // 5 minutes
      }),
    ],
  })
);

/**
 * Live match data with short TTL
 * CRITICAL serve stale live scores
 * Per RESEARCH.md Pitfall #4
 */
registerRoute(
  ({ url }) => url.pathname.includes('/live/'),
  new NetworkFirst({
    cacheName: 'live-data-cache',
    networkTimeoutSeconds,
    plugins: [
      new ExpirationPlugin({
        maxEntries,
        maxAgeSeconds, // 60 seconds - very short TTL
      }),
    ],
  })
);

// ============================================================================
// Service Worker Events
// ============================================================================

/**
 * Install assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  self.skipWaiting();
});

/**
 * Activate up old caches
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

  var data = event.data.json();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var options = {
    body.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag.tag || 'match-reminder',
    requireInteraction,
    actions.actions || [
      { action: 'confirm', title: 'Ci sono!' },
      { action: 'view', title: 'Vedi dettagli' },
    ],
    data: {
      url.url || '/',
      matchId.matchId,
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

  var data = event.notification.data;
  let url = data.url || '/';

  // Handle actions
  if (event.action === 'confirm') {
    // Could track confirmation or navigate to RSVP
    url = data.url ? `${data.url}?rsvp=in` : '/';
  } else if (event.action === 'view') {
    url = data.url || '/';
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // Focus existing window if open
      for (var client of clientList) {
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
 * Message Event messages from main thread
 */
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version.registration.scope });
  }
});
