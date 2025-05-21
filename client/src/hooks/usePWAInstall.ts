import { useState, useEffect } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Previne o navegador de mostrar o prompt de instalação automático
      e.preventDefault();
      
      // Guarda o evento para ser usado depois
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
      
      console.log('beforeinstallprompt event fired');
    };

    const handleAppInstalled = () => {
      console.log('PWA installed');
      setIsInstalled(true);
      setCanInstall(false);
    };

    // Verifica se o app já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('App is running in standalone mode');
      setIsInstalled(true);
      setCanInstall(false);
    }

    // Adiciona os event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Limpa os event listeners quando o componente for desmontado
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return false;
    
    try {
      // Mostra o prompt de instalação
      deferredPrompt.prompt();
      
      // Espera pelo resultado do prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`User response to the install prompt: ${outcome}`);
      
      // Limpa o prompt salvo, pois só pode ser usado uma vez
      setDeferredPrompt(null);
      setCanInstall(false);
      
      return outcome === 'accepted';
    } catch (error) {
      console.error('Error during installation prompt:', error);
      return false;
    }
  };

  return { canInstall, isInstalled, promptInstall };
}
