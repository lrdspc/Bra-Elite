/// <reference lib="webworker" />
/// <reference types="vite/client" />

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate, NetworkOnly } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// Tipagem para o Service Worker
// Service Worker PWA otimizado para Cloudflare Workers e CDN e Background Sync

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

// Ativa o service worker imediatamente
self.skipWaiting();
clientsClaim();

// Limpa caches antigos
cleanupOutdatedCaches();

// Pré-cache de recursos estáticos
precacheAndRoute(self.__WB_MANIFEST || []);


// Cache de páginas
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
);

// --- Background Sync ---
// Plugin para sincronização em segundo plano para POST requests de inspeções
const backgroundSyncPluginInspections = new BackgroundSyncPlugin('inspectionCreationQueue', {
  maxRetentionTime: 24 * 60, // Retry for up to 24 hours
  onSync: async ({ queue }) => {
    console.log('[Service Worker] Background sync: Processing inspectionCreationQueue...');
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        const response = await fetch(entry.request.clone());
        console.log('[Service Worker] Background sync: Request successful for', entry.request.url);
        // Optionally, notify the client that a specific item has been synced
        // self.clients.matchAll().then(clients => {
        //   clients.forEach(client => client.postMessage({ type: 'REQUEST_SYNCED', url: entry.request.url }));
        // });
      } catch (error) {
        console.error('[Service Worker] Background sync: Request failed for', entry.request.url, error);
        // If it fails again, it will be retried later, up to maxRetentionTime
        // Re-queue the request if it should be retried.
        await queue.unshiftRequest(entry);
        // If you want to stop retrying after a certain number of attempts for a specific request,
        // you would need more complex logic here, perhaps using entry.metadata.
        throw error; // Throwing error ensures Workbox knows it failed and might retry
      }
    }
    console.log('[Service Worker] Background sync: inspectionCreationQueue processed.');
    // Notify clients that the queue is processed (or specific items)
    // This allows the UI to update if it was showing "pending sync" status
     self.clients.matchAll().then(clients => {
       clients.forEach(client => client.postMessage({ type: 'QUEUE_PROCESSED', queueName: 'inspectionCreationQueue' }));
     });
  }
});

// Registrar rota para POST em /api/inspections para usar Background Sync
registerRoute(
  ({ url, request }) =>
    url.pathname === '/api/inspections' && request.method === 'POST',
  new NetworkOnly({ // Use NetworkOnly for POST. If it fails, BackgroundSyncPlugin handles it.
    plugins: [backgroundSyncPluginInspections]
  })
);

// Example for another POST route (e.g., updating inspections)
// const backgroundSyncPluginInspectionUpdates = new BackgroundSyncPlugin('inspectionUpdateQueue', {
//   maxRetentionTime: 24 * 60,
// });
// registerRoute(
//   ({ url, request }) =>
//     url.pathname.startsWith('/api/inspections/') && request.method === 'PUT', // Assuming PUT for updates
//   new NetworkOnly({
//     plugins: [backgroundSyncPluginInspectionUpdates]
//   })
// );

// Note: The onSync handler in BackgroundSyncPlugin is a good place to add more detailed
// logging or even attempt to update client-side IndexedDB if an item was successfully synced.
// For more complex scenarios, multiple queues might be needed for different types of requests
// or different handling logic (e.g., some requests might not be retryable).

// Cache de assets estáticos
registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'worker',
  new StaleWhileRevalidate({
    cacheName: 'assets-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
);

// Cache de imagens
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 dias
      })
    ]
  })
);

// Cache de fontes
registerRoute(
  ({ request }) => request.destination === 'font',
  new StaleWhileRevalidate({
    cacheName: 'fonts-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
);