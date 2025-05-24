import React, { useState, useEffect } from 'react';
import { inspectionDB, imageDB } from '@/lib/db';
import { syncManager } from '@/pwa/syncManager';
import useNetworkStatus from '@/pwa/hooks/useNetworkStatus';

/**
 * Componente que exibe o status de sincronização e permite sincronizar manualmente
 */
export default function SyncStatusIndicator() {
  const [pendingItems, setPendingItems] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const { isOnline } = useNetworkStatus();

  // Verifica itens pendentes de sincronização
  useEffect(() => {
    const checkPendingItems = async () => {
      const pendingInspections = await inspectionDB.getPendingSync();
      const pendingImages = await imageDB.getPendingSync();
      setPendingItems(pendingInspections.length + pendingImages.length);
      
      // Recupera a última sincronização
      const userData = await localStorage.getItem('lastSynced');
      if (userData) {
        setLastSynced(new Date(userData));
      }
    };
    
    checkPendingItems();
    
    // Verifica a cada minuto
    const interval = setInterval(checkPendingItems, 60000);
    return () => clearInterval(interval);
  }, []);

  // Sincroniza automaticamente quando voltar online
  useEffect(() => {
    if (isOnline && pendingItems > 0) {
      handleSync();
    }
  }, [isOnline, pendingItems]);

  // Função para sincronizar manualmente
  const handleSync = async () => {
    if (!isOnline || isSyncing) return;
    
    setIsSyncing(true);
    try {
      const result = await syncManager.syncAll();
      if (result.success) {
        setPendingItems(0);
        const now = new Date();
        setLastSynced(now);
        localStorage.setItem('lastSynced', now.toISOString());
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Se não houver itens pendentes, não exibe nada
  if (pendingItems === 0 && !isSyncing) {
    return null;
  }

  return (
    <div className="fixed bottom-16 right-4 z-40">
      <button
        onClick={handleSync}
        disabled={!isOnline || isSyncing}
        className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-lg ${
          isOnline ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400'
        } text-white transition-all`}
      >
        {isSyncing ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-xs">Sincronizando...</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-xs">{pendingItems} pendente{pendingItems > 1 ? 's' : ''}</span>
          </>
        )}
      </button>
    </div>
  );
}