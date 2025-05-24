import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { initDB } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import * as authService from '@/lib/authService'; // Import the new auth service
import { User as AuthUserType } from '@/lib/authService'; // Use User type from authService

interface AuthUser extends AuthUserType { // Ensure AuthUser is compatible or extends authService.User
  // id: string; // Already in authService.User
  // name: string; // Already in authService.User
  // email: string; // Already in authService.User
  role?: string; // Keep role if it's specific to this app's user concept
  avatar?: string; // Keep avatar if specific
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email?: string, password?: string) => Promise<void>; // Optional params to match authService
  loginWithGoogle: () => Promise<void>; // This will be a mock or removed if not applicable
  logout: () => Promise<void>;
  register: (email?: string, password?: string, name?: string) => Promise<void>; // Optional params
  forgotPassword: (email?: string) => Promise<void>; // Optional params
  loginWithoutAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isLoggedIn: false,
  login: async () => {},
  loginWithGoogle: async () => { console.warn("loginWithGoogle not implemented with new authService") },
  logout: async () => {},
  register: async () => {},
  forgotPassword: async () => {},
  loginWithoutAccount: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  // const [supabaseUser, setSupabaseUser] = useState<User | null>(null); // Remove Supabase specific user state
  const [isLoading, setIsLoading] = useState(true);
  const [, navigate] = useLocation(); // location was not used
  const { toast } = useToast();
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const failedLoginAttempts = useRef<{ [email: string]: { count: number, lockedUntil?: Date } }>({});

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

  // Reset inactivity timer
  const resetInactivityTimer = () => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }

    // Logout after 20 minutes of inactivity
    inactivityTimer.current = setTimeout(() => {
      if (user) {
        handleLogout();
        toast({
          title: 'Sessão expirada',
          description: 'Você foi desconectado devido à inatividade.',
        });
      }
    }, 20 * 60 * 1000); // 20 minutes
  };

  // Add event listeners for user activity
  useEffect(() => {
    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];

    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    activityEvents.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });

    // Initial timer
    resetInactivityTimer();

    return () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }

      activityEvents.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [user]);

  // Check session on mount using authService
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const session = await authService.getSession(); // Use new service
        if (session && session.user) {
          // Assuming authService.User can be directly used or needs mapping
          const appUser: AuthUser = {
            ...session.user, // Spread properties from authService.User
            // id: session.user.id,
            // name: session.user.name || 'Usuário',
            // email: session.user.email || '',
            role: session.user.role || 'tecnico', // Example: map role if needed
            avatar: session.user.avatar_url || session.user.avatar,
          };
          setUser(appUser);
        } else {
          // Attempt to get current user if no session (e.g. from local storage)
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            const appUser: AuthUser = {
              ...currentUser,
              role: currentUser.role || 'tecnico',
              avatar: currentUser.avatar_url || currentUser.avatar,
            };
            setUser(appUser);
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error checking session with authService:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Set up auth state change listener using authService
    const authSubscription = authService.onAuthStateChange((event, session) => {
      setIsLoading(true);
      console.log('Auth state changed:', event, session);
      if (session && session.user) {
        const appUser: AuthUser = {
          ...session.user,
          role: session.user.role || 'tecnico',
          avatar: session.user.avatar_url || session.user.avatar,
        };
        setUser(appUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

    // Usuários de demonstração para facilitar o acesso
  const demoUsers = [
    {
      id: '1',
      email: 'tecnico@brasilit.com.br',
      password: '123456',
      name: 'João da Silva',
      role: 'tecnico',
      avatar: '/avatars/tecnico.png'
    },
    {
      id: '2',
      email: 'gestor@brasilit.com.br',
      password: '123456',
      name: 'Maria Souza',
      role: 'gestor',
      avatar: '/avatars/gestor.png'
    },
    {
      id: '3',
      email: 'admin@brasilit.com.br',
      password: '123456',
      name: 'Carlos Oliveira',
      role: 'admin',
      avatar: '/avatars/admin.png'
    }
  ];

  // Check if account is locked
  const isAccountLocked = (email: string): boolean => {
    const attempts = failedLoginAttempts.current[email];
    if (!attempts || !attempts.lockedUntil) return false;

    const now = new Date();
    if (now < attempts.lockedUntil) {
      return true;
    }

    // Reset lock if expired
    delete failedLoginAttempts.current[email].lockedUntil;
    return false;
  };

  // Record failed login attempt
  const recordFailedLoginAttempt = (email: string) => {
    if (!failedLoginAttempts.current[email]) {
      failedLoginAttempts.current[email] = { count: 1 };
    } else {
      failedLoginAttempts.current[email].count += 1;

      // Lock account after 5 failed attempts
      if (failedLoginAttempts.current[email].count >= 5) {
        const lockUntil = new Date();
        lockUntil.setMinutes(lockUntil.getMinutes() + 15); // Lock for 15 minutes
        failedLoginAttempts.current[email].lockedUntil = lockUntil;
      }
    }
  };

  // Reset failed login attempts
  const resetFailedLoginAttempts = (email: string) => {
    if (failedLoginAttempts.current[email]) {
      failedLoginAttempts.current[email].count = 0;
      delete failedLoginAttempts.current[email].lockedUntil;
    }
  };

  // Handle login with email and password
  const handleLogin = async (email?: string, password?: string) => {
    if (!email || !password) {
      toast({ title: 'Erro de Login', description: 'Email e senha são obrigatórios.', variant: 'destructive' });
      return;
    }
    try {
      setIsLoading(true);

      if (isAccountLocked(email)) {
        const lockUntil = failedLoginAttempts.current[email].lockedUntil;
        const minutes = Math.ceil((lockUntil!.getTime() - new Date().getTime()) / 60000);
        toast({ title: 'Conta bloqueada', description: `Muitas tentativas de login. Tente novamente em ${minutes} minutos.`, variant: 'destructive' });
        return;
      }

      const demoUser = demoUsers.find(u => u.email === email && u.password === password);
      if (demoUser) {
        await new Promise(resolve => setTimeout(resolve, 800));
        const authUser: AuthUser = { ...demoUser };
        setUser(authUser);
        resetInactivityTimer();
        resetFailedLoginAttempts(email);
        authService._notifyAuthStateChange('SIGNED_IN', { user: authUser, token: 'demo-token' });
        navigate('/');
        toast({ title: 'Login realizado com sucesso', description: `Bem-vindo, ${authUser.name}! Você está utilizando uma conta de demonstração.` });
        return;
      }

      const { user: serviceUser, error } = await authService.login(email, password);

      if (error || !serviceUser) {
        recordFailedLoginAttempt(email);
        if (isAccountLocked(email)) {
          const lockUntil = failedLoginAttempts.current[email].lockedUntil;
          const minutes = Math.ceil((lockUntil!.getTime() - new Date().getTime()) / 60000);
          toast({ title: 'Conta bloqueada', description: `Muitas tentativas de login. Tente novamente em ${minutes} minutos.`, variant: 'destructive' });
        } else {
          const attemptsLeft = 5 - (failedLoginAttempts.current[email]?.count || 0);
          toast({ title: 'Falha no login', description: `Credenciais inválidas. ${attemptsLeft > 0 ? `${attemptsLeft} tentativa(s) restante(s) antes do bloqueio.` : 'Conta bloqueada.' }`, variant: 'destructive' });
        }
        authService._notifyAuthStateChange('SIGN_IN_FAILURE', null);
        return;
      }
      
      const appUser: AuthUser = { 
        ...serviceUser, 
        role: serviceUser.role || 'tecnico', 
        avatar: serviceUser.avatar_url || serviceUser.avatar 
      };
      setUser(appUser);
      resetFailedLoginAttempts(email);
      resetInactivityTimer();
      authService._notifyAuthStateChange('SIGNED_IN', { user: appUser, token: 'mock-token' }); // Simulate session for onAuthStateChange
      navigate('/');
      toast({ title: 'Login realizado com sucesso', description: `Bem-vindo de volta, ${appUser.name}!` });
    } catch (err) {
      console.error('Login error:', err);
      toast({ title: 'Erro no login', description: 'Ocorreu um erro ao tentar fazer login.', variant: 'destructive' });
      authService._notifyAuthStateChange('SIGN_IN_FAILURE', null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginWithGoogle = async () => {
    // This function would need significant changes if not using Supabase.
    // For now, it's a placeholder or could be removed if Google login isn't part of the local auth strategy.
    console.warn("Login with Google is not implemented with the new authService.");
    toast({
      title: 'Funcionalidade não disponível',
      description: 'Login com Google não está configurado para este modo de autenticação.',
      variant: 'default',
    });
  };
  
  const handleLogout = async () => {
    try {
      setIsLoading(true);
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
        inactivityTimer.current = null;
      }
      await authService.logout();
      setUser(null);
      authService._notifyAuthStateChange('SIGNED_OUT', null);
      navigate('/login');
      toast({ title: 'Logout realizado com sucesso', description: 'Você saiu da sua conta.' });
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null); // Force logout on client
      authService._notifyAuthStateChange('SIGNED_OUT', null);
      navigate('/login');
      toast({ title: 'Logout concluído', description: 'Você saiu da sua conta, mas ocorreu um erro de comunicação.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (email?: string, password?: string, name?: string) => {
    if (!email || !password || !name) {
      toast({ title: 'Erro de Cadastro', description: 'Todos os campos são obrigatórios.', variant: 'destructive' });
      return;
    }
    try {
      setIsLoading(true);
      const { user: serviceUser, error } = await authService.register(email, password, { name, role: 'tecnico' });
      if (error || !serviceUser) {
        toast({ title: 'Falha no cadastro', description: error?.message || 'Não foi possível realizar o cadastro.', variant: 'destructive' });
        return;
      }
      toast({ title: 'Cadastro realizado com sucesso', description: 'Você já pode fazer login.' }); // Adjusted message
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      toast({ title: 'Erro no cadastro', description: 'Ocorreu um erro ao tentar fazer o cadastro.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (email?: string) => {
    if (!email) {
      toast({ title: 'Recuperação de Senha', description: 'Email é obrigatório.', variant: 'destructive' });
      return;
    }
    try {
      setIsLoading(true);
      const { error } = await authService.resetPassword(email);
      if (error) {
        toast({ title: 'Falha na recuperação de senha', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Email enviado', description: 'Se o email estiver cadastrado, você receberá um link para redefinir sua senha.' }); // Adjusted message
    } catch (err) {
      console.error('Password recovery error:', err);
      toast({ title: 'Erro na recuperação de senha', description: 'Ocorreu um erro.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLoginWithoutAccount = async () => {
    try {
      setIsLoading(true);

      // Create a temporary user
      const tempUser: AuthUser = { // Ensure AuthUser is correctly typed here
        id: 'temp-' + Date.now(),
        name: 'Usuário Temporário',
        email: '', // Email might be optional in AuthUserType from authService
        role: 'tecnico',
      };

      setUser(tempUser);
      resetInactivityTimer();
      // Simulate auth state change for temporary user
      authService._notifyAuthStateChange('SIGNED_IN', { user: tempUser, token: 'temp-token' });


      navigate('/');
      toast({
        title: 'Acesso temporário',
        description: 'Você está utilizando o sistema sem cadastro. Algumas funcionalidades não estarão disponíveis.',
      });
    } catch (error) {
      console.error('Temporary access error:', error);
      toast({
        title: 'Erro no acesso temporário',
        description: 'Ocorreu um erro ao tentar acessar sem cadastro. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn: !!user,
        login: handleLogin,
        loginWithGoogle: handleLoginWithGoogle, // Kept for structure, but shows warning
        logout: handleLogout,
        register: handleRegister,
        forgotPassword: handleForgotPassword,
        loginWithoutAccount: handleLoginWithoutAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
