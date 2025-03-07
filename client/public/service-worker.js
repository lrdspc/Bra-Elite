const CACHE_NAME = 'brasilit-vistoria-v1';
const OFFLINE_URL = '/offline.html';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/brasilit-icon-192.svg',
  '/brasilit-icon-512.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service worker installing');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service worker: Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Ensure that the service worker takes control of the page as soon as it's activated
  self.clients.claim();
});

// Fetch event - respond with cached resources or fetch from network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle API requests differently
  if (event.request.url.includes('/api/')) {
    // For API requests, use "Network first, fallback to cache" strategy
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the response for future use
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If network failed, try to serve from cache
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If cache failed, return a generic response
            return new Response(
              JSON.stringify({ error: 'You are offline' }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
        })
    );
    return;
  }

  // For page (HTML) requests - network first with cache fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // If navigation fails, show offline page
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  // For all other requests - stale-while-revalidate strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Use the cached version if available, and fetch an update for next time
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Update the cache
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
          return networkResponse;
        })
        .catch((error) => {
          console.error('Fetching failed:', error);
          // Return nothing - the cached response will be used
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Function to sync data with the server
async function syncData() {
  // This would be implemented with IndexedDB to get pending sync items
  try {
    // Send data to server
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString()
      })
    });
    
    if (response.ok) {
      console.log('Background sync successful');
    } else {
      throw new Error('Background sync failed');
    }
  } catch (error) {
    console.error('Background sync error:', error);
    throw error;
  }
}

// Handle periodic background sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});
