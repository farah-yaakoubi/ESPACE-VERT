"use client";
// src/app/admin/layout.tsx
// REMPLACE ENTIÈREMENT l'ancien fichier
import { ThemeProvider } from "@/hooks/useTheme";
import { AdminLayoutInner } from "@/components/admin/AdminLayoutInner";
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </ThemeProvider>
  );
}
