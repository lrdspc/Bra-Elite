import { addToSyncQueue, getSyncQueue, removeFromSyncQueue, updateSyncQueueItem, clearAllData } from './db';

// Re-export isOnline to avoid import errors
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === true;
}

// Re-export clearAllData function
export { clearAllData };

// Register service worker
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });
      
      console.log('ServiceWorker registered with scope:', registration.scope);
      
      // Set up periodic sync if browser supports it
      setupPeriodicSync();
      
      // Process sync queue when online
      window.addEventListener('online', processSyncQueue);
      
      return registration;
    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
    }
  }
}

// Set up periodic background sync if supported
async function setupPeriodicSync() {
  if ('periodicSync' in navigator.serviceWorker) {
    try {
      const status = await navigator.permissions.query({
        name: 'periodic-background-sync' as any,
      });
      
      if (status.state === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        if ('periodicSync' in registration) {
          await (registration as any).periodicSync.register('sync-data', {
            minInterval: 15 * 60 * 1000, // 15 minutes
          });
          console.log('Periodic background sync registered');
        }
      }
    } catch (error) {
      console.error('Periodic background sync registration failed:', error);
    }
  }
}

// Process the sync queue when the device goes back online
export async function processSyncQueue() {
  if (!isOnline()) return;
  
  const queue = await getSyncQueue();
  if (queue.length === 0) return;
  
  console.log(`Processing ${queue.length} items in sync queue`);
  
  // Process items in order (oldest first)
  const sortedQueue = [...queue].sort((a, b) => a.timestamp - b.timestamp);
  
  for (const item of sortedQueue) {
    try {
      // Increment attempt count
      await updateSyncQueueItem(item.id, { attempts: item.attempts + 1 });
      
      // Make the request
      const response = await fetch(item.url, {
        method: item.method,
        headers: {
          'Content-Type': 'application/json',
          // Include auth headers if needed
        },
        body: item.body ? JSON.stringify(item.body) : undefined,
        credentials: 'include',
      });
      
      if (response.ok) {
        // If successful, remove from queue
        await removeFromSyncQueue(item.id);
        console.log(`Successfully synced item: ${item.id}`);
      } else {
        // If max attempts reached (5), remove from queue
        if (item.attempts >= 5) {
          await removeFromSyncQueue(item.id);
          console.error(`Max attempts reached for sync item: ${item.id}, removing from queue`);
        } else {
          console.error(`Failed to sync item: ${item.id}, status: ${response.status}`);
        }
      }
    } catch (error) {
      console.error(`Error syncing item: ${item.id}`, error);
    }
  }
}

// Add a fetch request to the sync queue
export async function queueRequest(method: string, url: string, body?: any) {
  await addToSyncQueue(method, url, body);
  
  // Try to process immediately if online
  if (isOnline()) {
    processSyncQueue();
  }
}

// Check if app needs update
export async function checkForUpdates() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      newWorker?.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New version installed but waiting to activate
          if (confirm('Nova versão disponível! Recarregar para atualizar?')) {
            window.location.reload();
          }
        }
      });
    });
  }
}

// Manually check for service worker updates
export async function checkForServiceWorkerUpdates() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    try {
      await registration.update();
    } catch (error) {
      console.error('Error updating service worker:', error);
    }
  }
}
