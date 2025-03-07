import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { formatDateTime } from '@/lib/utils';
import { Calendar, User, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const NextVisits: React.FC = () => {
  const { data: inspections, isLoading } = useQuery({
    queryKey: ['/api/inspections?status=scheduled'],
  });

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
            inspections.slice(0, 3).map((inspection: any) => {
              // Determine if inspection is today
              const isToday = new Date(inspection.scheduledDate).toDateString() === new Date().toDateString();
              const dateLabel = isToday 
                ? `Hoje, ${formatDateTime(inspection.scheduledDate).split(',')[1]}` 
                : formatDateTime(inspection.scheduledDate);
              
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
                      <span className={`px-2 py-1 text-xs rounded-full ${isToday ? 'bg-secondary/10 text-secondary' : 'bg-muted text-muted-foreground'} font-medium`}>
                        {dateLabel}
                      </span>
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
