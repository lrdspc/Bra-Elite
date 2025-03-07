import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import InspectionForm from '@/components/inspection/InspectionForm';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const InspectionDetailPage: React.FC<{ id: string }> = ({ id }) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch inspection data
  const { data: inspection, isLoading, isError, error } = useQuery({
    queryKey: [`/api/inspections/${id}`],
    queryFn: async ({ queryKey }) => {
      try {
        const res = await fetch(queryKey[0] as string, {
          credentials: 'include',
        });
        
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Vistoria não encontrada');
          }
          throw new Error('Erro ao carregar dados da vistoria');
        }
        
        return res.json();
      } catch (error) {
        console.error('Error fetching inspection:', error);
        throw error;
      }
    },
  });

  // Show error toast when fetch fails
  useEffect(() => {
    if (isError) {
      toast({
        title: 'Erro ao carregar vistoria',
        description: error instanceof Error ? error.message : 'Tente novamente mais tarde',
        variant: 'destructive',
      });
      
      // Navigate back to inspections list after a delay
      const timer = setTimeout(() => {
        navigate('/inspections');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isError, error, toast, navigate]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando dados da vistoria...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (isError || !inspection) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-medium">Não foi possível carregar a vistoria</h2>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : 'Ocorreu um erro ao buscar os dados da vistoria.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <InspectionForm 
      inspectionId={id}
      initialData={inspection}
    />
  );
};

// Make sure we import AlertTriangle for the error state
import { AlertTriangle } from 'lucide-react';

export default InspectionDetailPage;
