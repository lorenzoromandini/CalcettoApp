/**
 * Push Notification Utilities
 * 
 * Note: Push notification persistence is not yet implemented with Prisma.
 * This is a stub for UI compatibility until Phase 8 (Social & Sharing).
 * 
 * Push subscriptions will be stored in the database in a future phase.
 */

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Check if push is supported
export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

// Check current permission status
export async function getNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'default';
  return Notification.permission;
}

// Request permission and subscribe
export async function subscribeToPush(): Promise<PushSubscriptionData | null> {
  if (!isPushSupported()) {
    throw new Error('Push notifications not supported');
  }

  if (!VAPID_PUBLIC_KEY) {
    throw new Error('VAPID public key not configured');
  }

  // Request permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return null;
  }

  // Get service worker registration
  const registration = await navigator.serviceWorker.ready;

  // Subscribe to push
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as any,
  });

  // Convert keys to base64
  const p256dhKey = subscription.getKey('p256dh');
  const authKey = subscription.getKey('auth');
  
  const subscriptionData: PushSubscriptionData = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: p256dhKey ? btoa(String.fromCharCode(...new Uint8Array(p256dhKey))) : '',
      auth: authKey ? btoa(String.fromCharCode(...new Uint8Array(authKey))) : '',
    },
  };

  // TODO: Save subscription to database (Phase 8)
  console.log('[Push] Subscription created:', subscriptionData.endpoint);

  return subscriptionData;
}

// Unsubscribe from push
export async function unsubscribeFromPush(): Promise<void> {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  
  if (subscription) {
    await subscription.unsubscribe();
  }

  // TODO: Remove subscription from database (Phase 8)
  console.log('[Push] Unsubscribed');
}

// Helper to convert VAPID key from base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Send local notification (for testing)
export async function sendLocalNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  if (Notification.permission !== 'granted') return;
  
  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification(title, options);
}
