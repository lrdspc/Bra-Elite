// Service Worker PWA otimizado para Cloudflare Workers e CDN
const APP_VERSION = '1.0.0';
const CACHE_NAME = 'braelite-cloudflare-cache-v1-' + APP_VERSION;
const CACHE_VERSION = 'v1';
const CDN_HOST = 'https://cdn.braelite.com';
const OFFLINE_URL = '/offline.html';
const DEBUG = false; // Ative para logs detalhados

// Caches segmentados por tipo de conteúdo
const CACHES = {
  static: `${CACHE_NAME}-static`,
  pages: `${CACHE_NAME}-pages`,
  images: `${CACHE_NAME}-images`,
  fonts: `${CACHE_NAME}-fonts`,
  api: `${CACHE_NAME}-api`
};

// Assets essenciais para pré-cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/brasilit-icon-192.svg',
  '/brasilit-icon-512.svg',
  '/brasilit-icon-192-maskable.svg',
  '/brasilit-icon-512-maskable.svg',
  '/shortcut-dashboard.svg',
  '/shortcut-inspection.svg',
  '/shortcut-list.svg',
  'https://cdn.cloudflare.com/static/brasilit/brasilit-icon-192-maskable.png',
  'https://cdn.cloudflare.com/static/brasilit/brasilit-icon-512-maskable.png'
];

// Função helper para logs condicionais
function log(...args) {
  if (DEBUG) {
    console.log('[ServiceWorker]', ...args);
  }
}

// Função para limpar caches antigos
async function clearOldCaches() {
  const cacheKeys = await caches.keys();
  const oldCacheKeys = cacheKeys.filter(key => 
    key.startsWith('brasilit-vistoria-') && !Object.values(CACHES).includes(key)
  );
  
  log('Limpando caches antigos:', oldCacheKeys);
  return Promise.all(oldCacheKeys.map(key => caches.delete(key)));
}

// Função para detectar o tipo de conteúdo da requisição
function getCacheNameForRequest(request) {
  const url = new URL(request.url);
  
  // Requisições de API
  if (url.pathname.startsWith('/api/')) {
    return CACHES.api;
  }
  
  // Requisições de imagens
  if (
    request.destination === 'image' || 
    url.pathname.match(/\.(png|jpe?g|svg|gif|webp|bmp|ico)$/i)
  ) {
    return CACHES.images;
  }
  
  // Requisições de fontes
  if (
    request.destination === 'font' || 
    url.pathname.match(/\.(woff2?|ttf|otf|eot)$/i)
  ) {
    return CACHES.fonts;
  }
  
  // Requisições de HTML (páginas)
  if (
    request.destination === 'document' || 
    request.mode === 'navigate' ||
    url.pathname.match(/\.(html?)$/i)
  ) {
    return CACHES.pages;
  }
  
  // Conteúdo estático (CSS, JS, etc.)
  return CACHES.static;
        }

        // Nova estratégia de cache para CDN
        async function cacheFirstWithCDN(request) {
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const response = await fetch(CDN_HOST + new URL(request.url).pathname);
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        }
}

// Função para mostrar indicador de sincronização
async function showSyncIndicator() {
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach(client => {
    client.postMessage({
      type: 'SYNC_STATUS',
      payload: { syncing: true }
    });
  });
}

// Função para ocultar indicador de sincronização
async function hideSyncIndicator() {
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach(client => {
    client.postMessage({
      type: 'SYNC_STATUS',
      payload: { syncing: false }
    });
  });
}

// Função para obter dados da fila de sincronização do IndexedDB
async function getSyncQueue() {
  try {
    // Aqui normalmente acessaríamos o IndexedDB para obter os itens pendentes
    // Por enquanto, estamos apenas simulando
    return []; // TODO: Implementar com IndexedDB real
  } catch (error) {
    log('Erro ao acessar a fila de sincronização:', error);
    return [];
  }
}

