import React from 'react';
import { Link } from 'react-router-dom';
import useNetworkStatus from '../hooks/useNetworkStatus';

/**
 * Página 404 com suporte a detecção de estado offline
 */
export default function NotFound() {
  const { isOnline } = useNetworkStatus();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="text-center max-w-md">
        <svg 
          width="120" 
          height="120" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="#EE1B24" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="mx-auto mb-6"
        >
          {isOnline ? (
            // Ícone 404
            <>
              <path d="M9.9 16.5h.2c.2 0 .3-.1.3-.3v-5.5c0-.2-.1-.3-.3-.3h-.2c-.2 0-.3.1-.3.3v5.5c0 .2.1.3.3.3Z" />
              <path d="M13.5 16.5h.2c.2 0 .3-.1.3-.3v-5.5c0-.2-.1-.3-.3-.3h-.2c-.2 0-.3.1-.3.3v5.5c0 .2.1.3.3.3Z" />
              <rect x="4" y="8" width="16" height="12" rx="2" />
              <path d="m22 12-4-4" />
              <path d="m22 6-10 10" />
              <path d="m22 2-4 4-8 8-8 8" />
              <path d="m18 2-8 8" />
              <path d="m2 12 10 10" />
            </>
          ) : (
            // Ícone offline
            <>
              <line x1="1" y1="1" x2="23" y2="23"></line>
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
              <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
              <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
              <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
              <line x1="12" y1="20" x2="12.01" y2="20"></line>
            </>
          )}
        </svg>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {isOnline ? 'Página não encontrada' : 'Você está offline'}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {isOnline 
            ? 'A página que você está procurando não existe ou foi movida.' 
            : 'Não foi possível acessar esta página porque você está sem conexão com a internet.'}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Voltar ao início
          </Link>
          
          {!isOnline && (
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Tentar novamente
            </button>
          )}
        </div>
      </div>
    </div>
  );
}