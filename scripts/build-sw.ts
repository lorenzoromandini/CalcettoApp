/**
 * Service Worker Build Script
 * 
 * Compiles TypeScript SW source to JavaScript and injects precache manifest.
 * Run during Next.js build process.
 * 
 * @see https://developer.chrome.com/docs/workbox/modules/workbox-build
 */

import { injectManifest } from 'workbox-build';
import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const SW_SOURCE = './app/sw.ts';
const SW_DEST = './public/sw.js';
const BUILD_DIR = './.next/static';
const PRECACHE_MANIFEST_TEMP = './.sw-manifest.js';

async function buildServiceWorker() {
  console.log('[SW Build] Starting service worker build...');

  try {
    // Ensure public directory exists
    if (!existsSync('./public')) {
      await mkdir('./public', { recursive: true });
    }

    // Step 1: Build TypeScript to JavaScript with esbuild
    console.log('[SW Build] Compiling TypeScript...');
    const buildResult = await build({
      entryPoints: [SW_SOURCE],
      bundle: true,
      write: false,
      format: 'iife',
      target: 'es2020',
      platform: 'browser',
      define: {
        'process.env.NODE_ENV': '"production"',
      },
      external: ['workbox-*'], // Workbox loaded via CDN or we'll inline
    });

    const swCode = buildResult.outputFiles[0].text;

    // Step 2: Generate precache manifest from Next.js build output
    console.log('[SW Build] Generating precache manifest...');
    
    // Files to precache (app shell)
    const precacheFiles = [
      { url: '/', revision: Date.now().toString() },
      { url: '/manifest.json', revision: Date.now().toString() },
    ];

    // Try to get built files from .next/static
    if (existsSync(BUILD_DIR)) {
      const staticFiles = await getStaticFiles(BUILD_DIR);
      precacheFiles.push(...staticFiles);
    }

    // Step 3: Inject manifest into SW code
    const manifestJson = JSON.stringify(precacheFiles, null, 2);
    const finalSwCode = swCode.replace(
      'self.__WB_MANIFEST || []',
      manifestJson
    );

    // Step 4: Add Workbox runtime import
    const workboxImport = `
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.4.0/workbox-sw.js');

// Precache manifest
self.__WB_MANIFEST = ${manifestJson};
`;

    const finalCode = workboxImport + '\n' + finalSwCode;

    // Step 5: Write final SW
    await writeFile(SW_DEST, finalCode);
    console.log(`[SW Build] Service worker written to ${SW_DEST}`);
    console.log(`[SW Build] Precached ${precacheFiles.length} files`);

    // Clean up temp file
    if (existsSync(PRECACHE_MANIFEST_TEMP)) {
      await import('fs/promises').then(fs => fs.unlink(PRECACHE_MANIFEST_TEMP));
    }

    console.log('[SW Build] ✓ Service worker build complete');
    return true;
  } catch (error) {
    console.error('[SW Build] ✗ Failed to build service worker:', error);
    throw error;
  }
}

/**
 * Get static files from build directory for precaching
 */
async function getStaticFiles(dir: string): Promise<Array<{ url: string; revision: string }>> {
  const files: Array<{ url: string; revision: string }> = [];
  
  try {
    const entries = await import('fs/promises').then(fs => fs.readdir(dir, { recursive: true }));
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = await import('fs/promises').then(fs => fs.stat(fullPath));
      
      if (stat.isFile()) {
        // Convert to URL path
        const urlPath = '/_next/static/' + entry.replace(/\\/g, '/');
        files.push({
          url: urlPath,
          revision: stat.mtime.getTime().toString(),
        });
      }
    }
  } catch (error) {
    console.warn('[SW Build] Could not read static files:', error);
  }
  
  return files;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  buildServiceWorker();
}

export { buildServiceWorker };
