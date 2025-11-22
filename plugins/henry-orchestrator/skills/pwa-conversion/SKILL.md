---
name: pwa-conversion
description: This skill should be used when the user asks to "convert to PWA", "make this a Progressive Web App", "add offline support", "implement service worker", "add web app manifest", "enable push notifications", "implement background sync", "make app installable", or mentions Progressive Web Apps, PWA features, offline functionality, or installability.
version: 1.0.0
---

# PWA Conversion

Convert web applications into Progressive Web Apps (PWAs) with offline support, installability, push notifications, and background sync capabilities.

## Overview

Progressive Web Apps provide native app-like experiences using modern web capabilities. PWAs offer:

- **Offline functionality** through service workers and caching strategies
- **Installability** with web app manifest
- **Re-engagement** via push notifications
- **Reliability** with background sync
- **Performance** through strategic caching
- **Native feel** with standalone display mode

This skill focuses on Next.js PWA implementation using the `next-pwa` library, which leverages Workbox for production-ready service worker generation.

## Core PWA Requirements

A PWA must satisfy these baseline requirements:

1. **HTTPS** - Required in production (localhost exempt for development)
2. **Service Worker** - Handles offline functionality and caching
3. **Web App Manifest** - Defines app metadata and installation behavior
4. **Responsive Design** - Works across all device sizes
5. **Fast Performance** - Loads quickly, even on slow networks

## Implementation Workflow

### Step 1: Install Dependencies

For Next.js projects, install `next-pwa`:

```bash
npm install next-pwa
# or
yarn add next-pwa
```

For vanilla projects, implement service worker manually using the example in `examples/service-worker.js`.

### Step 2: Configure next-pwa

Create or update `next.config.js` with PWA configuration. Reference the complete example in `examples/next.config.js` for:

- Runtime caching strategies for different asset types
- Cache expiration policies
- Offline fallbacks
- Build exclusions

Key configuration options:

- `dest: 'public'` - Output directory for service worker files
- `register: true` - Auto-register service worker
- `skipWaiting: true` - Activate new service worker immediately
- `disable: process.env.NODE_ENV === 'development'` - Disable in dev mode for easier debugging
- `runtimeCaching` - Define caching strategies per URL pattern

### Step 3: Create Web App Manifest

Create `public/manifest.json` or `app/manifest.json` (for App Router). Reference `examples/manifest.json` for complete structure including:

**Required fields:**

- `name` - Full application name
- `short_name` - Name shown on home screen (12 chars max recommended)
- `start_url` - Entry point when launched from home screen
- `display` - Display mode: `standalone`, `fullscreen`, `minimal-ui`, or `browser`
- `icons` - Array of icon objects with various sizes

**Recommended fields:**

- `background_color` - Splash screen background
- `theme_color` - Browser UI color
- `description` - App description for stores
- `orientation` - Preferred orientation
- `scope` - Navigation scope
- `screenshots` - For enhanced install prompts
- `shortcuts` - Quick actions from home screen icon
- `categories` - App categories for discovery

### Step 4: Generate PWA Icons

PWAs require multiple icon sizes for different contexts:

**Required sizes:**

- 192x192 - Minimum for "Add to Home Screen"
- 512x512 - Splash screens and app stores

**Recommended sizes:**

- 72x72, 96x96, 128x128, 144x144, 152x152, 384x384

**Icon purposes:**

- `any` - Standard icons
- `maskable` - Safe zone for platform-specific masking (192x192 and 512x512 should be maskable)

Use `scripts/generate-icons.sh` to generate all required sizes from a source image:

```bash
chmod +x .claude/skills/pwa-conversion/scripts/generate-icons.sh
./.claude/skills/pwa-conversion/scripts/generate-icons.sh logo.svg public
```

**Requirements:**

- ImageMagick must be installed (`brew install imagemagick`)
- Source image should be square, ideally SVG or high-res PNG
- For maskable icons, keep important content in center 80% safe zone

### Step 5: Link Manifest in HTML

For App Router (Next.js 13+), create `app/manifest.ts`:

```typescript
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'My Progressive Web App',
    short_name: 'My PWA',
    description: 'A powerful PWA',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0070f3',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
```

For Pages Router or static HTML, add to `<head>`:

