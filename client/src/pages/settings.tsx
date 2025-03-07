import React, { useState } from 'react';
import { isOnline, checkForServiceWorkerUpdates, clearAllData } from '@/lib/pwa';
import { AlertTriangle, Cloud, CloudOff, RefreshCw, Database, Trash2, Lock, Bell, Phone, Palette, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SettingsPage: React.FC = () => {
  const { toast } = useToast();
  const [isDataClearDialogOpen, setIsDataClearDialogOpen] = useState(false);
  const [syncSettings, setSyncSettings] = useState({
    automaticSync: true,
    syncOnWifiOnly: true,
    backgroundSync: true
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    push: true,
    email: false,
    reminder: true
  });
  
  const [appearanceSettings, setAppearanceSettings] = useState({
    darkMode: false,
    highContrast: false,
    largeText: false
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    biometric: false,
    autoLock: true,
    twoFactor: false
  });

  const handleSync = async () => {
    if (!isOnline()) {
      toast({
        title: "Erro de sincronização",
        description: "Você está offline. Verifique sua conexão e tente novamente.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Sincronizando dados",
      description: "Aguarde enquanto sincronizamos seus dados...",
    });

    // In a real app, this would trigger a sync with the server
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
      
      toast({
        title: "Sincronização concluída",
        description: "Todos os dados foram sincronizados com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro de sincronização",
        description: "Não foi possível completar a sincronização. Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  };

  const handleCheckForUpdates = async () => {
    toast({
      title: "Verificando atualizações",
      description: "Aguarde enquanto verificamos por novas versões...",
    });

    try {
      await checkForServiceWorkerUpdates();
      
      // For demo purposes, always say no updates after a delay
      setTimeout(() => {
        toast({
          title: "Sistema atualizado",
          description: "Você já está usando a versão mais recente do aplicativo.",
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Erro ao verificar atualizações",
        description: "Não foi possível verificar atualizações. Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  };

  const handleClearData = async () => {
    setIsDataClearDialogOpen(false);
    
    toast({
      title: "Limpando dados",
      description: "Aguarde enquanto excluímos os dados locais...",
    });

    try {
      await clearAllData();
      
      toast({
        title: "Dados limpos",
        description: "Todos os dados locais foram excluídos com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao limpar dados",
        description: "Ocorreu um erro ao limpar os dados. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 md:px-6 md:py-4">
        <h1 className="text-xl font-bold">Configurações</h1>
      </div>

      {/* Settings Content */}
      <div className="p-4 md:p-6">
        <Tabs defaultValue="sync" className="space-y-6">
          <TabsList className="mb-4">
            <TabsTrigger value="sync">
              <Cloud className="h-4 w-4 mr-2" />
              Sincronização
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Palette className="h-4 w-4 mr-2" />
              Aparência
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="h-4 w-4 mr-2" />
              Segurança
            </TabsTrigger>
          </TabsList>
          
          {/* Sync Settings */}
          <TabsContent value="sync" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium">Sincronização</h2>
                <p className="text-sm text-muted-foreground">Gerencie como os dados são sincronizados</p>
              </div>
              <div className="flex items-center">
                {isOnline() ? (
                  <div className="flex items-center text-success text-sm">
                    <Cloud className="h-4 w-4 mr-1" />
                    <span>Online</span>
                  </div>
                ) : (
                  <div className="flex items-center text-muted-foreground text-sm">
                    <CloudOff className="h-4 w-4 mr-1" />
                    <span>Offline</span>
                  </div>
                )}
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Sincronização</CardTitle>
                <CardDescription>Controle como e quando seus dados são sincronizados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="automatic-sync">Sincronização automática</Label>
                    <p className="text-sm text-muted-foreground">
                      Sincroniza automaticamente dados quando houver conexão
                    </p>
                  </div>
                  <Switch
                    id="automatic-sync"
                    checked={syncSettings.automaticSync}
                    onCheckedChange={(checked) => setSyncSettings(prev => ({ ...prev, automaticSync: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="wifi-sync">Sincronizar apenas no Wi-Fi</Label>
                    <p className="text-sm text-muted-foreground">
                      Economiza dados móveis sincronizando apenas em redes Wi-Fi
                    </p>
                  </div>
                  <Switch
                    id="wifi-sync"
                    checked={syncSettings.syncOnWifiOnly}
                    onCheckedChange={(checked) => setSyncSettings(prev => ({ ...prev, syncOnWifiOnly: checked }))}
                    disabled={!syncSettings.automaticSync}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="background-sync">Sincronização em segundo plano</Label>
                    <p className="text-sm text-muted-foreground">
                      Permite sincronizar mesmo quando o app não está em uso
                    </p>
                  </div>
                  <Switch
                    id="background-sync"
                    checked={syncSettings.backgroundSync}
                    onCheckedChange={(checked) => setSyncSettings(prev => ({ ...prev, backgroundSync: checked }))}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleSync}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sincronizar Agora
                </Button>
                <Button variant="outline" onClick={handleCheckForUpdates}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Verificar Atualizações
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center text-destructive">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Dados Locais
                </CardTitle>
                <CardDescription>
                  Opções para gerenciamento de dados armazenados localmente no dispositivo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Limpar todos os dados locais removerá todas as vistorias não sincronizadas, 
                  clientes e projetos armazenados neste dispositivo. Essa ação não pode ser desfeita.
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="destructive" 
                  onClick={() => setIsDataClearDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Todos os Dados
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-4">
            <div>
              <h2 className="text-lg font-medium">Notificações</h2>
              <p className="text-sm text-muted-foreground">Controle como você recebe notificações</p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificação</CardTitle>
                <CardDescription>Configure quais notificações deseja receber</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notification">Notificações push</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações no dispositivo para eventos importantes
                    </p>
                  </div>
                  <Switch
                    id="push-notification"
                    checked={notificationSettings.push}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, push: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notification">Notificações por email</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba um resumo diário das atividades por email
                    </p>
                  </div>
                  <Switch
                    id="email-notification"
                    checked={notificationSettings.email}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, email: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reminder-notification">Lembretes de vistorias</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba lembretes para vistorias agendadas
                    </p>
                  </div>
                  <Switch
                    id="reminder-notification"
                    checked={notificationSettings.reminder}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, reminder: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-4">
            <div>
              <h2 className="text-lg font-medium">Aparência</h2>
              <p className="text-sm text-muted-foreground">Personalize a aparência do aplicativo</p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Tema e Acessibilidade</CardTitle>
                <CardDescription>Ajuste a aparência conforme sua preferência</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode">Modo escuro</Label>
                    <p className="text-sm text-muted-foreground">
                      Utiliza cores escuras para reduzir o cansaço visual
                    </p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={appearanceSettings.darkMode}
                    onCheckedChange={(checked) => setAppearanceSettings(prev => ({ ...prev, darkMode: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="high-contrast">Alto contraste</Label>
                    <p className="text-sm text-muted-foreground">
                      Aumenta o contraste para melhor visibilidade
                    </p>
                  </div>
                  <Switch
                    id="high-contrast"
                    checked={appearanceSettings.highContrast}
                    onCheckedChange={(checked) => setAppearanceSettings(prev => ({ ...prev, highContrast: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="large-text">Texto grande</Label>
                    <p className="text-sm text-muted-foreground">
                      Aumenta o tamanho do texto para melhor legibilidade
                    </p>
                  </div>
                  <Switch
                    id="large-text"
                    checked={appearanceSettings.largeText}
                    onCheckedChange={(checked) => setAppearanceSettings(prev => ({ ...prev, largeText: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Security Settings */}
          <TabsContent value="security" className="space-y-4">
            <div>
              <h2 className="text-lg font-medium">Segurança</h2>
              <p className="text-sm text-muted-foreground">Configure opções de segurança e privacidade</p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Segurança da Conta</CardTitle>
                <CardDescription>Proteja seu acesso e dados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="biometric">Autenticação biométrica</Label>
                    <p className="text-sm text-muted-foreground">
                      Use sua digital ou reconhecimento facial para acessar o app
                    </p>
                  </div>
                  <Switch
                    id="biometric"
                    checked={securitySettings.biometric}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, biometric: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-lock">Bloqueio automático</Label>
                    <p className="text-sm text-muted-foreground">
                      Bloqueia o aplicativo após 5 minutos de inatividade
                    </p>
                  </div>
                  <Switch
                    id="auto-lock"
                    checked={securitySettings.autoLock}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, autoLock: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="two-factor">Autenticação de dois fatores</Label>
                    <p className="text-sm text-muted-foreground">
                      Adiciona uma camada extra de segurança ao fazer login
                    </p>
                  </div>
                  <Switch
                    id="two-factor"
                    checked={securitySettings.twoFactor}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactor: checked }))}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline">
                  <Lock className="h-4 w-4 mr-2" />
                  Alterar Senha
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Versão do Aplicativo</CardTitle>
                <CardDescription>Informações sobre esta instalação</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Versão:</span>
                    <span className="text-sm">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Build:</span>
                    <span className="text-sm">2023.07.15</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Dispositivo:</span>
                    <span className="text-sm">{navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Clear Data Confirmation Dialog */}
      <AlertDialog open={isDataClearDialogOpen} onOpenChange={setIsDataClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá remover permanentemente todos os dados armazenados localmente neste dispositivo, 
              incluindo vistorias não sincronizadas, clientes e projetos. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sim, limpar todos os dados
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SettingsPage;
