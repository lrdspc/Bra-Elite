import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Plus, Users, Calendar, RefreshCw, FileText } from 'lucide-react';

const QuickAccess: React.FC = () => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-4 py-3 border-b border-neutral-light">
        <h2 className="font-medium">Acesso Rápido</h2>
      </CardHeader>
      
      <CardContent className="p-4">
        <Link href="/inspection/new">
          <Button className="w-full mb-3 flex items-center justify-center gap-2">
            <Plus size={18} />
            Nova Vistoria
          </Button>
        </Link>
        
        <div className="grid grid-cols-2 gap-3">
          <Link href="/clients">
            <Button variant="outline" className="flex flex-col items-center justify-center p-4 h-auto">
              <Users className="mb-1 h-5 w-5" />
              <span className="text-sm">Clientes</span>
            </Button>
          </Link>
          
          <Link href="/calendar">
            <Button variant="outline" className="flex flex-col items-center justify-center p-4 h-auto">
              <Calendar className="mb-1 h-5 w-5" />
              <span className="text-sm">Calendário</span>
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center p-4 h-auto"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="mb-1 h-5 w-5" />
            <span className="text-sm">Sincronizar</span>
          </Button>
          
          <Link href="/reports">
            <Button variant="outline" className="flex flex-col items-center justify-center p-4 h-auto">
              <FileText className="mb-1 h-5 w-5" />
              <span className="text-sm">Relatórios</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickAccess;
