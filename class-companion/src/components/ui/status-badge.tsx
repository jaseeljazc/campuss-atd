import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        present: "bg-present-light text-present",
        absent: "bg-absent-light text-absent",
        "college-leave": "bg-college-leave-light text-college-leave",
        "not-marked": "bg-muted text-muted-foreground",
        warning: "bg-warning/10 text-warning",
        success: "bg-success/10 text-success",
        info: "bg-primary/10 text-primary",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        default: "px-3 py-1 text-xs",
        lg: "px-4 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "not-marked",
      size: "default",
    },
  }
);

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export function StatusBadge({ 
  variant, 
  size, 
  children, 
  className,
  icon 
}: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ variant, size }), className)}>
      {icon}
      {children}
    </span>
  );
}