// Função para sincronizar dados com o servidor
async function syncData() {
  log('Iniciando sincronização de dados...');
  showSyncIndicator();
  
  try {
    const syncQueue = await getSyncQueue();
    if (syncQueue.length === 0) {
      log('Nenhum dado para sincronizar');
      return;
    }
    
    // Processar cada item da fila
    for (const item of syncQueue) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: item.body ? JSON.stringify(item.body) : undefined
        });
        
        if (response.ok) {
          // Remove item da fila se foi sincronizado com sucesso
          // TODO: Implementar remoção do IndexedDB
          log(`Item sincronizado com sucesso: ${item.url}`);
        } else {
          throw new Error(`Falha na sincronização: ${response.status} ${response.statusText}`);
        }
      } catch (itemError) {
        log(`Erro ao sincronizar item ${item.url}:`, itemError);
        // Manter na fila para tentar novamente mais tarde
        // TODO: Incrementar contador de tentativas
      }
    }
    
    log('Sincronização concluída');
  } catch (error) {
    log('Erro de sincronização:', error);
  } finally {
    hideSyncIndicator();
  }
}

// Função para notificar o usuário sobre atualizações no aplicativo
async function notifyAppUpdate() {
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach(client => {
    client.postMessage({
      type: 'APP_UPDATE',
      payload: { version: APP_VERSION }
    });
  });
}

// Evento de instalação - pré-cachear ativos estáticos
self.addEventListener('install', (event) => {
  log('Instalando Service Worker versão:', APP_VERSION);
  
  event.waitUntil((async () => {
    // Pré-cachear ativos estáticos
    const staticCache = await caches.open(CACHES.static);
    log('Pré-cacheando recursos estáticos');
    await staticCache.addAll(STATIC_ASSETS);
    
    // Força a ativação imediata
    await self.skipWaiting();
    log('Service Worker instalado');
  })());
});

// Evento de ativação - limpar caches antigos
self.addEventListener('activate', (event) => {
  log('Ativando Service Worker versão:', APP_VERSION);
  
  event.waitUntil((async () => {
    // Limpar caches antigos
    await clearOldCaches();
    
    // Tomar controle de todas as páginas imediatamente
    await self.clients.claim();
    
    // Notificar sobre a atualização
    await notifyAppUpdate();
    
    log('Service Worker ativado e no controle');
  })());
});

// Evento de fetch - responder com recursos em cache ou buscar na rede
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Ignorar requisições de outros domínios
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Ignorar requisições não GET
  if (request.method !== 'GET') {
    // Para requisições POST/PUT/DELETE durante offline,
    // adicionar à fila de sincronização
    if (!navigator.onLine) {
      log('Dispositivo offline. Enfileirando requisição para sincronização posterior');
      // TODO: Implementar enfileiramento no IndexedDB
      
      // Responder com status apropriado
      event.respondWith(
        new Response(
          JSON.stringify({ 
            success: true, 
            offline: true, 
            message: 'Request queued for sync when online' 
          }),
          { 
            status: 202, 
            headers: { 'Content-Type': 'application/json' } 
          }
        )
      );
    }
    return;
  }
  
  // Determinar qual cache usar
  const cacheName = getCacheNameForRequest(request);
  
  // Diferentes estratégias para diferentes tipos de conteúdo
  if (request.url.includes('/api/')) {
    // ESTRATÉGIA PARA API: Network first, fallback to cache, update cache when online
    event.respondWith(apiStrategy(request, cacheName));
  }
  else if (request.mode === 'navigate') {
    // ESTRATÉGIA PARA NAVEGAÇÃO: Network first com fallback para offline page
    event.respondWith(navigationStrategy(request));
  }
  else if (cacheName === CACHES.images || cacheName === CACHES.fonts) {
    // ESTRATÉGIA PARA IMAGENS e FONTES: Cache first, network fallback
    event.respondWith(cacheFirstStrategy(request, cacheName));
  }
  else {
    // ESTRATÉGIA PADRÃO: Stale-while-revalidate
    event.respondWith(staleWhileRevalidateStrategy(request, cacheName));
  }
});

