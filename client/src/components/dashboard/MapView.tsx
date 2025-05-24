import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Navigation, LocateFixed, Route, ListPlus, ListMinus, CheckSquare, Square, X } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { mockInspections, Inspection } from '@/lib/mockData'; 

import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import RouteOrderingModal from './RouteOrderingModal'; // Import the new modal
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React Leaflet
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Function to calculate days since protocol date and determine urgency
const getUrgencyInfo = (protocolDate: string) => {
  if (!protocolDate) return { daysElapsed: 0, urgencyClass: 'bg-green-500' };

  const protocolDateTime = new Date(protocolDate).getTime();
  const currentTime = new Date().getTime();
  const daysDiff = Math.floor((currentTime - protocolDateTime) / (1000 * 60 * 60 * 24));

  // Determine urgency class based on days elapsed
  // Green: <10 days, Yellow: 10-15 days, Orange: 15-25 days, Red: >25 days
  let urgencyClass = '';
  if (daysDiff < 10) {
    urgencyClass = 'bg-green-500';
  } else if (daysDiff < 15) {
    urgencyClass = 'bg-yellow-500';
  } else if (daysDiff < 25) {
    urgencyClass = 'bg-orange-500';
  } else {
    urgencyClass = 'bg-red-500';
  }

  return { daysElapsed: daysDiff, urgencyClass };
};

