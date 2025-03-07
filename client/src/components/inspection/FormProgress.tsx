import React from 'react';
import { cn } from '@/lib/utils';

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
}

const FormProgress: React.FC<FormProgressProps> = ({ 
  currentStep, 
  totalSteps,
  onStepClick
}) => {
  const steps = [
    { step: 1, label: 'Dados Cliente' },
    { step: 2, label: 'Produto' },
    { step: 3, label: 'Análise' },
    { step: 4, label: 'Evidências' },
    { step: 5, label: 'Conclusão' },
  ];

  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="bg-white border-t border-neutral-light px-4 py-3 md:px-6">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">Progresso</span>
        <span className="text-sm text-primary font-medium">{currentStep} de {totalSteps}</span>
      </div>
      
      <div className="w-full bg-neutral-light rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between mt-3 text-xs text-muted-foreground">
        {steps.map((step) => (
          <button
            key={step.step}
            className={cn(
              "font-medium", 
              currentStep >= step.step ? "text-primary" : ""
            )}
            onClick={() => onStepClick && onStepClick(step.step)}
            type="button"
          >
            {step.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FormProgress;
