---
description: Converts site to PWA; adds manifest, service worker.
argument-hint: Optional PWA configuration preferences (name, icons, offline strategy)
allowed-tools: ["Read", "Write", "Edit", "Grep", "Glob", "Bash", "TodoWrite", "AskUserQuestion"]
---

# Progressive Web App (PWA) Conversion

Convert an existing web application into a Progressive Web App by adding a web app manifest, service worker, and offline capabilities.

## Core Principles

- **Detect existing setup**: Check for existing PWA configuration before making changes
- **Preserve functionality**: Ensure the app continues working as before
- **Use TodoWrite**: Track all phases and steps throughout the process
- **Framework-aware**: Adapt implementation based on the detected framework (Next.js, React, Vue, etc.)
- **Best practices**: Follow modern PWA standards and performance guidelines

**Initial request:** $ARGUMENTS

---

## Phase 1: Project Analysis

**Goal**: Understand the project structure and existing PWA setup

**Actions**:

1. Create todo list with all phases:
   - Analyze project structure
   - Check existing PWA setup
   - Gather PWA configuration preferences
   - Create/update web app manifest
   - Implement service worker
   - Update HTML to reference PWA assets
   - Configure framework-specific PWA settings
   - Test PWA functionality
   - Provide verification steps

2. Detect project framework:
   - Check package.json for framework indicators
   - Look for framework-specific files:
     - Next.js: `next.config.js`, `next.config.mjs`
     - Create React App: `react-scripts` in package.json
     - Vite: `vite.config.js`, `vite.config.ts`
     - Vue: `vue.config.js`
     - Angular: `angular.json`
     - SvelteKit: `svelte.config.js`
     - Astro: `astro.config.mjs`

3. Check for existing PWA setup:
   - Look for `manifest.json` or `site.webmanifest`
   - Check for service worker files (`sw.js`, `service-worker.js`)
   - Search for PWA-related packages in package.json:
     - `workbox`, `next-pwa`, `vite-plugin-pwa`, etc.
   - Check HTML files for manifest and theme-color meta tags

4. Identify entry HTML file(s):
   - `public/index.html` (React, Vue)
   - `index.html` (Vite, SvelteKit root)
   - `app/layout.tsx` or `pages/_document.tsx` (Next.js)
   - `src/index.html` (Angular)

5. Parse user preferences from $ARGUMENTS:
   - App name
   - Theme color
   - Icon preferences
   - Offline strategy (cache-first, network-first, stale-while-revalidate)
   - Custom service worker requirements

**Output**: Project analysis with framework detection and existing PWA status

---

## Phase 2: Configuration Gathering

**Goal**: Collect PWA configuration details from user or smart defaults

**Actions**:

1. Determine app metadata:
   - Read `package.json` for name, description
   - Check existing `index.html` for title, description meta tags
   - Extract theme colors from CSS/design system if present

