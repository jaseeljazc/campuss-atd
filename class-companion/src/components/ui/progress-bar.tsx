import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "success" | "warning" | "danger";
}

export function ProgressBar({
  value,
  max = 100,
  className,
  showLabel = true,
  size = "default",
  variant = "default",
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const getVariant = () => {
    if (variant !== "default") return variant;
    if (percentage >= 75) return "success";
    if (percentage >= 50) return "warning";
    return "danger";
  };
  
  const currentVariant = getVariant();
  
  const sizeClasses = {
    sm: "h-1.5",
    default: "h-2.5",
    lg: "h-4",
  };
  
  const variantClasses = {
    success: "bg-present",
    warning: "bg-college-leave",
    danger: "bg-absent",
    default: "bg-primary",
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-1">
        {showLabel && (
          <span className={cn(
            "text-sm font-medium",
            currentVariant === "danger" && "text-absent",
            currentVariant === "warning" && "text-college-leave",
            currentVariant === "success" && "text-present",
          )}>
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      <div className={cn("w-full bg-muted rounded-full overflow-hidden", sizeClasses[size])}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            variantClasses[currentVariant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
