import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { formatDateTime } from '@/lib/utils';
import { Calendar, User, Info, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { mockInspections } from '@/lib/mockData';

const NextVisits: React.FC = () => {
  const { data: inspections, isLoading } = useQuery({
    queryKey: ['/api/inspections?status=scheduled'],
    // Use mock data for testing
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockInspections.filter(insp => insp.status === 'scheduled');
    }
  });

  // Function to calculate days since protocol date and determine urgency
  const getUrgencyInfo = (protocolDate: string) => {
    if (!protocolDate) return { daysElapsed: 0, urgencyClass: 'bg-green-100 text-green-800' };

    const protocolDateTime = new Date(protocolDate).getTime();
    const currentTime = new Date().getTime();
    const daysDiff = Math.floor((currentTime - protocolDateTime) / (1000 * 60 * 60 * 24));

    // Determine urgency class based on days elapsed
    // Green: <10 days, Yellow: 10-15 days, Orange: 15-25 days, Red: >25 days
    let urgencyClass = '';
    if (daysDiff < 10) {
      urgencyClass = 'bg-green-100 text-green-800';
    } else if (daysDiff < 15) {
      urgencyClass = 'bg-yellow-100 text-yellow-800';
    } else if (daysDiff < 25) {
      urgencyClass = 'bg-orange-100 text-orange-800';
    } else {
      urgencyClass = 'bg-red-100 text-red-800';
    }

    return { daysElapsed: daysDiff, urgencyClass };
  };

  return (
    <Card className="md:col-span-2 overflow-hidden">
      <CardHeader className="px-4 py-3 border-b border-neutral-light flex flex-row justify-between items-center">
        <h2 className="font-medium">Próximas Vistorias</h2>
        <Link href="/inspections?status=scheduled">
          <a className="text-primary text-sm">Ver todas</a>
        </Link>
      </CardHeader>

      <CardContent className="p-0 overflow-hidden">
        <div className="divide-y divide-neutral-light">
          {isLoading ? (
            // Loading skeletons
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="p-4 flex">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mr-4">
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <Skeleton className="h-5 w-40 mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                  <div className="flex mt-2">
                    <Skeleton className="h-4 w-20 mr-4" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            ))
          ) : inspections && inspections.length > 0 ? (
            // Sort inspections by protocol date (oldest first for prioritization)
            [...inspections]
              .sort((a, b) => {
                const dateA = a.protocolDate ? new Date(a.protocolDate).getTime() : 0;
                const dateB = b.protocolDate ? new Date(b.protocolDate).getTime() : 0;
                return dateA - dateB; // Oldest first
              })
              .slice(0, 3)
              .map((inspection: any) => {
                // Determine if inspection is today
                const isToday = new Date(inspection.scheduledDate).toDateString() === new Date().toDateString();
                const dateLabel = isToday 
                  ? `Hoje, ${formatDateTime(inspection.scheduledDate).split(',')[1]}` 
                  : formatDateTime(inspection.scheduledDate);

                // Get urgency information based on protocol date
                const urgencyInfo = getUrgencyInfo(inspection.protocolDate);

              return (
                <div key={inspection.id} className="p-4 flex">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4">
                    {isToday ? <Calendar size={20} /> : <Calendar size={20} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{inspection.projectName || `Projeto #${inspection.projectId}`}</p>
                        <p className="text-sm text-muted-foreground">{inspection.address || 'Endereço pendente'}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`px-2 py-1 text-xs rounded-full ${isToday ? 'bg-secondary/10 text-secondary' : 'bg-muted text-muted-foreground'} font-medium mb-1`}>
                          {dateLabel}
                        </span>
                        {inspection.protocolDate && (
                          <span className={`px-2 py-1 text-xs rounded-full ${urgencyInfo.urgencyClass} font-medium flex items-center`}>
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {urgencyInfo.daysElapsed} dias do protocolo
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex mt-2 text-sm">
                      <div className="flex items-center mr-4">
                        <User className="text-muted-foreground mr-1 h-4 w-4" />
                        <span>{inspection.contactName || 'Cliente'}</span>
                      </div>
                      <div className="flex items-center">
                        <Info className="text-muted-foreground mr-1 h-4 w-4" />
                        <span>{inspection.description || 'Vistoria técnica'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              Não há vistorias agendadas.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NextVisits;
