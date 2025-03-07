import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Plus, Search, Edit, Building, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ProjectsPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [projectFormData, setProjectFormData] = useState({
    id: 0,
    clientId: 0,
    name: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    latitude: '',
    longitude: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  // Fetch projects and clients
  const { data: projects, isLoading } = useQuery({
    queryKey: ['/api/projects'],
  });

  const { data: clients } = useQuery({
    queryKey: ['/api/clients'],
  });

  // Create project mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/projects', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: 'Empreendimento criado com sucesso',
        description: 'O empreendimento foi adicionado à base de dados',
      });
      setIsNewProjectDialogOpen(false);
      resetProjectForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar empreendimento',
        description: error.message || 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    },
  });

  // Update project mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('PATCH', `/api/projects/${data.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: 'Empreendimento atualizado com sucesso',
        description: 'As informações do empreendimento foram atualizadas',
      });
      setIsNewProjectDialogOpen(false);
      resetProjectForm();
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar empreendimento',
        description: error.message || 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    },
  });

  const resetProjectForm = () => {
    setProjectFormData({
      id: 0,
      clientId: 0,
      name: '',
      address: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      latitude: '',
      longitude: '',
    });
  };

  const handleProjectFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProjectFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClientChange = (value: string) => {
    setProjectFormData(prev => ({ ...prev, clientId: parseInt(value) }));
  };

  const handleStateChange = (value: string) => {
    setProjectFormData(prev => ({ ...prev, state: value }));
  };

  const handleNewProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!projectFormData.name.trim() || !projectFormData.clientId) {
      toast({
        title: 'Dados incompletos',
        description: 'Nome do empreendimento e cliente são obrigatórios',
        variant: 'destructive',
      });
      return;
    }
    
    if (isEditing) {
      updateMutation.mutate({
        ...projectFormData,
        clientId: Number(projectFormData.clientId)
      });
    } else {
      createMutation.mutate({
        ...projectFormData,
        clientId: Number(projectFormData.clientId)
      });
    }
  };

  const handleEditProject = (project: any) => {
    setProjectFormData({
      ...project,
      clientId: project.clientId
    });
    setIsEditing(true);
    setIsNewProjectDialogOpen(true);
  };

  const handleCepSearch = async () => {
    if (!projectFormData.zipCode || projectFormData.zipCode.length < 8) {
      toast({
        title: 'CEP inválido',
        description: 'Por favor, informe um CEP válido',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${projectFormData.zipCode.replace(/\D/g, '')}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        throw new Error('CEP não encontrado');
      }
      
      setProjectFormData(prev => ({
        ...prev,
        address: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf,
      }));
    } catch (error) {
      toast({
        title: 'Erro ao buscar CEP',
        description: 'Não foi possível localizar o endereço',
        variant: 'destructive',
      });
    }
  };

  // Filter projects based on search term
  const filteredProjects = projects ? projects.filter((project: any) => {
    return project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           project.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
           project.city.toLowerCase().includes(searchTerm.toLowerCase());
  }) : [];

  // Brazil states for select
  const brazilStates = [
    { value: 'AC', label: 'Acre' },
    { value: 'AL', label: 'Alagoas' },
    { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' },
    { value: 'BA', label: 'Bahia' },
    { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' },
    { value: 'ES', label: 'Espírito Santo' },
    { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' },
    { value: 'MT', label: 'Mato Grosso' },
    { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'PA', label: 'Pará' },
    { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'RN', label: 'Rio Grande do Norte' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' },
    { value: 'RR', label: 'Roraima' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'SE', label: 'Sergipe' },
    { value: 'TO', label: 'Tocantins' }
  ];

  // Find client name by ID
  const getClientName = (clientId: number) => {
    if (!clients) return 'Carregando...';
    const client = clients.find((c: any) => c.id === clientId);
    return client ? client.name : 'Cliente não encontrado';
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 md:px-6 md:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Empreendimentos</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar empreendimentos..."
              className="pl-8 w-full sm:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsNewProjectDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Empreendimento
          </Button>
        </div>
      </div>

      {/* Project List */}
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Lista de Empreendimentos</h2>
          <div className="text-sm text-muted-foreground">
            {filteredProjects.length} empreendimento(s) encontrado(s)
          </div>
        </div>
        
        {isLoading ? (
          // Loading state
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
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
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="space-y-4">
            {filteredProjects.map((project: any) => (
              <Card 
                key={project.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
                        <Building className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">{project.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Cliente: {getClientName(project.clientId)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        {project.address && project.number 
                          ? `${project.address}, ${project.number}` 
                          : project.address || 'Endereço não informado'}
                        {project.city && ` - ${project.city}`}
                        {project.state && `, ${project.state}`}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProject(project);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
              <Building className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">Nenhum empreendimento encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? `Nenhum resultado para "${searchTerm}"` : 'Ainda não há empreendimentos cadastrados'}
            </p>
            <Button onClick={() => setIsNewProjectDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Empreendimento
            </Button>
          </div>
        )}
      </div>

      {/* New/Edit Project Dialog */}
      <Dialog open={isNewProjectDialogOpen} onOpenChange={setIsNewProjectDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Empreendimento' : 'Novo Empreendimento'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleNewProjectSubmit}>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <Label htmlFor="clientId" className="mb-1 block">Cliente</Label>
                <Select 
                  value={projectFormData.clientId.toString()} 
                  onValueChange={handleClientChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.map((client: any) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="name" className="mb-1 block">Nome do Empreendimento</Label>
                <Input
                  id="name"
                  name="name"
                  value={projectFormData.name}
                  onChange={handleProjectFormChange}
                  placeholder="Nome do local da vistoria"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-4 sm:col-span-2">
                  <Label htmlFor="zipCode" className="mb-1 block">CEP</Label>
                  <div className="flex">
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={projectFormData.zipCode}
                      onChange={handleProjectFormChange}
                      placeholder="00000-000"
                      className="rounded-r-none"
                    />
                    <Button 
                      type="button" 
                      onClick={handleCepSearch} 
                      variant="secondary"
                      className="rounded-l-none"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="col-span-4 sm:col-span-2">
                  <Label htmlFor="address" className="mb-1 block">Logradouro</Label>
                  <Input
                    id="address"
                    name="address"
                    value={projectFormData.address}
                    onChange={handleProjectFormChange}
                    placeholder="Rua, Avenida, etc."
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <Label htmlFor="number" className="mb-1 block">Número</Label>
                  <Input
                    id="number"
                    name="number"
                    value={projectFormData.number}
                    onChange={handleProjectFormChange}
                    placeholder="Nº"
                  />
                </div>
                
                <div className="col-span-3">
                  <Label htmlFor="complement" className="mb-1 block">Complemento</Label>
                  <Input
                    id="complement"
                    name="complement"
                    value={projectFormData.complement}
                    onChange={handleProjectFormChange}
                    placeholder="Apto, Bloco, etc."
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-4 sm:col-span-2">
                  <Label htmlFor="neighborhood" className="mb-1 block">Bairro</Label>
                  <Input
                    id="neighborhood"
                    name="neighborhood"
                    value={projectFormData.neighborhood}
                    onChange={handleProjectFormChange}
                    placeholder="Bairro"
                  />
                </div>
                
                <div className="col-span-4 sm:col-span-2">
                  <Label htmlFor="city" className="mb-1 block">Cidade</Label>
                  <Input
                    id="city"
                    name="city"
                    value={projectFormData.city}
                    onChange={handleProjectFormChange}
                    placeholder="Cidade"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-4 sm:col-span-2">
                  <Label htmlFor="state" className="mb-1 block">Estado</Label>
                  <Select 
                    value={projectFormData.state} 
                    onValueChange={handleStateChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {brazilStates.map((state) => (
                        <SelectItem key={state.value} value={state.value}>
                          {state.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <Label htmlFor="latitude" className="mb-1 block">Latitude</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    value={projectFormData.latitude}
                    onChange={handleProjectFormChange}
                    placeholder="Ex: -23.5505"
                  />
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <Label htmlFor="longitude" className="mb-1 block">Longitude</Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    value={projectFormData.longitude}
                    onChange={handleProjectFormChange}
                    placeholder="Ex: -46.6333"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsNewProjectDialogOpen(false);
                  resetProjectForm();
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
                ) : isEditing ? 'Atualizar Empreendimento' : 'Criar Empreendimento'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsPage;
