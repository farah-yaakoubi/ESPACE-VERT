import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "sand" | "matar" | "outline";
  className?: string;
}

export function Badge({ children, variant = "sand", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "badge",
        variant === "green"   && "badge-green",
        variant === "sand"    && "badge-sand",
        variant === "matar"   && "badge-matar",
        variant === "outline" && "badge border border-gray-200 bg-transparent text-gray-600",
        className
      )}
    >
      {children}
    </span>
  );
}
