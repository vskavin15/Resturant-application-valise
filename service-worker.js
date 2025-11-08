const CACHE_NAME = 'rms-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // Note: External CDN assets are not cached by this basic service worker.
  // A more advanced implementation might use Cache API to store them,
  // but that can be complex due to CORS and dynamic URLs.
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
