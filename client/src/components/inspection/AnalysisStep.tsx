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
  // Standard list of non-conformities to check - based on Brasilit requirements
  const initialNonConformities: NonConformity[] = [
    { 
      id: 'nc1', 
      name: 'Armazenagem Incorreta', 
      description: 'Telhas estocadas em local inadequado, sem proteção contra intempéries, empilhamento incorreto ou altura excessiva.', 
      severity: 'high' 
    },
    { 
      id: 'nc2', 
      name: 'Carga Permanente sobre as Telhas', 
      description: 'Equipamentos, estruturas ou instalações apoiadas diretamente sobre as telhas, causando sobrecarga não prevista.', 
      severity: 'high' 
    },
    { 
      id: 'nc3', 
      name: 'Corte de Canto Incorreto ou Ausente', 
      description: 'Ausência da remoção do quadrado de 11x11cm nos cantos onde há sobreposição de telhas.', 
      severity: 'medium' 
    },
    { 
      id: 'nc4', 
      name: 'Estrutura Desalinhada', 
      description: 'Terças ou caibros sem alinhamento adequado, comprometendo o assentamento e caimento correto das telhas.', 
      severity: 'high' 
    },
    { 
      id: 'nc5', 
      name: 'Fixação Irregular das Telhas', 
      description: 'Uso de fixadores incompatíveis, quantidade insuficiente ou posicionamento incorreto dos parafusos/ganchos.', 
      severity: 'high' 
    },
    { 
      id: 'nc6', 
      name: 'Inclinação da Telha Inferior ao Recomendado', 
      description: 'Caimento abaixo do mínimo especificado pelo fabricante (15° para onduladas, 10° para estruturais).', 
      severity: 'high' 
    },
    { 
      id: 'nc7', 
      name: 'Marcas de Caminhamento sobre o Telhado', 
      description: 'Evidências de tráfego direto sobre as telhas sem uso de tábuas de distribuição de cargas.', 
      severity: 'medium' 
    },
    { 
      id: 'nc8', 
      name: 'Balanço Livre do Beiral Incorreto', 
      description: 'Distância entre última terça e extremidade da telha fora das especificações (varia conforme o comprimento da telha).', 
      severity: 'medium' 
    },
    { 
      id: 'nc9', 
      name: 'Número de Apoios e Vão Livre Inadequados', 
      description: 'Quantidade insuficiente de apoios ou espaçamento excessivo entre terças (acima do vão máximo permitido).', 
      severity: 'high' 
    },
    { 
      id: 'nc10', 
      name: 'Recobrimento Incorreto', 
      description: 'Sobreposição longitudinal ou lateral insuficiente entre telhas adjacentes, comprometendo a estanqueidade.', 
      severity: 'high' 
    },
    { 
      id: 'nc11', 
      name: 'Sentido de Montagem Incorreto', 
      description: 'Instalação das telhas no sentido contrário ao recomendado em relação aos ventos predominantes.', 
      severity: 'medium' 
    },
    { 
      id: 'nc12', 
      name: 'Uso de Cumeeira Cerâmica', 
      description: 'Utilização de peças cerâmicas incompatíveis com as telhas de fibrocimento.', 
      severity: 'medium' 
    },
    { 
      id: 'nc13', 
      name: 'Uso de Argamassa em Substituição a Peças Complementares', 
      description: 'Aplicação de argamassa em vez do uso de peças específicas Brasilit para vedação e acabamento.', 
      severity: 'medium' 
    },
    { 
      id: 'nc14', 
      name: 'Fixação de Acessórios Complementares Realizada de Forma Inadequada', 
      description: 'Instalação incorreta de rufos, calhas, pingadeiras ou outros acessórios.', 
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
