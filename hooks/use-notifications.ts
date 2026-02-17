import { useState, useEffect, useCallback } from 'react';
import {
  isPushSupported,
  getNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  sendLocalNotification,
} from '@/lib/notifications/push';

export function useNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    match_reminder_24h: true,
    match_reminder_2h: true,
    match_reminder_30m: false,
  });

  useEffect(() => {
    setIsSupported(isPushSupported());
    checkPermission();
    // TODO: Load preferences from database when implemented (Phase 8)
  }, []);

  const checkPermission = async () => {
    const perm = await getNotificationPermission();
    setPermission(perm);
    setIsSubscribed(perm === 'granted');
  };

  const requestPermission = useCallback(async () => {
    setIsLoading(true);
    try {
      await subscribeToPush();
      await checkPermission();
      return true;
    } catch (err) {
      console.error('Failed to subscribe:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disableNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      await unsubscribeFromPush();
      await checkPermission();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePreferences = useCallback(async (newPrefs: Partial<typeof preferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);

    // TODO: Save preferences to database when implemented (Phase 8)
    console.log('[Notifications] Preferences updated:', updated);
  }, [preferences]);

  const testNotification = useCallback(async () => {
    await sendLocalNotification('Test Notifica', {
      body: 'Le notifiche funzionano correttamente!',
      icon: '/icons/icon-192x192.png',
    });
  }, []);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    preferences,
    requestPermission,
    disableNotifications,
    updatePreferences,
    testNotification,
  };
}
