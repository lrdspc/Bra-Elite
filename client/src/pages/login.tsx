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
    <div className="h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <svg width="180" height="60" viewBox="0 0 180 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
            <path d="M30 0H60C77.6731 0 90 12.3269 90 30C90 47.6731 77.6731 60 60 60H30C12.3269 60 0 47.6731 0 30C0 12.3269 12.3269 0 30 0Z" fill="hsl(var(--primary))"/>
            <path d="M120 0H150C167.673 0 180 12.3269 180 30C180 47.6731 167.673 60 150 60H120C102.327 60 90 47.6731 90 30C90 12.3269 102.327 0 120 0Z" fill="hsl(var(--primary))"/>
            <text x="22.5" y="37.5" fontFamily="Arial" fontSize="24" fontWeight="700" fill="white">BRASI</text>
            <text x="112.5" y="37.5" fontFamily="Arial" fontSize="24" fontWeight="700" fill="white">LIT</text>
          </svg>
          <h1 className="text-2xl font-bold mt-4">Vistorias Técnicas</h1>
          <p className="text-muted-foreground mt-2">Faça login para acessar o sistema</p>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <Label htmlFor="username" className="block text-sm font-medium text-muted-foreground mb-1">
                  Email / Usuário
                </Label>
                <Input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="seu.email@empresa.com"
                  className={errors.username ? "border-destructive" : ""}
                  disabled={isLoading}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-destructive">{errors.username}</p>
                )}
              </div>
              
              <div className="mb-6">
                <Label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-1">
                  Senha
                </Label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={errors.password ? "border-destructive" : ""}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-destructive">{errors.password}</p>
                )}
                <div className="flex justify-end mt-1">
                  <a href="#" className="text-primary text-sm">Esqueceu a senha?</a>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full"
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
        
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>Versão 1.0.0 - Sistema de Vistorias Técnicas Brasilit</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
