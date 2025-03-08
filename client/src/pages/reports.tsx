import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatDate } from '@/lib/utils';
import { Calendar, FileDown, Download, FileText, Search, Filter, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ReportsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedReport, setSelectedReport] = useState<any>(null);

  // Fetch completed inspections to generate reports
  const { data: inspections, isLoading } = useQuery<any[]>({
    queryKey: ['/api/inspections'],
  });

  // Filter for completed reports only
  const completedInspections = Array.isArray(inspections) 
    ? inspections.filter((inspection: any) => inspection.status === 'completed') 
    : [];

  // Apply filters
  const filteredReports = completedInspections.filter((report: any) => {
    const matchesSearch = 
      (report.projectName && report.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (report.clientName && report.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (report.protocolNumber && report.protocolNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    // Period filtering
    if (filterPeriod !== 'all') {
      const reportDate = new Date(report.updatedAt || report.createdAt);
      const now = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastThreeMonths = new Date();
      lastThreeMonths.setMonth(lastThreeMonths.getMonth() - 3);
      
      if (filterPeriod === 'month' && reportDate < lastMonth) {
        return false;
      } else if (filterPeriod === 'quarter' && reportDate < lastThreeMonths) {
        return false;
      }
    }

    // Type filtering
    if (filterType !== 'all') {
      if (filterType === 'approved' && report.conclusion !== 'approved') {
        return false;
      } else if (filterType === 'rejected' && report.conclusion !== 'rejected') {
        return false;
      }
    }
    
    return matchesSearch;
  });

  const handleViewReport = (report: any) => {
    setSelectedReport(report);
  };

  const handleDownloadReport = async (report: any) => {
    try {
      // Solicitar a geração do relatório
      const response = await fetch(`/api/inspections/${report.id}/generate-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao gerar relatório');
      }
      
      const data = await response.json();
      console.log('Relatório gerado:', data);
      
      // Normalmente aqui faria o download do arquivo
      // Em um app real, usaríamos algo como:
      // window.open(data.downloadUrl, '_blank');
      
      // Por enquanto, apenas mostramos um alerta
      alert(`Relatório ${report.protocolNumber} gerado com sucesso!`);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert(`Erro ao gerar relatório: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 md:px-6 md:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Relatórios</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar relatórios..."
              className="pl-8 w-full sm:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-t border-neutral-light px-4 py-3 md:px-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtros:</span>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Select value={filterPeriod} onValueChange={setFilterPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os períodos</SelectItem>
              <SelectItem value="month">Último mês</SelectItem>
              <SelectItem value="quarter">Últimos 3 meses</SelectItem>
              <SelectItem value="year">Último ano</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="approved">Procedentes</SelectItem>
              <SelectItem value="rejected">Improcedentes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reports List */}
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Relatórios Disponíveis</h2>
          <div className="text-sm text-muted-foreground">
            {filteredReports.length} relatório(s) encontrado(s)
          </div>
        </div>
        
        {isLoading ? (
          // Loading state
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex justify-between items-center pt-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((report: any) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start mb-2">
                    <FileText className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium">{report.projectName || `Projeto #${report.projectId}`}</h3>
                      <p className="text-sm text-muted-foreground">
                        Cliente: {report.clientName || `Cliente #${report.clientId}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Gerado em: {formatDate(report.updatedAt || report.createdAt)}</span>
                  </div>
                  
                  <p className="text-sm mb-4">
                    <span className="font-medium">Protocolo:</span> {report.protocolNumber}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      report.conclusion === 'approved' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      {report.conclusion === 'approved' ? 'Procedente' : 'Improcedente'}
                    </span>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewReport(report)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadReport(report)}
                      >
                        <Download className="h-4 w-4" />
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
              <FileDown className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">Nenhum relatório encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? `Nenhum resultado para "${searchTerm}"`
                : 'Não há relatórios disponíveis com os filtros selecionados'
              }
            </p>
          </div>
        )}
      </div>

      {/* Report View Modal */}
      {selectedReport && (
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Relatório: {selectedReport.protocolNumber}</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="summary" className="mt-4">
              <TabsList className="mb-4">
                <TabsTrigger value="summary">Resumo</TabsTrigger>
                <TabsTrigger value="details">Detalhes</TabsTrigger>
                <TabsTrigger value="evidences">Evidências</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Informações do Relatório</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-medium">Cliente</h3>
                        <p>{selectedReport.clientName || `Cliente #${selectedReport.clientId}`}</p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium">Empreendimento</h3>
                        <p>{selectedReport.projectName || `Projeto #${selectedReport.projectId}`}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedReport.address}
                          {selectedReport.number && `, ${selectedReport.number}`}
                          {selectedReport.city && ` - ${selectedReport.city}`}
                          {selectedReport.state && `, ${selectedReport.state}`}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium">Data da Vistoria</h3>
                        <p>{formatDate(selectedReport.scheduledDate || selectedReport.createdAt)}</p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium">Status</h3>
                        <div className={`inline-block px-2 py-1 rounded-full text-sm ${
                          selectedReport.conclusion === 'approved' 
                            ? 'bg-success/10 text-success' 
                            : 'bg-destructive/10 text-destructive'
                        }`}>
                          {selectedReport.conclusion === 'approved' ? 'Procedente' : 'Improcedente'}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium">Justificativa</h3>
                        <p className="text-sm">{selectedReport.recommendation || 'Nenhuma justificativa informada'}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      className="mr-2"
                      onClick={() => setSelectedReport(null)}
                    >
                      Fechar
                    </Button>
                    <Button 
                      onClick={() => handleDownloadReport(selectedReport)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Relatório
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Detalhes Técnicos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium">Produto</h3>
                      <p>Modelo: {selectedReport.roofModel || 'Não especificado'}</p>
                      <p>Quantidade: {selectedReport.quantity || 'Não especificado'} unidades</p>
                      <p>Área: {selectedReport.area || 'Não especificado'} m²</p>
                      <p>Data de Instalação: {selectedReport.installationDate ? formatDate(selectedReport.installationDate) : 'Não especificado'}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium">Análise Técnica</h3>
                      {selectedReport.technicalAnalysis && selectedReport.technicalAnalysis.length > 0 ? (
                        <div className="mt-2 space-y-2">
                          {selectedReport.technicalAnalysis.map((item: any, index: number) => (
                            <div key={index} className="p-3 border rounded-md">
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm">{item.description}</p>
                              {item.notes && (
                                <p className="text-sm mt-1 italic border-l-2 border-primary pl-2">
                                  "{item.notes}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhum item de análise registrado</p>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-medium">Recomendações</h3>
                      {selectedReport.recommendations ? (
                        <ul className="list-disc ml-5 mt-2 space-y-1">
                          {selectedReport.recommendations.split(',').map((rec: string, index: number) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhuma recomendação registrada</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="evidences">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Evidências Fotográficas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedReport.evidences && selectedReport.evidences.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedReport.evidences.map((evidence: any, index: number) => (
                          <div key={index} className="overflow-hidden rounded-md border">
                            <div className="aspect-video relative bg-muted">
                              <img 
                                src={evidence.url} 
                                alt={`Evidência ${index + 1}`} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-2">
                              <p className="text-xs font-medium">{evidence.category || 'Sem categoria'}</p>
                              {evidence.notes && (
                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                  {evidence.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Nenhuma evidência registrada para esta vistoria</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ReportsPage;
