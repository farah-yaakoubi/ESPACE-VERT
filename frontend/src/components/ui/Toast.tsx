"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

const ICONS = {
  success: CheckCircle2,
  error:   XCircle,
  info:    Info,
  warning: AlertTriangle,
};

const STYLES = {
  success: { border: "border-green-200", icon: "text-green-600", bar: "bg-green-500" },
  error:   { border: "border-red-200",   icon: "text-red-600",   bar: "bg-red-500"   },
  info:    { border: "border-blue-200",  icon: "text-blue-600",  bar: "bg-blue-500"  },
  warning: { border: "border-amber-200", icon: "text-amber-600", bar: "bg-amber-500" },
};

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  const s    = STYLES[toast.type];
  const Icon = ICONS[toast.type];

  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(t);
  }, [toast.id, onRemove]);

  return (
    <div
      className={`relative flex items-start gap-3 w-80 rounded-2xl border bg-white shadow-xl overflow-hidden p-4 ${s.border}`}
      style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)" }}
    >
      {/* barre colorée gauche */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${s.bar} rounded-l-2xl`} />

      <div className={`shrink-0 mt-0.5 ${s.icon}`}>
        <Icon size={18} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 leading-tight">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{toast.message}</p>
        )}
      </div>

      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 p-0.5 text-gray-300 hover:text-gray-600 rounded-lg transition-colors"
      >
        <X size={14} />
      </button>

      {/* barre de progression */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 ${s.bar} opacity-30`}
        style={{ animation: "toast-progress 4s linear forwards" }}
      />

      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to   { width: 0%;   }
        }
      `}</style>
    </div>
  );
}

/* ─── Singleton push function ───────────────────────────────────── */
let _push: ((t: Omit<ToastMessage, "id">) => void) | null = null;

export function toast(type: ToastType, title: string, message?: string) {
  _push?.({ type, title, message });
}
toast.success = (title: string, msg?: string) => toast("success", title, msg);
toast.error   = (title: string, msg?: string) => toast("error",   title, msg);
toast.info    = (title: string, msg?: string) => toast("info",    title, msg);
toast.warning = (title: string, msg?: string) => toast("warning", title, msg);

/* ─── Provider — à placer dans le layout admin ──────────────────── */
export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    _push = (t) => {
      const id = Math.random().toString(36).slice(2);
      setToasts(prev => [...prev.slice(-4), { ...t, id }]);
    };
    return () => { _push = null; };
  }, []);

  const remove = (id: string) =>
    setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onRemove={remove} />
        </div>
      ))}
    </div>
  );
}