// Component to recenter map to user's location
const LocationFinder = () => {
  const map = useMap();
  const { toast } = useToast();

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 13);
          toast({
            title: 'Localização encontrada',
            description: 'O mapa foi centralizado na sua localização atual.',
          });
        },
        (error) => {
          toast({
            title: 'Erro de localização',
            description: 'Não foi possível obter sua localização atual.',
            variant: 'destructive',
          });
          console.error('Error getting location:', error);
        }
      );
    } else {
      toast({
        title: 'Geolocalização não suportada',
        description: 'Seu navegador não suporta geolocalização.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: '60px' }}>
      <div className="leaflet-control leaflet-bar">
        <button 
          className="bg-white p-2 rounded-md shadow-md hover:bg-gray-100 transition-colors"
          onClick={handleLocateMe}
          title="Encontrar minha localização"
        >
          <LocateFixed className="h-5 w-5 text-primary" />
        </button>
      </div>
    </div>
  );
};

// Layer to display the sequenced route
const SequencedRouteLayer = ({ orderedInspections }: { orderedInspections: Inspection[] }) => {
  const map = useMap();
  const routePoints = useMemo(() => {
    return orderedInspections
      .filter(insp => insp.latitude && insp.longitude)
      .map(insp => [insp.latitude, insp.longitude] as LatLngExpression);
  }, [orderedInspections]);

  useEffect(() => {
    if (routePoints.length > 1) {
      map.fitBounds(L.polyline(routePoints).getBounds(), { padding: [50, 50] });
    }
  }, [routePoints, map]);

  if (routePoints.length < 2) {
    return null;
  }

  return <Polyline positions={routePoints} color="blue" weight={4} opacity={0.7} />;
};

const MapView: React.FC = () => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([-25.4284, -49.2733]); // Curitiba as default
  const [selectedInspections, setSelectedInspections] = useState<Inspection[]>([]);
  const [orderedInspections, setOrderedInspections] = useState<Inspection[]>([]);
  const [isOrderingModalOpen, setIsOrderingModalOpen] = useState(false); // State for modal
  const { toast } = useToast();

  // Fetch inspections with scheduled status
  const { data: inspections, isLoading } = useQuery<Inspection[], Error>({ // Added type for data and error
    queryKey: ['/api/inspections?status=scheduled'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockInspections.filter(insp => insp.status === 'scheduled');
    }
  });

  const sortedInspections = useMemo(() => {
    if (!inspections) return [];
    return [...inspections].sort((a, b) => {
      const dateA = a.protocolDate ? new Date(a.protocolDate).getTime() : 0;
      const dateB = b.protocolDate ? new Date(b.protocolDate).getTime() : 0;
      return dateA - dateB;
    });
  }, [inspections]);

  const toggleSelection = (inspection: Inspection) => {
    setSelectedInspections(prev => {
      const isSelected = prev.find(i => i.id === inspection.id);
      if (isSelected) {
        return prev.filter(i => i.id !== inspection.id);
      } else {
        if (prev.length >= 10) { // Limit selection to 10 for now
          toast({
            title: "Limite de seleção atingido",
            description: "Você pode selecionar no máximo 10 vistorias para a rota.",
            variant: "destructive"
          });
          return prev;
        }
        return [...prev, inspection];
      }
    });
  };
  
  // Update orderedInspections whenever selectedInspections changes (basic for now)
  useEffect(() => {
    setOrderedInspections(selectedInspections);
  }, [selectedInspections]);


  const handlePlanRoute = () => {
    if (selectedInspections.length < 2) {
      toast({
        title: "Seleção insuficiente",
        description: "Selecione pelo menos 2 vistorias para planejar uma rota.",
        variant: "destructive"
      });
      return;
    }
    // The SequencedRouteLayer will automatically update based on orderedInspections state
    // Now, open the modal
    setIsOrderingModalOpen(true);
  };

  const handleOrderChange = (newOrder: Inspection[]) => {
    setOrderedInspections(newOrder);
    // Optionally, also update selectedInspections if the modal could remove items
    setSelectedInspections(newOrder); 
    toast({
      title: "Ordem da rota atualizada",
      description: "A sequência da rota no mapa foi atualizada.",
    });
  };

  return (
    <Card className="md:col-span-2 overflow-hidden">
      <CardHeader className="px-4 py-3 border-b border-neutral-light flex flex-row justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="font-medium">Mapa de Vistorias</h2>
          {selectedInspections.length > 0 && (
            <Button onClick={handlePlanRoute} size="sm" variant="default">
              <Route className="h-4 w-4 mr-1" />
              {orderedInspections.length > 1 ? 'Editar Rota' : 'Ordenar Rota'} ({selectedInspections.length})
            </Button>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {sortedInspections.length} vistoria(s) agendada(s)
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center bg-muted">
            <Skeleton className="h-[300px] w-[90%] rounded-md" />
          </div>
        ) : (
          <div className="h-[400px] relative">
            <MapContainer 
              center={mapCenter} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {sortedInspections.map((inspection: Inspection) => {
                if (!inspection.latitude || !inspection.longitude) return null;
                const urgencyInfo = getUrgencyInfo(inspection.protocolDate || '');
                const isSelected = selectedInspections.some(i => i.id === inspection.id);
                const orderIndex = orderedInspections.findIndex(i => i.id === inspection.id);

                const customIcon = L.divIcon({
                  className: `custom-div-icon ${isSelected ? 'selected' : ''}`,
                  html: `<div class="marker-pin ${urgencyInfo.urgencyClass} ${isSelected ? 'ring-2 ring-blue-500' : ''}"></div>
                         ${isSelected && orderIndex !== -1 ? `<div class="marker-order-badge">${orderIndex + 1}</div>` : ''}`,
                  iconSize: [30, 42],
                  iconAnchor: [15, 42]
                });
                
                return (
                  <Marker 
                    key={inspection.id} 
                    position={[inspection.latitude, inspection.longitude]}
                    icon={customIcon}
                  >
                    <Popup>
                      <div className="p-1 space-y-2">
                        <h3 className="font-medium text-sm">{inspection.projectName || `Projeto #${inspection.projectId}`}</h3>
                        <p className="text-xs text-muted-foreground">{inspection.address || 'Endereço pendente'}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Badge className="text-[10px] h-4">
                            {inspection.scheduledDate ? formatDateTime(inspection.scheduledDate) : 'Data N/A'}
                          </Badge>
                          {inspection.protocolDate && (
                            <Badge variant="outline" className="text-[10px] h-4">
                              {urgencyInfo.daysElapsed} dias
                            </Badge>
                          )}
                        </div>
                        <Button 
                          size="xs" 
                          variant={isSelected ? "destructive" : "outline"}
                          onClick={() => toggleSelection(inspection)}
                          className="w-full flex items-center gap-1"
                        >
                          {isSelected ? <ListMinus className="h-3 w-3" /> : <ListPlus className="h-3 w-3" />}
                          {isSelected ? 'Remover da Rota' : 'Adicionar à Rota'}
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              <LocationFinder />
              <SequencedRouteLayer orderedInspections={orderedInspections} />
            </MapContainer>

            {/* CSS for custom markers */}
            <style jsx>{`
              :global(.marker-pin) {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                position: relative; /* For order badge positioning */
              }
              :global(.marker-pin.ring-2) { /* Style for selected marker pin */
                border-color: #3b82f6; /* blue-500 */
              }
              :global(.marker-order-badge) {
                position: absolute;
                top: -5px;
                right: -5px;
                background-color: #3b82f6; /* blue-500 */
                color: white;
                border-radius: 50%;
                width: 16px;
                height: 16px;
                font-size: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                border: 1px solid white;
              }
            `}</style>
          </div>
        )}
      </CardContent>
      <RouteOrderingModal
        isOpen={isOrderingModalOpen}
        onClose={() => setIsOrderingModalOpen(false)}
        inspections={selectedInspections}
        onOrderChange={handleOrderChange}
      />
    </Card>
  );
};

export default MapView;
