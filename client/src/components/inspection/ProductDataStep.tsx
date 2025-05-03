import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Calendar, Check, Upload } from 'lucide-react';

interface ProductDataStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onPrevious: () => void;
  onNext: () => void;
}

const ProductDataStep: React.FC<ProductDataStepProps> = ({ 
  formData, 
  updateFormData, 
  onPrevious, 
  onNext 
}) => {
  // State for selected model and dimensions
  const [selectedModelId, setSelectedModelId] = useState(formData.modelId || '');
  const [selectedDimension, setSelectedDimension] = useState<{ width: number, length: number } | null>(
    formData.width && formData.length ? { width: formData.width, length: formData.length } : null
  );
  const [quantity, setQuantity] = useState<number>(formData.quantity || 1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // State for product table
  const [products, setProducts] = useState<Array<{
    id: string;
    modelId: string;
    modelName: string;
    width: number;
    length: number;
    quantity: number;
    area: number;
  }>>(formData.products || []);

  // Get selected model details
  const selectedModel = productModels.find(model => model.id === selectedModelId);

  // Get available dimensions for selected model
  const availableDimensions = selectedModel 
    ? productDimensions[selectedModel.type][selectedModel.thickness] 
    : [];

  // Calculate area for current selection
  const calculateArea = (width: number, length: number, qty: number) => {
    return parseFloat((width * length * qty).toFixed(2));
  };

  // Calculate total area of all products
  const totalArea = products.reduce((sum, product) => sum + product.area, 0);

  // Handle model selection
  const handleModelSelect = (modelId: string) => {
    setSelectedModelId(modelId);
    setSelectedDimension(null); // Reset dimension when model changes

    // Update form data
    updateFormData({ 
      modelId,
      roofModel: productModels.find(m => m.id === modelId)?.value || ''
    });
  };

  // Handle dimension selection
  const handleDimensionSelect = (dimension: { width: number, length: number }) => {
    setSelectedDimension(dimension);

    // Update form data
    updateFormData({ 
      width: dimension.width,
      length: dimension.length
    });
  };

  // Handle quantity change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const qty = parseInt(e.target.value) || 0;
    setQuantity(qty);
    updateFormData({ quantity: qty });
  };

  // Add product to table
  const handleAddProduct = () => {
    if (!selectedModel || !selectedDimension || quantity <= 0) return;

    const newProduct = {
      id: `${Date.now()}`,
      modelId: selectedModel.id,
      modelName: selectedModel.value,
      width: selectedDimension.width,
      length: selectedDimension.length,
      quantity,
      area: calculateArea(selectedDimension.width, selectedDimension.length, quantity)
    };

    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);

    // Update form data
    updateFormData({ 
      products: updatedProducts,
      area: updatedProducts.reduce((sum, p) => sum + p.area, 0)
    });

    // Reset selection for next product
    setQuantity(1);
  };

  // Remove product from table
  const handleRemoveProduct = (productId: string) => {
    const updatedProducts = products.filter(p => p.id !== productId);
    setProducts(updatedProducts);

    // Update form data
    updateFormData({ 
      products: updatedProducts,
      area: updatedProducts.reduce((sum, p) => sum + p.area, 0)
    });
  };

  // Handle other field changes
  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ installationDate: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // In a real app, you would upload this file to a server or store it
      // For now, just store the file name
      updateFormData({ invoice: file.name });
    }
  };

  // Product models with thickness
  const productModels = [
    {
      id: 'ondulada-5mm',
      value: 'Ondulada 5mm CRFS',
      type: 'Ondulada',
      thickness: '5mm',
      imageSrc: 'https://via.placeholder.com/400x240?text=Ondulada+5mm+CRFS'
    },
    {
      id: 'ondulada-6mm',
      value: 'Ondulada 6mm CRFS',
      type: 'Ondulada',
      thickness: '6mm',
      imageSrc: 'https://via.placeholder.com/400x240?text=Ondulada+6mm+CRFS'
    },
    {
      id: 'ondulada-8mm',
      value: 'Ondulada 8mm CRFS',
      type: 'Ondulada',
      thickness: '8mm',
      imageSrc: 'https://via.placeholder.com/400x240?text=Ondulada+8mm+CRFS'
    },
    {
      id: 'topcomfort-5mm',
      value: 'TopComfort 5mm',
      type: 'TopComfort',
      thickness: '5mm',
      imageSrc: 'https://via.placeholder.com/400x240?text=TopComfort+5mm'
    },
    {
      id: 'topcomfort-6mm',
      value: 'TopComfort 6mm',
      type: 'TopComfort',
      thickness: '6mm',
      imageSrc: 'https://via.placeholder.com/400x240?text=TopComfort+6mm'
    },
    {
      id: 'topcomfort-8mm',
      value: 'TopComfort 8mm',
      type: 'TopComfort',
      thickness: '8mm',
      imageSrc: 'https://via.placeholder.com/400x240?text=TopComfort+8mm'
    }
  ];

  // Product dimensions based on model and thickness
  const productDimensions = {
    'TopComfort': {
      '5mm': [
        { width: 1.10, length: 1.22 },
        { width: 1.10, length: 1.53 },
        { width: 1.10, length: 1.83 },
        { width: 1.10, length: 2.13 },
        { width: 1.10, length: 2.44 }
      ],
      '6mm': [
        { width: 1.10, length: 1.22 },
        { width: 1.10, length: 1.53 },
        { width: 1.10, length: 1.83 },
        { width: 1.10, length: 2.13 },
        { width: 1.10, length: 2.44 },
        { width: 1.10, length: 3.05 },
        { width: 1.10, length: 3.66 }
      ],
      '8mm': [
        { width: 1.10, length: 1.22 },
        { width: 1.10, length: 1.53 },
        { width: 1.10, length: 1.83 },
        { width: 1.10, length: 2.13 },
        { width: 1.10, length: 2.44 },
        { width: 1.10, length: 3.05 },
        { width: 1.10, length: 3.66 }
      ]
    },
    'Ondulada': {
      '5mm': [
        { width: 0.92, length: 1.53 },
        { width: 0.92, length: 1.83 },
        { width: 0.92, length: 2.13 },
        { width: 0.92, length: 2.44 }
      ],
      '6mm': [
        { width: 0.92, length: 1.53 },
        { width: 0.92, length: 1.83 },
        { width: 0.92, length: 2.13 },
        { width: 0.92, length: 2.44 },
        { width: 0.92, length: 3.05 }
      ],
      '8mm': [
        { width: 0.92, length: 1.53 },
        { width: 0.92, length: 1.83 },
        { width: 0.92, length: 2.13 },
        { width: 0.92, length: 2.44 },
        { width: 0.92, length: 3.05 },
        { width: 0.92, length: 3.66 }
      ]
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4 md:p-6">
        <h2 className="text-lg font-medium mb-4">Dados do Produto Instalado</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2 mb-4">
            <Label className="block text-sm font-medium text-muted-foreground mb-3">
              Sistema Unificado de Seleção
            </Label>

            {/* Modelo/Espessura Selection */}
            <div className="mb-4">
              <Label htmlFor="modelThickness" className="block text-sm font-medium mb-2">
                Modelo/Espessura
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {productModels.map((model) => (
                  <label 
                    key={model.id}
                    className={cn(
                      "relative flex flex-col border border-input rounded-md p-2 cursor-pointer hover:bg-accent",
                      selectedModelId === model.id ? "border-primary bg-primary/5" : ""
                    )}
                  >
                    <input 
                      type="radio" 
                      name="modelId"
                      value={model.id}
                      checked={selectedModelId === model.id}
                      onChange={() => handleModelSelect(model.id)}
                      className="sr-only peer"
                    />
                    <div className="h-20 bg-muted rounded-md mb-2 flex items-center justify-center overflow-hidden">
                      <img 
                        src={model.imageSrc} 
                        alt={`${model.value}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-sm font-medium text-center">{model.value}</span>
                    {selectedModelId === model.id && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full text-white flex items-center justify-center">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Dimensions Selection - Only shown if model is selected */}
            {selectedModel && (
              <div className="mb-4">
                <Label htmlFor="dimensions" className="block text-sm font-medium mb-2">
                  Dimensões (filtrado conforme modelo e espessura)
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {availableDimensions.map((dimension, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant={selectedDimension && 
                              selectedDimension.width === dimension.width && 
                              selectedDimension.length === dimension.length 
                                ? "default" 
                                : "outline"}
                      className="text-sm h-auto py-2"
                      onClick={() => handleDimensionSelect(dimension)}
                    >
                      {dimension.width}m × {dimension.length}m
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Input - Only shown if dimension is selected */}
            {selectedDimension && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="quantity" className="block text-sm font-medium mb-1">
                    Quantidade (unidades)
                  </Label>
                  <Input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min="1"
                    max="10000"
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="block text-sm font-medium mb-1">
                    Área Calculada
                  </Label>
                  <div className="h-10 flex items-center px-3 border rounded-md bg-muted/50">
                    <span className="font-medium">
                      {selectedDimension && quantity > 0 
                        ? calculateArea(selectedDimension.width, selectedDimension.length, quantity)
                        : 0} m²
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Add Product Button - Only shown if all selections are made */}
            {selectedModel && selectedDimension && quantity > 0 && (
              <Button 
                type="button" 
                onClick={handleAddProduct}
                className="w-full mb-4"
              >
                Adicionar Produto à Lista
              </Button>
            )}

            {/* Dynamic Table of Products */}
            {products.length > 0 && (
              <div className="border rounded-md overflow-hidden mb-4">
                <div className="bg-muted px-4 py-2 font-medium text-sm">
                  Tabela Dinâmica de Produtos
                </div>
                <div className="divide-y">
                  {products.map(product => (
                    <div key={product.id} className="px-4 py-3 flex justify-between items-center">
                      <div>
                        <div className="font-medium">{product.modelName}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.width}m × {product.length}m × {product.quantity} un = {product.area} m²
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveProduct(product.id)}
                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                  <div className="px-4 py-3 bg-muted/30 flex justify-between items-center">
                    <div className="font-medium">Área Total</div>
                    <div className="font-bold">{totalArea} m²</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="col-span-1 md:col-span-2">
            <Label htmlFor="area" className="block text-sm font-medium text-muted-foreground mb-1">
              Área Total Calculada (m²)
            </Label>
            <Input
              type="number"
              id="area"
              name="area"
              value={totalArea || formData.area || ''}
              onChange={handleFieldChange}
              min="0"
              step="0.01"
              readOnly
              className="bg-muted/50"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Este valor é calculado automaticamente com base nos produtos adicionados acima.
            </p>
          </div>

          <div>
            <Label htmlFor="installationDate" className="block text-sm font-medium text-muted-foreground mb-1">
              Data Aproximada de Instalação
            </Label>
            <div className="relative">
              <Input
                type="date"
                id="installationDate"
                name="installationDate"
                value={formData.installationDate ? new Date(formData.installationDate).toISOString().split('T')[0] : ''}
                onChange={handleDateChange}
                max={new Date().toISOString().split('T')[0]}
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div>
            <Label htmlFor="warranty" className="block text-sm font-medium text-muted-foreground mb-1">
              Garantia
            </Label>
            <select
              id="warranty"
              name="warranty"
              value={formData.warranty || ''}
              onChange={handleFieldChange}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="">Selecione</option>
              <option value="5">5 anos</option>
              <option value="7">7 anos</option>
              <option value="10">10 anos</option>
              <option value="15">15 anos</option>
            </select>
          </div>

          <div className="col-span-1 md:col-span-2">
            <Label className="block text-sm font-medium text-muted-foreground mb-1">
              Nota Fiscal ou Documento de Compra
            </Label>
            <div className="border-2 border-dashed border-input rounded-md p-4 flex flex-col items-center justify-center">
              <input
                type="file"
                id="invoice"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
              {selectedFile || formData.invoice ? (
                <div className="flex flex-col items-center">
                  <div className="p-2 bg-primary/10 rounded-full mb-2">
                    <Check className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">{selectedFile?.name || formData.invoice}</p>
                  <Button
                    variant="link"
                    onClick={() => {
                      setSelectedFile(null);
                      updateFormData({ invoice: null });
                      // Reset file input
                      const fileInput = document.getElementById('invoice') as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }}
                    className="text-destructive mt-2 p-0 h-auto"
                  >
                    Remover arquivo
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="text-muted-foreground mb-2 h-6 w-6" />
                  <p className="text-sm text-muted-foreground text-center mb-2">
                    Arraste um arquivo ou clique para fazer o upload
                  </p>
                  <Label htmlFor="invoice" className="text-primary text-sm font-medium cursor-pointer">
                    Selecionar Arquivo
                  </Label>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <div className="p-4 md:p-6 pt-0 flex justify-between">
        <Button 
          variant="outline"
          onClick={onPrevious}
        >
          Voltar
        </Button>
        <Button onClick={onNext}>
          Continuar
        </Button>
      </div>
    </Card>
  );
};

export default ProductDataStep;
