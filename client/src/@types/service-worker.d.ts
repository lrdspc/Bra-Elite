/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare const __RELOAD_SW__: boolean;
declare const __PWA_START_URL__: string;

// Extend the WindowEventMap to include beforeinstallprompt
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Extend the Navigator interface to include getInstalledRelatedApps
interface Navigator {
  getInstalledRelatedApps?(): Promise<Array<{
    id: string;
    platform: string;
    url?: string;
  }>>;
}

// Extend the ServiceWorkerRegistration interface
interface ServiceWorkerRegistration {
  navigationPreload?: {
    enable: () => Promise<void>;
    disable: () => Promise<void>;
    setHeaderValue: (value: string) => Promise<void>;
    getState: () => Promise<{ enabled: boolean; headerValue: string }>;
  };
}
