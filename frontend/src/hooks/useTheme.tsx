"use client";
// src/hooks/useTheme.tsx — CORRIGÉ : variables CSS dans globals.css
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
interface ThemeCtx { theme: Theme; toggle: () => void; isDark: boolean; }

const Ctx = createContext<ThemeCtx>({ theme: "light", toggle: () => {}, isDark: false });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme,   setTheme]   = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Les variables CSS light/dark sont définies dans globals.css
    // On applique juste l'attribut data-theme sur <html>
    const saved = localStorage.getItem("ev_admin_theme") as Theme | null;
    const dark  = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    const initial: Theme = dark ? "dark" : "light";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("ev_admin_theme", theme);
  }, [theme, mounted]);

  const toggle = () => setTheme(t => t === "light" ? "dark" : "light");

  return (
    <Ctx.Provider value={{ theme, toggle, isDark: theme === "dark" }}>
      {children}
    </Ctx.Provider>
  );
}

export const useTheme = () => useContext(Ctx);
