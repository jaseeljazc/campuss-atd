import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  const variantStyles = {
    default: "border-border",
    success: "border-present/20 bg-present-light/30",
    warning: "border-college-leave/20 bg-college-leave-light/30",
    danger: "border-absent/20 bg-absent-light/30",
    info: "border-primary/20 bg-primary/5",
  };

  const iconVariants = {
    default: "bg-muted text-muted-foreground",
    success: "bg-present/10 text-present",
    warning: "bg-college-leave/10 text-college-leave",
    danger: "bg-absent/10 text-absent",
    info: "bg-primary/10 text-primary",
  };

  return (
    <div
      className={cn(
        "card-elevated p-3 sm:p-4 md:p-5 transition-all duration-200 hover:shadow-elevated",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <p className="text-xl sm:text-2xl font-bold font-display tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                "text-xs font-medium flex items-center gap-1",
                trend.isPositive ? "text-present" : "text-absent"
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div className={cn("p-2 sm:p-2.5 rounded-lg", iconVariants[variant])}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
