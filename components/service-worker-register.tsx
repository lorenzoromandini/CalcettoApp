'use client';

/**
 * Service Worker Registration Component
 * 
 * Registers the service worker on component mount.
 * Handles update prompts and registration errors gracefully.
 * 
 * @see RESEARCH.md Pattern 1
 */

import { useEffect } from 'react';

/**
 * Check if service workers are supported
 */
function isServiceWorkerSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator;
}

/**
 * Check if we should register service worker (localhost only in dev)
 */
function shouldRegisterServiceWorker(): boolean {
  if (!isServiceWorkerSupported()) return false;
  
  // Only register on localhost or same origin in production
  // Skip for dev tunnels (cloudflare, ngrok, etc.)
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname.startsWith('192.168.');
  
  return isLocalhost || process.env.NODE_ENV === 'production';
}

/**
 * Register the service worker
 */
async function registerServiceWorker(): Promise<void> {
  if (!shouldRegisterServiceWorker()) {
    console.log('[SW] Skipping registration (not localhost or production)');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[SW] Registered successfully:', registration.scope);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New version available
          console.log('[SW] New version available');
          
          // Dispatch event for UI to show update prompt
          window.dispatchEvent(new CustomEvent('sw-update-available'));
        }
      });
    });

    // Check for updates periodically (every hour)
    setInterval(() => {
      registration.update();
      console.log('[SW] Checking for updates...');
    }, 60 * 60 * 1000);

  } catch (error) {
    console.error('[SW] Registration failed:', error);
  }
}

/**
 * Skip waiting and activate new service worker
 */
export async function skipWaiting(): Promise<void> {
  if (!isServiceWorkerSupported()) return;

  const registration = await navigator.serviceWorker.ready;
  
  if (registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
}

/**
 * Get service worker version
 */
export async function getServiceWorkerVersion(): Promise<string | null> {
  if (!isServiceWorkerSupported()) return null;

  const registration = await navigator.serviceWorker.ready;
  
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    
    channel.port1.onmessage = (event) => {
      resolve(event.data?.version || null);
    };

    registration.active?.postMessage(
      { type: 'GET_VERSION' },
      [channel.port2]
    );
  });
}

/**
 * Service Worker Registration Component
 * Renders nothing - just handles registration
 */
export function ServiceWorkerRegister(): null {
  useEffect(() => {
    // Register on mount
    registerServiceWorker();

    // Handle controller changes (new SW activated)
    const handleControllerChange = () => {
      console.log('[SW] Controller changed - new version active');
      window.location.reload();
    };

    navigator.serviceWorker?.addEventListener('controllerchange', handleControllerChange);

    return () => {
      navigator.serviceWorker?.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  // This component renders nothing
  return null;
}
