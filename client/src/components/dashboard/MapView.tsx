import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Navigation, LocateFixed, Route } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { mockInspections } from '@/lib/mockData';

// These imports will work once the packages are installed
// @ts-ignore
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
// @ts-ignore
import L from 'leaflet';
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

// Component to calculate and display optimized route
const RouteOptimizer = ({ inspections }: { inspections: any[] }) => {
  const map = useMap();
  const { toast } = useToast();
  const [isCalculating, setIsCalculating] = useState(false);
  const [route, setRoute] = useState<any>(null);

  const calculateOptimizedRoute = () => {
    setIsCalculating(true);

    // In a real implementation, this would call a routing API like GraphHopper, OSRM, or MapBox
    // For this demo, we'll just create a simple route connecting all points
    setTimeout(() => {
      try {
        if (inspections.length < 2) {
          toast({
            title: 'Rota não disponível',
            description: 'É necessário ter pelo menos 2 pontos para calcular uma rota.',
            variant: 'destructive',
          });
          setIsCalculating(false);
          return;
        }

        // Get coordinates from inspections
        const points = inspections
          .filter(insp => insp.latitude && insp.longitude)
          .map(insp => [insp.latitude, insp.longitude]);

        if (points.length < 2) {
          toast({
            title: 'Dados de localização insuficientes',
            description: 'Algumas vistorias não possuem dados de localização.',
            variant: 'destructive',
          });
          setIsCalculating(false);
          return;
        }

        // Create a polyline for the route
        const routeLine = L.polyline(points, { color: 'blue', weight: 4, opacity: 0.7 });

        // Remove previous route if exists
        if (route) {
          map.removeLayer(route);
        }

        // Add new route to map
        routeLine.addTo(map);
        setRoute(routeLine);

        // Fit map to show the entire route
        map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });

        toast({
          title: 'Rota calculada',
          description: `Rota otimizada com ${points.length} pontos de parada.`,
        });
      } catch (error) {
        console.error('Error calculating route:', error);
        toast({
          title: 'Erro ao calcular rota',
          description: 'Ocorreu um erro ao calcular a rota otimizada.',
          variant: 'destructive',
        });
      } finally {
        setIsCalculating(false);
      }
    }, 1500); // Simulate API delay
  };

  return (
    <div className="leaflet-bottom leaflet-right" style={{ marginBottom: '20px' }}>
      <div className="leaflet-control">
        <Button 
          onClick={calculateOptimizedRoute}
          disabled={isCalculating}
          className="flex items-center gap-2"
        >
          <Route className="h-4 w-4" />
          {isCalculating ? 'Calculando...' : 'Calcular Rota Otimizada'}
        </Button>
      </div>
    </div>
  );
};

const MapView: React.FC = () => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([-25.4284, -49.2733]); // Curitiba as default

  // Fetch inspections with scheduled status
  const { data: inspections, isLoading } = useQuery({
    queryKey: ['/api/inspections?status=scheduled'],
    // Use mock data for testing
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockInspections.filter(insp => insp.status === 'scheduled');
    }
  });

  // Sort inspections by protocol date (oldest first for prioritization)
  const sortedInspections = React.useMemo(() => {
    if (!inspections) return [];

    return [...inspections]
      .sort((a, b) => {
        const dateA = a.protocolDate ? new Date(a.protocolDate).getTime() : 0;
        const dateB = b.protocolDate ? new Date(b.protocolDate).getTime() : 0;
        return dateA - dateB; // Oldest first
      });
  }, [inspections]);

  return (
    <Card className="md:col-span-2 overflow-hidden">
      <CardHeader className="px-4 py-3 border-b border-neutral-light flex flex-row justify-between items-center">
        <h2 className="font-medium">Mapa de Vistorias</h2>
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

              {sortedInspections.map((inspection: any) => {
                // Skip if no coordinates
                if (!inspection.latitude || !inspection.longitude) return null;

                // Get urgency information based on protocol date
                const urgencyInfo = getUrgencyInfo(inspection.protocolDate);

                // Create custom icon based on urgency
                const customIcon = L.divIcon({
                  className: 'custom-div-icon',
                  html: `<div class="marker-pin ${urgencyInfo.urgencyClass}"></div>`,
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
                      <div className="p-1">
                        <h3 className="font-medium text-sm">{inspection.projectName || `Projeto #${inspection.projectId}`}</h3>
                        <p className="text-xs text-muted-foreground">{inspection.address || 'Endereço pendente'}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Badge className="text-[10px] h-4">
                            {formatDateTime(inspection.scheduledDate)}
                          </Badge>
                          {inspection.protocolDate && (
                            <Badge variant="outline" className="text-[10px] h-4">
                              {urgencyInfo.daysElapsed} dias
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              <LocationFinder />
              <RouteOptimizer inspections={sortedInspections} />
            </MapContainer>

            {/* CSS for custom markers */}
            <style jsx>{`
              :global(.marker-pin) {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 1px 3px rgba(0,0,0,0.3);
              }
            `}</style>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MapView;
