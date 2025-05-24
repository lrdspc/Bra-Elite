import React from 'react';
import useNetworkStatus from '@/pwa/hooks/useNetworkStatus';

/**
 * Componente que exibe um indicador quando o usuário está offline
 */
export default function OfflineIndicator() {
  const { isOnline } = useNetworkStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-lg bg-amber-500 text-white">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-amber-200 animate-pulse"></div>
        <span className="text-sm font-medium">Você está offline</span>
      </div>
    </div>
  );
}