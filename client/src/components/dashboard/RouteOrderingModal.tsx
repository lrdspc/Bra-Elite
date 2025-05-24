import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Inspection } from '@/lib/mockData'; // Assuming Inspection type is exported from mockData
import { ArrowUp, ArrowDown, Save } from 'lucide-react';

interface RouteOrderingModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspections: Inspection[];
  onOrderChange: (orderedInspections: Inspection[]) => void;
}

const RouteOrderingModal: React.FC<RouteOrderingModalProps> = ({
  isOpen,
  onClose,
  inspections,
  onOrderChange,
}) => {
  const [localOrderedInspections, setLocalOrderedInspections] = React.useState<Inspection[]>([]);

  React.useEffect(() => {
    setLocalOrderedInspections([...inspections]);
  }, [inspections, isOpen]); // Reset local order when inspections change or modal opens

  const moveInspection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...localOrderedInspections];
    const item = newOrder[index];

    if (direction === 'up' && index > 0) {
      newOrder.splice(index, 1);
      newOrder.splice(index - 1, 0, item);
    } else if (direction === 'down' && index < newOrder.length - 1) {
      newOrder.splice(index, 1);
      newOrder.splice(index + 1, 0, item);
    }
    setLocalOrderedInspections(newOrder);
  };

  const handleSaveChanges = () => {
    onOrderChange(localOrderedInspections);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ordenar Vistorias da Rota</DialogTitle>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto">
          {localOrderedInspections.length === 0 ? (
            <p className="text-muted-foreground text-center">Nenhuma vistoria selecionada para ordenação.</p>
          ) : (
            <ul className="space-y-2">
              {localOrderedInspections.map((inspection, index) => (
                <li
                  key={inspection.id}
                  className="flex items-center justify-between p-3 border rounded-md shadow-sm bg-card"
                >
                  <div className="flex-grow">
                    <p className="font-medium">{inspection.projectName || `Projeto #${inspection.projectId}`}</p>
                    <p className="text-sm text-muted-foreground">{inspection.address || 'Endereço não disponível'}</p>
                  </div>
                  <div className="flex items-center space-x-1 ml-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => moveInspection(index, 'up')}
                      disabled={index === 0}
                      aria-label="Mover para cima"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => moveInspection(index, 'down')}
                      disabled={index === localOrderedInspections.length - 1}
                      aria-label="Mover para baixo"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSaveChanges} disabled={localOrderedInspections.length < 2}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Ordem
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RouteOrderingModal;
