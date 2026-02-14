/**
 * Calcetto Manager Service Worker
 * 
 * Workbox-based service worker for offline-first PWA support.
 * Features:
 * - App shell precaching for instant loads
 * - Runtime caching strategies for different content types
 * - Background Sync for offline mutations
 * - NetworkFirst for live match data (never stale scores)
 * 
 * @see RESEARCH.md Pattern 1 for Workbox configuration
 */

importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.4.0/workbox-sw.js');

// Precache manifest (will be injected by build process)
self.__WB_MANIFEST = self.__WB_MANIFEST || [];

// Workbox modules
const { precacheAndRoute, cleanupOutdatedCaches } = workbox.precaching;
const { registerRoute } = workbox.routing;
const { StaleWhileRevalidate, CacheFirst, NetworkOnly, NetworkFirst } = workbox.strategies;
const { ExpirationPlugin } = workbox.expiration;
const { BackgroundSyncPlugin } = workbox.backgroundSync;
const { clientsClaim } = workbox.core;

// ============================================================================
// Core Setup
// ============================================================================

// Take control immediately
clientsClaim();

// Precache app shell
precacheAndRoute(self.__WB_MANIFEST);

// Cleanup old caches
cleanupOutdatedCaches();

// ============================================================================
// Caching Strategies
// ============================================================================

/**
 * Pages: StaleWhileRevalidate
 * Instant load from cache, update in background
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
 * JS, CSS, fonts - cache aggressively
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
 * Images: CacheFirst with limits
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
 * Queue failed mutations for retry when online
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

// Register background sync for mutations
['POST', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
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
        maxAgeSeconds: 60, // 60 seconds - very short
      }),
    ],
  })
);

// ============================================================================
// Service Worker Lifecycle
// ============================================================================

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
});

/**
 * Background Sync Event
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'offline-mutations') {
    console.log('[SW] Received sync event for offline mutations');
    event.waitUntil(Promise.resolve());
  }
});

/**
 * Push Notifications (future feature)
 */
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: data.tag || 'default',
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

/**
 * Message handling from main thread
 */
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data?.type === 'GET_VERSION') {
    event.ports[0]?.postMessage({ version: '1.0.0' });
  }
});
