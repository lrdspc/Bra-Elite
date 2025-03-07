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
      {/* Cabeçalho Brasilit */}
      <header className="bg-brasilit-red py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center">
          <svg width="150" height="36" viewBox="0 0 150 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-9">
            <path d="M10.8 7.2H21.6C27.9 7.2 32.4 11.7 32.4 18C32.4 24.3 27.9 28.8 21.6 28.8H10.8C4.5 28.8 0 24.3 0 18C0 11.7 4.5 7.2 10.8 7.2Z" fill="white"/>
            <path d="M43.2 7.2H54C60.3 7.2 64.8 11.7 64.8 18C64.8 24.3 60.3 28.8 54 28.8H43.2C36.9 28.8 32.4 24.3 32.4 18C32.4 11.7 36.9 7.2 43.2 7.2Z" fill="white"/>
            <text x="8.1" y="22.5" fontFamily="Arial" fontSize="14" fontWeight="700" fill="#EE1B24">BRASI</text>
            <text x="40.5" y="22.5" fontFamily="Arial" fontSize="14" fontWeight="700" fill="#EE1B24">LIT</text>
            <text x="68" y="19" fontFamily="Arial" fontSize="10" fontWeight="400" fill="white">SAINT-GOBAIN</text>
          </svg>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="flex-grow flex items-center justify-center px-4 py-12 bg-gradient-to-b from-white to-gray-100">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Sistema de Vistorias Técnicas</h1>
            <div className="mt-2 h-1 w-24 bg-brasilit-red mx-auto rounded-full"></div>
            <p className="text-gray-600 mt-4">Faça login para acessar o sistema</p>
          </div>
          
          <Card className="shadow-lg border-t-4 border-t-brasilit-red">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <Label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Email / Usuário
                  </Label>
                  <Input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="seu.email@empresa.com"
                    className={`bg-gray-50 border ${errors.username ? "border-destructive" : "border-gray-300"}`}
                    disabled={isLoading}
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-destructive">{errors.username}</p>
                  )}
                </div>
                
                <div className="mb-6">
                  <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Senha
                  </Label>
                  <Input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`bg-gray-50 border ${errors.password ? "border-destructive" : "border-gray-300"}`}
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-destructive">{errors.password}</p>
                  )}
                  <div className="flex justify-end mt-1">
                    <a href="#" className="text-primary text-sm hover:underline">Esqueceu a senha?</a>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-brasilit-red hover:bg-red-700 text-white font-medium py-2.5"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : 'Entrar'}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">Versão 1.0.0 - Sistema de Vistorias Técnicas Brasilit</p>
          </div>
        </div>
      </div>

      {/* Rodapé amarelo */}
      <footer className="bg-brasilit-yellow py-2 text-center text-black text-sm font-medium shadow-inner">
        <p>&copy; 2025 Brasilit - Saint-Gobain. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default LoginPage;
