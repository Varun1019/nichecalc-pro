const CACHE_NAME = 'nichecalc-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/about',
  '/privacy',
  '/terms',
  '/contact',
  '/favicon.ico',
];

// Install Event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event (Network-first, falling back to cache for static pages)
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  
  // Bypass caching for API requests, dev assets, next bundle scripts
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/_next') || url.hostname !== self.location.hostname) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Cache static page GET responses
        if (response.status === 200 && e.request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(e.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
        });
      })
  );
});
