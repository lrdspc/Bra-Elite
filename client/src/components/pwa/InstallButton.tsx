import React from 'react';
import usePWAInstall from '../../hooks/usePWAInstall';

/**
 * Botão para instalar o PWA
 */
export default function InstallButton() {
  const { isInstallable, promptInstall } = usePWAInstall();

  if (!isInstallable) {
    return null;
  }

  return (
    <button
      onClick={promptInstall}
      className="flex items-center gap-2 px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Instalar app
    </button>
  );
}