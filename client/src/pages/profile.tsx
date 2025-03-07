import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Phone, Building, MapPin, Edit, Camera, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ProfilePage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '(11) 98765-4321', // Example data
    company: 'Brasilit',
    jobTitle: 'Técnico Vistoriador',
    address: 'Av. das Nações Unidas, 14171',
    city: 'São Paulo',
    state: 'SP'
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    
    // In a real app, this would call an API to update the profile
    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
      
      setIsEditingProfile(false);
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar seu perfil. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 md:px-6 md:py-4">
        <h1 className="text-xl font-bold">Meu Perfil</h1>
      </div>

      {/* Profile Content */}
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
            <div className="relative">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-md"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-primary text-white flex items-center justify-center text-4xl font-semibold border-4 border-white shadow-md">
                  {getInitials(user?.name || '')}
                </div>
              )}
              <Button 
                variant="outline" 
                size="icon" 
                className="absolute bottom-0 right-0 rounded-full bg-white shadow-sm h-8 w-8"
                onClick={() => toast({
                  title: "Funcionalidade não implementada",
                  description: "A alteração de foto de perfil será disponibilizada em breve.",
                })}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-center md:text-left md:flex-1">
              <h2 className="text-2xl font-bold">{user?.name}</h2>
              <p className="text-muted-foreground">{profileData.jobTitle} em {profileData.company}</p>
              <p className="flex items-center justify-center md:justify-start mt-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 mr-1" />
                {user?.email}
              </p>
              <p className="flex items-center justify-center md:justify-start mt-1 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 mr-1" />
                {profileData.phone}
              </p>
            </div>
            
            <div>
              <Button 
                variant={isEditingProfile ? "secondary" : "outline"} 
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                disabled={isSaving}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditingProfile ? "Cancelar" : "Editar Perfil"}
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="info">
                <User className="h-4 w-4 mr-2" />
                Informações Pessoais
              </TabsTrigger>
              <TabsTrigger value="activity">
                <Building className="h-4 w-4 mr-2" />
                Atividades Recentes
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="info">
              {isEditingProfile ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Editar Informações</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input 
                          id="name" 
                          name="name" 
                          value={profileData.name} 
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          value={profileData.email} 
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input 
                          id="phone" 
                          name="phone" 
                          value={profileData.phone} 
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jobTitle">Cargo</Label>
                        <Input 
                          id="jobTitle" 
                          name="jobTitle" 
                          value={profileData.jobTitle} 
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Empresa</Label>
                        <Input 
                          id="company" 
                          name="company" 
                          value={profileData.company} 
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Endereço</Label>
                        <Input 
                          id="address" 
                          name="address" 
                          value={profileData.address} 
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">Cidade</Label>
                        <Input 
                          id="city" 
                          name="city" 
                          value={profileData.city} 
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">Estado</Label>
                        <Input 
                          id="state" 
                          name="state" 
                          value={profileData.state} 
                          onChange={handleProfileChange}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={isSaving}
                      className="ml-auto"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        Informações Pessoais
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Nome Completo</p>
                          <p>{profileData.name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Email</p>
                          <p>{profileData.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                          <p>{profileData.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Cargo</p>
                          <p>{profileData.jobTitle}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Building className="h-5 w-5 mr-2" />
                        Informações Profissionais
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Empresa</p>
                          <p>{profileData.company}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Endereço</p>
                          <p>{profileData.address}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Cidade/Estado</p>
                          <p>{profileData.city}, {profileData.state}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Atividades Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="border-l-2 border-primary pl-4 pb-6 relative">
                      <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1"></div>
                      <p className="text-sm font-medium">Vistoria concluída</p>
                      <p className="text-sm text-muted-foreground mt-1">Condomínio Solar das Flores - São Paulo, SP</p>
                      <p className="text-xs text-muted-foreground mt-1">Hoje, 14:30</p>
                    </div>
                    
                    <div className="border-l-2 border-neutral-light pl-4 pb-6 relative">
                      <div className="absolute w-3 h-3 bg-neutral-light rounded-full -left-[7px] top-1"></div>
                      <p className="text-sm font-medium">Cliente adicionado</p>
                      <p className="text-sm text-muted-foreground mt-1">Residencial Vila Nova</p>
                      <p className="text-xs text-muted-foreground mt-1">Ontem, 09:45</p>
                    </div>
                    
                    <div className="border-l-2 border-neutral-light pl-4 pb-6 relative">
                      <div className="absolute w-3 h-3 bg-neutral-light rounded-full -left-[7px] top-1"></div>
                      <p className="text-sm font-medium">Relatório gerado</p>
                      <p className="text-sm text-muted-foreground mt-1">Escola Municipal Monteiro Lobato - Protocolo #VT-2023-0780</p>
                      <p className="text-xs text-muted-foreground mt-1">20/04/2023, 16:15</p>
                    </div>
                    
                    <div className="border-l-2 border-neutral-light pl-4 relative">
                      <div className="absolute w-3 h-3 bg-neutral-light rounded-full -left-[7px] top-1"></div>
                      <p className="text-sm font-medium">Login realizado</p>
                      <p className="text-xs text-muted-foreground mt-1">20/04/2023, 08:30</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
