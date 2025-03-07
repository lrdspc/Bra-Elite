import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Camera, AlertTriangle, AlertCircle, Info, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NonConformity {
  id: string;
  name: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  selected?: boolean;
  notes?: string;
  images?: string[];
}

interface AnalysisStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onPrevious: () => void;
  onNext: () => void;
}

const AnalysisStep: React.FC<AnalysisStepProps> = ({ 
  formData, 
  updateFormData, 
  onPrevious, 
  onNext 
}) => {
  // Standard list of non-conformities to check
  const initialNonConformities: NonConformity[] = [
    { 
      id: 'nc1', 
      name: 'Infiltração', 
      description: 'Sinais de infiltração de água na estrutura ou no telhado', 
      severity: 'high' 
    },
    { 
      id: 'nc2', 
      name: 'Fissuras', 
      description: 'Presença de fissuras ou rachaduras nas telhas', 
      severity: 'medium' 
    },
    { 
      id: 'nc3', 
      name: 'Oxidação', 
      description: 'Sinais de oxidação em componentes metálicos', 
      severity: 'medium' 
    },
    { 
      id: 'nc4', 
      name: 'Deslocamento', 
      description: 'Telhas deslocadas da posição original', 
      severity: 'high' 
    },
    { 
      id: 'nc5', 
      name: 'Fungos/Mofo', 
      description: 'Presença de fungos, mofo ou manchas escuras', 
      severity: 'medium' 
    },
    { 
      id: 'nc6', 
      name: 'Estrutura comprometida', 
      description: 'Problemas na estrutura de suporte do telhado', 
      severity: 'high' 
    },
    { 
      id: 'nc7', 
      name: 'Desgaste', 
      description: 'Desgaste natural do material além do esperado', 
      severity: 'low' 
    },
    { 
      id: 'nc8', 
      name: 'Instalação incorreta', 
      description: 'Problemas decorrentes de instalação inadequada', 
      severity: 'medium' 
    },
    { 
      id: 'nc9', 
      name: 'Danos por impacto', 
      description: 'Danos causados por impacto de objetos ou granizo', 
      severity: 'medium' 
    },
    { 
      id: 'nc10', 
      name: 'Acúmulo de detritos', 
      description: 'Acúmulo excessivo de folhas ou outros detritos', 
      severity: 'low' 
    },
    { 
      id: 'nc11', 
      name: 'Vazamentos', 
      description: 'Vazamentos localizados em junções ou pontos específicos', 
      severity: 'high' 
    },
    { 
      id: 'nc12', 
      name: 'Calhas obstruídas', 
      description: 'Obstrução de calhas e sistemas de drenagem', 
      severity: 'medium' 
    },
    { 
      id: 'nc13', 
      name: 'Ventilação inadequada', 
      description: 'Problemas de ventilação no telhado ou sótão', 
      severity: 'low' 
    },
    { 
      id: 'nc14', 
      name: 'Outros problemas', 
      description: 'Outros problemas identificados durante a vistoria', 
      severity: 'medium' 
    },
  ];

  // Initialize from form data if available
  const [nonConformities, setNonConformities] = useState<NonConformity[]>(() => {
    if (formData.technicalAnalysis && typeof formData.technicalAnalysis === 'object') {
      return initialNonConformities.map(nc => {
        const savedNc = formData.technicalAnalysis.find((item: any) => item.id === nc.id);
        return savedNc ? { ...nc, ...savedNc } : nc;
      });
    }
    return initialNonConformities;
  });

  const [selectedNonConformity, setSelectedNonConformity] = useState<NonConformity | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [tempImage, setTempImage] = useState<string | null>(null);

  const handleNonConformityToggle = (id: string) => {
    setNonConformities(prev => prev.map(nc => 
      nc.id === id ? { ...nc, selected: !nc.selected } : nc
    ));
    
    // Update form data
    const updatedNonConformities = nonConformities.map(nc => 
      nc.id === id ? { ...nc, selected: !nc.selected } : nc
    );
    updateFormData({ technicalAnalysis: updatedNonConformities.filter(nc => nc.selected) });
  };

  const openNonConformityDetail = (nc: NonConformity) => {
    setSelectedNonConformity(nc);
    setNotes(nc.notes || '');
  };

  const saveNonConformityDetail = () => {
    if (!selectedNonConformity) return;
    
    // Update the specific non-conformity
    const updatedNonConformities = nonConformities.map(nc => 
      nc.id === selectedNonConformity.id 
        ? { ...nc, notes, selected: true, images: [...(nc.images || []), ...(tempImage ? [tempImage] : [])] } 
        : nc
    );
    
    setNonConformities(updatedNonConformities);
    setSelectedNonConformity(null);
    setNotes('');
    setTempImage(null);
    
    // Update form data
    updateFormData({ technicalAnalysis: updatedNonConformities.filter(nc => nc.selected) });
  };

  const captureImage = () => {
    // Simulate camera capture with a placeholder
    // In a real app, this would open the device camera
    setTempImage('https://via.placeholder.com/300x200?text=Evidência+Capturada');
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return (
          <Badge variant="destructive" className="ml-2">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Alta
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="warning" className="ml-2 bg-secondary text-white">
            <AlertCircle className="h-3 w-3 mr-1" />
            Média
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="outline" className="ml-2">
            <Info className="h-3 w-3 mr-1" />
            Baixa
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="mb-6">
        <CardContent className="p-4 md:p-6">
          <h2 className="text-lg font-medium mb-4">Análise Técnica</h2>
          
          {selectedNonConformity ? (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-medium">{selectedNonConformity.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedNonConformity.description}</p>
                  {getSeverityBadge(selectedNonConformity.severity)}
                </div>
                <Button variant="outline" size="sm" onClick={() => setSelectedNonConformity(null)}>
                  Voltar
                </Button>
              </div>
              
              <div>
                <Label htmlFor="notes" className="block text-sm font-medium text-muted-foreground mb-1">
                  Observações
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Descreva detalhes sobre esta não-conformidade..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-muted-foreground mb-1">
                  Evidências Fotográficas
                </Label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {selectedNonConformity.images?.map((img, index) => (
                    <div key={index} className="relative rounded-md overflow-hidden h-24">
                      <img src={img} alt={`Evidência ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {tempImage && (
                    <div className="relative rounded-md overflow-hidden h-24">
                      <img src={tempImage} alt="Nova evidência" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={captureImage}
                  className="flex items-center"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Capturar Foto
                </Button>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={saveNonConformityDetail}>
                  Salvar Detalhes
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Selecione as não-conformidades identificadas durante a vistoria:
              </p>
              
              <div className="space-y-2">
                {nonConformities.map((nc) => (
                  <div 
                    key={nc.id} 
                    className={cn(
                      "flex items-start border rounded-md p-3 cursor-pointer",
                      nc.selected ? "border-primary bg-primary/5" : "border-input"
                    )}
                  >
                    <Checkbox
                      id={nc.id}
                      checked={nc.selected || false}
                      onCheckedChange={() => handleNonConformityToggle(nc.id)}
                      className="mt-0.5"
                    />
                    <div className="ml-3 flex-1">
                      <Label 
                        htmlFor={nc.id} 
                        className={cn(
                          "font-medium cursor-pointer flex items-center", 
                          nc.selected ? "text-primary" : ""
                        )}
                      >
                        {nc.name}
                        {getSeverityBadge(nc.severity)}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">{nc.description}</p>
                      
                      {nc.selected && (
                        <div className="mt-2">
                          {nc.notes ? (
                            <p className="text-sm italic border-l-2 border-primary pl-2 mt-1">
                              "{nc.notes}"
                            </p>
                          ) : null}
                          
                          {(nc.images && nc.images.length > 0) ? (
                            <div className="flex mt-2 space-x-2">
                              {nc.images.slice(0, 3).map((img, i) => (
                                <div key={i} className="w-12 h-12 rounded-md overflow-hidden bg-muted">
                                  <img src={img} alt={`Evidência ${i+1}`} className="w-full h-full object-cover" />
                                </div>
                              ))}
                              {nc.images.length > 3 && (
                                <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center text-sm text-muted-foreground">
                                  +{nc.images.length - 3}
                                </div>
                              )}
                            </div>
                          ) : null}
                          
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => openNonConformityDetail(nc)}
                            className="p-0 h-auto mt-1 text-primary"
                          >
                            {nc.notes || nc.images?.length ? "Editar detalhes" : "Adicionar detalhes"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={onPrevious}>
                  Voltar
                </Button>
                <Button onClick={onNext}>
                  Continuar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default AnalysisStep;
