import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, FileText, Save, RefreshCw, LoaderCircle } from 'lucide-react';

interface ConclusionStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onPrevious: () => void;
  onSaveAsDraft: () => void;
  onFinish: () => void;
  onSubmitForReview: () => void;
  isSaving: boolean;
}

const ConclusionStep: React.FC<ConclusionStepProps> = ({ 
  formData, 
  updateFormData, 
  onPrevious, 
  onSaveAsDraft,
  onFinish,
  onSubmitForReview,
  isSaving
}) => {
  const [conclusion, setConclusion] = useState<string>(formData.conclusion || 'pending');
  const [recommendations, setRecommendations] = useState<string[]>(formData.recommendations ? formData.recommendations.split(',') : []);
  const [justification, setJustification] = useState<string>(formData.recommendation || '');
  const [signature, setSignature] = useState<string | null>(formData.signature || null);
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);

  const recommendationOptions = [
    { id: 'manutenção', label: 'Manutenção preventiva anual' },
    { id: 'substituição', label: 'Substituição parcial de telhas danificadas' },
    { id: 'reparos', label: 'Reparos no sistema de fixação' },
    { id: 'impermeabilização', label: 'Tratamento de impermeabilização' },
    { id: 'calhas', label: 'Limpeza e desobstrução de calhas' },
    { id: 'estrutura', label: 'Reforço na estrutura de apoio' },
  ];

  const handleRecommendationChange = (id: string) => {
    setRecommendations(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
    
    // Update form data
    const updatedRecommendations = recommendations.includes(id)
      ? recommendations.filter(item => item !== id)
      : [...recommendations, id];
    
    updateFormData({ recommendations: updatedRecommendations.join(',') });
  };

  const handleConclusionChange = (value: string) => {
    setConclusion(value);
    updateFormData({ conclusion: value });
  };

  const handleJustificationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJustification(e.target.value);
    updateFormData({ recommendation: e.target.value });
  };

  // Canvas signature methods
  const initializeCanvas = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    
    setCanvasRef(canvas);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#000';
    }
    
    // If we have an existing signature, load it
    if (signature) {
      const img = new Image();
      img.onload = () => {
        ctx?.drawImage(img, 0, 0);
      };
      img.src = signature;
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    
    const canvas = canvasRef;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    setLastX(clientX - rect.left);
    setLastY(clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef) return;
    
    const ctx = canvasRef.getContext('2d');
    if (!ctx) return;
    
    const rect = canvasRef.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      
      // Prevent scrolling while drawing
      e.preventDefault();
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    setLastX(x);
    setLastY(y);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    
    if (canvasRef) {
      // Save the signature as data URL
      const dataUrl = canvasRef.toDataURL();
      setSignature(dataUrl);
      updateFormData({ signature: dataUrl });
    }
  };

  const clearSignature = () => {
    if (!canvasRef) return;
    
    const ctx = canvasRef.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
    }
    
    setSignature(null);
    updateFormData({ signature: null });
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4 md:p-6">
        <h2 className="text-lg font-medium mb-4">Conclusão e Avaliação</h2>
        
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium text-muted-foreground mb-2">
              Conclusão da Vistoria
            </Label>
            
            <RadioGroup 
              value={conclusion} 
              onValueChange={handleConclusionChange}
              className="space-y-3"
            >
              <div className={cn(
                "flex items-start p-3 rounded-md border",
                conclusion === "approved" ? "border-success bg-success/5" : "border-input"
              )}>
                <RadioGroupItem 
                  value="approved" 
                  id="approved" 
                  className={conclusion === "approved" ? "text-success" : ""}
                />
                <div className="ml-3">
                  <Label htmlFor="approved" className={cn(
                    "font-medium flex items-center",
                    conclusion === "approved" ? "text-success" : ""
                  )}>
                    <CheckCircle className={cn(
                      "h-4 w-4 mr-2",
                      conclusion === "approved" ? "text-success" : "text-muted-foreground"
                    )} />
                    Procedente
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    A vistoria identificou problemas cobertos pela garantia do produto
                  </p>
                </div>
              </div>
              
              <div className={cn(
                "flex items-start p-3 rounded-md border",
                conclusion === "rejected" ? "border-destructive bg-destructive/5" : "border-input"
              )}>
                <RadioGroupItem 
                  value="rejected" 
                  id="rejected" 
                  className={conclusion === "rejected" ? "text-destructive" : ""}
                />
                <div className="ml-3">
                  <Label htmlFor="rejected" className={cn(
                    "font-medium flex items-center",
                    conclusion === "rejected" ? "text-destructive" : ""
                  )}>
                    <XCircle className={cn(
                      "h-4 w-4 mr-2",
                      conclusion === "rejected" ? "text-destructive" : "text-muted-foreground"
                    )} />
                    Improcedente
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    A vistoria não identificou problemas cobertos pela garantia
                  </p>
                </div>
              </div>
              
              <div className={cn(
                "flex items-start p-3 rounded-md border",
                conclusion === "pending" ? "border-primary bg-primary/5" : "border-input"
              )}>
                <RadioGroupItem 
                  value="pending" 
                  id="pending" 
                  className={conclusion === "pending" ? "text-primary" : ""}
                />
                <div className="ml-3">
                  <Label htmlFor="pending" className={cn(
                    "font-medium flex items-center",
                    conclusion === "pending" ? "text-primary" : ""
                  )}>
                    <FileText className={cn(
                      "h-4 w-4 mr-2",
                      conclusion === "pending" ? "text-primary" : "text-muted-foreground"
                    )} />
                    Análise Pendente
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Requer análise técnica adicional para determinar procedência
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Label htmlFor="justification" className="block text-sm font-medium text-muted-foreground mb-2">
              Justificativa da Conclusão
            </Label>
            <Textarea
              id="justification"
              placeholder="Descreva os motivos da conclusão..."
              value={justification}
              onChange={handleJustificationChange}
              className="min-h-[120px]"
            />
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-muted-foreground mb-2">
              Recomendações ao Cliente
            </Label>
            
            <div className="space-y-2 border rounded-md p-3">
              {recommendationOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={option.id} 
                    checked={recommendations.includes(option.id)}
                    onCheckedChange={() => handleRecommendationChange(option.id)}
                  />
                  <Label htmlFor={option.id} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-muted-foreground mb-2">
              Assinatura do Cliente
            </Label>
            
            <div className="border border-input rounded-md overflow-hidden">
              <canvas 
                width={500}
                height={200}
                ref={initializeCanvas}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full bg-white touch-none cursor-crosshair"
              />
            </div>
            
            <div className="flex justify-end mt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearSignature}
              >
                Limpar Assinatura
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="bg-muted p-3 rounded-md">
              <h3 className="font-medium mb-2">Resumo da Vistoria</h3>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Cliente:</span> {formData.clientName || 'Não informado'}
                </div>
                <div>
                  <span className="text-muted-foreground">Local:</span> {formData.projectName || 'Não informado'}
                </div>
                <div>
                  <span className="text-muted-foreground">Produto:</span> {formData.roofModel || 'Não informado'}
                </div>
                <div>
                  <span className="text-muted-foreground">Não-conformidades:</span> {formData.technicalAnalysis?.length || 0} identificadas
                </div>
                <div>
                  <span className="text-muted-foreground">Evidências:</span> {formData.evidences?.length || 0} registradas
                </div>
                <div>
                  <span className="text-muted-foreground">Conclusão:</span> {
                    conclusion === 'approved' ? 'Procedente' : 
                    conclusion === 'rejected' ? 'Improcedente' : 
                    'Análise Pendente'
                  }
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={onPrevious}
                disabled={isSaving}
              >
                Voltar
              </Button>
              
              <Button 
                variant="outline" 
                onClick={onSaveAsDraft}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Rascunho
              </Button>
              
              <Button 
                variant="secondary" 
                onClick={onSubmitForReview}
                disabled={isSaving}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Enviar para Revisão
              </Button>
              
              <Button 
                onClick={onFinish}
                disabled={isSaving}
              >
                {isSaving ? (
                  <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Finalizar Vistoria
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConclusionStep;
