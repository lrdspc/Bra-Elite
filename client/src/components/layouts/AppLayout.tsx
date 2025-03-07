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
  const [, navigate] = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isMobile = useMobile();

  // Ensure user is authenticated
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate('/login');
    }
  }, [isLoading, isLoggedIn, navigate]);

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
    <div className="min-h-screen flex flex-col">
      {/* Mobile Header - only shown on small screens */}
      {isMobile && (
        <MobileHeader 
          onMenuClick={toggleMobileSidebar}
        />
      )}

      <div className="flex h-full pt-14 md:pt-0">
        {/* Desktop Sidebar - hidden on mobile */}
        <DesktopSidebar 
          user={user}
        />

        {/* Mobile Sidebar - conditionally rendered when open */}
        <MobileSidebar 
          user={user}
          isOpen={mobileSidebarOpen} 
          onClose={() => setMobileSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 md:ml-64 min-h-screen pb-16 md:pb-0">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        {isMobile && <MobileBottomNav />}
      </div>
    </div>
  );
};

export default AppLayout;