2. Use AskUserQuestion to gather missing configuration:
   - App name (default from package.json)
   - App short name (default: truncated name)
   - Theme color (default: #000000 or detected from CSS)
   - Background color (default: #ffffff)
   - Display mode (standalone, fullscreen, minimal-ui)
   - Offline strategy preference

3. Check for icons:
   - Look for existing icons in `public/`, `static/`, `assets/`
   - Common icon filenames: `icon.png`, `logo.png`, `favicon.png`
   - If no suitable icons found, note that icons need to be provided

4. Prepare manifest configuration object with gathered/detected values

**Output**: Complete PWA configuration ready for implementation

---

## Phase 3: Web App Manifest Creation

**Goal**: Create or update the web app manifest file

**Actions**:

1. Update TodoWrite: Mark "Create/update web app manifest" as in_progress

2. Determine manifest location based on framework:
   - Next.js: `public/manifest.json`
   - React/Vite: `public/manifest.json`
   - Vue: `public/manifest.json`
   - Angular: `src/manifest.webmanifest`
   - SvelteKit: `static/manifest.json`

3. Create manifest.json with proper structure:
   ```json
   {
     "name": "[App Full Name]",
     "short_name": "[App Short Name]",
     "description": "[App Description]",
     "start_url": "/",
     "display": "standalone",
     "background_color": "#ffffff",
     "theme_color": "#000000",
     "orientation": "portrait-primary",
     "icons": [
       {
         "src": "/icons/icon-72x72.png",
         "sizes": "72x72",
         "type": "image/png",
         "purpose": "any"
       },
       {
         "src": "/icons/icon-96x96.png",
         "sizes": "96x96",
         "type": "image/png",
         "purpose": "any"
       },
       {
         "src": "/icons/icon-128x128.png",
         "sizes": "128x128",
         "type": "image/png",
         "purpose": "any"
       },
       {
         "src": "/icons/icon-144x144.png",
         "sizes": "144x144",
         "type": "image/png",
         "purpose": "any"
       },
       {
         "src": "/icons/icon-152x152.png",
         "sizes": "152x152",
         "type": "image/png",
         "purpose": "any"
       },
       {
         "src": "/icons/icon-192x192.png",
         "sizes": "192x192",
         "type": "image/png",
         "purpose": "any"
       },
       {
         "src": "/icons/icon-384x384.png",
         "sizes": "384x384",
         "type": "image/png",
         "purpose": "any"
       },
       {
         "src": "/icons/icon-512x512.png",
         "sizes": "512x512",
         "type": "image/png",
         "purpose": "any maskable"
       }
     ]
   }
   ```

4. If updating existing manifest, preserve custom fields and merge with new values

5. Create icons directory if it doesn't exist:
   - Create `public/icons/` or framework equivalent
   - Document required icon sizes in comments or separate file

**Output**: Web app manifest created/updated

---

## Phase 4: Service Worker Implementation

**Goal**: Create service worker with appropriate caching strategy

**Actions**:

1. Update TodoWrite: Mark "Implement service worker" as in_progress

2. Choose implementation approach based on framework:

   **Option A: Framework Plugin (Recommended)**
   - Next.js: Install and configure `next-pwa`
   - Vite: Install and configure `vite-plugin-pwa`
   - Vue CLI: Use `@vue/cli-plugin-pwa`
   - Angular: Use `@angular/pwa`

   **Option B: Custom Service Worker**
   - For frameworks without good PWA plugins
   - Or when custom behavior is required

3. If using framework plugin:

   **For Next.js**:
   ```bash
   npm install next-pwa
   ```

   Update `next.config.js`:
   ```javascript
   const withPWA = require('next-pwa')({
     dest: 'public',
     disable: process.env.NODE_ENV === 'development',
     register: true,
     skipWaiting: true,
   })

   module.exports = withPWA({
     // existing next config
   })
   ```

   **For Vite**:
   ```bash
   npm install vite-plugin-pwa -D
   ```

   Update `vite.config.js`:
   ```javascript
   import { VitePWA } from 'vite-plugin-pwa'

   export default {
     plugins: [
       VitePWA({
         registerType: 'autoUpdate',
         manifest: {
           // references manifest.json
         },
         workbox: {
           globPatterns: ['**/*.{js,css,html,ico,png,svg}']
         }
       })
     ]
   }
   ```

   **For Angular**:
   ```bash
   ng add @angular/pwa
   ```

4. If implementing custom service worker:

   Create `public/sw.js`:
   ```javascript
   const CACHE_NAME = 'app-cache-v1';
   const urlsToCache = [
     '/',
     '/index.html',
     '/static/css/main.css',
     '/static/js/main.js',
     // Add critical assets
   ];

   // Install event - cache critical assets
   self.addEventListener('install', (event) => {
     event.waitUntil(
       caches.open(CACHE_NAME)
         .then((cache) => cache.addAll(urlsToCache))
         .then(() => self.skipWaiting())
     );
   });

   // Activate event - clean up old caches
   self.addEventListener('activate', (event) => {
     event.waitUntil(
       caches.keys().then((cacheNames) => {
         return Promise.all(
           cacheNames.map((cacheName) => {
             if (cacheName !== CACHE_NAME) {
               return caches.delete(cacheName);
             }
           })
         );
       }).then(() => self.clients.claim())
     );
   });

   // Fetch event - serve from cache, fallback to network
   self.addEventListener('fetch', (event) => {
     event.respondWith(
       caches.match(event.request)
         .then((response) => {
           // Cache hit - return response
           if (response) {
             return response;
           }
           // Clone the request
           const fetchRequest = event.request.clone();

           return fetch(fetchRequest).then((response) => {
             // Check if valid response
             if (!response || response.status !== 200 || response.type !== 'basic') {
               return response;
             }

             // Clone the response
             const responseToCache = response.clone();

             caches.open(CACHE_NAME)
               .then((cache) => {
                 cache.put(event.request, responseToCache);
               });

             return response;
           });
         })
     );
   });
   ```

   Create `public/sw-register.js`:
   ```javascript
   if ('serviceWorker' in navigator) {
     window.addEventListener('load', () => {
       navigator.serviceWorker.register('/sw.js')
         .then((registration) => {
           console.log('SW registered: ', registration);
         })
         .catch((error) => {
           console.log('SW registration failed: ', error);
         });
     });
   }
   ```

**Output**: Service worker implemented with chosen strategy

---

## Phase 5: HTML/Framework Integration

**Goal**: Update HTML and framework files to reference PWA assets

**Actions**:

1. Update TodoWrite: Mark "Update HTML to reference PWA assets" as in_progress

2. Framework-specific integration:

   **Next.js** (App Router):
   Update `app/layout.tsx`:
   ```tsx
   export const metadata = {
     manifest: '/manifest.json',
     themeColor: '#000000',
     appleWebApp: {
       capable: true,
       statusBarStyle: 'default',
       title: 'App Name'
     }
   }
   ```

   **Next.js** (Pages Router):
   Update `pages/_document.tsx`:
   ```tsx
   <Head>
     <link rel="manifest" href="/manifest.json" />
     <meta name="theme-color" content="#000000" />
     <meta name="apple-mobile-web-app-capable" content="yes" />
     <meta name="apple-mobile-web-app-status-bar-style" content="default" />
     <meta name="apple-mobile-web-app-title" content="App Name" />
   </Head>
   ```

   **React/Vite/Vue** (public/index.html):
   ```html
   <head>
     <link rel="manifest" href="/manifest.json" />
     <meta name="theme-color" content="#000000" />
     <meta name="apple-mobile-web-app-capable" content="yes" />
     <meta name="apple-mobile-web-app-status-bar-style" content="default" />
     <meta name="apple-mobile-web-app-title" content="App Name" />

     <!-- iOS Icons -->
     <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
   </head>
   ```

3. If using custom service worker, add registration script:
   ```html
   <script src="/sw-register.js"></script>
   ```
   Or inline:
   ```html
   <script>
     if ('serviceWorker' in navigator) {
       window.addEventListener('load', () => {
         navigator.serviceWorker.register('/sw.js');
       });
     }
   </script>
   ```

4. Add viewport meta tag if missing:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
   ```

**Output**: HTML/Framework configured to load PWA assets

---

## Phase 6: Additional PWA Enhancements

**Goal**: Add optional but recommended PWA features

**Actions**:

1. Update TodoWrite: Mark "Configure framework-specific PWA settings" as in_progress

2. Add offline page (if using custom service worker):
   - Create `public/offline.html`
   - Update service worker to serve offline page when network fails

3. Add install prompt handler (optional):
   ```javascript
   // public/install-prompt.js or in main app file
   let deferredPrompt;

   window.addEventListener('beforeinstallprompt', (e) => {
     e.preventDefault();
     deferredPrompt = e;
     // Show custom install button
     showInstallButton();
   });

   function showInstallButton() {
     const installButton = document.getElementById('install-button');
     if (installButton) {
       installButton.style.display = 'block';
       installButton.addEventListener('click', async () => {
         if (deferredPrompt) {
           deferredPrompt.prompt();
           const { outcome } = await deferredPrompt.userChoice;
           deferredPrompt = null;
           installButton.style.display = 'none';
         }
       });
     }
   }
   ```

4. Add loading skeleton or splash screen:
   - Configure in manifest.json with splash screen settings
   - Or create inline HTML splash in index.html

5. Update .gitignore if needed:
   - Add service worker build outputs
   - Add workbox cache files

6. Update package.json scripts if needed:
   - Add PWA build verification script
   - Add lighthouse audit script

**Output**: Enhanced PWA with additional features

---

## Phase 7: Testing & Verification

**Goal**: Verify PWA implementation works correctly

**Actions**:

1. Update TodoWrite: Mark "Test PWA functionality" as in_progress

2. Install dependencies if packages were added:
   ```bash
   npm install
   ```

3. Run development build:
   ```bash
   npm run dev
   ```

4. Check console for service worker registration:
   - Open browser DevTools
   - Check for "SW registered" message
   - Verify no errors

5. Verify manifest loading:
   - Open DevTools > Application > Manifest
   - Check all fields are correct
   - Verify icons are accessible

6. Test service worker:
   - Open DevTools > Application > Service Workers
   - Verify worker is active
   - Test offline mode by enabling offline in DevTools

7. Create production build and test:
   ```bash
   npm run build
   npm run start  # or serve the build directory
   ```

8. Run Lighthouse audit:
   - Open Chrome DevTools
   - Navigate to Lighthouse tab
   - Run PWA audit
   - Check for 100% PWA score or identify issues

9. Test install prompt:
   - In Chrome, check for install icon in address bar
   - Test installation flow
   - Verify app opens as standalone

**Output**: Verified working PWA

---

## Phase 8: Documentation & Next Steps

**Goal**: Document the PWA setup and provide guidance

**Actions**:

1. Mark all todos as completed

2. Create/update README with PWA section:
   ```markdown
   ## PWA Features

   This application is a Progressive Web App with the following features:

   - Offline support via service worker
   - Installable on mobile and desktop
   - App-like experience with standalone display mode
   - Fast loading with cached assets

   ### Testing PWA Locally

   1. Build the production version:
      \`\`\`bash
      npm run build
      npm run start
      \`\`\`

   2. Open Chrome DevTools > Lighthouse
   3. Run a PWA audit

   ### PWA Configuration

   - Manifest: `/public/manifest.json`
   - Service Worker: [location]
   - Icons: `/public/icons/`

   ### Required Icons

   Make sure to provide icons in the following sizes:
   - 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

   Place icons in `/public/icons/` directory.
   ```

3. Create icon generation guide if icons missing:
   - Document how to generate icons from a source image
   - Recommend tools: pwa-asset-generator, realfavicongenerator.net
   - Provide CLI command:
     ```bash
     npx pwa-asset-generator source-icon.png public/icons/ --icon-only --favicon
     ```

4. Provide summary to user:
   ```
   PWA Conversion Complete!

   Implemented:
   ✓ Web app manifest (manifest.json)
   ✓ Service worker with [strategy] caching
   ✓ Framework integration ([framework])
   ✓ Meta tags for mobile/iOS
   ✓ Offline support

   Next Steps:
   1. Add app icons (72x72 to 512x512) to public/icons/
   2. Test offline functionality
   3. Run Lighthouse audit for PWA score
   4. Test installation on mobile device
   5. Deploy to HTTPS (required for PWA)

   Testing:
   - Local: npm run build && npm run start
   - DevTools: Application > Manifest & Service Workers
   - Lighthouse: Run PWA audit

   Notes:
   - PWAs require HTTPS in production
   - Icons are critical for installation prompt
   - Test on actual mobile devices
   ```

5. List potential improvements:
   - Push notifications setup
   - Background sync
   - Periodic background sync
   - Share target API
   - File handling API
   - App shortcuts in manifest

**Output**: Complete PWA documentation and next steps

---

## Important Notes

### Framework-Specific Considerations

**Next.js**:
- Use `next-pwa` package for automatic SW generation
- Manifest in public/ directory
- Use App Router metadata API for meta tags

**Vite**:
- Use `vite-plugin-pwa` with Workbox
- Auto-generates service worker
- Supports both generateSW and injectManifest modes

**Create React App**:
- Has built-in service worker support (disabled by default)
- Enable in `src/index.js`: `serviceWorkerRegistration.register()`
- Manifest template in `public/manifest.json`

**Angular**:
- Use `@angular/pwa` schematic
- Auto-configures everything
- ngsw-config.json for service worker configuration

### PWA Requirements Checklist

- [ ] HTTPS (required in production)
- [ ] Web app manifest
- [ ] Service worker
- [ ] Icons (at least 192x192 and 512x512)
- [ ] Theme color
- [ ] Viewport meta tag
- [ ] Fast load time (< 3s)
- [ ] Works offline

### Caching Strategies

**Cache First** (fastest for static assets):
- Serve from cache, update cache in background
- Best for: CSS, JS, images

**Network First** (best for dynamic content):
- Try network, fallback to cache if offline
- Best for: API calls, dynamic data

**Stale While Revalidate** (balanced):
- Serve from cache immediately, update in background
- Best for: frequently updated content

### Common Issues

**Service worker not updating**:
- Clear browser cache
- Unregister old service worker
- Use skipWaiting() in service worker

**Manifest not loading**:
- Check file path is correct
- Verify MIME type is application/json
- Check CORS headers if manifest is on different domain

**Install prompt not showing**:
- Ensure HTTPS
- Verify all PWA requirements met
- Check icons are available
- Wait ~30 seconds after page load

---

**Begin with Phase 1: Project Analysis**
