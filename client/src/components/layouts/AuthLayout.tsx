import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'wouter';
import LoadingScreen from '@/components/shared/LoadingScreen';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { isLoading, isLoggedIn } = useAuth();
  const [location, navigate] = useLocation();

  // Redirect to dashboard if already authenticated
  
  useEffect(() => {
    // Apenas redirecionar se não estiver já em uma rota protegida
    if (!isLoading && isLoggedIn && location === '/login') {
      navigate('/');
    }
  }, [isLoading, isLoggedIn, navigate, location]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {children}
    </div>
  );
};

export default AuthLayout;
