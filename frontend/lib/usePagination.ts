// lib/usePagination.ts
// Hook réutilisable : pagination + debounce + sync URL params

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export interface PaginationState {
  page:  number;
  total: number;
  pages: number;
}

export function useDebounce<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/** Sync un paramètre de filtre avec l'URL (pour bookmarkabilité) */
export function useUrlFilters() {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();

  const get = (key: string, fallback = "") =>
    searchParams.get(key) ?? fallback;

  const getNum = (key: string): number | undefined => {
    const v = searchParams.get(key);
    return v ? Number(v) : undefined;
  };

  const set = useCallback((updates: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, val] of Object.entries(updates)) {
      if (val === undefined || val === "" || val === 0) {
        params.delete(key);
      } else {
        params.set(key, String(val));
      }
    }
    // Reset page si un filtre change
    if (!("page" in updates)) params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  return { get, getNum, set, searchParams };
}

/** Pagination avec window ellipsis — ex: 1 … 4 5 6 … 12 */
export function buildPages(current: number, total: number, siblings = 1): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const left  = Math.max(2,           current - siblings);
  const right = Math.min(total - 1,   current + siblings);

  const pages: (number | "…")[] = [1];
  if (left > 2)       pages.push("…");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push("…");
  pages.push(total);
  return pages;
}
