import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { getStatusLabel, getStatusColor } from '@/lib/utils';
import FormProgress from './FormProgress';
import ClientDataStep from './ClientDataStep';
import ProductDataStep from './ProductDataStep';
import AnalysisStep from './AnalysisStep';
import EvidenceStep from './EvidenceStep';
import ConclusionStep from './ConclusionStep';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { saveInspection } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';

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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse-custom">Carregando dados da vistoria...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Form Header */}
      <div className="bg-white shadow-sm px-4 py-3 md:px-6 md:py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2 p-1 rounded-full" 
            onClick={handleBackToDashboard}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg md:text-xl font-bold">
            {isNewInspection ? 'Nova Vistoria' : `Vistoria #${inspectionId}`}
          </h1>
        </div>
        <div className="flex items-center">
          <span className="text-muted-foreground text-sm mr-2">Status:</span>
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(formData.status)} font-medium`}>
            {getStatusLabel(formData.status)}
          </span>
        </div>
      </div>

      {/* Form Progress */}
      <FormProgress 
        currentStep={currentStep} 
        totalSteps={totalSteps} 
        onStepClick={handleStepChange} 
      />

      {/* Form Content */}
      <div className="p-4 md:p-6">
        <form onSubmit={(e) => e.preventDefault()}>
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
        </form>
      </div>
    </div>
  );
};

export default InspectionForm;
