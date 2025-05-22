// This is a basic service worker implementation
// It will be enhanced by Vite PWA plugin during build

// Required for Vite PWA plugin
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
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Verifica se a requisição é para a API
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Verifica se a resposta é válida
          if (!response || response.status !== 200) {
            return response;
          }

          // Armazena a resposta no cache da API
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        })
        .catch(() => {
          // Fallback para o cache em caso de falha na rede
          return caches.match(event.request);
        })
    );
  } else {
    // Lógica padrão para outros tipos de requisições
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Cache hit - return response
          if (response) {
            return response;
          }
          return fetch(event.request).then(
            response => {
              // Check if we received a valid response
              if(!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              // Clone the response
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
