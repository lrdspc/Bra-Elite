import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    positive?: boolean;
  };
  className?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ 
  title, 
  value, 
  change,
  className 
}) => {
  return (
    <Card className={cn("w-full overflow-hidden h-full", className)}>
      <CardContent className="p-2 md:p-3">
        <p className="text-muted-foreground text-xs font-medium truncate max-w-full">{title}</p>
        <p className="text-base font-bold mt-1 truncate max-w-full">{value}</p>
        
        {change && (
          <div className={cn(
            "flex items-center mt-1 text-xs",
            change.positive ? "text-success" : "text-destructive"
          )}>
            <div className="flex-shrink-0 mr-1">
              {change.positive ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )}
            </div>
            <span className="truncate max-w-full">{change.value}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KpiCard;
