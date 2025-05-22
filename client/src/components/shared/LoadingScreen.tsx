import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

/**
 * Tela de carregamento para transições e operações longas
 */
export default function LoadingScreen({ message = 'Carregando...' }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col items-center justify-center">
      <svg width="180" height="60" viewBox="0 0 180 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-pulse">
        <path d="M30 0H60C77.6731 0 90 12.3269 90 30C90 47.6731 77.6731 60 60 60H30C12.3269 60 0 47.6731 0 30C0 12.3269 12.3269 0 30 0Z" fill="#EE1B24"/>
        <path d="M120 0H150C167.673 0 180 12.3269 180 30C180 47.6731 167.673 60 150 60H120C102.327 60 90 47.6731 90 30C90 12.3269 102.327 0 120 0Z" fill="#EE1B24"/>
        <text x="22.5" y="37.5" fontFamily="Arial" fontSize="24" fontWeight="700" fill="white">BRASI</text>
        <text x="112.5" y="37.5" fontFamily="Arial" fontSize="24" fontWeight="700" fill="white">LIT</text>
      </svg>
      
      <div className="mt-8 w-48 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-red-600 rounded-full animate-loading-bar"></div>
      </div>
      
      <p className="mt-4 text-gray-600 dark:text-gray-300">{message}</p>
    </div>
  );
}

// Adicione este CSS ao seu arquivo global de estilos
// @keyframes loadingBar {
//   0% { width: 0; transform: translateX(-100%); }
//   50% { width: 50%; }
//   100% { width: 0; transform: translateX(200%); }
// }
// 
// .animate-loading-bar {
//   animation: loadingBar 1.5s infinite;
// }