// Push Notification Subscription Utilities for Next.js PWA
// This module provides functions to manage push notification subscriptions

/**
 * Convert VAPID public key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Check if push notifications are supported
 */
export function isPushNotificationSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  // Check current permission
  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn('Notification permission was previously denied');
    return false;
  }

  // Request permission
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(
  vapidPublicKey: string
): Promise<PushSubscription | null> {
  try {
    // Check support
    if (!isPushNotificationSupported()) {
      throw new Error('Push notifications are not supported');
    }

    // Request permission
    const permissionGranted = await requestNotificationPermission();
    if (!permissionGranted) {
      throw new Error('Notification permission not granted');
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Subscribe to push notifications
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      console.log('Push subscription created:', subscription);
    } else {
      console.log('Already subscribed to push notifications');
    }

    // Send subscription to server
    await sendSubscriptionToServer(subscription);

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    throw error;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      console.log('No active push subscription found');
      return false;
    }

    // Unsubscribe client-side
    const successful = await subscription.unsubscribe();

    if (successful) {
      console.log('Successfully unsubscribed from push notifications');

      // Notify server to remove subscription
      await removeSubscriptionFromServer(subscription.endpoint);
    }

    return successful;
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
    throw error;
  }
}

/**
 * Get current push subscription
 */
export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  try {
    if (!isPushNotificationSupported()) {
      return null;
    }

    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error('Failed to get current subscription:', error);
    return null;
  }
}

/**
 * Send subscription to server
 */
async function sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
  const response = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(subscription)
  });

  if (!response.ok) {
    throw new Error('Failed to send subscription to server');
  }

  console.log('Subscription sent to server');
}

/**
 * Remove subscription from server
 */
async function removeSubscriptionFromServer(endpoint: string): Promise<void> {
  const response = await fetch('/api/push/unsubscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ endpoint })
  });

  if (!response.ok) {
    throw new Error('Failed to remove subscription from server');
  }

  console.log('Subscription removed from server');
}

/**
 * Show a test notification (requires permission)
 */
export async function showTestNotification(): Promise<void> {
  const permissionGranted = await requestNotificationPermission();

  if (!permissionGranted) {
    throw new Error('Notification permission not granted');
  }

  const registration = await navigator.serviceWorker.ready;

  await registration.showNotification('Test Notification', {
    body: 'This is a test notification from your PWA',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    tag: 'test-notification'
  });
}

/**
 * React Hook for managing push notifications
 */
export function usePushNotifications(vapidPublicKey: string) {
  const [isSupported, setIsSupported] = React.useState(false);
  const [subscription, setSubscription] = React.useState<PushSubscription | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    setIsSupported(isPushNotificationSupported());

    if (isPushNotificationSupported()) {
      getCurrentSubscription().then(setSubscription);
    }
  }, []);

  const subscribe = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const sub = await subscribeToPushNotifications(vapidPublicKey);
      setSubscription(sub);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [vapidPublicKey]);

  const unsubscribe = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await unsubscribeFromPushNotifications();
      setSubscription(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const testNotification = React.useCallback(async () => {
    setError(null);

    try {
      await showTestNotification();
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  return {
    isSupported,
    subscription,
    loading,
    error,
    subscribe,
    unsubscribe,
    testNotification
  };
}

// Add React import for the hook
import React from 'react';
