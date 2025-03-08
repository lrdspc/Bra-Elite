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
      
      // Não vamos redirecionar aqui para evitar conflitos com os layouts
      // Deixamos a lógica de redirecionamento para os componentes de layout
    }
  }, [data, isLoading]);

  // Usuários de demonstração para facilitar o acesso
  const demoUsers = [
    {
      id: 1,
      username: 'tecnico',
      password: '123456',
      name: 'João da Silva',
      email: 'joao.silva@brasilit.com.br',
      role: 'tecnico',
      avatar: '/avatars/tecnico.png'
    },
    {
      id: 2,
      username: 'gestor',
      password: '123456',
      name: 'Maria Souza',
      email: 'maria.souza@brasilit.com.br',
      role: 'gestor',
      avatar: '/avatars/gestor.png'
    },
    {
      id: 3,
      username: 'admin',
      password: '123456',
      name: 'Carlos Oliveira',
      email: 'carlos.oliveira@brasilit.com.br',
      role: 'admin',
      avatar: '/avatars/admin.png'
    }
  ];

  // Login mutation modificado para aceitar credenciais de demonstração
  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      // Primeiro, verifica se é um dos usuários de demonstração
      const demoUser = demoUsers.find(
        user => user.username === username && user.password === password
      );
      
      if (demoUser) {
        // Simula uma pequena pausa para dar a impressão de que está processando
        await new Promise(resolve => setTimeout(resolve, 800));
        // Retorna o usuário de demonstração sem as informações sensíveis
        const { password: _, ...safeUser } = demoUser;
        return safeUser;
      }
      
      // Se não for um usuário de demonstração, tenta o login normal
      try {
        const res = await apiRequest('POST', '/api/auth/login', { username, password });
        return res.json();
      } catch (error) {
        // Mensagem amigável se o servidor estiver indisponível
        throw new Error('Credenciais inválidas. Tente usar os logins de demonstração: tecnico/123456, gestor/123456 ou admin/123456');
      }
    },
    onSuccess: (userData) => {
      setUser(userData);
      
      // Salva o usuário na sessão local para persistência
      try {
        localStorage.setItem('brasilit_user', JSON.stringify(userData));
      } catch (error) {
        console.warn('Não foi possível salvar sessão localmente:', error);
      }
      
      navigate('/');
      toast({
        title: 'Login realizado com sucesso',
        description: `Bem-vindo, ${userData.name}! Você está utilizando uma conta de demonstração.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Falha no login',
        description: error.message || 'Use: tecnico/123456, gestor/123456 ou admin/123456',
        variant: 'destructive',
      });
    },
  });

  // Verifica se há um usuário salvo localmente ao inicializar
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('brasilit_user');
      if (savedUser && !user) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.warn('Erro ao recuperar usuário da sessão local:', error);
    }
  }, []);

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Remove o usuário da sessão local
      try {
        localStorage.removeItem('brasilit_user');
      } catch (error) {
        console.warn('Erro ao remover sessão local:', error);
      }
      
      // Tenta logout normal na API
      try {
        const res = await apiRequest('POST', '/api/auth/logout', {});
        return res.json();
      } catch (error) {
        // Se falhar, não tem problema para a demo
        return { success: true };
      }
    },
    onSuccess: () => {
      setUser(null);
      navigate('/login');
      toast({
        title: 'Logout realizado com sucesso',
        description: 'Você saiu da sua conta de demonstração.',
      });
    },
    onError: (error: any) => {
      // Força logout mesmo em caso de erro
      setUser(null);
      navigate('/login');
      toast({
        title: 'Logout concluído',
        description: 'Você saiu da sua conta, mas ocorreu um erro de comunicação com o servidor.',
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
