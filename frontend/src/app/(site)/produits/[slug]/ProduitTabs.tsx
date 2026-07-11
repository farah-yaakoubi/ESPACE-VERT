"use client";

import { useState, type ReactNode } from "react";
import { Printer } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

export function ProduitTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  if (tabs.length === 0) return null;
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div className="rounded-2xl bg-white border border-sand-200 overflow-hidden" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
      <div className="flex flex-wrap border-b border-sand-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`px-5 py-3.5 text-sm font-semibold transition-colors relative ${
              current.id === tab.id ? "text-ev-800" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
            {current.id === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px]" style={{ backgroundColor: "#e30613" }} />
            )}
          </button>
        ))}
      </div>
      <div className="p-5 sm:p-6">{current.content}</div>
    </div>
  );
}

/** Bouton "Imprimer la fiche technique" — ouvre le contenu HTML de la fiche
 *  dans une fenêtre dédiée et lance directement le dialogue d'impression. */
export function PrintFicheTechniqueButton({
  html,
  title,
  label = "Imprimer la fiche technique",
}: {
  html: string;
  title: string;
  label?: string;
}) {
  const handlePrint = () => {
    const win = window.open("", "_blank", "width=900,height=1000");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>${title} — Fiche technique</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: system-ui, sans-serif; color: #1a1a1a; padding: 32px; max-width: 780px; margin: 0 auto; }
            h1 { font-size: 20px; margin-bottom: 24px; }
            img { max-width: 100%; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          ${html}
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  };

  return (
    <button
      onClick={handlePrint}
      className="flex w-full items-center gap-3 rounded-xl border border-sand-200 bg-white px-4 py-3 text-left transition hover:border-ev-300 hover:bg-ev-50 group"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sand-100 text-gray-500 group-hover:bg-ev-100 group-hover:text-ev-700 transition-colors">
        <Printer size={16} />
      </span>
      <span className="text-sm font-semibold text-gray-700 group-hover:text-ev-800">{label}</span>
    </button>
  );
}