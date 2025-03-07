import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { initDB } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isLoggedIn: false,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  // Initialize IndexedDB when auth context is mounted
  useEffect(() => {
    initDB().catch(err => {
      console.error('Failed to initialize IndexedDB', err);
      toast({
        title: 'Erro de inicialização',
        description: 'Falha ao inicializar o banco de dados local.',
        variant: 'destructive',
      });
    });
  }, []);

  // Check session status on mount
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/auth/session'],
    queryFn: async ({ queryKey }) => {
      try {
        const res = await fetch(queryKey[0] as string, {
          credentials: 'include',
        });
        
        if (res.status === 401) {
          return null;
        }
        
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        
        return res.json();
      } catch (error) {
        console.error('Error fetching session:', error);
        return null;
      }
    },
    retry: false,
  });

  useEffect(() => {
    if (!isLoading) {
      setUser(data);
      
      // Redirect to login if not authenticated and not already on login page
      if (!data && location !== '/login') {
        navigate('/login');
      }
      
      // Redirect to dashboard if authenticated and on login page
      if (data && location === '/login') {
        navigate('/');
      }
    }
  }, [data, isLoading, location, navigate]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const res = await apiRequest('POST', '/api/auth/login', { username, password });
      return res.json();
    },
    onSuccess: (userData) => {
      setUser(userData);
      navigate('/');
      toast({
        title: 'Login realizado com sucesso',
        description: `Bem-vindo, ${userData.name}!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Falha no login',
        description: error.message || 'Verifique suas credenciais e tente novamente.',
        variant: 'destructive',
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/logout', {});
      return res.json();
    },
    onSuccess: () => {
      setUser(null);
      navigate('/login');
      toast({
        title: 'Logout realizado com sucesso',
        description: 'Você saiu da sua conta.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao sair',
        description: error.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    },
  });

  const login = async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isLoading || loginMutation.isPending || logoutMutation.isPending,
        isLoggedIn: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
