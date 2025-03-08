import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  getStatusLabel, 
  getStatusColor, 
  formatDate 
} from '@/lib/utils';
import FormProgress from './FormProgress';
import ClientDataStep from './ClientDataStep';
import ProductDataStep from './ProductDataStep';
import AnalysisStep from './AnalysisStep';
import EvidenceStep from './EvidenceStep';
import ConclusionStep from './ConclusionStep';
import { 
  ArrowLeft, 
  Save,
  Calendar,
  Clock,
  User,
  Building,
  Box,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { saveInspection } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface InspectionFormProps {
  inspectionId?: string;
  initialData?: any;
}

const InspectionForm: React.FC<InspectionFormProps> = ({ inspectionId, initialData }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    status: 'draft',
    ...initialData
  });
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const totalSteps = 5;
  const isNewInspection = !inspectionId;
  
  // Fetch inspection data if editing an existing one
  const { data: inspectionData, isLoading } = useQuery({
    queryKey: [`/api/inspections/${inspectionId}`],
    enabled: !!inspectionId,
    refetchOnWindowFocus: false,
  });
  
  // Set form data from API response
  useEffect(() => {
    if (inspectionData) {
      setFormData(prev => ({
        ...prev,
        ...inspectionData
      }));
    }
  }, [inspectionData]);
  
  // Create/update inspection mutation
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (isNewInspection) {
        const res = await apiRequest('POST', '/api/inspections', data);
        return res.json();
      } else {
        const res = await apiRequest('PATCH', `/api/inspections/${inspectionId}`, data);
        return res.json();
      }
    },
    onSuccess: (data) => {
      // Save to IndexedDB for offline access
      saveInspection(data);
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/inspections'] });
      
      toast({
        title: isNewInspection ? 'Vistoria criada com sucesso' : 'Vistoria atualizada com sucesso',
        description: `Protocolo: ${data.protocolNumber}`,
      });
      
      // Navigate back to dashboard if completed, stay on page if draft
      if (data.status === 'completed' || data.status === 'in_review') {
        navigate('/');
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao salvar vistoria',
        description: error.message || 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    }
  });
  
  const handleStepChange = (step: number) => {
    // Validate current step before proceeding
    if (step > currentStep) {
      // You can add validation here
    }
    
    setCurrentStep(step);
  };
  
  const handleBackToDashboard = () => {
    // Ask for confirmation if there are unsaved changes
    if (mutation.isPending || (formData && Object.keys(formData).length > 0)) {
      if (window.confirm('Existem alterações não salvas. Deseja sair sem salvar?')) {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };
  
  const handleSave = (status: string = 'draft') => {
    // Prepare data for saving
    const dataToSave = {
      ...formData,
      status,
      userId: user?.id
    };
    
    // Execute mutation
    mutation.mutateAsync(dataToSave);
  };
  
  const updateFormData = (stepData: any) => {
    setFormData(prev => ({
      ...prev,
      ...stepData
    }));
  };
  
  // If loading existing inspection data
  if (inspectionId && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] flex-col">
        <div className="w-full max-w-2xl mx-auto px-4">
          {/* Skeleton header */}
          <div className="bg-white shadow-sm px-4 py-3 md:px-6 md:py-4 flex items-center justify-between mb-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-6 w-24" />
          </div>
          
          {/* Skeleton progress */}
          <div className="bg-white shadow-sm px-4 py-6 rounded-lg mb-4">
            <Skeleton className="h-4 w-full mb-2" />
            <div className="flex justify-between mt-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
          
          {/* Skeleton content */}
          <div className="bg-white shadow-sm px-4 py-6 rounded-lg">
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-10 w-full mb-3" />
            <Skeleton className="h-10 w-full mb-3" />
            <Skeleton className="h-10 w-full mb-3" />
            <Skeleton className="h-10 w-2/3 mb-6" />
            <div className="flex justify-end">
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">Carregando dados da vistoria...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Form Header */}
      <div className="bg-white shadow-sm px-4 py-3 md:px-6 md:py-4 flex flex-wrap items-center justify-between gap-y-2">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2 p-1 rounded-full" 
            onClick={handleBackToDashboard}
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg md:text-xl font-bold flex items-center gap-1">
              {isNewInspection ? 'Nova Vistoria' : formData?.protocolNumber || `Vistoria #${inspectionId}`}
              {!isNewInspection && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2 h-7 text-xs"
                  onClick={() => handleSave()}
                  disabled={mutation.isPending}
                >
                  <Save className="h-3 w-3 mr-1" />
                  Salvar
                </Button>
              )}
            </h1>
            {!isNewInspection && formData?.clientName && (
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center">
                <Building className="h-3 w-3 mr-1 inline" /> 
                {formData.clientName || 'Cliente não especificado'}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3 ml-auto">
          {formData?.scheduledDate && (
            <div className="hidden md:flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{formatDate(formData.scheduledDate)}</span>
            </div>
          )}
          
          <Badge 
            variant="outline" 
            className={`${getStatusColor(formData.status)} font-medium px-2 py-1`}
          >
            {getStatusLabel(formData.status)}
          </Badge>
        </div>
      </div>

      {/* Form Progress */}
      <FormProgress 
        currentStep={currentStep} 
        totalSteps={totalSteps} 
        onStepClick={handleStepChange} 
      />

      {/* Informações da Inspeção para formulários existentes */}
      {!isNewInspection && (
        <div className="px-4 md:px-6 py-3 bg-neutral-50 border-b border-neutral-100 hidden md:flex items-center justify-between flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-3">
            {formData?.clientName && (
              <Badge variant="secondary" className="px-2 py-1 gap-1">
                <Building className="h-3 w-3" />
                <span>{formData.clientName}</span>
              </Badge>
            )}
            
            {formData?.projectName && (
              <Badge variant="secondary" className="px-2 py-1 gap-1">
                <Box className="h-3 w-3" />
                <span>{formData.projectName}</span>
              </Badge>
            )}
            
            {formData?.area && (
              <span className="text-xs text-muted-foreground">
                Área: {formData.area}m²
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {formData?.scheduledDate && (
              <span className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{formatDate(formData.scheduledDate)}</span>
              </span>
            )}
            
            {formData?.technician && (
              <span className="flex items-center text-xs text-muted-foreground">
                <User className="h-3 w-3 mr-1" />
                <span>{formData.technician}</span>
              </span>
            )}
            
            {mutation.isPending && (
              <span className="text-xs text-muted-foreground animate-pulse">
                Salvando...
              </span>
            )}
          </div>
        </div>
      )}

      {/* Área principal de conteúdo */}
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        {/* Alerta para modo offline */}
        {!navigator.onLine && (
          <Card className="mb-4 p-3 flex items-center gap-2 bg-yellow-50 border-yellow-200 text-yellow-800">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">
              Você está trabalhando no modo offline. As alterações serão sincronizadas quando a conexão for restaurada.
            </span>
          </Card>
        )}
        
        {/* Formulário */}
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {/* Animações suaves entre os passos */}
          <div className="transition-all duration-300 ease-in-out">
            {/* Step 1: Client Data */}
            {currentStep === 1 && (
              <ClientDataStep 
                formData={formData}
                updateFormData={updateFormData}
                onNext={() => handleStepChange(2)}
              />
            )}

            {/* Step 2: Product Information */}
            {currentStep === 2 && (
              <ProductDataStep 
                formData={formData}
                updateFormData={updateFormData}
                onPrevious={() => handleStepChange(1)}
                onNext={() => handleStepChange(3)}
              />
            )}

            {/* Step 3: Technical Analysis */}
            {currentStep === 3 && (
              <AnalysisStep 
                formData={formData}
                updateFormData={updateFormData}
                onPrevious={() => handleStepChange(2)}
                onNext={() => handleStepChange(4)}
              />
            )}

            {/* Step 4: Evidence Documentation */}
            {currentStep === 4 && (
              <EvidenceStep 
                formData={formData}
                updateFormData={updateFormData}
                onPrevious={() => handleStepChange(3)}
                onNext={() => handleStepChange(5)}
              />
            )}

            {/* Step 5: Conclusion and Summary */}
            {currentStep === 5 && (
              <ConclusionStep 
                formData={formData}
                updateFormData={updateFormData}
                onPrevious={() => handleStepChange(4)}
                onSaveAsDraft={() => handleSave('draft')}
                onFinish={() => handleSave('completed')}
                onSubmitForReview={() => handleSave('in_review')}
                isSaving={mutation.isPending}
              />
            )}
          </div>
        </form>
        
        {/* Botão de salvar como rascunho flutuante em dispositivos móveis */}
        {!isNewInspection && currentStep !== 5 && (
          <div className="fixed bottom-20 right-4 md:hidden z-20">
            <Button 
              variant="default" 
              size="sm" 
              className="rounded-full shadow-lg"
              onClick={() => handleSave()}
              disabled={mutation.isPending}
            >
              <Save className="h-4 w-4 mr-1" />
              Salvar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectionForm;
