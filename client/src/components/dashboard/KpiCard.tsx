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
    <Card className={cn("w-full overflow-hidden", className)}>
      <CardContent className="p-3">
        <p className="text-muted-foreground text-xs font-medium truncate">{title}</p>
        <p className="text-lg font-bold mt-1 truncate">{value}</p>
        
        {change && (
          <div className={cn(
            "flex items-center mt-2 text-xs",
            change.positive ? "text-success" : "text-destructive"
          )}>
            {change.positive ? (
              <ArrowUp className="h-3 w-3 mr-1 flex-shrink-0" />
            ) : (
              <ArrowDown className="h-3 w-3 mr-1 flex-shrink-0" />
            )}
            <span className="truncate">{change.value}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KpiCard;
