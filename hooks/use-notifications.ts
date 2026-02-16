import { useState, useEffect, useCallback } from 'react';
import {
  isPushSupported,
  getNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  sendLocalNotification,
} from '@/lib/notifications/push';
import { createClient } from '@/lib/supabase/client';

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
    loadPreferences();
  }, []);

  const checkPermission = async () => {
    const perm = await getNotificationPermission();
    setPermission(perm);
    setIsSubscribed(perm === 'granted');
  };

  const loadPreferences = async () => {
    const supabase = createClient();
    const { data } = await (supabase as any)
      .from('notification_preferences')
      .select('*')
      .single();
    
    if (data) {
      setPreferences({
        match_reminder_24h: data.match_reminder_24h,
        match_reminder_2h: data.match_reminder_2h,
        match_reminder_30m: data.match_reminder_30m,
      });
    }
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

    const supabase = createClient();
    await (supabase as any)
      .from('notification_preferences')
      .upsert({
        match_reminder_24h: updated.match_reminder_24h,
        match_reminder_2h: updated.match_reminder_2h,
        match_reminder_30m: updated.match_reminder_30m,
      }, { onConflict: 'user_id' });
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