```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#0070f3" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

### Step 6: Implement Caching Strategies

Service workers enable sophisticated caching. Choose appropriate strategies per resource type:

**Cache First** - Best for static assets (images, fonts, versioned JS/CSS):

- Fastest response
- Works offline immediately
- Use for rarely-changing resources

**Network First** - Best for API requests and dynamic content:

- Always tries fresh content
- Falls back to cache when offline
- Use for frequently-updated data

**Stale While Revalidate** - Best for balanced freshness and speed:

- Returns cached content immediately
- Updates cache in background
- Use for content tolerant of brief staleness

Reference `references/cache-strategies.md` for:

- Detailed strategy implementations
- Advanced patterns (timeouts, conditional caching, size limits)
- Workbox configuration examples
- Best practices and debugging techniques

### Step 7: Add Offline Fallback

Create `app/offline/page.tsx` or `public/offline.html`:

```tsx
// app/offline/page.tsx
export default function OfflinePage() {
  return (
    <div>
      <h1>You're offline</h1>
      <p>Please check your internet connection and try again.</p>
    </div>
  );
}
```

Configure fallback in `next.config.js`:

```javascript
fallbacks: {
  document: '/offline';
}
```

### Step 8: Implement Push Notifications (Optional)

Enable re-engagement through push notifications. Reference `references/push-notifications.md` for complete implementation including:

**Setup steps:**

1. Generate VAPID keys for authentication
2. Create subscription API routes
3. Implement client-side subscription logic
4. Handle push events in service worker
5. Send notifications from server

**Key files:**

- `examples/push-subscription.ts` - Client utilities and React hooks
- `examples/service-worker.js` - Push event handlers (lines 125-158)

**Quick start:**

```bash
# Generate VAPID keys
node -e "console.log(require('web-push').generateVAPIDKeys())"
```

Add keys to `.env`:

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

Use the `usePushNotifications` hook from `examples/push-subscription.ts` in your components.

### Step 9: Implement Background Sync (Optional)

Ensure critical operations complete even when offline. Reference `references/background-sync.md` for:

**Common use cases:**

- Form submissions
- Message queuing
- File uploads
- Data synchronization

**Implementation pattern:**

1. Store pending operations in IndexedDB
2. Register sync event when offline
3. Handle sync event in service worker
4. Process pending operations when online
5. Clean up completed operations

Background Sync fires automatically when network connectivity is restored, ensuring reliable completion of deferred actions.

### Step 10: Test PWA Functionality

Validate PWA implementation using `scripts/validate-pwa.sh`:

```bash
chmod +x .claude/skills/pwa-conversion/scripts/validate-pwa.sh
./.claude/skills/pwa-conversion/scripts/validate-pwa.sh
```

**Manual testing checklist:**

1. **Installability**
   - Open app in Chrome/Edge
   - Check for install prompt in address bar
   - Install and verify standalone mode

2. **Offline functionality**
   - Open DevTools � Application � Service Workers
   - Check "Offline" in Network tab
   - Navigate app and verify cached content loads

3. **Caching**
   - Application � Cache Storage
   - Verify expected resources are cached
   - Check cache names match configuration

4. **Manifest**
   - Application � Manifest
   - Verify all fields display correctly
   - Check icons load properly

5. **Push notifications** (if implemented)
   - Subscribe to notifications
   - Send test notification from server
   - Verify notification displays and click handling works

6. **Background sync** (if implemented)
   - Submit form while offline
   - Verify operation queued
   - Go online and confirm sync completes

**Lighthouse PWA audit:**

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run PWA audit
lighthouse https://your-app.com --view --preset=pwa
```

Target Lighthouse PWA score: 100

## Project Structure

```
project/
   public/
      manifest.json          # Web app manifest
      icon-*.png             # PWA icons (various sizes)
      apple-touch-icon.png   # iOS home screen icon
      favicon.ico            # Browser favicon
      sw.js                  # Service worker (generated by next-pwa)
      workbox-*.js           # Workbox runtime (generated)
   app/                       # Next.js App Router
      manifest.ts            # Manifest configuration (alternative to JSON)
      offline/
         page.tsx          # Offline fallback page
      api/
          push/
              subscribe/
                 route.ts  # Push subscription endpoint
              send/
                  route.ts  # Send notification endpoint
   next.config.js            # Next.js + PWA config
   package.json
```

## Common Patterns

### Progressive Enhancement

Detect PWA features before using:

```javascript
// Check service worker support
if ('serviceWorker' in navigator) {
  // Use service worker features
}

// Check push notification support
if ('PushManager' in window) {
  // Enable push notifications
}

// Check background sync support
if ('sync' in registration) {
  // Use background sync
}
```

### Service Worker Registration

For custom service workers (non-next-pwa):

```javascript
// app/layout.tsx or _app.tsx
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered:', registration);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  }
}, []);
```

### Update Service Worker

Prompt users when new version is available:

