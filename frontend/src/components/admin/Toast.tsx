"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

let _push: ((t: Omit<Toast, "id">) => void) | null = null;

export function pushToast(t: Omit<Toast, "id">) {
  _push?.(t);
}

/** Objet toast pratique utilisable depuis n'importe quel composant */
export const toast = {
  success: (title: string, message?: string) =>
    pushToast({ type: "success", title, message }),
  error: (title: string, message?: string) =>
    pushToast({ type: "error", title, message }),
  warning: (title: string, message?: string) =>
    pushToast({ type: "warning", title, message }),
  info: (title: string, message?: string) =>
    pushToast({ type: "info", title, message }),
};

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />,
  error:   <XCircle      size={18} className="text-red-500   shrink-0 mt-0.5" />,
  warning: <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />,
  info:    <Info          size={18} className="text-blue-500  shrink-0 mt-0.5" />,
};

const STYLES: Record<ToastType, string> = {
  success: "bg-white border-green-200",
  error:   "bg-white border-red-200",
  warning: "bg-white border-amber-200",
  info:    "bg-white border-blue-200",
};

const TITLE_STYLES: Record<ToastType, string> = {
  success: "text-green-800",
  error:   "text-red-800",
  warning: "text-amber-800",
  info:    "text-blue-800",
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    _push = (t) => {
      const id = Math.random().toString(36).slice(2);
      setToasts(prev => [...prev, { ...t, id }]);
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 4500);
    };
    return () => { _push = null; };
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg pointer-events-auto
            animate-in slide-in-from-right-4 fade-in duration-200 ${STYLES[t.type]}`}>
          {ICONS[t.type]}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${TITLE_STYLES[t.type]}`}>{t.title}</p>
            {t.message && (
              <p className="text-xs text-gray-500 mt-0.5 truncate">{t.message}</p>
            )}
          </div>
          <button onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}
            className="text-gray-400 hover:text-gray-600 transition-colors ml-1 shrink-0">
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}