import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'wouter';
import LoadingScreen from '@/components/shared/LoadingScreen';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { isLoading, isLoggedIn } = useAuth();
  const [, navigate] = useLocation();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      navigate('/');
    }
  }, [isLoading, isLoggedIn, navigate]);

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
