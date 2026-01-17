import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "secondary" | "white" | "muted";
}

export function Loader({
  size = "md",
  variant = "primary",
  className,
  ...props
}: LoaderProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const variantClasses = {
    primary: "text-primary",
    secondary: "text-secondary",
    white: "text-white",
    muted: "text-muted-foreground",
  };

  return (
    <div
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      <Loader2
        className={cn(
          "animate-spin",
          sizeClasses[size],
          variantClasses[variant],
        )}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = "Loading..." }: PageLoaderProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
      <Loader size="xl" className="mb-4" />
      <p className="text-muted-foreground font-medium animate-pulse">
        {message}
      </p>
    </div>
  );
}

interface SectionLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  minHeight?: string;
}

export function SectionLoader({
  message,
  minHeight = "h-40",
  className,
  ...props
}: SectionLoaderProps) {
  return (
    <div
      className={cn(
        "w-full flex flex-col items-center justify-center bg-muted/5 rounded-lg border-2 border-dashed border-muted/20",
        minHeight,
        className,
      )}
      {...props}
    >
      <Loader size="lg" className="mb-3" />
      {message && (
        <p className="text-sm text-muted-foreground font-medium">{message}</p>
      )}
    </div>
  );
}
