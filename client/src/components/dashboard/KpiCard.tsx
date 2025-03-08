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
    <Card className={cn("w-full max-w-full overflow-hidden", className)}>
      <CardContent className="p-4">
        <p className="text-muted-foreground text-xs sm:text-sm truncate">{title}</p>
        <p className="text-xl sm:text-2xl font-bold mt-1 truncate">{value}</p>
        
        {change && (
          <div className={cn(
            "flex items-center mt-2 text-xs sm:text-sm",
            change.positive ? "text-success" : "text-destructive"
          )}>
            {change.positive ? (
              <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
            ) : (
              <ArrowDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
            )}
            <span className="truncate">{change.value}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KpiCard;
