import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'wouter';
import { useMobile } from '@/hooks/use-mobile';

// Components
import LoadingScreen from '@/components/shared/LoadingScreen';
import MobileHeader from '@/components/shared/MobileHeader';
import MobileSidebar from '@/components/shared/MobileSidebar';
import MobileBottomNav from '@/components/shared/MobileBottomNav';
import DesktopSidebar from '@/components/shared/DesktopSidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isLoading, isLoggedIn, user } = useAuth();
  const [location, navigate] = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isMobile = useMobile();
  // Estado para verificar o status online/offline
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Ensure user is authenticated
  useEffect(() => {
    if (!isLoading && !isLoggedIn && location !== '/login') {
      navigate('/login');
    }
  }, [isLoading, isLoggedIn, navigate, location]);
  
  // Monitorar o status de conexão
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!isLoggedIn || !user) {
    return null; // Will redirect to login via the useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Mobile Header - otimizado para dispositivos móveis */}
      {isMobile && (
        <MobileHeader 
          onMenuClick={toggleMobileSidebar}
        />
      )}

      {/* Aviso de status offline - aparece apenas quando offline */}
      {!isOnline && (
        <div className="bg-amber-100 text-amber-800 text-xs sm:text-sm py-1 px-2 text-center font-medium optimize-gpu">
          <span className="inline-flex items-center">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600 mr-1.5"></span>
            Você está offline. Os dados serão sincronizados quando a conexão for restabelecida.
          </span>
        </div>
      )}

      <div className="flex flex-grow h-full pt-14 md:pt-0">
        {/* Desktop Sidebar - oculto em dispositivos móveis */}
        <aside className="hidden md:block">
          <DesktopSidebar 
            user={user}
          />
        </aside>

        {/* Mobile Sidebar - renderizado condicionalmente */}
        <MobileSidebar 
          user={user}
          isOpen={mobileSidebarOpen} 
          onClose={() => setMobileSidebarOpen(false)}
        />

        {/* Conteúdo Principal - Layout Responsivo */}
        <main className="flex-1 md:ml-64 min-h-screen pb-16 md:pb-8 transition-all duration-200 ease-in-out">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 responsive-container-xl">
            {children}
          </div>
        </main>

        {/* Navegação Inferior para Dispositivos Móveis - Otimizada */}
        {isMobile && (
          <div className="fixed bottom-0 w-full z-50 optimize-gpu">
            <MobileBottomNav />
          </div>
        )}
      </div>
      
      {/* Indicador de Sincronização - Visível apenas quando dados estão sendo sincronizados */}
      <div id="sync-indicator" className="fixed bottom-16 md:bottom-2 right-2 hidden items-center bg-white shadow-lg rounded-full py-1 px-3 text-xs font-medium text-gray-700 z-50">
        <div className="animate-pulse h-2 w-2 rounded-full bg-brasilit-blue mr-2"></div>
        <span>Sincronizando...</span>
      </div>
    </div>
  );
};

export default AppLayout;
