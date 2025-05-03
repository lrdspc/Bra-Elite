import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { initDB } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { 
  supabase, 
  signInWithEmail, 
  signInWithGoogle, 
  signOut, 
  signUpWithEmail, 
  resetPassword,
  getCurrentUser,
  getSession
} from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  loginWithoutAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isLoggedIn: false,
  login: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  register: async () => {},
  forgotPassword: async () => {},
  loginWithoutAccount: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [location, navigate] = useLocation();
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

  // Check Supabase session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);

        // Get current session from Supabase
        const session = await getSession();

        if (session) {
          const currentUser = await getCurrentUser();
          setSupabaseUser(currentUser);

          if (currentUser) {
            // Convert Supabase user to AuthUser
            const authUser: AuthUser = {
              id: currentUser.id,
              name: currentUser.user_metadata?.name || 'Usuário',
              email: currentUser.email || '',
              role: currentUser.user_metadata?.role || 'tecnico',
              avatar: currentUser.user_metadata?.avatar,
            };

            setUser(authUser);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const currentUser = await getCurrentUser();
          setSupabaseUser(currentUser);

          if (currentUser) {
            // Convert Supabase user to AuthUser
            const authUser: AuthUser = {
              id: currentUser.id,
              name: currentUser.user_metadata?.name || 'Usuário',
              email: currentUser.email || '',
              role: currentUser.user_metadata?.role || 'tecnico',
              avatar: currentUser.user_metadata?.avatar,
            };

            setUser(authUser);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSupabaseUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
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
  const handleLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      // Check if account is locked
      if (isAccountLocked(email)) {
        const lockUntil = failedLoginAttempts.current[email].lockedUntil;
        const minutes = Math.ceil((lockUntil!.getTime() - new Date().getTime()) / 60000);

        toast({
          title: 'Conta bloqueada',
          description: `Muitas tentativas de login. Tente novamente em ${minutes} minutos.`,
          variant: 'destructive',
        });

        return;
      }

      // Check if it's a demo user
      const demoUser = demoUsers.find(
        user => user.email === email && user.password === password
      );

      if (demoUser) {
        // Simulate a small delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Create a demo auth user
        const authUser: AuthUser = {
          id: demoUser.id,
          name: demoUser.name,
          email: demoUser.email,
          role: demoUser.role,
          avatar: demoUser.avatar,
        };

        setUser(authUser);
        resetInactivityTimer();
        resetFailedLoginAttempts(email);

        navigate('/');
        toast({
          title: 'Login realizado com sucesso',
          description: `Bem-vindo, ${authUser.name}! Você está utilizando uma conta de demonstração.`,
        });

        return;
      }

      // If not a demo user, try Supabase login
      const { data, error } = await signInWithEmail(email, password);

      if (error) {
        recordFailedLoginAttempt(email);

        if (isAccountLocked(email)) {
          const lockUntil = failedLoginAttempts.current[email].lockedUntil;
          const minutes = Math.ceil((lockUntil!.getTime() - new Date().getTime()) / 60000);

          toast({
            title: 'Conta bloqueada',
            description: `Muitas tentativas de login. Tente novamente em ${minutes} minutos.`,
            variant: 'destructive',
          });
        } else {
          const attemptsLeft = 5 - failedLoginAttempts.current[email].count;

          toast({
            title: 'Falha no login',
            description: `Credenciais inválidas. ${attemptsLeft} tentativa(s) restante(s) antes do bloqueio.`,
            variant: 'destructive',
          });
        }

        return;
      }

      // Reset failed login attempts on successful login
      resetFailedLoginAttempts(email);
      resetInactivityTimer();

      navigate('/');
      toast({
        title: 'Login realizado com sucesso',
        description: `Bem-vindo de volta!`,
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Erro no login',
        description: 'Ocorreu um erro ao tentar fazer login. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle login with Google
  const handleLoginWithGoogle = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await signInWithGoogle();

      if (error) {
        toast({
          title: 'Falha no login com Google',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      resetInactivityTimer();
    } catch (error) {
      console.error('Google login error:', error);
      toast({
        title: 'Erro no login com Google',
        description: 'Ocorreu um erro ao tentar fazer login com o Google. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLoading(true);

      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
        inactivityTimer.current = null;
      }

      await signOut();

      setUser(null);
      setSupabaseUser(null);

      navigate('/login');
      toast({
        title: 'Logout realizado com sucesso',
        description: 'Você saiu da sua conta.',
      });
    } catch (error) {
      console.error('Logout error:', error);

      // Force logout even if there's an error
      setUser(null);
      setSupabaseUser(null);

      navigate('/login');
      toast({
        title: 'Logout concluído',
        description: 'Você saiu da sua conta, mas ocorreu um erro de comunicação.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle registration
  const handleRegister = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);

      const { data, error } = await signUpWithEmail(email, password, {
        name,
        role: 'tecnico', // Default role
      });

      if (error) {
        toast({
          title: 'Falha no cadastro',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Cadastro realizado com sucesso',
        description: 'Verifique seu email para confirmar o cadastro.',
      });

      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Erro no cadastro',
        description: 'Ocorreu um erro ao tentar fazer o cadastro. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password recovery
  const handleForgotPassword = async (email: string) => {
    try {
      setIsLoading(true);

      const { data, error } = await resetPassword(email);

      if (error) {
        toast({
          title: 'Falha na recuperação de senha',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Email enviado',
        description: 'Verifique seu email para redefinir sua senha.',
      });
    } catch (error) {
      console.error('Password recovery error:', error);
      toast({
        title: 'Erro na recuperação de senha',
        description: 'Ocorreu um erro ao tentar recuperar a senha. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle login without account
  const handleLoginWithoutAccount = async () => {
    try {
      setIsLoading(true);

      // Create a temporary user
      const tempUser: AuthUser = {
        id: 'temp-' + Date.now(),
        name: 'Usuário Temporário',
        email: '',
        role: 'tecnico',
      };

      setUser(tempUser);
      resetInactivityTimer();

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
        loginWithGoogle: handleLoginWithGoogle,
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
