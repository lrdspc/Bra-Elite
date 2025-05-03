import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Plus, Edit, Trash, Save } from 'lucide-react';
import { 
  Template, 
  ReportData, 
  getTemplates, 
  getTemplateById, 
  saveTemplate, 
  deleteTemplate, 
  generateReport, 
  downloadReport 
} from '@/lib/reportGenerator';

interface ReportGeneratorProps {
  inspectionData: any;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ inspectionData }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Load templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const loadedTemplates = await getTemplates();
        setTemplates(loadedTemplates);
        
        // Select the first template by default
        if (loadedTemplates.length > 0 && !selectedTemplateId) {
          setSelectedTemplateId(loadedTemplates[0].id);
        }
      } catch (error) {
        console.error('Error loading templates:', error);
        toast({
          title: 'Erro ao carregar templates',
          description: 'Não foi possível carregar os templates de relatório.',
          variant: 'destructive',
        });
      }
    };
    
    loadTemplates();
  }, []);

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
  };

  // Start creating a new template
  const handleCreateTemplate = () => {
    setIsCreatingTemplate(true);
    setIsEditingTemplate(false);
    setNewTemplateName('Novo Template');
    setNewTemplateContent('');
  };

  // Start editing an existing template
  const handleEditTemplate = async (templateId: string) => {
    try {
      const template = await getTemplateById(templateId);
      if (template) {
        setIsCreatingTemplate(false);
        setIsEditingTemplate(true);
        setNewTemplateName(template.name);
        setNewTemplateContent(template.content);
        setSelectedTemplateId(templateId);
      }
    } catch (error) {
      console.error('Error loading template for editing:', error);
      toast({
        title: 'Erro ao editar template',
        description: 'Não foi possível carregar o template para edição.',
        variant: 'destructive',
      });
    }
  };

  // Save a new or edited template
  const handleSaveTemplate = async () => {
    try {
      if (!newTemplateName.trim()) {
        toast({
          title: 'Nome obrigatório',
          description: 'O template precisa ter um nome.',
          variant: 'destructive',
        });
        return;
      }

      const templateData = {
        name: newTemplateName,
        content: newTemplateContent || '',
      };

      const savedTemplate = await saveTemplate(templateData);
      
      // Update templates list
      setTemplates(prev => {
        if (isEditingTemplate) {
          return prev.map(t => t.id === selectedTemplateId ? savedTemplate : t);
        } else {
          return [...prev, savedTemplate];
        }
      });
      
      setSelectedTemplateId(savedTemplate.id);
      setIsCreatingTemplate(false);
      setIsEditingTemplate(false);
      
      toast({
        title: 'Template salvo',
        description: 'O template foi salvo com sucesso.',
      });
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'Erro ao salvar template',
        description: 'Não foi possível salvar o template.',
        variant: 'destructive',
      });
    }
  };

  // Delete a template
  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm('Tem certeza que deseja excluir este template?')) {
      try {
        await deleteTemplate(templateId);
        
        // Update templates list
        setTemplates(prev => prev.filter(t => t.id !== templateId));
        
        // If the deleted template was selected, select another one
        if (selectedTemplateId === templateId) {
          const remainingTemplates = templates.filter(t => t.id !== templateId);
          if (remainingTemplates.length > 0) {
            setSelectedTemplateId(remainingTemplates[0].id);
          } else {
            setSelectedTemplateId('');
          }
        }
        
        toast({
          title: 'Template excluído',
          description: 'O template foi excluído com sucesso.',
        });
      } catch (error) {
        console.error('Error deleting template:', error);
        toast({
          title: 'Erro ao excluir template',
          description: 'Não foi possível excluir o template.',
          variant: 'destructive',
        });
      }
    }
  };

  // Generate and download a report
  const handleGenerateReport = async () => {
    if (!selectedTemplateId) {
      toast({
        title: 'Selecione um template',
        description: 'Por favor, selecione um template para gerar o relatório.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsGenerating(true);
      
      // Prepare report data from inspection data
      const reportData: ReportData = {
        dataVistoria: inspectionData.scheduledDate ? new Date(inspectionData.scheduledDate).toLocaleDateString('pt-BR') : '',
        dataProtocolo: inspectionData.protocolDate ? new Date(inspectionData.protocolDate).toLocaleDateString('pt-BR') : '',
        cliente: inspectionData.clientName || '',
        empreendimento: inspectionData.projectName || '',
        cidade: inspectionData.city || '',
        estado: inspectionData.state || '',
        endereco: inspectionData.address || '',
        protocolo: inspectionData.protocolNumber || '',
        assunto: inspectionData.subject || '',
        tecnico: inspectionData.technician || '',
        departamento: inspectionData.department || 'Assistência Técnica',
        unidade: inspectionData.unit || 'PR',
        coordenador: inspectionData.coordinator || 'Marlon Weingartner',
        gerente: inspectionData.manager || '',
        regional: inspectionData.region || 'Sul',
        naoConformidades: inspectionData.technicalAnalysis ? 
          inspectionData.technicalAnalysis.map((nc: any) => ({
            id: nc.id,
            name: nc.name,
            description: nc.description,
            notes: nc.notes
          })) : []
      };
      
      // Generate the report
      const reportBlob = await generateReport(selectedTemplateId, reportData);
      
      // Download the report
      const fileName = `Relatório de Vistoria - ${reportData.cliente || 'Cliente'}.docx`;
      downloadReport(reportBlob, fileName);
      
      toast({
        title: 'Relatório gerado',
        description: 'O relatório foi gerado e baixado com sucesso.',
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Erro ao gerar relatório',
        description: 'Não foi possível gerar o relatório.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Gerador de Relatórios</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCreateTemplate}
            disabled={isCreatingTemplate || isEditingTemplate}
          >
            <Plus className="h-4 w-4 mr-1" />
            Novo Template
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="select" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="select" disabled={isCreatingTemplate || isEditingTemplate}>
              Selecionar Template
            </TabsTrigger>
            <TabsTrigger value="edit" disabled={!isCreatingTemplate && !isEditingTemplate}>
              {isCreatingTemplate ? 'Criar Template' : 'Editar Template'}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="select" className="space-y-4">
            {templates.length > 0 ? (
              <>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="template-select">Selecione um Template</Label>
                    <Select 
                      value={selectedTemplateId} 
                      onValueChange={handleTemplateSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedTemplateId && (
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTemplate(selectedTemplateId)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteTemplate(selectedTemplateId)}
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="pt-4 border-t">
                  <Button
                    className="w-full"
                    onClick={handleGenerateReport}
                    disabled={!selectedTemplateId || isGenerating}
                  >
                    {isGenerating ? (
                      <>Gerando relatório...</>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Gerar Relatório DOCX
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    O relatório será gerado com base nos dados da vistoria e no template selecionado.
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum template disponível</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Crie um novo template para começar a gerar relatórios.
                </p>
                <Button onClick={handleCreateTemplate}>
                  <Plus className="h-4 w-4 mr-1" />
                  Criar Template
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="edit" className="space-y-4">
            <div>
              <Label htmlFor="template-name">Nome do Template</Label>
              <Input
                id="template-name"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="Nome do template"
              />
            </div>
            
            <div>
              <Label htmlFor="template-content">Conteúdo do Template (HTML)</Label>
              <Textarea
                id="template-content"
                value={newTemplateContent}
                onChange={(e) => setNewTemplateContent(e.target.value)}
                placeholder="Conteúdo HTML do template com marcadores {variavel}"
                className="min-h-[300px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use marcadores como {'{cliente}'}, {'{dataVistoria}'}, {'{naoConformidades}'} para substituição automática.
              </p>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreatingTemplate(false);
                  setIsEditingTemplate(false);
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveTemplate}>
                <Save className="h-4 w-4 mr-1" />
                Salvar Template
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ReportGenerator;