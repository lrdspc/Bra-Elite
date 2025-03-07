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
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        <p className="text-muted-foreground text-sm">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        
        {change && (
          <div className={cn(
            "flex items-center mt-2 text-sm",
            change.positive ? "text-success" : "text-destructive"
          )}>
            {change.positive ? (
              <ArrowUp className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDown className="h-4 w-4 mr-1" />
            )}
            <span>{change.value}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KpiCard;
