"use client";
import { ThemeProvider } from "@/hooks/useTheme";
import { AdminLayoutInner } from "@/components/admin/AdminLayoutInner";
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </ThemeProvider>
  );
}
