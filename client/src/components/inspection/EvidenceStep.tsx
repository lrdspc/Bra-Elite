import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Camera, X, Pencil, Image, Upload, Trash2, Circle, Square, ArrowUp, Type, Undo } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { useMobile } from '@/hooks/use-mobile';

interface Annotation {
  type: 'arrow' | 'circle' | 'rectangle' | 'text';
  x: number;
  y: number;
  width?: number;
  height?: number;
  endX?: number; // Para setas: posição final X
  endY?: number; // Para setas: posição final Y
  text?: string;
  color: string;
  size: number;
  isPlacing?: boolean; // Estado para indicar que está no modo de colocação inicial
}

interface EvidenceImage {
  id: string;
  url: string;
  category: string;
  notes?: string;
  annotations?: Annotation[];
}

interface EvidenceStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onPrevious: () => void;
  onNext: () => void;
}

const EvidenceStep: React.FC<EvidenceStepProps> = ({ 
  formData, 
  updateFormData, 
  onPrevious, 
  onNext 
}) => {
  // Initialize from form data or with empty array
  const [evidences, setEvidences] = useState<EvidenceImage[]>(() => {
    if (formData.evidences && Array.isArray(formData.evidences)) {
      return formData.evidences;
    }
    return [];
  });

  const [activeTab, setActiveTab] = useState('all');
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<EvidenceImage | null>(null);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('geral');
  const [currentNotes, setCurrentNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Annotation feature states
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [annotationTool, setAnnotationTool] = useState<'arrow' | 'circle' | 'rectangle' | 'text'>('arrow');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [annotationColor, setAnnotationColor] = useState('#EE1B24'); // Cor padrão Brasilit
  const [annotationSize, setAnnotationSize] = useState(3); // Tamanho padrão
  const [annotationText, setAnnotationText] = useState('');
  const [isAddingText, setIsAddingText] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  
  // Estados para o modo interativo (arrastar e soltar)
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [dragEndPos, setDragEndPos] = useState({ x: 0, y: 0 });
  const [activeAnnotationIndex, setActiveAnnotationIndex] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [tempAnnotation, setTempAnnotation] = useState<Annotation | null>(null);
  
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobile();

  const categories = [
    { id: 'geral', name: 'Geral' },
    { id: 'telhado', name: 'Telhado' },
    { id: 'estrutura', name: 'Estrutura' },
    { id: 'infiltracao', name: 'Infiltração' },
    { id: 'instalacao', name: 'Instalação' },
    { id: 'outros', name: 'Outros' }
  ];

  const filteredEvidences = activeTab === 'all' 
    ? evidences 
    : evidences.filter(ev => ev.category === activeTab);

  const captureImage = () => {
    // In a real app, this would access the device camera
    // For our demo, we'll simulate it with a placeholder
    const newImage: EvidenceImage = {
      id: `evidence-${Date.now()}`,
      url: `https://via.placeholder.com/800x600?text=Evidência+${evidences.length + 1}`,
      category: currentCategory,
      notes: currentNotes
    };
    
    const updatedEvidences = [...evidences, newImage];
    setEvidences(updatedEvidences);
    updateFormData({ evidences: updatedEvidences });
    
    // Reset state
    setIsCapturing(false);
    setCurrentNotes('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // In a real app, you would upload the file to a server
      // For our demo, we'll use a placeholder URL
      
      const newImage: EvidenceImage = {
        id: `evidence-${Date.now()}`,
        url: URL.createObjectURL(file), // This creates a temporary URL in memory
        category: currentCategory,
        notes: currentNotes
      };
      
      const updatedEvidences = [...evidences, newImage];
      setEvidences(updatedEvidences);
      updateFormData({ evidences: updatedEvidences });
      
      // Reset state
      setCurrentNotes('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const deleteImage = (id: string) => {
    const updatedEvidences = evidences.filter(ev => ev.id !== id);
    setEvidences(updatedEvidences);
    updateFormData({ evidences: updatedEvidences });
  };

  const updateImageDetails = () => {
    if (!selectedImage) return;
    
    const updatedEvidences = evidences.map(ev => 
      ev.id === selectedImage.id 
        ? { ...ev, category: currentCategory, notes: currentNotes } 
        : ev
    );
    
    setEvidences(updatedEvidences);
    updateFormData({ evidences: updatedEvidences });
    setIsEditingImage(false);
    setSelectedImage(null);
  };

  const handleEditImage = (evidence: EvidenceImage) => {
    setSelectedImage(evidence);
    setCurrentCategory(evidence.category);
    setCurrentNotes(evidence.notes || '');
    setIsEditingImage(true);
  };

  const handleViewImage = (evidence: EvidenceImage) => {
    setSelectedImage(evidence);
    // Se a imagem tiver anotações, carregue-as
    if (evidence.annotations && evidence.annotations.length > 0) {
      setAnnotations(evidence.annotations);
    } else {
      setAnnotations([]);
    }
    // Resetar modo de anotação
    setIsAnnotating(false);
  };
  
  // Funções para anotações
  const startAnnotating = () => {
    setIsAnnotating(true);
  };

  const cancelAnnotating = () => {
    setIsAnnotating(false);
    // Recarregar anotações originais
    if (selectedImage?.annotations) {
      setAnnotations(selectedImage.annotations);
    } else {
      setAnnotations([]);
    }
  };

  const saveAnnotations = () => {
    if (!selectedImage) return;
    
    const updatedEvidences = evidences.map(ev => 
      ev.id === selectedImage.id 
        ? { ...ev, annotations: annotations } 
        : ev
    );
    
    setEvidences(updatedEvidences);
    updateFormData({ evidences: updatedEvidences });
    setIsAnnotating(false);
  };
  
  // Função para obter coordenadas percentuais relativas ao contêiner da imagem
  const getRelativeCoordinates = (clientX: number, clientY: number) => {
    if (!imageContainerRef.current) return { x: 0, y: 0 };
    
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100; // Coordenadas percentuais
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    return { x, y };
  };
  
  // Tratar cliques para colocação de anotações - sistema de dois cliques
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnnotating || !imageContainerRef.current) return;
    
    // Sempre impedir comportamento padrão quando estamos no modo anotação
    e.preventDefault();
    e.stopPropagation();
    
    // Obter coordenadas relativas no contêiner da imagem
    const { x, y } = getRelativeCoordinates(e.clientX, e.clientY);
    
    // Tratamento especial para texto
    if (annotationTool === 'text') {
      setIsAddingText(true);
      setTextPosition({ x, y });
      setAnnotationText('');
      return;
    }
    
    // Criação de anotações usando o sistema de dois cliques
    if (!tempAnnotation) {
      // Primeiro clique - Criar uma anotação inicial
      console.log("Primeiro clique em", x, y);
      
      // Criar uma nova anotação temporária
      const initialAnnotation: Annotation = {
        type: annotationTool,
        x: x,
        y: y,
        color: annotationColor,
        size: annotationSize,
        width: 10, // Tamanho inicial para visualização
        height: 10,
        isPlacing: true,
        ...(annotationTool === 'arrow' && { endX: x + 10, endY: y + 10 })
      };
      
      setTempAnnotation(initialAnnotation);
    } else {
      // Segundo clique - finalizar a anotação
      if (tempAnnotation.isPlacing) {
        console.log("Segundo clique em", x, y);
        
        // Calcular a anotação final baseada no tipo e nas coordenadas
        let finalAnnotation: Annotation = { ...tempAnnotation, isPlacing: false };
        
        if (annotationTool === 'arrow') {
          finalAnnotation = {
            ...finalAnnotation,
            endX: x,
            endY: y
          };
        } else if (annotationTool === 'circle') {
          // Para círculo, calculamos o raio baseado na distância
          const deltaX = Math.abs(x - tempAnnotation.x);
          const deltaY = Math.abs(y - tempAnnotation.y);
          const radius = Math.max(deltaX, deltaY);
          
          finalAnnotation = {
            ...finalAnnotation,
            width: radius * 2,
            height: radius * 2
          };
        } else if (annotationTool === 'rectangle') {
          // Para retângulo, calculamos a largura e altura
          const width = Math.abs(x - tempAnnotation.x);
          const height = Math.abs(y - tempAnnotation.y);
          
          finalAnnotation = {
            ...finalAnnotation,
            width: width,
            height: height
          };
        }
        
        // Adicionar à lista de anotações
        setAnnotations([...annotations, finalAnnotation]);
        
        // Limpar a anotação temporária
        setTempAnnotation(null);
      }
    }
  };
  
  const addTextAnnotation = () => {
    if (!annotationText.trim()) {
      setIsAddingText(false);
      return;
    }
    
    const newAnnotation: Annotation = {
      type: 'text',
      x: textPosition.x,
      y: textPosition.y,
      text: annotationText,
      color: annotationColor,
      size: annotationSize
    };
    
    setAnnotations([...annotations, newAnnotation]);
    setIsAddingText(false);
  };
  
  const removeLastAnnotation = () => {
    if (annotations.length > 0) {
      setAnnotations(annotations.slice(0, -1));
    }
  };

  return (
    <>
      <Card className="mb-6">
        <CardContent className="p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Evidências</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCapturing(true)}
              >
                <Camera className="h-4 w-4 mr-2" />
                Capturar Foto
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start mb-4 overflow-x-auto flex-nowrap">
              <TabsTrigger value="all" className="min-w-[80px]">Todas</TabsTrigger>
              {categories.map(category => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="min-w-[80px]"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-0">
              {filteredEvidences.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {filteredEvidences.map((evidence) => (
                    <div 
                      key={evidence.id} 
                      className="relative group border border-input rounded-md overflow-hidden"
                    >
                      <div 
                        className="aspect-[4/3] bg-muted cursor-pointer"
                        onClick={() => handleViewImage(evidence)}
                      >
                        <img 
                          src={evidence.url} 
                          alt="Evidência" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="absolute p-1 text-[10px] font-medium bg-black/60 text-white bottom-0 left-0 right-0">
                        {categories.find(c => c.id === evidence.category)?.name || 'Geral'}
                      </div>
                      
                      <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-7 w-7 bg-white/80 hover:bg-white"
                          onClick={() => handleEditImage(evidence)}
                        >
                          <Pencil className="h-3.5 w-3.5 text-foreground" />
                        </Button>
                        
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => deleteImage(evidence.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      
                      {evidence.notes && (
                        <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-input rounded-md p-8 flex flex-col items-center justify-center text-center">
                  <Image className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground mb-1">Nenhuma evidência adicionada</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Capture fotos ou faça upload de imagens para documentar a vistoria
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCapturing(true)}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Capturar Foto
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Voltar
        </Button>
        <Button onClick={onNext}>
          Continuar
        </Button>
      </div>

      {/* Photo Capture Dialog */}
      <Dialog open={isCapturing} onOpenChange={setIsCapturing}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Capturar Evidência</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="aspect-[4/3] bg-muted rounded-md flex items-center justify-center">
              <Camera className="h-10 w-10 text-muted-foreground" />
              {/* In a real app, this would show the camera preview */}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <select
                id="category"
                value={currentCategory}
                onChange={(e) => setCurrentCategory(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <textarea
                id="notes"
                value={currentNotes}
                onChange={(e) => setCurrentNotes(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md min-h-[80px] resize-none"
                placeholder="Adicione observações sobre esta evidência..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCapturing(false)}>
              Cancelar
            </Button>
            <Button onClick={captureImage}>
              Capturar Foto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Image Dialog */}
      <Dialog open={isEditingImage} onOpenChange={setIsEditingImage}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Evidência</DialogTitle>
          </DialogHeader>
          
          {selectedImage && (
            <div className="space-y-4">
              <div className="aspect-[4/3] bg-muted rounded-md overflow-hidden">
                <img 
                  src={selectedImage.url} 
                  alt="Evidência" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-category">Categoria</Label>
                <select
                  id="edit-category"
                  value={currentCategory}
                  onChange={(e) => setCurrentCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Observações</Label>
                <textarea
                  id="edit-notes"
                  value={currentNotes}
                  onChange={(e) => setCurrentNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md min-h-[80px] resize-none"
                  placeholder="Adicione observações sobre esta evidência..."
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingImage(false)}>
              Cancelar
            </Button>
            <Button onClick={updateImageDetails}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Image Dialog */}
      <Dialog open={!!selectedImage && !isEditingImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl">
          {selectedImage && (
            <div className="flex flex-col md:flex-row gap-4">
              <div className="md:flex-1">
                <div 
                  className={`rounded-md overflow-hidden relative ${isAnnotating ? 'annotating-mode' : ''}`}
                  ref={imageContainerRef}
                  onClick={handleImageClick}
                  onDragStart={(e) => isAnnotating && e.preventDefault()}
                  onMouseMove={(e) => isAnnotating && e.preventDefault()}
                >
                  {/* Layer de imagem (base) */}
                  <img 
                    src={selectedImage.url} 
                    alt="Evidência" 
                    className="w-full h-auto max-h-[70vh] object-contain"
                    draggable="false"
                    style={{ userSelect: 'none' }}
                    onMouseDown={(e) => isAnnotating && e.preventDefault()}
                  />
                  
                  {/* Camada de anotações */}
                  <div className="absolute inset-0 pointer-events-none">
                    
                    {/* Mensagem de instrução */}
                    {isAnnotating && !tempAnnotation && (
                      <div className="absolute top-2 left-0 right-0 flex justify-center">
                        <div className="bg-primary/80 text-primary-foreground rounded-md px-3 py-1 shadow text-sm font-medium">
                          Clique primeiro para posicionar, depois para definir o tamanho/direção
                        </div>
                      </div>
                    )}
                    
                    {/* Mensagem de segundo clique */}
                    {isAnnotating && tempAnnotation?.isPlacing && (
                      <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                        <div className="bg-primary/80 text-primary-foreground rounded-md px-3 py-1 shadow text-sm font-medium">
                          Agora clique para finalizar a {annotationTool === 'arrow' ? 'seta' : 
                                                       annotationTool === 'circle' ? 'círculo' : 'retângulo'}
                        </div>
                      </div>
                    )}
                    
                    {/* Anotação temporária durante o desenho */}
                    {isAnnotating && tempAnnotation && (
                      <div 
                        className="absolute"
                        style={{
                          left: `${tempAnnotation.x}%`,
                          top: `${tempAnnotation.y}%`,
                          color: tempAnnotation.color,
                        }}
                      >
                        {tempAnnotation.type === 'circle' && (
                          <div 
                            className="rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2" 
                            style={{
                              width: `${tempAnnotation.width}%`,
                              height: `${tempAnnotation.width}%`,
                              borderColor: tempAnnotation.color,
                              borderWidth: tempAnnotation.size,
                            }}
                          />
                        )}
                        {tempAnnotation.type === 'rectangle' && (
                          <div 
                            className="border-2 transform -translate-x-1/2 -translate-y-1/2" 
                            style={{
                              width: `${tempAnnotation.width}%`,
                              height: `${tempAnnotation.height}%`,
                              borderColor: tempAnnotation.color,
                              borderWidth: tempAnnotation.size,
                            }}
                          />
                        )}
                        {tempAnnotation.type === 'arrow' && tempAnnotation.endX !== undefined && tempAnnotation.endY !== undefined && (
                          <svg
                            style={{
                              position: 'absolute',
                              width: '100%',
                              height: '100%',
                              left: 0,
                              top: 0,
                              transform: 'translate(-50%, -50%)',
                              zIndex: 5,
                              pointerEvents: 'none',
                            }}
                          >
                            <defs>
                              <marker
                                id={`arrowhead-${tempAnnotation.color.replace('#', '')}`}
                                markerWidth="10"
                                markerHeight="7"
                                refX="0"
                                refY="3.5"
                                orient="auto"
                              >
                                <polygon
                                  points="0 0, 10 3.5, 0 7"
                                  fill={tempAnnotation.color}
                                />
                              </marker>
                            </defs>
                            <line
                              x1="0"
                              y1="0"
                              x2={`${tempAnnotation.endX - tempAnnotation.x}%`}
                              y2={`${tempAnnotation.endY - tempAnnotation.y}%`}
                              stroke={tempAnnotation.color}
                              strokeWidth={tempAnnotation.size}
                              markerEnd={`url(#arrowhead-${tempAnnotation.color.replace('#', '')})`}
                            />
                          </svg>
                        )}
                      </div>
                    )}
                    {annotations.map((annotation, index) => (
                      <div 
                        key={index} 
                        className="absolute"
                        style={{
                          left: `${annotation.x}%`,
                          top: `${annotation.y}%`,
                          color: annotation.color,
                        }}
                      >
                        {annotation.type === 'circle' && (
                          <div 
                            className="rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2" 
                            style={{
                              width: `${annotation.width}%`,
                              height: `${annotation.width}%`,
                              borderColor: annotation.color,
                              borderWidth: annotation.size,
                            }}
                          />
                        )}
                        {annotation.type === 'rectangle' && (
                          <div 
                            className="border-2 transform -translate-x-1/2 -translate-y-1/2" 
                            style={{
                              width: `${annotation.width}%`,
                              height: `${annotation.height}%`,
                              borderColor: annotation.color,
                              borderWidth: annotation.size,
                            }}
                          />
                        )}
                        {annotation.type === 'arrow' && annotation.endX !== undefined && annotation.endY !== undefined && (
                          <svg
                            style={{
                              position: 'absolute',
                              width: '100%',
                              height: '100%',
                              left: 0,
                              top: 0,
                              transform: 'translate(-50%, -50%)',
                              zIndex: 5,
                              pointerEvents: 'none',
                            }}
                          >
                            <defs>
                              <marker
                                id={`arrowhead-${annotation.color.replace('#', '')}-${index}`}
                                markerWidth="10"
                                markerHeight="7"
                                refX="0"
                                refY="3.5"
                                orient="auto"
                              >
                                <polygon
                                  points="0 0, 10 3.5, 0 7"
                                  fill={annotation.color}
                                />
                              </marker>
                            </defs>
                            <line
                              x1="0"
                              y1="0"
                              x2={`${annotation.endX - annotation.x}%`}
                              y2={`${annotation.endY - annotation.y}%`}
                              stroke={annotation.color}
                              strokeWidth={annotation.size}
                              markerEnd={`url(#arrowhead-${annotation.color.replace('#', '')}-${index})`}
                            />
                          </svg>
                        )}
                        {annotation.type === 'text' && (
                          <div 
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 text-center bg-white bg-opacity-75 px-1 py-0.5 rounded whitespace-nowrap"
                            style={{
                              color: annotation.color,
                              fontSize: `${annotation.size * 4}px`,
                              fontWeight: 'bold',
                            }}
                          >
                            {annotation.text}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Modal de adição de texto */}
                  {isAddingText && (
                    <div 
                      className="absolute p-2 bg-white rounded-md shadow-lg z-10"
                      style={{
                        left: `${textPosition.x}%`,
                        top: `${textPosition.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="mb-2">
                        <Input
                          value={annotationText}
                          onChange={(e) => setAnnotationText(e.target.value)}
                          placeholder="Digite o texto..."
                          className="w-full text-sm"
                          autoFocus
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setIsAddingText(false)}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={addTextAnnotation}
                        >
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Barra de ferramentas de anotação */}
                {isAnnotating && (
                  <div className="mt-2 p-2 bg-secondary/50 rounded-md">
                    <div className="text-sm text-muted-foreground mb-2 bg-background/80 p-2 rounded-md">
                      <p><strong>Instruções:</strong> Selecione uma ferramenta abaixo. Para desenhar, clique primeiro para colocar o ponto inicial, depois clique novamente para finalizar.</p>
                    </div>
                    <div className="flex items-center flex-wrap gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant={annotationTool === 'arrow' ? 'default' : 'outline'} 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setAnnotationTool('arrow')}
                            >
                              <ArrowUp className="h-4 w-4 transform rotate-45" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Seta</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant={annotationTool === 'circle' ? 'default' : 'outline'} 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setAnnotationTool('circle')}
                            >
                              <Circle className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Círculo</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant={annotationTool === 'rectangle' ? 'default' : 'outline'} 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setAnnotationTool('rectangle')}
                            >
                              <Square className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Retângulo</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant={annotationTool === 'text' ? 'default' : 'outline'} 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setAnnotationTool('text')}
                            >
                              <Type className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Texto</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <div className="h-6 w-[1px] bg-border mx-1"></div>
                      
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 w-8 p-0 relative"
                          >
                            <div 
                              className="h-5 w-5 rounded-full border"
                              style={{ backgroundColor: annotationColor }}
                            />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2">
                          <div className="flex flex-wrap gap-1 w-36">
                            {['#EE1B24', '#00529C', '#FFEB00', '#000000', '#FFFFFF', '#4CAF50', '#FF9800', '#9C27B0'].map(color => (
                              <button
                                key={color}
                                onClick={() => setAnnotationColor(color)}
                                className={cn(
                                  "h-6 w-6 rounded-full border",
                                  color === annotationColor && "ring-2 ring-offset-2 ring-primary"
                                )}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                      
                      <div className="h-6 w-[1px] bg-border mx-1"></div>
                      
                      <div className="flex items-center space-x-2 flex-1 min-w-[120px]">
                        <Label htmlFor="annotation-size" className="text-xs">Tamanho:</Label>
                        <Slider
                          id="annotation-size"
                          min={1}
                          max={10}
                          step={1}
                          value={[annotationSize]}
                          onValueChange={(value) => setAnnotationSize(value[0])}
                          className="flex-1"
                        />
                      </div>
                      
                      <div className="h-6 w-[1px] bg-border mx-1"></div>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={removeLastAnnotation}
                              disabled={annotations.length === 0}
                            >
                              <Undo className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Desfazer</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    <div className="flex justify-end mt-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={cancelAnnotating}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        size="sm"
                        onClick={saveAnnotations}
                      >
                        Salvar Anotações
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="md:w-64 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Categoria</h3>
                  <p className="text-base">
                    {categories.find(c => c.id === selectedImage.category)?.name || 'Geral'}
                  </p>
                </div>
                
                {selectedImage.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Observações</h3>
                    <p className="text-sm mt-1">
                      {selectedImage.notes}
                    </p>
                  </div>
                )}
                
                <div className="flex flex-col gap-2 pt-4">
                  {!isAnnotating && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={startAnnotating}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Anotar Imagem
                    </Button>
                  )}
                
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditImage(selectedImage)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar Detalhes
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      deleteImage(selectedImage.id);
                      setSelectedImage(null);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EvidenceStep;
