import React, { useEffect } from 'react';
import useServiceWorker from '@/pwa/hooks/useServiceWorker';

/**
 * Componente que gerencia atualizações do PWA
 */
export default function PWAUpdater() {
  const { updateAvailable, update } = useServiceWorker();

  useEffect(() => {
    if (updateAvailable) {
      // Mostra notificação de atualização
      const showUpdateNotification = async () => {
        const { toast } = await import('../../lib/utils');
        
        toast({
          title: 'Atualização disponível',
          description: 'Uma nova versão está disponível. Clique para atualizar.',
          action: {
            label: 'Atualizar',
            onClick: () => update()
          },
          duration: 10000 // 10 segundos
        });
      };
      
      showUpdateNotification();
    }
  }, [updateAvailable, update]);

  // Este componente não renderiza nada visualmente
  return null;
}