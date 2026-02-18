#!/usr/bin/env node
/**
 * Simple Service Worker Build Script
 * 
 * Compiles the TypeScript SW to JavaScript for production.
 * This script runs after Next.js build.
 */

/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs');
const path = require('path');

const SW_SOURCE = path.join(__dirname, '..', 'app', 'sw.ts');
const SW_DEST = path.join(__dirname, '..', 'public', 'sw.js');

function buildServiceWorker() {
  console.log('[SW Build] Building service worker...');

  try {
    // Read the TypeScript source
    const source = fs.readFileSync(SW_SOURCE, 'utf-8');

    // Simple transform: remove TypeScript-specific syntax
    let js = source
      // Remove imports (we'll use workbox via CDN)
      .replace(/import .+ from ['"].+['"];?\n/g, '')
      .replace(/import type .+;?\n/g, '')
      // Remove declare statements
      .replace(/declare .+;?\n/g, '')
      // Remove type annotations
      .replace(/:\s*(ServiceWorkerGlobalScope|IDBPDatabase|NotificationOptions|Promise<void>|void|string|number|boolean)(\s*[,;=\)])/g, '$2')
      .replace(/:\s*\w+(\[\])?/g, '')
      // Remove generic type parameters
      .replace(/<[^>]+>/g, '')
      // Remove interface/type definitions
      .replace(/interface\s+\w+\s*\{[^}]*\}/g, '')
      .replace(/type\s+\w+\s*=\s*[^;]+;/g, '')
      // Convert const to var for older browsers
      .replace(/\bconst\b/g, 'var')
      // Remove export keywords
      .replace(/\bexport\s+/g, '')
      // Remove async/await type annotations
      .replace(/async\s+/g, 'async ')
      // Fix remaining TypeScript syntax
      .replace(/\?\./g, '.');

    // Add Workbox CDN import and manifest placeholder
    const workboxSetup = `
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

`;

    const finalSw = workboxSetup + js;

    // Write output
    fs.writeFileSync(SW_DEST, finalSw);
    console.log('[SW Build] ✓ Service worker built successfully');
    console.log(`[SW Build] Output: ${SW_DEST}`);
    
    return true;
  } catch (error) {
    console.error('[SW Build] ✗ Failed to build service worker:', error.message);
    process.exit(1);
  }
}

// Run build
buildServiceWorker();
