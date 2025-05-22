import { openDB } from 'idb';

/**
 * Inicializa o banco de dados IndexedDB para armazenamento offline
 */
export async function initializeOfflineDB() {
  const db = await openDB('brasilit-offline-db', 1, {
    upgrade(db) {
      // Armazena inspeções para sincronização posterior
      if (!db.objectStoreNames.contains('inspections')) {
        const inspectionsStore = db.createObjectStore('inspections', { 
          keyPath: 'id',
          autoIncrement: true 
        });
        inspectionsStore.createIndex('status', 'status');
        inspectionsStore.createIndex('syncStatus', 'syncStatus');
      }
      
      // Armazena imagens para sincronização posterior
      if (!db.objectStoreNames.contains('images')) {
        const imagesStore = db.createObjectStore('images', { 
          keyPath: 'id',
          autoIncrement: true 
        });
        imagesStore.createIndex('inspectionId', 'inspectionId');
        imagesStore.createIndex('syncStatus', 'syncStatus');
      }
      
      // Armazena dados do usuário
      if (!db.objectStoreNames.contains('userData')) {
        db.createObjectStore('userData', { keyPath: 'id' });
      }
    }
  });
  
  return db;
}

/**
 * Registra uma tarefa para sincronização em segundo plano
 * @param tag Nome da tag de sincronização
 */
export async function registerBackgroundSync(tag: string) {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
      return true;
    } catch (error) {
      console.error('Erro ao registrar sincronização em segundo plano:', error);
      return false;
    }
  }
  return false;
}

/**
 * Solicita permissão para enviar notificações push
 */
export async function requestNotificationPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

/**
 * Verifica se o aplicativo está sendo executado no modo standalone (instalado)
 */
export function isRunningStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
}

/**
 * Verifica se o dispositivo está online
 */
export function isOnline() {
  return navigator.onLine;
}

/**
 * Verifica se o navegador suporta recursos PWA
 */
export function isPWASupported() {
  return 'serviceWorker' in navigator && 
         'caches' in window &&
         window.fetch !== undefined;
}