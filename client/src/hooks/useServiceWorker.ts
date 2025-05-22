import { useState, useEffect } from 'react';
import { Workbox } from 'workbox-window';

/**
 * Hook para gerenciar o service worker
 * @returns Um objeto com o estado do service worker e métodos relacionados
 */
export function useServiceWorker() {
  const [wb, setWb] = useState<Workbox | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      const workbox = new Workbox('/service-worker.js', { 
        // Importante para garantir que o service worker seja atualizado corretamente
        immediateControl: true
      });

      // Evento disparado quando há uma nova versão do service worker
      workbox.addEventListener('waiting', () => {
        setUpdateAvailable(true);
      });

      // Evento disparado quando o service worker é instalado
      workbox.addEventListener('installed', (event) => {
        if (event.isUpdate) {
          setUpdateAvailable(true);
        }
      });

      // Evento disparado quando o service worker é ativado
      workbox.addEventListener('activated', (event) => {
        if (event.isUpdate) {
          // Recarrega a página para usar o novo service worker
          window.location.reload();
        }
      });

      // Registra o service worker
      workbox.register()
        .then(reg => {
          setRegistration(reg);
        })
        .catch(err => {
          console.error('Erro ao registrar o service worker:', err);
        });

      setWb(workbox);

      // Monitora o status da conexão
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Função para atualizar o service worker
  const update = () => {
    if (wb && updateAvailable) {
      // Envia mensagem para o service worker pular a espera e ativar-se
      wb.messageSkipWaiting();
    }
  };

  return {
    updateAvailable,
    update,
    registration,
    isOffline
  };
}

export default useServiceWorker;