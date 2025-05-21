import { useState, useEffect } from 'react';

type Workbox = {
  messageSkipWaiting: () => Promise<void>;
  addEventListener: (type: string, callback: (event?: Event) => void) => void;
  register: () => Promise<ServiceWorkerRegistration>;
};

declare global {
  interface Window {
    workbox?: Workbox;
  }
}

type ServiceWorkerEvent = Event & {
  target: ServiceWorkerRegistration;
};

export function useServiceWorker() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !window.workbox) {
      return;
    }

    const wb = window.workbox;
    
    // Verificar atualizações quando o Service Worker estiver pronto
    const handleWaiting = (event: Event) => {
      const customEvent = event as unknown as ServiceWorkerEvent;
      if (customEvent.target) {
        setRegistration(customEvent.target);
        setUpdateAvailable(true);
      }
    };

    // Registrar o Service Worker
    const registerSW = async () => {
      try {
        const reg = await wb.register();
        console.log('Service Worker registrado com sucesso:', reg);
        
        // Verificar se há uma atualização disponível
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setRegistration(reg);
                setUpdateAvailable(true);
              }
            });
          }
        });
        
        return reg;
      } catch (error) {
        console.error('Erro ao registrar Service Worker:', error);
        return null;
      }
    };
    
    // Adiciona o event listener para atualizações
    const handleWaitingWrapper = (e?: Event) => {
      if (e) handleWaiting(e);
    };
    
    wb.addEventListener('waiting', handleWaitingWrapper);
    
    // Registra o Service Worker
    registerSW();
    
    // Verifica atualizações a cada hora
    const checkForUpdates = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration()
          .then(reg => reg?.update())
          .catch(console.error);
      }
    };
    
    const intervalId = setInterval(checkForUpdates, 60 * 60 * 1000);
    
    // Verifica atualizações na inicialização
    checkForUpdates();

    // Limpa o intervalo quando o componente for desmontado
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const updateServiceWorker = async () => {
    if (!registration?.waiting) return false;
    
    try {
      setIsUpdating(true);
      
      // Envia uma mensagem para o Service Worker para pular a espera
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Aguarda o novo Service Worker ativar
      return new Promise<boolean>((resolve) => {
        const handleControllerChange = () => {
          setIsUpdating(false);
          setUpdateAvailable(false);
          resolve(true);
          window.location.reload();
        };
        
        navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange, { once: true });
      });
    } catch (error) {
      console.error('Erro ao atualizar o Service Worker:', error);
      setIsUpdating(false);
      return false;
    }
  };

  return { updateAvailable, isUpdating, updateServiceWorker };
}
