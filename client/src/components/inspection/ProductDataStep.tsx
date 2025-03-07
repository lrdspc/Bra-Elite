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
  const [selectedRoofModel, setSelectedRoofModel] = useState(formData.roofModel || 'Telha Ondulada');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const roofModels = [
    {
      id: 'model1',
      value: 'Telha Ondulada',
      imageSrc: 'https://via.placeholder.com/400x240?text=Telha+Ondulada'
    },
    {
      id: 'model2',
      value: 'Telha Plana',
      imageSrc: 'https://via.placeholder.com/400x240?text=Telha+Plana'
    },
    {
      id: 'model3',
      value: 'Colonial',
      imageSrc: 'https://via.placeholder.com/400x240?text=Colonial'
    },
    {
      id: 'model4',
      value: 'Fibrocimento',
      imageSrc: 'https://via.placeholder.com/400x240?text=Fibrocimento'
    }
  ];

  return (
    <Card className="mb-6">
      <CardContent className="p-4 md:p-6">
        <h2 className="text-lg font-medium mb-4">Dados do Produto Instalado</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2 mb-2">
            <Label className="block text-sm font-medium text-muted-foreground mb-3">
              Modelo de Telha
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {roofModels.map((model) => (
                <label 
                  key={model.id}
                  className="relative flex flex-col border border-input rounded-md p-2 cursor-pointer hover:bg-accent"
                >
                  <input 
                    type="radio" 
                    name="roofModel"
                    value={model.value}
                    checked={selectedRoofModel === model.value}
                    onChange={(e) => {
                      setSelectedRoofModel(e.target.value);
                      updateFormData({ roofModel: e.target.value });
                    }}
                    className="sr-only peer"
                  />
                  <div className="h-24 bg-muted rounded-md mb-2 flex items-center justify-center overflow-hidden">
                    <img 
                      src={model.imageSrc} 
                      alt={`Modelo ${model.value}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium text-center">{model.value}</span>
                  <div className={cn(
                    "absolute inset-0 border-2 border-primary rounded-md opacity-0 peer-checked:opacity-100",
                    selectedRoofModel === model.value ? "opacity-100" : "opacity-0"
                  )}></div>
                  <div className={cn(
                    "absolute top-1 right-1 w-5 h-5 bg-primary rounded-full text-white flex items-center justify-center opacity-0 peer-checked:opacity-100",
                    selectedRoofModel === model.value ? "opacity-100" : "opacity-0"
                  )}>
                    <Check className="h-3 w-3" />
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="quantity" className="block text-sm font-medium text-muted-foreground mb-1">
              Quantidade (unidades)
            </Label>
            <Input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity || ''}
              onChange={handleFieldChange}
              min="0"
            />
          </div>

          <div>
            <Label htmlFor="area" className="block text-sm font-medium text-muted-foreground mb-1">
              Área Total (m²)
            </Label>
            <Input
              type="number"
              id="area"
              name="area"
              value={formData.area || ''}
              onChange={handleFieldChange}
              min="0"
              step="0.01"
            />
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
