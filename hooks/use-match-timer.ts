/**
 * Match Timer Hook
 * 
 * Provides accurate match timing with pause/resume, visibility handling,
 * and server synchronization. Uses performance.now() for drift-free timing.
 * 
 * @see RESEARCH.md Pattern 1 for accurate timer implementation
 * @see RESEARCH.md Pitfall #2 for visibility change handling
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { startMatchTimer, pauseMatchTimer, resumeMatchTimer } from '@/lib/db/match-timers';

export type TimerStatus = 'idle' | 'running' | 'paused';

export interface UseMatchTimerReturn {
  /** Elapsed time in milliseconds */
  elapsedMs: number;
  /** Elapsed time in whole seconds */
  elapsedSeconds: number;
  /** Whether timer is currently running */
  isRunning: boolean;
  /** Current timer status */
  status: TimerStatus;
  /** Formatted time string (MM:SS) */
  formattedTime: string;
  /** Start the timer from zero */
  start: () => Promise<void>;
  /** Pause the timer, preserving elapsed time */
  pause: () => Promise<void>;
  /** Resume the timer from pause point */
  resume: () => Promise<void>;
  /** Reset timer to zero and stop */
  reset: () => void;
}

/**
 * Format milliseconds to MM:SS display
 */
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Zero-pad single digit numbers
 */
function pad(num: number): string {
  return num.toString().padStart(2, '0');
}

/**
 * Debounce function for server sync
 */
function debounce(
  fn: (seconds: number, timerStatus: TimerStatus) => void,
  delay: number
): (seconds: number, timerStatus: TimerStatus) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (seconds: number, timerStatus: TimerStatus) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => fn(seconds, timerStatus), delay);
  };
}

/**
 * Hook for accurate match timer with pause/resume and visibility handling
 * 
 * @param matchId - The match ID to sync timer state with
 * @param initialElapsedSeconds - Initial elapsed seconds (for resuming existing timer)
 * @returns Timer state and controls
 * 
 * @example
 * ```tsx
 * const {
 *   elapsedMs,
 *   formattedTime,
 *   isRunning,
 *   start,
 *   pause,
 *   resume,
 * } = useMatchTimer(matchId);
 * 
 * // Display: 12:34
 * <div>{formattedTime}</div>
 * ```
 */
export function useMatchTimer(
  matchId: string,
  initialElapsedSeconds = 0
): UseMatchTimerReturn {
  // State
  const [elapsedMs, setElapsedMs] = useState(initialElapsedSeconds * 1000);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<TimerStatus>('idle');

  // Refs for timing calculations (not triggering re-renders)
  const startTimeRef = useRef<number | null>(null);
  const pausedElapsedRef = useRef(initialElapsedSeconds * 1000);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSyncRef = useRef<number>(0);

  /**
   * Sync timer state to server (debounced)
   */
  const syncToServer = useCallback(
    debounce(async (seconds: number, timerStatus: TimerStatus) => {
      try {
        if (timerStatus === 'running') {
          await resumeMatchTimer(matchId, seconds);
        } else if (timerStatus === 'paused') {
          await pauseMatchTimer(matchId, seconds);
        }
        lastSyncRef.current = Date.now();
        console.log('[MatchTimer] Synced to server:', seconds, 'status:', timerStatus);
      } catch (error) {
        console.error('[MatchTimer] Failed to sync timer:', error);
      }
    }, 5000),
    [matchId]
  );

  /**
   * Start the timer from zero
   */
  const start = useCallback(async () => {
    const now = performance.now();
    startTimeRef.current = now;
    pausedElapsedRef.current = 0;
    setElapsedMs(0);
    setIsRunning(true);
    setStatus('running');
    
    try {
      await startMatchTimer(matchId);
      console.log('[MatchTimer] Timer started for match:', matchId);
    } catch (error) {
      console.error('[MatchTimer] Failed to start timer on server:', error);
    }
  }, [matchId]);

  /**
   * Pause the timer, preserving elapsed time
   */
  const pause = useCallback(async () => {
    if (startTimeRef.current) {
      const now = performance.now();
      pausedElapsedRef.current += now - startTimeRef.current;
      setElapsedMs(pausedElapsedRef.current);
    }
    
    startTimeRef.current = null;
    setIsRunning(false);
    setStatus('paused');
    
    // Immediate sync on pause
    try {
      const seconds = Math.floor(pausedElapsedRef.current / 1000);
      await pauseMatchTimer(matchId, seconds);
      console.log('[MatchTimer] Timer paused at:', seconds, 'seconds');
    } catch (error) {
      console.error('[MatchTimer] Failed to pause timer on server:', error);
    }
  }, [matchId]);

  /**
   * Resume the timer from pause point
   */
  const resume = useCallback(async () => {
    startTimeRef.current = performance.now();
    setIsRunning(true);
    setStatus('running');
    
    try {
      const seconds = Math.floor(pausedElapsedRef.current / 1000);
      await resumeMatchTimer(matchId, seconds);
      console.log('[MatchTimer] Timer resumed from:', seconds, 'seconds');
    } catch (error) {
      console.error('[MatchTimer] Failed to resume timer on server:', error);
    }
  }, [matchId]);

  /**
   * Reset timer to zero and stop
   */
  const reset = useCallback(() => {
    startTimeRef.current = null;
    pausedElapsedRef.current = 0;
    setElapsedMs(0);
    setIsRunning(false);
    setStatus('idle');
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    console.log('[MatchTimer] Timer reset');
  }, []);

  /**
   * Update loop - runs every 100ms while timer is running
   */
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Update display every 100ms for smooth UI
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const now = performance.now();
        const currentElapsed = (now - startTimeRef.current) + pausedElapsedRef.current;
        setElapsedMs(currentElapsed);
        
        // Debounced sync to server (every ~5 seconds)
        const seconds = Math.floor(currentElapsed / 1000);
        syncToServer(seconds, 'running');
      }
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, syncToServer]);

  /**
   * Handle visibility change (Pitfall #2 prevention)
   * 
   * When tab is hidden while running: store current elapsed time
   * When tab becomes visible while should be running: resume calculation
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is being hidden - capture current state
        if (isRunning && startTimeRef.current) {
          const now = performance.now();
          pausedElapsedRef.current += now - startTimeRef.current;
          startTimeRef.current = null;
          console.log('[MatchTimer] Tab hidden, stored elapsed:', pausedElapsedRef.current);
        }
      } else {
        // Tab is becoming visible again
        if (isRunning && !startTimeRef.current) {
          startTimeRef.current = performance.now();
          console.log('[MatchTimer] Tab visible, resuming from:', pausedElapsedRef.current);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Sync final state if running
      if (isRunning && status === 'running') {
        const seconds = Math.floor(elapsedMs / 1000);
        pauseMatchTimer(matchId, seconds).catch((err: Error) => {
          console.error('[MatchTimer] Failed to sync on unmount:', err);
        });
      }
    };
  }, [isRunning, status, elapsedMs, matchId]);

  const formattedTime = formatTime(elapsedMs);
  const elapsedSeconds = Math.floor(elapsedMs / 1000);

  return {
    elapsedMs,
    elapsedSeconds,
    isRunning,
    status,
    formattedTime,
    start,
    pause,
    resume,
    reset,
  };
}

export default useMatchTimer;
