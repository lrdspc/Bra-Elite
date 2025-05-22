// Service Worker otimizado para Cloudflare Workers e CDN
// Integração com autenticação Cloudflare Access
// Todos os assets devem ser servidos via CDN Cloudflare

const manifest = self.__WB_MANIFEST;
const CACHE_NAME = 'brasilit-cloudflare-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/brasilit-icon-192-maskable.png',
  '/brasilit-icon-512-maskable.png',
  '/brasilit-icon-192.svg',
  '/brasilit-icon-512.svg',
  '/favicon.ico',
  'https://cdn.cloudflare.com/static/brasilit/brasilit-icon-192-maskable.png',
  'https://cdn.cloudflare.com/static/brasilit/brasilit-icon-512-maskable.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Integração com autenticação Cloudflare Access
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request, { credentials: 'include' })
        .then(response => {
          if (!response || response.status !== 200) {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  } else {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request).then(
            response => {
              if(!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
              return response;
            }
          );
        })
    );
  }
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Verifica autenticação com Cloudflare Access
  event.waitUntil((async () => {
    const authResponse = await fetch('/.well-known/cf-access-auth', {
      credentials: 'include'
    });
    if (!authResponse.ok) {
      console.error('Falha na autenticação com Cloudflare Access');
      return;
    }
    const authData = await authResponse.json();
    if (!authData.authenticated) {
      console.error('Usuário não autenticado');
      return;
    }
    console.log('Usuário autenticado via Cloudflare Access');
  })());
});
