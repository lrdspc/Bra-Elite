import React from 'react';
import InspectionForm from '@/components/inspection/InspectionForm';
import { useToast } from '@/hooks/use-toast';
import { generateProtocolNumber } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const NewInspectionPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Generate initial data for a new inspection
  const initialData = {
    userId: user?.id,
    status: 'draft',
    protocolNumber: generateProtocolNumber(),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return (
    <InspectionForm 
      initialData={initialData}
    />
  );
};

export default NewInspectionPage;
