import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive?: boolean;
  };
  className?: string;
}

export const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  className 
}: MetricCardProps) => {
  return (
    <Card className={cn(
      "p-6 bg-gradient-subtle border-0 shadow-card hover:shadow-elegant transition-all duration-300",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {trend && (
            <div className={cn(
              "flex items-center text-xs font-medium",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              <span>{trend.isPositive ? "↗" : "↘"} {Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-accent-foreground" />
        </div>
      </div>
    </Card>
  );
};