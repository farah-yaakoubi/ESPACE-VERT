import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("skeleton rounded-xl", className)}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="h-48 bg-sand-200" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-2/3" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count, cols, rows }: { count?: number; cols?: number; rows?: number }) {
  const total = count ?? ((cols ?? 3) * (rows ?? 2));
  const colClass = cols === 4 ? "xl:grid-cols-4 lg:grid-cols-3" : cols === 2 ? "sm:grid-cols-2" : "lg:grid-cols-3";
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${colClass} gap-6`}>
      {Array.from({ length: total }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}