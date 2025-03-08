import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, Circle } from 'lucide-react';

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
    { step: 1, label: 'Dados Cliente', icon: 'user' },
    { step: 2, label: 'Produto', icon: 'package' },
    { step: 3, label: 'Análise', icon: 'search' },
    { step: 4, label: 'Evidências', icon: 'camera' },
    { step: 5, label: 'Conclusão', icon: 'check' },
  ];

  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="bg-white border-t border-b border-neutral-100 px-4 py-4 md:px-6 shadow-sm sticky top-0 z-10">
      {/* Progress info */}
      <div className="flex justify-between mb-2 items-center">
        <span className="text-sm font-medium">Progresso da Vistoria</span>
        <span className="text-sm text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">
          {currentStep} de {totalSteps}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-neutral-200 rounded-full h-2 mb-4">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      {/* Mobile step indicators (circles only) */}
      <div className="flex justify-between mt-2 md:hidden">
        {steps.map((step) => (
          <button
            key={step.step}
            className={cn(
              "flex flex-col items-center justify-center transition-colors p-1 rounded-full",
              currentStep === step.step ? "text-primary bg-primary/10" : 
              currentStep > step.step ? "text-primary/80" : "text-muted-foreground"
            )}
            onClick={() => onStepClick && onStepClick(step.step)}
            type="button"
            aria-label={step.label}
          >
            {currentStep > step.step ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <Circle className={cn("h-5 w-5", 
                currentStep === step.step ? "fill-primary/20" : "")} 
              />
            )}
            <span className="sr-only">{step.label}</span>
          </button>
        ))}
      </div>
      
      {/* Desktop step indicators (with labels) */}
      <div className="hidden md:flex justify-between mt-1 text-xs gap-1">
        {steps.map((step) => (
          <button
            key={step.step}
            className={cn(
              "flex items-center px-2 py-1 rounded-full font-medium transition-all", 
              currentStep === step.step ? 
                "bg-primary/10 text-primary" : 
                currentStep > step.step ? 
                  "text-primary/80" : 
                  "text-muted-foreground hover:bg-neutral-100"
            )}
            onClick={() => onStepClick && onStepClick(step.step)}
            type="button"
          >
            {currentStep > step.step ? (
              <CheckCircle className="h-3.5 w-3.5 mr-1.5 inline-block" />
            ) : (
              <Circle className={cn("h-3.5 w-3.5 mr-1.5 inline-block", 
                currentStep === step.step ? "fill-primary/20" : "")} 
              />
            )}
            {step.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FormProgress;
