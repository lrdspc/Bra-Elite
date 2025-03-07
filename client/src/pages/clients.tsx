import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatDocumentNumber, formatPhoneNumber } from '@/lib/utils';
import { Plus, Search, Edit, Trash2, BuildingIcon, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocation } from 'wouter';

const ClientsPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [clientFormData, setClientFormData] = useState({
    id: 0,
    name: '',
    type: 'company', // 'company' or 'person'
    document: '',
    contactName: '',
    contactPhone: '',
    email: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch clients
  const { data: clients, isLoading } = useQuery({
    queryKey: ['/api/clients'],
  });

  // Create client mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/clients', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: 'Cliente criado com sucesso',
        description: 'O cliente foi adicionado à base de dados',
      });
      setIsNewClientDialogOpen(false);
      resetClientForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar cliente',
        description: error.message || 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    },
  });

  // Update client mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('PATCH', `/api/clients/${data.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: 'Cliente atualizado com sucesso',
        description: 'As informações do cliente foram atualizadas',
      });
      setIsNewClientDialogOpen(false);
      resetClientForm();
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar cliente',
        description: error.message || 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    },
  });

  const resetClientForm = () => {
    setClientFormData({
      id: 0,
      name: '',
      type: 'company',
      document: '',
      contactName: '',
      contactPhone: '',
      email: '',
    });
  };

  const handleClientFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClientFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: string) => {
    setClientFormData(prev => ({ ...prev, type: value }));
  };

  const handleNewClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!clientFormData.name.trim()) {
      toast({
        title: 'Dados incompletos',
        description: 'O nome do cliente é obrigatório',
        variant: 'destructive',
      });
      return;
    }
    
    if (isEditing) {
      updateMutation.mutate(clientFormData);
    } else {
      createMutation.mutate(clientFormData);
    }
  };

  const handleEditClient = (client: any) => {
    setClientFormData(client);
    setIsEditing(true);
    setIsNewClientDialogOpen(true);
  };

  // Filter clients based on search term and active tab
  const filteredClients = clients ? clients.filter((client: any) => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (client.document && client.document.includes(searchTerm)) ||
                         (client.contactName && client.contactName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && client.type === activeTab;
  }) : [];

  return (
    <div>
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 md:px-6 md:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Clientes</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes..."
              className="pl-8 w-full sm:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsNewClientDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* Client List */}
      <div className="p-4 md:p-6">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="company">Empresas</TabsTrigger>
              <TabsTrigger value="person">Pessoas Físicas</TabsTrigger>
            </TabsList>
            <div className="text-sm text-muted-foreground">
              {filteredClients.length} cliente(s) encontrado(s)
            </div>
          </div>
          
          <TabsContent value={activeTab} className="mt-0 space-y-4">
            {isLoading ? (
              // Loading state
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="cursor-pointer">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-4 w-36" />
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredClients.length > 0 ? (
              filteredClients.map((client: any) => (
                <Card 
                  key={client.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/clients/${client.id}`)}
                >
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${client.type === 'company' ? 'bg-primary' : 'bg-secondary'}`}>
                          {client.type === 'company' ? <BuildingIcon className="h-5 w-5" /> : <User className="h-5 w-5" />}
                        </div>
                        <div>
                          <h3 className="font-medium">{client.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {client.document ? formatDocumentNumber(client.document) : 'Documento não informado'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-sm">
                        {client.contactName && (
                          <span className="text-muted-foreground">
                            Contato: {client.contactName}
                          </span>
                        )}
                        {client.contactPhone && (
                          <span className="text-muted-foreground">
                            Tel: {formatPhoneNumber(client.contactPhone)}
                          </span>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClient(client);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="py-12 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                  <BuildingIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">Nenhum cliente encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? `Nenhum resultado para "${searchTerm}"` : 'Ainda não há clientes cadastrados'}
                </p>
                <Button onClick={() => setIsNewClientDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Cliente
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* New/Edit Client Dialog */}
      <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleNewClientSubmit}>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Tipo de Cliente</Label>
                <RadioGroup 
                  value={clientFormData.type} 
                  onValueChange={handleTypeChange}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="company" id="company" />
                    <Label htmlFor="company">Pessoa Jurídica</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="person" id="person" />
                    <Label htmlFor="person">Pessoa Física</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <Label htmlFor="name" className="mb-1 block">
                  {clientFormData.type === 'company' ? 'Razão Social' : 'Nome Completo'}
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={clientFormData.name}
                  onChange={handleClientFormChange}
                  placeholder={clientFormData.type === 'company' ? 'Empresa S/A' : 'João da Silva'}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="document" className="mb-1 block">
                  {clientFormData.type === 'company' ? 'CNPJ' : 'CPF'}
                </Label>
                <Input
                  id="document"
                  name="document"
                  value={clientFormData.document}
                  onChange={handleClientFormChange}
                  placeholder={clientFormData.type === 'company' ? '00.000.000/0000-00' : '000.000.000-00'}
                />
              </div>
              
              <div>
                <Label htmlFor="contactName" className="mb-1 block">Nome do Contato</Label>
                <Input
                  id="contactName"
                  name="contactName"
                  value={clientFormData.contactName}
                  onChange={handleClientFormChange}
                  placeholder="Nome do responsável"
                />
              </div>
              
              <div>
                <Label htmlFor="contactPhone" className="mb-1 block">Telefone</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  value={clientFormData.contactPhone}
                  onChange={handleClientFormChange}
                  placeholder="(00) 00000-0000"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="mb-1 block">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={clientFormData.email}
                  onChange={handleClientFormChange}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsNewClientDialogOpen(false);
                  resetClientForm();
                  setIsEditing(false);
                }}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : isEditing ? 'Atualizar Cliente' : 'Criar Cliente'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientsPage;