// Estratégia para API: Network first, fallback to cache
async function apiStrategy(request, cacheName) {
  log('API strategy for:', request.url);
  
  try {
    // Tentar obter da rede
    const networkResponse = await fetch(request);
    
    // Clonar a resposta para armazenar no cache
    const responseToCache = networkResponse.clone();
    
    // Armazenar no cache em segundo plano
    caches.open(cacheName).then(cache => {
      cache.put(request, responseToCache);
    });
    
    return networkResponse;
  } catch (error) {
    log('Network request failed, falling back to cache:', error);
    
    // Tentar obter do cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Se falhar também no cache, retornar resposta genérica
    return new Response(
      JSON.stringify({ 
        error: 'Você está offline e este conteúdo não está disponível no cache' 
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Estratégia para navegação: Network first com fallback para offline page
async function navigationStrategy(request) {
  log('Navigation strategy for:', request.url);
  
  try {
    // Tentar obter da rede
    const networkResponse = await fetch(request);
    
    // Armazenar no cache de páginas
    const responseToCache = networkResponse.clone();
    const pagesCache = await caches.open(CACHES.pages);
    pagesCache.put(request, responseToCache);
    
    return networkResponse;
  } catch (error) {
    log('Navigation failed, falling back to cached version or offline page');
    
    // Tentar obter do cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Se não estiver em cache, mostrar página offline
    const offlineResponse = await caches.match(OFFLINE_URL);
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Se até mesmo a página offline não estiver disponível
    return new Response(
      '<html><body><h1>Você está offline</h1><p>E a página offline não está disponível.</p></body></html>',
      {
        status: 503,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// Estratégia Cache First: Tenta o cache primeiro, depois a rede
async function cacheFirstStrategy(request, cacheName) {
  log('Cache-first strategy for:', request.url);
  
  // Verificar no cache primeiro
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    // Atualização em segundo plano
    fetch(request)
      .then(networkResponse => {
        caches.open(cacheName).then(cache => {
          cache.put(request, networkResponse);
        });
      })
      .catch(error => log('Background fetch failed:', error));
      
    return cachedResponse;
  }
  
  // Se não estiver em cache, buscar na rede
  try {
    const networkResponse = await fetch(request);
    
    // Armazenar no cache para uso futuro
    const cache = await caches.open(cacheName);
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    log('Network and cache fetch failed for:', request.url);
    
    // Para imagens, retornar um placeholder
    if (request.destination === 'image') {
      return new Response(
        'SVG_PLACEHOLDER_DATA_URI_HERE', // Substituir por um SVG real como data URI
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    
    // Para outros recursos, retornar erro
    throw error;
  }
}

// Estratégia Stale-While-Revalidate: Usa cache e atualiza em segundo plano
async function staleWhileRevalidateStrategy(request, cacheName) {
  log('Stale-while-revalidate strategy for:', request.url);
  
  // Buscar do cache e da rede em paralelo
  const cachedResponsePromise = caches.match(request);
  const networkResponsePromise = fetch(request);
  
  // Usar cache enquanto atualiza em segundo plano
  try {
    // Retornar imediatamente o que estiver em cache
    const cachedResponse = await cachedResponsePromise;
    
    // Em segundo plano, atualizar o cache
    networkResponsePromise
      .then(networkResponse => {
        caches.open(cacheName).then(cache => {
          cache.put(request, networkResponse.clone());
        });
      })
      .catch(error => log('Background fetch failed:', error));
      
    // Se tiver no cache, usar isso primeiro
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Se não estiver em cache, esperar pela resposta da rede
    return await networkResponsePromise;
    
  } catch (error) {
    log('Both cache and network failed for:', request.url);
    
    // Se ambos falharem, verificar se temos resposta em cache
    const cachedResponse = await cachedResponsePromise.catch(() => null);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Se tudo falhar, gerar erro
    throw error;
  }
}

// Evento de background sync para sincronizar dados offline
self.addEventListener('sync', (event) => {
  log('Background sync event:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Evento de periodic background sync para sincronização periódica
self.addEventListener('periodicsync', (event) => {
  log('Periodic background sync event:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Evento de push para notificações push
self.addEventListener('push', (event) => {
  log('Push notification received:', event);
  
  // Garantir que sempre tenhamos dados
  const data = event.data?.json() || {
    title: 'Brasilit Vistorias',
    body: 'Nova notificação',
    icon: '/brasilit-icon-192.svg'
  };
  
  const options = {
    body: data.body,
    icon: data.icon || '/brasilit-icon-192.svg',
    badge: '/brasilit-icon-192.svg',
    data: data.url ? { url: data.url } : null,
    vibrate: [100, 50, 100]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Evento de click na notificação
self.addEventListener('notificationclick', (event) => {
  log('Notification click:', event);
  
  event.notification.close();
  
  // Abrir URL associada ou página padrão
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Evento de mensagem para comunicação com páginas
self.addEventListener('message', (event) => {
  log('Message received from client:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'SYNC_NOW') {
    syncData();
  }
});

// Indica que o service worker foi carregado corretamente
log('Service Worker carregado com sucesso - versão:', APP_VERSION);
