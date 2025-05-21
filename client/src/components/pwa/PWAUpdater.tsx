import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ReloadIcon } from '@radix-ui/react-icons';
import { useServiceWorker } from '@/hooks/useServiceWorker';

export function PWAUpdater() {
  const { updateAvailable, isUpdating, updateServiceWorker } = useServiceWorker();
  const [isDismissed, setIsDismissed] = useState(false);

  const handleUpdate = async () => {
    await updateServiceWorker();
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  if (!updateAvailable || isDismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-background border border-border rounded-lg shadow-lg z-50 max-w-sm">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <ReloadIcon className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Nova atualização disponível</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Uma nova versão do aplicativo está disponível. Atualize para obter as últimas melhorias e correções.
        </p>
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDismiss}
            disabled={isUpdating}
          >
            Depois
          </Button>
          <Button 
            size="sm" 
            onClick={handleUpdate}
            disabled={isUpdating}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isUpdating ? (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                Atualizando...
              </>
            ) : 'Atualizar Agora'}
          </Button>
        </div>
      </div>
    </div>
  );
}
