// components/Pagination/Pagination.tsx
"use client";

import { buildPages } from "../lib/usePagination";

interface PaginationProps {
  page:      number;
  pages:     number;
  total:     number;
  onPage:    (p: number) => void;
  accentColor?: string;
}

export default function Pagination({
  page, pages, total, onPage, accentColor = "#0a6030",
}: PaginationProps) {
  if (pages <= 1) return null;

  const items = buildPages(page, pages);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1 mt-12 select-none flex-wrap"
    >
      {/* Précédent */}
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105"
        style={{ borderColor: "#e5e7eb", color: "#374151" }}
        aria-label="Page précédente"
      >
        ‹
      </button>

      {items.map((item, i) =>
        item === "…" ? (
          <span key={`ellipsis-${i}`} className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm">
            …
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onPage(item)}
            className="w-10 h-10 rounded-xl text-sm font-bold transition-all hover:scale-105"
            style={
              item === page
                ? { backgroundColor: accentColor, color: "#fff", boxShadow: `0 2px 8px ${accentColor}44` }
                : { backgroundColor: "#fff", color: "#374151", border: "1px solid #e5e7eb" }
            }
            aria-current={item === page ? "page" : undefined}
          >
            {item}
          </button>
        )
      )}

      {/* Suivant */}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page === pages}
        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105"
        style={{ borderColor: "#e5e7eb", color: "#374151" }}
        aria-label="Page suivante"
      >
        ›
      </button>

      {/* Compteur discret */}
      <span className="text-xs text-gray-400 ml-3 hidden sm:block">
        Page {page} / {pages} — {total} résultat{total > 1 ? "s" : ""}
      </span>
    </nav>
  );
}
