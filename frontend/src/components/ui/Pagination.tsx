"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApiMeta } from "@/types/api";

interface PaginationProps {
  meta: ApiMeta;
  onPageChange: (page: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  const { page, pages } = meta;
  if (pages <= 1) return null;

  const getRange = (): (number | "…")[] => {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    const range: (number | "…")[] = [1];
    if (page > 3)         range.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) range.push(i);
    if (page < pages - 2) range.push("…");
    range.push(pages);
    return range;
  };

  return (
    <nav className="flex items-center justify-center gap-1 mt-12" aria-label="Pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="p-2 rounded-lg hover:bg-sand-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Page précédente"
      >
        <ChevronLeft size={18} />
      </button>

      {getRange().map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-2 py-1 text-gray-400 text-sm select-none">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              "w-9 h-9 rounded-lg text-sm font-medium transition-all",
              p === page
                ? "bg-ev-700 text-white shadow-green"
                : "hover:bg-sand-100 text-gray-700"
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
        className="p-2 rounded-lg hover:bg-sand-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Page suivante"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}
