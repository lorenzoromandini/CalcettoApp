/**
 * Screen Wake Lock Hook
 * 
 * Manages screen wake lock during active matches to prevent device sleep.
 * Uses the Screen Wake Lock API with graceful fallbacks.
 * 
 * @see RESEARCH.md Pattern 5 for wake lock implementation
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseWakeLockReturn {
  /** Whether wake lock is currently held */
  isLocked: boolean;
  /** Any error acquiring/releasing lock */
  error: Error | null;
  /** Whether browser supports wake lock API */
  supported: boolean;
  /** Manually request wake lock (if not auto-managed) */
  request: () => Promise<void>;
  /** Manually release wake lock */
  release: () => Promise<void>;
}

/**
 * Hook to manage screen wake lock
 * 
 * @param enabled - Whether to request wake lock (e.g., when timer is running)
 * @returns Wake lock state and controls
 * 
 * @example
 * ```tsx
 * const { isLocked, supported, error } = useWakeLock(isTimerRunning);
 * 
 * // Or manual control
 * const { isLocked, request, release } = useWakeLock(false);
 * ```
 */
export function useWakeLock(enabled: boolean): UseWakeLockReturn {
  const [isLocked, setIsLocked] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Use ref to store the WakeLockSentinel for cleanup
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  
  // Check if wake lock is supported
  const supported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;

  /**
   * Request wake lock
   */
  const request = useCallback(async () => {
    if (!supported) {
      setError(new Error('Wake Lock API not supported'));
      return;
    }

    try {
      // Release existing lock if any
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
      }

      // Request new wake lock
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      setIsLocked(true);
      setError(null);
      
      console.log('[WakeLock] Screen wake lock acquired');

      // Listen for release events (e.g., when tab is hidden)
      wakeLockRef.current.addEventListener('release', () => {
        console.log('[WakeLock] Screen wake lock released');
        setIsLocked(false);
        wakeLockRef.current = null;
      });
    } catch (err) {
      const wakeError = err instanceof Error ? err : new Error('Failed to acquire wake lock');
      setError(wakeError);
      setIsLocked(false);
      console.error('[WakeLock] Failed to acquire wake lock:', wakeError);
    }
  }, [supported]);

  /**
   * Release wake lock
   */
  const release = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        setIsLocked(false);
        console.log('[WakeLock] Screen wake lock manually released');
      } catch (err) {
        const releaseError = err instanceof Error ? err : new Error('Failed to release wake lock');
        setError(releaseError);
        console.error('[WakeLock] Failed to release wake lock:', releaseError);
      }
    }
  }, []);

  // Auto-request/release based on enabled prop
  useEffect(() => {
    if (!supported) return;

    if (enabled) {
      request();
    } else {
      release();
    }
  }, [enabled, supported, request, release]);

  // Re-acquire wake lock when tab becomes visible again
  // (Wake locks auto-release when tab is hidden)
  useEffect(() => {
    if (!supported) return;

    const handleVisibilityChange = () => {
      if (!document.hidden && enabled) {
        console.log('[WakeLock] Tab visible, re-acquiring wake lock');
        request();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, supported, request]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch((err) => {
          console.error('[WakeLock] Cleanup release failed:', err);
        });
      }
    };
  }, []);

  return {
    isLocked,
    error,
    supported,
    request,
    release,
  };
}

export default useWakeLock;