```javascript
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;

        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            if (confirm('New version available! Reload to update?')) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            }
          }
        });
      });
    });
  }
}, []);
```

## Best Practices

1. **Disable PWA in Development**: Set `disable: process.env.NODE_ENV === 'development'` in next-pwa config for easier debugging

2. **Version Cache Names**: Include version in cache names to force updates when deploying breaking changes

3. **Selective Caching**: Do not cache authentication endpoints, user-specific data, or real-time content

4. **Set Expiration Policies**: Prevent unbounded cache growth with `maxEntries` and `maxAgeSeconds`

5. **Test Offline Scenarios**: Regularly test app with DevTools offline mode enabled

6. **Monitor Cache Size**: Check Application � Storage in DevTools to monitor quota usage

7. **Respect User Preferences**: Make push notifications opt-in and easy to disable

8. **Handle Permission States**: Respect denied permissions and avoid repeatedly asking

9. **Provide Update Mechanism**: Notify users when new service worker versions are available

10. **Use HTTPS**: PWAs require HTTPS in production (development on localhost is exempt)

## Troubleshooting

### Service worker not registering

**Symptoms:** Console shows service worker registration errors

**Solutions:**

- Verify HTTPS in production (or localhost in development)
- Check `next.config.js` PWA configuration
- Ensure service worker file is accessible at `/sw.js`
- Clear site data in DevTools and retry

### Install prompt not showing

**Symptoms:** No install banner appears in browser

**Solutions:**

- Verify manifest.json has all required fields
- Check icon sizes include 192x192 and 512x512
- Ensure service worker is registered and active
- Test in Chrome/Edge (Safari has limited PWA support)
- Verify app is served over HTTPS
- Run Lighthouse audit to identify missing requirements

### Offline functionality not working

**Symptoms:** App shows errors when offline

**Solutions:**

- Verify service worker is active in DevTools
- Check cache storage contains expected resources
- Review caching strategies in `next.config.js`
- Test with DevTools offline mode
- Check service worker console for errors

### Push notifications not working

**Symptoms:** Subscribe fails or notifications don't appear

**Solutions:**

- Verify VAPID keys are correctly configured
- Check notification permission status
- Ensure service worker is active
- Test with simple notification first
- Review push event handler in service worker
- Verify server is sending valid payloads

### Cache not updating

**Symptoms:** Old content persists after deployment

**Solutions:**

- Update cache version in service worker
- Use `activate` event to delete old caches
- Implement `skipWaiting` for immediate activation
- Clear site data in DevTools
- Check caching strategy is appropriate for resource type

## Additional Resources

### Reference Files

For detailed implementation guidance:

- **`references/cache-strategies.md`** - Comprehensive caching patterns, Workbox configuration, debugging techniques
- **`references/push-notifications.md`** - Complete push notification setup, server implementation, React hooks
- **`references/background-sync.md`** - Background sync patterns, IndexedDB helpers, retry strategies

### Example Files

Working implementations in `examples/`:

- **`examples/service-worker.js`** - Production-ready service worker with all PWA features
- **`examples/manifest.json`** - Complete manifest with all optional fields
- **`examples/next.config.js`** - Next.js PWA configuration with runtime caching
- **`examples/push-subscription.ts`** - Push notification utilities and React hooks

### Script Utilities

Helper scripts in `scripts/`:

- **`scripts/validate-pwa.sh`** - Validate PWA requirements
- **`scripts/generate-icons.sh`** - Generate all icon sizes from source image

### External Documentation

- [Next PWA Documentation](https://github.com/shadowwalker/next-pwa)
- [Workbox Documentation](https://developer.chrome.com/docs/workbox/)
- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev: PWA](https://web.dev/progressive-web-apps/)
- [PWA Builder](https://www.pwabuilder.com/)

## Quick Start Checklist

When converting an existing Next.js app to PWA:

- [ ] Install `next-pwa` package
- [ ] Configure `next.config.js` with PWA settings
- [ ] Create manifest.json with required fields
- [ ] Generate PWA icons (192x192, 512x512 minimum)
- [ ] Link manifest in app layout
- [ ] Create offline fallback page
- [ ] Configure runtime caching strategies
- [ ] Test installability in Chrome/Edge
- [ ] Test offline functionality with DevTools
- [ ] Run Lighthouse PWA audit
- [ ] (Optional) Implement push notifications
- [ ] (Optional) Implement background sync
- [ ] Run validation script
- [ ] Deploy with HTTPS

Follow this workflow to systematically implement all PWA features for a production-ready Progressive Web App.
