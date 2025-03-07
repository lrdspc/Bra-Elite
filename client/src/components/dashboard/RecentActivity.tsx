import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const RecentActivity: React.FC = () => {
  const { data: inspections, isLoading } = useQuery({
    queryKey: ['/api/inspections'],
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-4 py-3 border-b border-neutral-light flex flex-row justify-between items-center">
        <h2 className="font-medium">Atividade Recente</h2>
        <Link href="/inspections">
          <a className="text-primary text-sm">Ver todas</a>
        </Link>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-light">
            <thead className="bg-muted">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Protocolo</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Cliente</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Data</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Técnico</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-light">
              {isLoading ? (
                // Loading skeletons
                Array(3).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : inspections && inspections.length > 0 ? (
                inspections.slice(0, 3).map((inspection: any) => (
                  <tr key={inspection.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      {inspection.protocolNumber}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {inspection.clientName || `Cliente #${inspection.clientId}`}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {formatDate(inspection.scheduledDate || inspection.updatedAt || inspection.createdAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(inspection.status)} font-medium`}>
                        {getStatusLabel(inspection.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {inspection.userName || 'Técnico'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                      <Link href={`/inspection/${inspection.id}`}>
                        <Button variant="link" className="h-auto p-0 text-primary">
                          {inspection.status === 'completed' ? 'Ver relatório' : 
                           inspection.status === 'in_review' ? 'Revisar' : 'Continuar'}
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                    Nenhuma vistoria encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
