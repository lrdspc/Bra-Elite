import { WifiOff, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function OfflineIndicator() {
  const { isOnline, wasOffline } = useNetworkStatus();
  
  // Não mostra nada se estiver online e não tiver acabado de voltar do offline
  if (isOnline && !wasOffline) return null;

  return (
    <div 
      className={cn(
        'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50',
        'px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium shadow-lg',
        isOnline 
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      )}
    >
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          <span>Você está online novamente</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>Você está offline. Algumas funcionalidades podem estar limitadas.</span>
        </>
      )}
    </div>
  );
}
