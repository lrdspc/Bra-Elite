import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDocumentNumber, formatPhoneNumber } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { isOnline } from '@/lib/pwa';

interface ClientDataStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
}

const ClientDataStep: React.FC<ClientDataStepProps> = ({ formData, updateFormData, onNext }) => {
  const [clientType, setClientType] = useState(formData.clientType || 'company');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [coordinates, setCoordinates] = useState<{lat: string, lng: string} | null>(null);
  const { toast } = useToast();

  // Fetch clients for dropdown
  const { data: clients } = useQuery({
    queryKey: ['/api/clients'],
  });

  // Fetch projects based on selected client
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: [`/api/projects?clientId=${selectedClient?.id}`],
    enabled: !!selectedClient?.id,
  });

  // Load existing data if editing
  useEffect(() => {
    if (formData.clientId && clients) {
      const client = clients.find((c: any) => c.id === formData.clientId);
      if (client) {
        setSelectedClient(client);
        setClientType(client.type);
      }
    }

    if (formData.projectId && projects) {
      const project = projects.find((p: any) => p.id === formData.projectId);
      if (project) {
        setSelectedProject(project);
      }
    }
  }, [formData, clients, projects]);

  // Função para solicitar acesso à geolocalização
  const requestGeolocation = () => {
    setIsLoadingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude.toString(),
            lng: position.coords.longitude.toString()
          });
          setIsLoadingLocation(false);
          
          toast({
            title: "Localização obtida",
            description: "Coordenadas GPS capturadas com sucesso."
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoadingLocation(false);
          
          toast({
            title: "Erro ao obter localização",
            description: error.message || "Verifique se o GPS está ativado e as permissões concedidas.",
            variant: "destructive"
          });
        },
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setIsLoadingLocation(false);
      toast({
        title: "Geolocalização não suportada",
        description: "Seu navegador não suporta geolocalização.",
        variant: "destructive"
      });
    }
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = parseInt(e.target.value);
    if (clientId) {
      const selectedClient = clients.find((c: any) => c.id === clientId);
      setSelectedClient(selectedClient);
      setClientType(selectedClient.type);
      
      // Clear project when client changes
      setSelectedProject(null);
      
      updateFormData({
        clientId,
        clientName: selectedClient.name,
        clientType: selectedClient.type,
        contactName: selectedClient.contactName,
        contactPhone: selectedClient.contactPhone,
        email: selectedClient.email,
        projectId: null,
      });
    } else {
      setSelectedClient(null);
      setSelectedProject(null);
    }
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projectId = parseInt(e.target.value);
    if (projectId) {
      const selectedProject = projects.find((p: any) => p.id === projectId);
      setSelectedProject(selectedProject);
      
      updateFormData({
        projectId,
        projectName: selectedProject.name,
        address: selectedProject.address,
        number: selectedProject.number,
        complement: selectedProject.complement,
        neighborhood: selectedProject.neighborhood,
        city: selectedProject.city,
        state: selectedProject.state,
        zipCode: selectedProject.zipCode,
        latitude: selectedProject.latitude || coordinates?.lat,
        longitude: selectedProject.longitude || coordinates?.lng,
      });
    } else {
      setSelectedProject(null);
    }
  };

  const handleCepSearch = async () => {
    if (!formData.zipCode || formData.zipCode.length < 8) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${formData.zipCode.replace(/\D/g, '')}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        updateFormData({
          address: data.logradouro,
          neighborhood: data.bairro,
          city: data.localidade,
          state: data.uf,
        });
      }
    } catch (error) {
      console.error("Error fetching CEP:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  // Função para obter endereço a partir das coordenadas GPS
  const handleGetLocationAddress = async () => {
    if (!coordinates) {
      toast({
        title: "Localização não disponível",
        description: "Não foi possível obter sua localização atual.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingLocation(true);
    try {
      // Verificar se estamos online
      if (!isOnline()) {
        toast({
          title: "Sem conexão",
          description: "Não é possível obter o endereço sem conexão com a internet.",
          variant: "destructive",
        });
        return;
      }

      // Usar API de geocodificação reversa
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.lat}&lon=${coordinates.lng}&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'pt-BR'
          }
        }
      );
      
      const data = await response.json();
      console.log("Dados de geocodificação reversa:", data);
      
      if (data && data.address) {
        // Extrair informações do endereço
        const { 
          road, street, footway, path, pedestrian, // possíveis nomes para ruas
          house_number, 
          suburb, neighbourhood, 
          city, town, municipality, county, // possíveis nomes para cidade
          state, state_code, // possíveis nomes para estado 
          postcode,
          country_code
        } = data.address;
        
        // Mapear código de estado para sigla brasileira (se necessário)
        let stateCode = '';
        if (country_code === 'br') {
          if (state_code) {
            stateCode = state_code.toUpperCase();
          } else if (state) {
            // Mapeamento de nomes de estados brasileiros para siglas
            const estadoParaSigla: Record<string, string> = {
              'acre': 'AC',
              'alagoas': 'AL',
              'amapá': 'AP',
              'amazonas': 'AM',
              'bahia': 'BA',
              'ceará': 'CE',
              'distrito federal': 'DF',
              'espírito santo': 'ES',
              'goiás': 'GO',
              'maranhão': 'MA',
              'mato grosso': 'MT',
              'mato grosso do sul': 'MS',
              'minas gerais': 'MG',
              'pará': 'PA',
              'paraíba': 'PB',
              'paraná': 'PR',
              'pernambuco': 'PE',
              'piauí': 'PI',
              'rio de janeiro': 'RJ',
              'rio grande do norte': 'RN',
              'rio grande do sul': 'RS',
              'rondônia': 'RO',
              'roraima': 'RR',
              'santa catarina': 'SC',
              'são paulo': 'SP',
              'sergipe': 'SE',
              'tocantins': 'TO'
            };
            
            const stateLower = state.toLowerCase();
            stateCode = estadoParaSigla[stateLower] || '';
          }
        }
        
        // Determinar o endereço da rua (tentando várias propriedades possíveis)
        const streetAddress = road || street || footway || path || pedestrian || '';
        
        // Determinar a cidade (tentando várias propriedades possíveis)
        const cityName = city || town || municipality || county || '';
        
        // Determinar o bairro (tentando várias propriedades possíveis)
        const districtName = neighbourhood || suburb || '';
        
        updateFormData({
          address: streetAddress,
          number: house_number || '',
          neighborhood: districtName,
          city: cityName,
          state: stateCode,
          zipCode: postcode || '',
          latitude: coordinates.lat,
          longitude: coordinates.lng
        });
        
        toast({
          title: "Localização obtida",
          description: "Endereço preenchido com base na sua localização atual.",
        });
      }
    } catch (error) {
      console.error("Error fetching address from coordinates:", error);
      toast({
        title: "Erro ao obter endereço",
        description: "Não foi possível converter sua localização em endereço.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingLocation(false);
    }
  };

  return (
    <>
      <Card className="mb-6">
        <CardContent className="p-4 md:p-6">
          <h2 className="text-lg font-medium mb-4">Informações do Cliente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <Label className="block text-sm font-medium text-muted-foreground mb-1">Tipo de Cliente</Label>
              <RadioGroup 
                value={clientType} 
                onValueChange={(value) => {
                  setClientType(value);
                  updateFormData({ clientType: value });
                }}
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

            <div className="col-span-1 md:col-span-2">
              <Label htmlFor="clientId" className="block text-sm font-medium text-muted-foreground mb-1">
                Selecione um cliente existente
              </Label>
              <select
                id="clientId"
                value={selectedClient?.id || ''}
                onChange={handleClientChange}
                className="w-full px-3 py-2 border border-input rounded-md"
              >
                <option value="">-- Selecione um cliente --</option>
                {clients?.map((client: any) => (
                  <option key={client.id} value={client.id}>
                    {client.name} {client.document ? `(${formatDocumentNumber(client.document)})` : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="clientName" className="block text-sm font-medium text-muted-foreground mb-1">
                {clientType === 'company' ? 'Razão Social' : 'Nome Completo'}
              </Label>
              <Input
                id="clientName"
                name="clientName"
                value={formData.clientName || ''}
                onChange={handleFieldChange}
                placeholder={clientType === 'company' ? 'Empresa S/A' : 'João da Silva'}
              />
            </div>
            
            <div>
              <Label htmlFor="document" className="block text-sm font-medium text-muted-foreground mb-1">
                {clientType === 'company' ? 'CNPJ' : 'CPF'}
              </Label>
              <Input
                id="document"
                name="document"
                value={formData.document || ''}
                onChange={handleFieldChange}
                placeholder={clientType === 'company' ? '00.000.000/0000-00' : '000.000.000-00'}
              />
            </div>
            
            <div>
              <Label htmlFor="contactName" className="block text-sm font-medium text-muted-foreground mb-1">
                Nome do Contato
              </Label>
              <Input
                id="contactName"
                name="contactName"
                value={formData.contactName || ''}
                onChange={handleFieldChange}
                placeholder="Nome do responsável"
              />
            </div>
            
            <div>
              <Label htmlFor="contactPhone" className="block text-sm font-medium text-muted-foreground mb-1">
                Telefone
              </Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                value={formData.contactPhone || ''}
                onChange={handleFieldChange}
                placeholder="(00) 00000-0000"
              />
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <Label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-1">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={handleFieldChange}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="p-4 md:p-6">
          <h2 className="text-lg font-medium mb-4">Endereço do Empreendimento</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="col-span-1 md:col-span-2">
              <Label htmlFor="projectId" className="block text-sm font-medium text-muted-foreground mb-1">
                Empreendimento
              </Label>
              <select
                id="projectId"
                value={selectedProject?.id || ''}
                onChange={handleProjectChange}
                disabled={!selectedClient}
                className="w-full px-3 py-2 border border-input rounded-md"
              >
                <option value="">-- Selecione um empreendimento --</option>
                {projectsLoading ? (
                  <option disabled>Carregando...</option>
                ) : projects?.length ? (
                  projects.map((project: any) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))
                ) : (
                  <option disabled>Nenhum empreendimento disponível</option>
                )}
              </select>
            </div>
            
            <div className="md:col-span-4">
              <Label htmlFor="projectName" className="block text-sm font-medium text-muted-foreground mb-1">
                Nome do Empreendimento
              </Label>
              <Input
                id="projectName"
                name="projectName"
                value={formData.projectName || ''}
                onChange={handleFieldChange}
                placeholder="Nome do local da vistoria"
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="zipCode" className="block text-sm font-medium text-muted-foreground mb-1">
                CEP
              </Label>
              <div className="flex">
                <Input
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode || ''}
                  onChange={handleFieldChange}
                  placeholder="00000-000"
                  className="flex-1 rounded-r-none"
                />
                <Button 
                  onClick={handleCepSearch} 
                  variant="secondary"
                  disabled={isLoading}
                  className="rounded-l-none"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="md:col-span-4">
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor="address" className="block text-sm font-medium text-muted-foreground">
                  Logradouro
                </Label>
                <Button 
                  onClick={handleGetLocationAddress}
                  variant="outline" 
                  size="sm"
                  className="h-8 px-2 text-xs"
                  disabled={isLoadingLocation || !coordinates}
                >
                  {isLoadingLocation ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <MapPin className="h-3 w-3 mr-1" />
                  )}
                  Usar localização atual
                </Button>
              </div>
              <Input
                id="address"
                name="address"
                value={formData.address || ''}
                onChange={handleFieldChange}
                placeholder="Rua, Avenida, etc."
              />
            </div>
            
            <div className="md:col-span-1">
              <Label htmlFor="number" className="block text-sm font-medium text-muted-foreground mb-1">
                Número
              </Label>
              <Input
                id="number"
                name="number"
                value={formData.number || ''}
                onChange={handleFieldChange}
                placeholder="Nº"
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="complement" className="block text-sm font-medium text-muted-foreground mb-1">
                Complemento
              </Label>
              <Input
                id="complement"
                name="complement"
                value={formData.complement || ''}
                onChange={handleFieldChange}
                placeholder="Apto, Bloco, etc."
              />
            </div>
            
            <div className="md:col-span-3">
              <Label htmlFor="neighborhood" className="block text-sm font-medium text-muted-foreground mb-1">
                Bairro
              </Label>
              <Input
                id="neighborhood"
                name="neighborhood"
                value={formData.neighborhood || ''}
                onChange={handleFieldChange}
                placeholder="Bairro"
              />
            </div>
            
            <div className="md:col-span-3">
              <Label htmlFor="city" className="block text-sm font-medium text-muted-foreground mb-1">
                Cidade
              </Label>
              <Input
                id="city"
                name="city"
                value={formData.city || ''}
                onChange={handleFieldChange}
                placeholder="Cidade"
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="state" className="block text-sm font-medium text-muted-foreground mb-1">
                Estado
              </Label>
              <select
                id="state"
                name="state"
                value={formData.state || ''}
                onChange={(e) => updateFormData({ state: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md"
              >
                <option value="">Selecione</option>
                <option value="AC">Acre</option>
                <option value="AL">Alagoas</option>
                <option value="AP">Amapá</option>
                <option value="AM">Amazonas</option>
                <option value="BA">Bahia</option>
                <option value="CE">Ceará</option>
                <option value="DF">Distrito Federal</option>
                <option value="ES">Espírito Santo</option>
                <option value="GO">Goiás</option>
                <option value="MA">Maranhão</option>
                <option value="MT">Mato Grosso</option>
                <option value="MS">Mato Grosso do Sul</option>
                <option value="MG">Minas Gerais</option>
                <option value="PA">Pará</option>
                <option value="PB">Paraíba</option>
                <option value="PR">Paraná</option>
                <option value="PE">Pernambuco</option>
                <option value="PI">Piauí</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="RN">Rio Grande do Norte</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="RO">Rondônia</option>
                <option value="RR">Roraima</option>
                <option value="SC">Santa Catarina</option>
                <option value="SP">São Paulo</option>
                <option value="SE">Sergipe</option>
                <option value="TO">Tocantins</option>
              </select>
            </div>
            
            <div className="md:col-span-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Localização GPS</h3>
                <Button 
                  onClick={requestGeolocation}
                  variant="outline"
                  size="sm"
                  disabled={isLoadingLocation}
                >
                  {isLoadingLocation ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      <span>Obtendo GPS...</span>
                    </>
                  ) : coordinates ? (
                    <>
                      <MapPin className="h-4 w-4 mr-1 text-green-500" />
                      <span>Atualizar localização</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>Obter localização GPS</span>
                    </>
                  )}
                </Button>
              </div>
              
              <div className="rounded-md border border-input overflow-hidden h-48">
                {coordinates ? (
                  <iframe 
                    title="Mapa de Localização"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    src={`https://maps.google.com/maps?q=${formData.latitude || coordinates.lat},${formData.longitude || coordinates.lng}&z=15&output=embed`}
                    allowFullScreen
                  />
                ) : (
                  <div className="bg-muted h-full flex flex-col items-center justify-center">
                    <MapPin className="h-8 w-8 mb-2 text-muted-foreground" />
                    <span className="text-muted-foreground text-center px-4">
                      Clique no botão "Obter localização GPS" para permitir o acesso à sua localização
                    </span>
                  </div>
                )}
              </div>
              
              <div className="mt-2 flex items-center text-sm text-muted-foreground">
                {coordinates ? (
                  <>
                    <MapPin className="h-4 w-4 mr-1 text-green-500" />
                    <span>Localização: {coordinates.lat.substr(0, 8)}, {coordinates.lng.substr(0, 8)}</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-1 text-red-500" />
                    <span>Localização GPS não capturada</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onNext} className="bg-primary text-white py-2 px-6 rounded-md font-medium hover:bg-primary-dark transition">
          Continuar
        </Button>
      </div>
    </>
  );
};

export default ClientDataStep;
