import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { Search, Filter, Plus, Clock, CheckCircle, AlertCircle, Clock3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from '@/components/ui/skeleton';

const InspectionsPage: React.FC = () => {
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(() => {
    // Parse status from URL if present
    const params = new URLSearchParams(location.split('?')[1]);
    return params.get('status') || 'all';
  });

  // Fetch inspections
  const { data: inspections, isLoading } = useQuery({
    queryKey: ['/api/inspections'],
  });

  // Filter inspections based on search term and active tab
  const filteredInspections = inspections ? inspections.filter((inspection: any) => {
    const matchesSearch = 
      (inspection.projectName && inspection.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inspection.clientName && inspection.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inspection.protocolNumber && inspection.protocolNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'in_progress') return matchesSearch && inspection.status === 'in_progress';
    if (activeTab === 'completed') return matchesSearch && inspection.status === 'completed';
    if (activeTab === 'pending') return matchesSearch && (inspection.status === 'draft' || inspection.status === 'scheduled');
    if (activeTab === 'in_review') return matchesSearch && inspection.status === 'in_review';
    
    return matchesSearch && inspection.status === activeTab;
  }) : [];

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'in_progress':
        return <Clock3 className="h-5 w-5 text-primary" />;
      case 'in_review':
        return <AlertCircle className="h-5 w-5 text-secondary" />;
      case 'scheduled':
        return <Clock className="h-5 w-5 text-muted-foreground" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 md:px-6 md:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Vistorias</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar vistorias..."
              className="pl-8 w-full sm:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filtrar por Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setActiveTab('all')}>
                  Todos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('in_progress')}>
                  <Clock3 className="h-4 w-4 mr-2 text-primary" />
                  Em andamento
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('completed')}>
                  <CheckCircle className="h-4 w-4 mr-2 text-success" />
                  Concluídas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('in_review')}>
                  <AlertCircle className="h-4 w-4 mr-2 text-secondary" />
                  Em revisão
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('scheduled')}>
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  Agendadas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('draft')}>
                  <AlertCircle className="h-4 w-4 mr-2 text-destructive" />
                  Rascunhos
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/inspection/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Vistoria
            </Button>
          </Link>
        </div>
      </div>

      {/* Inspections List */}
      <div className="p-4 md:p-6">
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="in_progress">Em andamento</TabsTrigger>
              <TabsTrigger value="completed">Concluídas</TabsTrigger>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
            </TabsList>
            <div className="text-sm text-muted-foreground">
              {filteredInspections.length} vistoria(s) encontrada(s)
            </div>
          </div>
          
          <TabsContent value={activeTab} className="mt-0">
            {isLoading ? (
              // Loading state
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-4 w-36" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredInspections.length > 0 ? (
              <div className="space-y-4">
                {filteredInspections.map((inspection: any) => (
                  <Link key={inspection.id} href={`/inspection/${inspection.id}`}>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full flex items-center justify-center">
                              {getStatusIcon(inspection.status)}
                            </div>
                            <div>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <h3 className="font-medium">
                                  {inspection.projectName || `Projeto #${inspection.projectId}`}
                                </h3>
                                <Badge className={getStatusColor(inspection.status)}>
                                  {getStatusLabel(inspection.status)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {inspection.clientName || `Cliente #${inspection.clientId}`}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Protocolo: {inspection.protocolNumber || 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {inspection.scheduledDate ? formatDate(inspection.scheduledDate) : 'Data não agendada'}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {inspection.roofModel || 'Modelo não especificado'}
                            </p>
                            <Button variant="link" className="h-auto p-0 mt-1">
                              {inspection.status === 'completed' ? 'Ver relatório' : 
                               inspection.status === 'in_review' ? 'Revisar' : 'Continuar'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">Nenhuma vistoria encontrada</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? `Nenhum resultado para "${searchTerm}"`
                    : activeTab !== 'all'
                      ? `Não há vistorias com o status "${getStatusLabel(activeTab).toLowerCase()}"`
                      : 'Ainda não há vistorias cadastradas'
                  }
                </p>
                <Link href="/inspection/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Vistoria
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InspectionsPage;
