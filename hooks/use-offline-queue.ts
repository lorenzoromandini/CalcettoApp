'use client';

/**
 * useOfflineQueue Hook
 * 
 * Tracks online/offline status and pending sync queue count.
 * Listens for service worker sync completion messages.
 * 
 * @see RESEARCH.md Pattern 2
 */

import { useState, useEffect, useCallback } from 'react';
import { getPendingActionCount } from '@/lib/db/actions';

interface OfflineQueueState {
  /** Whether the browser is online */
  isOnline: boolean;
  /** Number of pending actions in queue */
  queueCount: number;
  /** Whether a sync is in progress */
  isSyncing: boolean;
}

/**
 * Hook for tracking offline state and queue
 */
export function useOfflineQueue(): OfflineQueueState {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [queueCount, setQueueCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  /**
   * Update queue count from IndexedDB
   */
  const updateQueueCount = useCallback(async () => {
    try {
      const count = await getPendingActionCount();
      setQueueCount(count);
    } catch (error) {
      console.error('[useOfflineQueue] Failed to get queue count:', error);
    }
  }, []);

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);

    // Initial queue count
    updateQueueCount();

    /**
     * Handle online event
     */
    const handleOnline = () => {
      console.log('[useOfflineQueue] Browser is online');
      setIsOnline(true);
      setIsSyncing(true);
      
      // Update queue count after a delay to allow sync to process
      setTimeout(() => {
        updateQueueCount();
        setIsSyncing(false);
      }, 1000);
    };

    /**
     * Handle offline event
     */
    const handleOffline = () => {
      console.log('[useOfflineQueue] Browser is offline');
      setIsOnline(false);
    };

    /**
     * Handle service worker sync complete message
     */
    const handleSyncComplete = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_COMPLETE') {
        console.log('[useOfflineQueue] Sync completed');
        updateQueueCount();
        setIsSyncing(false);
      }
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    navigator.serviceWorker?.addEventListener('message', handleSyncComplete);

    // Poll queue count periodically when offline (every 5 seconds)
    const intervalId = setInterval(() => {
      if (!navigator.onLine) {
        updateQueueCount();
      }
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      navigator.serviceWorker?.removeEventListener('message', handleSyncComplete);
      clearInterval(intervalId);
    };
  }, [updateQueueCount]);

  return {
    isOnline,
    queueCount,
    isSyncing,
  };
}
