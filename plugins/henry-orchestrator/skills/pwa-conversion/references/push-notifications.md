# Push Notifications for PWAs

This reference provides comprehensive guidance on implementing push notifications in Progressive Web Apps.

## Overview

Push notifications enable re-engagement with users even when the app is not open. They require:
1. Service worker registration
2. User permission
3. Push subscription
4. Backend server to send notifications
5. Notification event handlers

## Architecture

```
[Your Server] → [Push Service (FCM/VAPID)] → [Service Worker] → [User Device]
     ↑                                              ↓
     └────────── Push Subscription ────────────────┘
```

## Client-Side Implementation

### Step 1: Request Notification Permission

```javascript
async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}
```

### Step 2: Subscribe to Push Notifications

```javascript
async function subscribeToPushNotifications() {
  try {
    // Request permission first
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
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)
      });
    }

    // Send subscription to your server
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    });

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    throw error;
  }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
```

### Step 3: Unsubscribe from Push Notifications

```javascript
async function unsubscribeFromPushNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Unsubscribe client-side
      await subscription.unsubscribe();

      // Notify server to remove subscription
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ endpoint: subscription.endpoint })
      });

      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
    throw error;
  }
}
```

## Service Worker Push Event Handler

```javascript
// In your service worker (sw.js or public/sw.js)

self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log('Push event has no data');
    return;
  }

  const data = event.data.json();

  const options = {
    body: data.body || 'New notification',
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/badge-72x72.png',
    image: data.image,
    vibrate: data.vibrate || [200, 100, 200],
    data: {
      url: data.url || '/',
      timestamp: Date.now(),
      ...data.data
    },
    actions: data.actions || [],
    tag: data.tag || 'default-tag',
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Notification', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Handle action clicks
  if (event.action) {
    console.log('Action clicked:', event.action);
    // Handle specific actions
    switch (event.action) {
      case 'open':
        event.waitUntil(clients.openWindow(event.notification.data.url));
        break;
      case 'dismiss':
        // Do nothing, notification already closed
        break;
      default:
        event.waitUntil(clients.openWindow('/'));
    }
  } else {
    // Default click behavior - open the app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if there's already a window open
          for (let client of clientList) {
            if (client.url === event.notification.data.url && 'focus' in client) {
              return client.focus();
            }
          }
          // Open new window
          if (clients.openWindow) {
            return clients.openWindow(event.notification.data.url);
          }
        })
    );
  }
});

self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
  // Track notification dismissal analytics
});
```

## Server-Side Implementation (Next.js)

### Generate VAPID Keys

```javascript
// scripts/generate-vapid-keys.js
const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('VAPID Public Key:', vapidKeys.publicKey);
console.log('VAPID Private Key:', vapidKeys.privateKey);
console.log('\nAdd these to your .env file:');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
```

Run with: `node scripts/generate-vapid-keys.js`

### API Route: Subscribe

```typescript
// app/api/push/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// Configure web-push with VAPID details
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Store subscriptions (use a database in production)
const subscriptions = new Map<string, webpush.PushSubscription>();

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json();

    // Validate subscription
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription' },
        { status: 400 }
      );
    }

    // Store subscription (in production, save to database)
    subscriptions.set(subscription.endpoint, subscription);

    // Optionally send a welcome notification
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: 'Subscribed!',
        body: 'You will now receive push notifications',
        icon: '/icon-192x192.png',
        url: '/'
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error subscribing to push:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
```

### API Route: Send Notification

```typescript
// app/api/push/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// Configure web-push
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { title, body, url, icon, actions, subscriptions } = await request.json();

    const payload = JSON.stringify({
      title,
      body,
      url: url || '/',
      icon: icon || '/icon-192x192.png',
      badge: '/badge-72x72.png',
      actions: actions || [],
      vibrate: [200, 100, 200],
      tag: `notification-${Date.now()}`,
      timestamp: Date.now()
    });

    // Send to all subscriptions (or specific ones)
    const sendPromises = subscriptions.map((subscription: webpush.PushSubscription) =>
      webpush.sendNotification(subscription, payload)
        .catch((error) => {
          console.error('Error sending push notification:', error);
          // Handle expired subscriptions
          if (error.statusCode === 410) {
            // Remove subscription from database
            console.log('Subscription expired, removing:', subscription.endpoint);
          }
        })
    );

    await Promise.all(sendPromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending push notifications:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}
```

### API Route: Unsubscribe

```typescript
// app/api/push/unsubscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { endpoint } = await request.json();

    // Remove subscription from database
    // subscriptions.delete(endpoint);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unsubscribing from push:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}
```

