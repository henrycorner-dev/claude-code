# Service Worker Cache Strategies

This reference provides detailed information about service worker caching strategies for PWAs.

## Overview

Service workers enable offline functionality through strategic caching. Choose the right strategy based on content type and update requirements.

## Core Cache Strategies

### 1. Cache First (Cache Falling Back to Network)

Best for: Static assets, fonts, images that rarely change

```javascript
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
```

**Pros:**

- Fastest response time
- Works offline immediately
- Reduces bandwidth usage

**Cons:**

- May serve stale content
- Requires cache invalidation strategy

**Use cases:**

- Application shell
- CSS/JS bundles with versioned filenames
- Static images and fonts

### 2. Network First (Network Falling Back to Cache)

Best for: API requests, frequently updated content

```javascript
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone response to store in cache
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request);
      })
  );
});
```

**Pros:**

- Always tries to get fresh content
- Falls back gracefully when offline
- Automatically updates cache

**Cons:**

- Slower when online (network latency)
- Uses more bandwidth

**Use cases:**

- API endpoints
- User-generated content
- News feeds and dynamic content

### 3. Stale While Revalidate

Best for: Content that can be slightly stale but should update

```javascript
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
        // Return cached version immediately, update cache in background
        return cachedResponse || fetchPromise;
      });
    })
  );
});
```

**Pros:**

- Fast initial response
- Automatic background updates
- Good balance of speed and freshness

**Cons:**

- May show outdated content briefly
- Extra network requests in background

**Use cases:**

- Avatar images
- Social media posts
- Product listings

### 4. Network Only

Best for: Real-time data that should never be cached

```javascript
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});
```

**Use cases:**

- Analytics requests
- Real-time stock prices
- Live chat messages

### 5. Cache Only

Best for: Pre-cached content that never changes

```javascript
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request));
});
```

**Use cases:**

- Offline fallback pages
- Pre-installed application shell

## Advanced Patterns

### Strategy by Route

Apply different strategies based on URL patterns:

```javascript
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // API requests: Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(event.request));
  }
  // Static assets: Cache First
  else if (url.pathname.match(/\.(js|css|png|jpg|svg)$/)) {
    event.respondWith(cacheFirst(event.request));
  }
  // HTML pages: Stale While Revalidate
  else {
    event.respondWith(staleWhileRevalidate(event.request));
  }
});
```

### Cache with Timeout

Network First with timeout fallback:

```javascript
async function fetchWithTimeout(request, timeout = 3000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

self.addEventListener('fetch', event => {
  event.respondWith(
    fetchWithTimeout(event.request, 3000)
      .catch(() => caches.match(event.request))
      .catch(() => caches.match('/offline.html'))
  );
});
```

### Conditional Caching

Cache based on response headers or status:

```javascript
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).then(response => {
      // Only cache successful responses
      if (response.ok && event.request.method === 'GET') {
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          // Check cache-control header
          const cacheControl = response.headers.get('cache-control');
          if (!cacheControl || !cacheControl.includes('no-store')) {
            cache.put(event.request, responseToCache);
          }
        });
      }
      return response;
    })
  );
});
```

## Cache Management

### Versioned Caching

Use versioned cache names to manage updates:

```javascript
const CACHE_VERSION = 'v1';
const CACHE_NAME = `my-app-${CACHE_VERSION}`;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(['/', '/styles.css', '/script.js', '/offline.html']);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
});
```

### Cache Expiration

Implement time-based cache expiration:

```javascript
const CACHE_EXPIRATION = 7 * 24 * 60 * 60 * 1000; // 7 days

async function isCacheExpired(cache, request) {
  const cachedResponse = await cache.match(request);
  if (!cachedResponse) return true;

  const cachedTime = new Date(cachedResponse.headers.get('date')).getTime();
  const currentTime = Date.now();

  return currentTime - cachedTime > CACHE_EXPIRATION;
}

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(CACHE_NAME).then(async cache => {
      const expired = await isCacheExpired(cache, event.request);

      if (expired) {
        try {
          const response = await fetch(event.request);
          cache.put(event.request, response.clone());
          return response;
        } catch (error) {
          return cache.match(event.request);
        }
      }

      return cache.match(event.request);
    })
  );
});
```

### Size-Limited Cache

Prevent cache from growing too large:

```javascript
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    await limitCacheSize(cacheName, maxItems);
  }
}

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return fetch(event.request).then(response => {
        cache.put(event.request, response.clone());
        limitCacheSize(CACHE_NAME, 50); // Keep only 50 items
        return response;
      });
    })
  );
});
```

## Workbox Integration

For Next.js PWAs using next-pwa (which uses Workbox under the hood), configure strategies in `next.config.js`:

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.example\.com\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      urlPattern: /\.(?:js|css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources',
      },
    },
  ],
});
```

## Best Practices

1. **Match Strategy to Content Type**: Use Cache First for static assets, Network First for API data, Stale While Revalidate for frequently accessed but tolerant-of-stale content.

2. **Implement Cache Versioning**: Update cache version when deploying breaking changes to force cache refresh.

3. **Set Expiration Policies**: Prevent unbounded cache growth with max entries and max age limits.

4. **Handle Failed Requests**: Always provide fallback behavior for offline scenarios.

5. **Cache Selectively**: Do not cache authentication requests, user-specific data, or time-sensitive content.

6. **Test Offline Scenarios**: Regularly test app behavior with DevTools offline simulation.

7. **Monitor Cache Size**: Use Chrome DevTools Application tab to monitor cache storage usage.

8. **Respect Cache-Control Headers**: Check server cache headers before caching responses.

9. **Version Static Assets**: Use content hashes in filenames (e.g., `app.abc123.js`) to enable long-term caching.

10. **Provide Offline Fallback**: Always cache a generic offline page for when network and cache fail.

## Debugging Cache Strategies

### Chrome DevTools

1. Open DevTools → Application → Cache Storage
2. Inspect cached requests and responses
3. Clear individual caches or all site data
4. Simulate offline mode in Network tab

### Service Worker Debugging

```javascript
// Add logging to cache operations
self.addEventListener('fetch', event => {
  console.log('[SW] Fetch:', event.request.url);

  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        console.log('[SW] Cache hit:', event.request.url);
        return response;
      }
      console.log('[SW] Cache miss, fetching:', event.request.url);
      return fetch(event.request);
    })
  );
});
```

### Testing Strategy Performance

Monitor cache effectiveness with Performance API:

```javascript
// In your application code
if ('performance' in window) {
  window.addEventListener('load', () => {
    const perfEntries = performance.getEntriesByType('resource');
    perfEntries.forEach(entry => {
      console.log(entry.name, entry.transferSize === 0 ? '(from cache)' : '(from network)');
    });
  });
}
```

## Additional Resources

- [Service Worker API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Workbox Strategies](https://developer.chrome.com/docs/workbox/modules/workbox-strategies/)
- [The Offline Cookbook](https://web.dev/offline-cookbook/)
