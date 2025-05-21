import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { LoaderCircle, Mail, Lock, User, LogIn } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '', registerEmail: '', registerPassword: '', registerName: '', forgotEmail: '' });

  const { 
    login, 
    loginWithGoogle, 
    register, 
    forgotPassword, 
    loginWithoutAccount, 
    isLoading 
  } = useAuth();

  const validateLoginForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
      valid = false;
    } else {
      newErrors.email = '';
    }

    if (!password.trim()) {
      newErrors.password = 'Senha é obrigatória';
      valid = false;
    } else {
      newErrors.password = '';
    }

    setErrors(newErrors);
    return valid;
  };

  const validateRegisterForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    if (!registerName.trim()) {
      newErrors.registerName = 'Nome é obrigatório';
      valid = false;
    } else {
      newErrors.registerName = '';
    }

    if (!registerEmail.trim()) {
      newErrors.registerEmail = 'Email é obrigatório';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(registerEmail)) {
      newErrors.registerEmail = 'Email inválido';
      valid = false;
    } else {
      newErrors.registerEmail = '';
    }

    if (!registerPassword.trim()) {
      newErrors.registerPassword = 'Senha é obrigatória';
      valid = false;
    } else if (registerPassword.length < 6) {
      newErrors.registerPassword = 'A senha deve ter pelo menos 6 caracteres';
      valid = false;
    } else {
      newErrors.registerPassword = '';
    }

    setErrors(newErrors);
    return valid;
  };

  const validateForgotPasswordForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    if (!forgotEmail.trim()) {
      newErrors.forgotEmail = 'Email é obrigatório';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(forgotEmail)) {
      newErrors.forgotEmail = 'Email inválido';
      valid = false;
    } else {
      newErrors.forgotEmail = '';
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateLoginForm()) return;

    try {
      await login(email, password);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateRegisterForm()) return;

    try {
      await register(registerEmail, registerPassword, registerName);
      setShowRegister(false);
      // Clear registration form
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterName('');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForgotPasswordForm()) return;

    try {
      await forgotPassword(forgotEmail);
      setShowForgotPassword(false);
      // Clear forgot password form
      setForgotEmail('');
    } catch (error) {
      console.error('Password recovery failed:', error);
    }
  };

  const handleLoginWithoutAccount = async () => {
    try {
      await loginWithoutAccount();
    } catch (error) {
      console.error('Login without account failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Cabeçalho Brasilit - Responsivo */}
      <header className="bg-brasilit-red py-2 sm:py-4 px-4 sm:px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <svg 
            width="150" 
            height="36" 
            viewBox="0 0 150 36" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-8 sm:h-9 w-auto optimize-gpu"
          >
            <path d="M10.8 7.2H21.6C27.9 7.2 32.4 11.7 32.4 18C32.4 24.3 27.9 28.8 21.6 28.8H10.8C4.5 28.8 0 24.3 0 18C0 11.7 4.5 7.2 10.8 7.2Z" fill="white"/>
            <path d="M43.2 7.2H54C60.3 7.2 64.8 11.7 64.8 18C64.8 24.3 60.3 28.8 54 28.8H43.2C36.9 28.8 32.4 24.3 32.4 18C32.4 11.7 36.9 7.2 43.2 7.2Z" fill="white"/>
            <text x="8.1" y="22.5" fontFamily="Arial" fontSize="14" fontWeight="700" fill="#EE1B24">BRASI</text>
            <text x="40.5" y="22.5" fontFamily="Arial" fontSize="14" fontWeight="700" fill="#EE1B24">LIT</text>
            <text x="68" y="19" fontFamily="Arial" fontSize="10" fontWeight="400" fill="white">SAINT-GOBAIN</text>
          </svg>

          {/* Indicador de conexão - Visível apenas em telas médias e grandes */}
          <div className="hidden sm:flex items-center space-x-2 text-white text-sm">
            <div className={`h-2 w-2 rounded-full ${navigator.onLine ? 'bg-green-400' : 'bg-gray-400'}`}></div>
            <span>{navigator.onLine ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal - Design Responsivo */}
      <div className="flex-grow flex items-center justify-center px-4 py-6 sm:py-12 bg-gradient-to-b from-white to-gray-100">
        <div className="w-full max-w-md responsive-container animate-transition">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 responsive-title high-contrast-text">
              Sistema de Vistorias Técnicas
            </h1>
            <div className="mt-2 h-1 w-16 sm:w-24 bg-brasilit-red mx-auto rounded-full"></div>
            <p className="text-gray-600 mt-3 sm:mt-4 text-sm sm:text-base">
              Faça login para acessar o sistema
            </p>
          </div>

          <Card className="shadow-lg border-t-4 border-t-brasilit-red animate-transition">
            <CardContent className="p-5 sm:p-8 responsive-card">
              {/* Banner de demonstração */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4 text-blue-800 text-sm">
                <h3 className="font-medium mb-1">🔑 Demonstração</h3>
                <p className="text-xs text-blue-700 mb-2">
                  Use uma das credenciais abaixo para entrar no sistema:
                </p>
                <div className="space-y-1.5 text-xs font-mono bg-white/50 p-2 rounded border border-blue-100">
                  <div className="flex">
                    <span className="w-28">Técnico:</span>
                    <span className="font-medium">tecnico@brasilit.com.br / 123456</span>
                  </div>
                  <div className="flex">
                    <span className="w-28">Gestor:</span>
                    <span className="font-medium">gestor@brasilit.com.br / 123456</span>
                  </div>
                  <div className="flex">
                    <span className="w-28">Administrador:</span>
                    <span className="font-medium">admin@brasilit.com.br / 123456</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4 sm:space-y-5">
                <div>
                  <Label 
                    htmlFor="email" 
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@empresa.com"
                      className={`bg-gray-50 border ${errors.email ? "border-destructive" : "border-gray-300"} w-full pl-10`}
                      disabled={isLoading}
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label 
                    htmlFor="password" 
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`bg-gray-50 border ${errors.password ? "border-destructive" : "border-gray-300"} w-full pl-10`}
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-destructive">{errors.password}</p>
                  )}
                  <div className="flex justify-end mt-1">
                    <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-primary text-sm hover:underline"
                        >
                          Esqueceu a senha?
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Recuperar Senha</DialogTitle>
                          <DialogDescription>
                            Digite seu email para receber um link de recuperação de senha.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 mt-4">
                          <div>
                            <Label htmlFor="forgotEmail">Email</Label>
                            <Input
                              id="forgotEmail"
                              type="email"
                              value={forgotEmail}
                              onChange={(e) => setForgotEmail(e.target.value)}
                              placeholder="seu.email@empresa.com"
                              className={errors.forgotEmail ? "border-destructive" : ""}
                            />
                            {errors.forgotEmail && (
                              <p className="mt-1 text-sm text-destructive">{errors.forgotEmail}</p>
                            )}
                          </div>
                          <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                              {isLoading ? (
                                <>
                                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                  Enviando...
                                </>
                              ) : 'Enviar Link'}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-brasilit-red hover:bg-red-700 text-white font-medium py-2.5 mt-2 optimized-animation"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : 'Entrar'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <LogIn className="h-4 w-4" />
                  Entrar com Google
                </Button>

                {/* Botões de acesso rápido */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-500 mb-2">Acesso rápido:</div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs h-8"
                      disabled={isLoading}
                      onClick={() => {
                        setEmail('tecnico@brasilit.com.br');
                        setPassword('123456');
                        setTimeout(() => handleLoginSubmit({ preventDefault: () => {} } as any), 100);
                      }}
                    >
                      Técnico
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs h-8"
                      disabled={isLoading}
                      onClick={() => {
                        setEmail('gestor@brasilit.com.br');
                        setPassword('123456');
                        setTimeout(() => handleLoginSubmit({ preventDefault: () => {} } as any), 100);
                      }}
                    >
                      Gestor
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs h-8"
                      disabled={isLoading}
                      onClick={() => {
                        setEmail('admin@brasilit.com.br');
                        setPassword('123456');
                        setTimeout(() => handleLoginSubmit({ preventDefault: () => {} } as any), 100);
                      }}
                    >
                      Admin
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col space-y-3 pt-3 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-sm"
                    onClick={handleLoginWithoutAccount}
                    disabled={isLoading}
                  >
                    Continuar sem cadastro
                  </Button>

                  <Dialog open={showRegister} onOpenChange={setShowRegister}>
                    <DialogTrigger asChild>
                      <Button 
                        type="button"
                        variant="link" 
                        className="text-sm"
                        disabled={isLoading}
                      >
                        Não tem uma conta? Cadastre-se
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Criar Conta</DialogTitle>
                        <DialogDescription>
                          Preencha os campos abaixo para criar uma nova conta.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleRegisterSubmit} className="space-y-4 mt-4">
                        <div>
                          <Label htmlFor="registerName">Nome Completo</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="registerName"
                              type="text"
                              value={registerName}
                              onChange={(e) => setRegisterName(e.target.value)}
                              placeholder="Seu nome completo"
                              className={`pl-10 ${errors.registerName ? "border-destructive" : ""}`}
                            />
                          </div>
                          {errors.registerName && (
                            <p className="mt-1 text-sm text-destructive">{errors.registerName}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="registerEmail">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="registerEmail"
                              type="email"
                              value={registerEmail}
                              onChange={(e) => setRegisterEmail(e.target.value)}
                              placeholder="seu.email@empresa.com"
                              className={`pl-10 ${errors.registerEmail ? "border-destructive" : ""}`}
                            />
                          </div>
                          {errors.registerEmail && (
                            <p className="mt-1 text-sm text-destructive">{errors.registerEmail}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="registerPassword">Senha</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="registerPassword"
                              type="password"
                              value={registerPassword}
                              onChange={(e) => setRegisterPassword(e.target.value)}
                              placeholder="••••••••"
                              className={`pl-10 ${errors.registerPassword ? "border-destructive" : ""}`}
                            />
                          </div>
                          {errors.registerPassword && (
                            <p className="mt-1 text-sm text-destructive">{errors.registerPassword}</p>
                          )}
                          <p className="mt-1 text-xs text-muted-foreground">
                            A senha deve ter pelo menos 6 caracteres.
                          </p>
                        </div>
                        <DialogFooter>
                          <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                              <>
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                Cadastrando...
                              </>
                            ) : 'Cadastrar'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-gray-500 text-xs sm:text-sm">
              Versão 1.0.0 - Sistema de Vistorias Técnicas Brasilit
            </p>
          </div>
        </div>
      </div>

      {/* Rodapé amarelo - Responsivo */}
      <footer className="bg-brasilit-yellow py-1.5 sm:py-2 text-center text-black text-xs sm:text-sm font-medium shadow-inner">
        <p>&copy; 2025 Brasilit - Saint-Gobain. Todos os direitos reservados.</p>

        {/* Indicador de conexão para dispositivos móveis */}
        <div className="flex justify-center mt-1 sm:hidden">
          <div className="flex items-center space-x-1 text-xs">
            <div className={`h-1.5 w-1.5 rounded-full ${navigator.onLine ? 'bg-green-600' : 'bg-gray-600'}`}></div>
            <span>{navigator.onLine ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