## React Component Example

```typescript
// components/PushNotificationButton.tsx
'use client';

import { useState, useEffect } from 'react';

export default function PushNotificationButton() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsSupported(
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );

    // Check if already subscribed
    if (isSupported) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then(setSubscription);
      });
    }
  }, [isSupported]);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const sub = await subscribeToPushNotifications();
      setSubscription(sub);
    } catch (error) {
      console.error('Subscription failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    try {
      await unsubscribeFromPushNotifications();
      setSubscription(null);
    } catch (error) {
      console.error('Unsubscribe failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>;
  }

  return (
    <div>
      {subscription ? (
        <button onClick={handleUnsubscribe} disabled={loading}>
          {loading ? 'Unsubscribing...' : 'Disable Notifications'}
        </button>
      ) : (
        <button onClick={handleSubscribe} disabled={loading}>
          {loading ? 'Subscribing...' : 'Enable Notifications'}
        </button>
      )}
    </div>
  );
}

async function subscribeToPushNotifications() {
  // Implementation from earlier
}

async function unsubscribeFromPushNotifications() {
  // Implementation from earlier
}
```

## Notification Payload Examples

### Basic Notification

```json
{
  "title": "New Message",
  "body": "You have a new message from John",
  "icon": "/icon-192x192.png",
  "url": "/messages/123"
}
```

### Notification with Actions

```json
{
  "title": "Friend Request",
  "body": "Sarah wants to connect with you",
  "icon": "/icon-192x192.png",
  "badge": "/badge-72x72.png",
  "url": "/friends/requests",
  "actions": [
    {
      "action": "accept",
      "title": "Accept",
      "icon": "/icons/accept.png"
    },
    {
      "action": "ignore",
      "title": "Ignore",
      "icon": "/icons/ignore.png"
    }
  ],
  "requireInteraction": true
}
```

### Rich Media Notification

```json
{
  "title": "New Photo",
  "body": "Check out this amazing sunset!",
  "icon": "/icon-192x192.png",
  "image": "/photos/sunset.jpg",
  "badge": "/badge-72x72.png",
  "vibrate": [200, 100, 200, 100, 200],
  "url": "/photos/456",
  "tag": "photo-456"
}
```

## Best Practices

1. **Request Permission Thoughtfully**: Ask for permission in context when user performs an action that would benefit from notifications.

2. **Provide Value**: Only send notifications that provide real value to users. Avoid spam.

3. **Support Unsubscribe**: Make it easy for users to disable notifications.

4. **Handle Permission States**: Respect when users deny permission and don't repeatedly ask.

5. **Group Related Notifications**: Use the `tag` property to replace older notifications.

6. **Rich Content**: Use icons, images, and actions to make notifications engaging.

7. **Deep Links**: Link notifications to specific content in your app using the `url` property.

8. **Handle Expired Subscriptions**: Remove subscriptions that return 410 status from your database.

9. **Test Thoroughly**: Test on multiple devices and browsers.

10. **Monitor Analytics**: Track notification delivery, clicks, and dismissals.

## Debugging

### Test Notification Locally

```javascript
// In browser console
navigator.serviceWorker.ready.then((registration) => {
  registration.showNotification('Test Notification', {
    body: 'This is a test',
    icon: '/icon-192x192.png'
  });
});
```

### Chrome DevTools

1. Open DevTools → Application → Service Workers
2. Check "Update on reload" during development
3. Use "Push" to simulate push events
4. Monitor "Notifications" in Application tab

### Firefox DevTools

1. Open DevTools → Application → Service Workers
2. Click "Push" to test push events
3. Monitor Console for service worker logs

## Security Considerations

1. **HTTPS Required**: Push notifications require HTTPS (except localhost).

2. **VAPID Keys**: Keep private VAPID key secret (server-side only).

3. **Validate Subscriptions**: Verify subscription objects before storing.

4. **Rate Limiting**: Implement rate limiting on push API endpoints.

5. **User Privacy**: Don't include sensitive information in notification payloads.

6. **Endpoint Security**: Protect push API routes with authentication.

## Database Schema Example

```typescript
// Prisma schema example
model PushSubscription {
  id        String   @id @default(cuid())
  userId    String
  endpoint  String   @unique
  keys      Json     // { p256dh: string, auth: string }
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## Additional Resources

- [Push API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Notifications API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [web-push Library](https://github.com/web-push-libs/web-push)
- [FCM Documentation](https://firebase.google.com/docs/cloud-messaging)
