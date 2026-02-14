'use client';

/**
 * Offline Banner Component
 * 
 * Shows connection status and pending sync queue count.
 * Fixed at bottom of screen.
 * 
 * @see RESEARCH.md Pattern 2
 */

import { useOfflineQueue } from '@/hooks/use-offline-queue';
import { CloudOff, CloudCheck, CloudCog } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Offline Banner Component
 */
export function OfflineBanner(): ReactNode | null {
  const { isOnline, queueCount, isSyncing } = useOfflineQueue();

  // Don't show banner when online with no pending actions
  if (isOnline && queueCount === 0 && !isSyncing) {
    return null;
  }

  // Determine state
  const isOffline = !isOnline;
  const hasPending = queueCount > 0;

  // Get display text and styling based on state
  const getStateConfig = () => {
    if (isOffline) {
      return {
        icon: CloudOff,
        text: hasPending 
          ? `You're offline · ${queueCount} pending`
          : "You're offline",
        bgColor: 'bg-amber-500',
        textColor: 'text-white',
      };
    }

    if (isSyncing) {
      return {
        icon: CloudCog,
        text: 'Syncing...',
        bgColor: 'bg-blue-500',
        textColor: 'text-white',
      };
    }

    if (hasPending) {
      return {
        icon: CloudCheck,
        text: `${queueCount} pending sync`,
        bgColor: 'bg-green-500',
        textColor: 'text-white',
      };
    }

    return {
      icon: CloudCheck,
      text: 'Online',
      bgColor: 'bg-green-500',
      textColor: 'text-white',
    };
  };

  const config = getStateConfig();
  const Icon = config.icon;

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-50
        ${config.bgColor} ${config.textColor}
        px-4 py-3
        flex items-center justify-center gap-2
        shadow-lg
      `}
      role="status"
      aria-live="polite"
    >
      <Icon className="w-5 h-5" aria-hidden="true" />
      <span className="text-sm font-medium">{config.text}</span>
    </div>
  );
}
