import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { LoaderCircle } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ username: '', password: '' });
  const { login, isLoading } = useAuth();

  const validateForm = () => {
    let valid = true;
    const newErrors = { username: '', password: '' };

    if (!username.trim()) {
      newErrors.username = 'Email é obrigatório';
      valid = false;
    }

    if (!password.trim()) {
      newErrors.password = 'Senha é obrigatória';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await login(username, password);
    } catch (error) {
      console.error('Login failed:', error);
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
                    <span className="font-medium">tecnico / 123456</span>
                  </div>
                  <div className="flex">
                    <span className="w-28">Gestor:</span>
                    <span className="font-medium">gestor / 123456</span>
                  </div>
                  <div className="flex">
                    <span className="w-28">Administrador:</span>
                    <span className="font-medium">admin / 123456</span>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div>
                  <Label 
                    htmlFor="username" 
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email / Usuário
                  </Label>
                  <Input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="seu.email@empresa.com"
                    className={`bg-gray-50 border ${errors.username ? "border-destructive" : "border-gray-300"} w-full`}
                    disabled={isLoading}
                    autoComplete="username"
                    autoFocus
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-destructive">{errors.username}</p>
                  )}
                </div>
                
                <div>
                  <Label 
                    htmlFor="password" 
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Senha
                  </Label>
                  <Input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`bg-gray-50 border ${errors.password ? "border-destructive" : "border-gray-300"} w-full`}
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-destructive">{errors.password}</p>
                  )}
                  <div className="flex justify-end mt-1">
                    <a 
                      href="#" 
                      className="text-primary text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-primary/30 rounded"
                    >
                      Esqueceu a senha?
                    </a>
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
                        setUsername('tecnico');
                        setPassword('123456');
                        setTimeout(() => handleSubmit({ preventDefault: () => {} } as any), 100);
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
                        setUsername('gestor');
                        setPassword('123456');
                        setTimeout(() => handleSubmit({ preventDefault: () => {} } as any), 100);
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
                        setUsername('admin');
                        setPassword('123456');
                        setTimeout(() => handleSubmit({ preventDefault: () => {} } as any), 100);
                      }}
                    >
                      Admin
                    </Button>
                  </div>
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
