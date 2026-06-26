"use client";
/**
 * GlobalCommandPalette.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Palette de commandes globale (⌘K / Ctrl+K) — Espace Vert Admin
 *
 * Fonctionnalités :
 *  • Recherche full-text dans produits, marques, actualités, FAQs, devis, RDV, messages
 *  • Commandes de navigation rapide
 *  • Actions rapides (aller à une section, créer un élément)
 *  • Résultats groupés avec icônes et raccourcis clavier
 *  • Debounce 200ms avec indicateur de chargement
 *  • Naviguer avec ↑↓ et valider avec ⏎
 *
 * INSTALLATION :
 *  1. Copier dans src/components/admin/GlobalCommandPalette.tsx
 *  2. Dans AdminLayoutInner.tsx, ajouter <GlobalCommandPalette /> dans le layout
 *  3. Le raccourci ⌘K / Ctrl+K est capturé globalement
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { tokenStore } from "@/lib/admin-api";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  Calendar,
  Command,
  FileText,
  Globe,
  HelpCircle,
  ImageIcon,
  Layers,
  LayoutDashboard,
  Loader2,
  MessageSquare,
  Newspaper,
  Package,
  Plus,
  Search,
  Shield,
  Tag,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

// ─── Palette Espace Vert ──────────────────────────────────────────────────────
const EV = {
  bg: "#0f1a14",
  bg2: "#162117",
  accent: "#2e7d4f",
  accentLt: "#3a9e63",
  accentXl: "#4fbb7a",
  border: "rgba(255,255,255,0.08)",
  textBright: "rgba(255,255,255,0.9)",
  textMid: "rgba(255,255,255,0.55)",
  textDim: "rgba(255,255,255,0.28)",
};

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SearchResult {
  id: string;
  type:
    | "produit"
    | "marque"
    | "actualite"
    | "faq"
    | "devis"
    | "rdv"
    | "contact"
    | "nav"
    | "action";
  label: string;
  sublabel?: string;
  href: string;
  icon: React.ReactNode;
  badge?: { text: string; color: string };
  score?: number;
}

// ─── Commandes de navigation statiques ───────────────────────────────────────
const NAV_COMMANDS: SearchResult[] = [
  {
    id: "nav-dashboard",
    type: "nav",
    label: "Dashboard",
    sublabel: "Vue d'ensemble",
    href: "/admin/dashboard",
    icon: <LayoutDashboard size={14} />,
  },
  {
    id: "nav-analytics",
    type: "nav",
    label: "Analytiques",
    sublabel: "Statistiques et rapports",
    href: "/admin/analytics",
    icon: <BarChart3 size={14} />,
  },
  {
    id: "nav-produits",
    type: "nav",
    label: "Produits",
    sublabel: "Catalogue produits",
    href: "/admin/produits",
    icon: <Package size={14} />,
  },
  {
    id: "nav-marques",
    type: "nav",
    label: "Marques",
    sublabel: "Gestion des marques",
    href: "/admin/marques",
    icon: <Tag size={14} />,
  },
  {
    id: "nav-activites",
    type: "nav",
    label: "Activités",
    sublabel: "Catégories d'activités",
    href: "/admin/activites",
    icon: <Activity size={14} />,
  },
  {
    id: "nav-categories",
    type: "nav",
    label: "Catégories",
    sublabel: "Arborescence catalogue",
    href: "/admin/categories",
    icon: <Layers size={14} />,
  },
  {
    id: "nav-actualites",
    type: "nav",
    label: "Actualités",
    sublabel: "CMS Blog",
    href: "/admin/actualites",
    icon: <Newspaper size={14} />,
  },
  {
    id: "nav-hero",
    type: "nav",
    label: "Hero Slides",
    sublabel: "Carrousel page d'accueil",
    href: "/admin/hero",
    icon: <ImageIcon size={14} />,
  },
  {
    id: "nav-faq",
    type: "nav",
    label: "FAQ",
    sublabel: "Questions fréquentes",
    href: "/admin/faq",
    icon: <HelpCircle size={14} />,
  },
  {
    id: "nav-devis",
    type: "nav",
    label: "Devis",
    sublabel: "CRM — Demandes de devis",
    href: "/admin/devis",
    icon: <FileText size={14} />,
  },
  {
    id: "nav-rdv",
    type: "nav",
    label: "Rendez-vous",
    sublabel: "CRM — Agenda",
    href: "/admin/rdv",
    icon: <Calendar size={14} />,
  },
  {
    id: "nav-contact",
    type: "nav",
    label: "Messages",
    sublabel: "CRM — Contact",
    href: "/admin/contact",
    icon: <MessageSquare size={14} />,
  },
  {
    id: "nav-chat",
    type: "nav",
    label: "Chat interne",
    sublabel: "Messagerie équipe",
    href: "/admin/chat",
    icon: <MessageSquare size={14} />,
  },
  {
    id: "nav-visiteurs",
    type: "nav",
    label: "Visiteurs",
    sublabel: "Suivi des visiteurs",
    href: "/admin/visiteurs",
    icon: <Users size={14} />,
  },
  {
    id: "nav-admins",
    type: "nav",
    label: "Administrateurs",
    sublabel: "Gestion des accès",
    href: "/admin/admins",
    icon: <Users size={14} />,
  },
  {
    id: "nav-audit",
    type: "nav",
    label: "Journal d'audit",
    sublabel: "Historique des actions",
    href: "/admin/audit",
    icon: <Shield size={14} />,
  },
  {
    id: "nav-chatbot",
    type: "nav",
    label: "Assistant IA",
    sublabel: "Intelligence artificielle",
    href: "/admin/chatbot",
    icon: <Bot size={14} />,
  },
  {
    id: "nav-site",
    type: "nav",
    label: "Voir le site public",
    sublabel: "espace-vert.com.tn",
    href: "/",
    icon: <Globe size={14} />,
  },
];

const ACTION_COMMANDS: SearchResult[] = [
  {
    id: "act-new-produit",
    type: "action",
    label: "Nouveau produit",
    sublabel: "Créer un produit dans le catalogue",
    href: "/admin/produits",
    icon: <Plus size={14} />,
    badge: { text: "Créer", color: EV.accentXl },
  },
  {
    id: "act-new-actu",
    type: "action",
    label: "Nouvelle actualité",
    sublabel: "Rédiger un article de blog",
    href: "/admin/actualites",
    icon: <Plus size={14} />,
    badge: { text: "Créer", color: EV.accentXl },
  },
  {
    id: "act-new-faq",
    type: "action",
    label: "Nouvelle FAQ",
    sublabel: "Ajouter une question-réponse",
    href: "/admin/faq",
    icon: <Plus size={14} />,
    badge: { text: "Créer", color: EV.accentXl },
  },
];

// ─── Hook debounce ────────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// ─── Recherche API ────────────────────────────────────────────────────────────
async function searchAPI(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];
  const token = tokenStore.get();
  const headers: HeadersInit | undefined = token
    ? { Authorization: `Bearer ${token}` }
    : undefined;
  const results: SearchResult[] = [];

  const doFetch = async (url: string) => {
    try {
      const r = await fetch(url, { headers, cache: "no-store" });
      if (!r.ok) return null;
      const j = await r.json();
      return j?.data ?? j ?? null;
    } catch {
      return null;
    }
  };

  const q = encodeURIComponent(query);

  // Recherche parallèle
  const [produits, actualites, faqs, devis, contacts] = await Promise.all([
    doFetch(`${BASE}/admin/produits?search=${q}&limit=5`),
    doFetch(`${BASE}/admin/actualites?search=${q}&limit=4`),
    doFetch(`${BASE}/admin/faq?search=${q}&limit=4`),
    doFetch(`${BASE}/admin/devis?search=${q}&limit=3`),
    doFetch(`${BASE}/admin/contact?search=${q}&limit=3`),
  ]);

  // Produits
  const produitsArr = Array.isArray(produits)
    ? produits
    : (produits?.items ?? produits?.produits ?? []);
  for (const p of produitsArr.slice(0, 5)) {
    results.push({
      id: `produit-${p.id_produit}`,
      type: "produit",
      label: p.nom ?? "Produit sans nom",
      sublabel: p.marque?.nom ?? p.division ?? "Catalogue",
      href: `/admin/produits`,
      icon: <Package size={14} />,
      badge:
        p.actif === false ? { text: "Inactif", color: "#6b7280" } : undefined,
    });
  }

  // Actualités
  const actuArr = Array.isArray(actualites)
    ? actualites
    : (actualites?.items ?? actualites?.actualites ?? []);
  for (const a of actuArr.slice(0, 4)) {
    results.push({
      id: `actu-${a.id_actualite}`,
      type: "actualite",
      label: a.titre ?? "Article",
      sublabel: a.publiee ? "Publié" : "Brouillon",
      href: `/admin/actualites`,
      icon: <Newspaper size={14} />,
      badge: !a.publiee ? { text: "Brouillon", color: "#f59e0b" } : undefined,
    });
  }

  // FAQs
  const faqArr = Array.isArray(faqs) ? faqs : (faqs?.items ?? faqs?.faqs ?? []);
  for (const f of faqArr.slice(0, 4)) {
    results.push({
      id: `faq-${f.id_faq}`,
      type: "faq",
      label: f.question ?? "FAQ",
      sublabel: "FAQ",
      href: `/admin/faq`,
      icon: <HelpCircle size={14} />,
    });
  }

  // Devis
  const devisArr = Array.isArray(devis)
    ? devis
    : (devis?.items ?? devis?.devis ?? []);
  for (const d of devisArr.slice(0, 3)) {
    results.push({
      id: `devis-${d.id_devis}`,
      type: "devis",
      label: `Devis — ${d.nom ?? d.email ?? `#${d.id_devis}`}`,
      sublabel: d.statut ?? "en_attente",
      href: `/admin/devis`,
      icon: <FileText size={14} />,
      badge:
        d.statut === "en_attente"
          ? { text: "En attente", color: "#f59e0b" }
          : undefined,
    });
  }

  // Contacts
  const contactArr = Array.isArray(contacts)
    ? contacts
    : (contacts?.items ?? contacts?.contacts ?? []);
  for (const c of contactArr.slice(0, 3)) {
    results.push({
      id: `contact-${c.id_contact}`,
      type: "contact",
      label: `Message — ${c.nom ?? c.email ?? `#${c.id_contact}`}`,
      sublabel: c.sujet ?? "Sans sujet",
      href: `/admin/contact`,
      icon: <MessageSquare size={14} />,
      badge: !c.lu ? { text: "Non lu", color: "#3b82f6" } : undefined,
    });
  }

  return results;
}

// ─── Composant résultat ───────────────────────────────────────────────────────
function ResultItem({
  result,
  active,
  onClick,
}: {
  result: SearchResult;
  active: boolean;
  onClick: () => void;
}) {
  const typeColor: Record<string, string> = {
    produit: EV.accentXl,
    marque: "#a78bfa",
    actualite: "#60a5fa",
    faq: "#34d399",
    devis: "#f59e0b",
    rdv: "#fb923c",
    contact: "#f472b6",
    nav: EV.textMid,
    action: EV.accentXl,
  };

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "9px 16px",
        border: "none",
        cursor: "pointer",
        background: active ? "rgba(46,125,79,0.12)" : "transparent",
        borderLeft: active
          ? `2px solid ${EV.accentXl}`
          : "2px solid transparent",
        transition: "all 0.1s",
        textAlign: "left",
      }}
    >
      {/* Icon */}
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: 7,
          flexShrink: 0,
          background: active ? "rgba(46,125,79,0.2)" : "rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: active ? EV.accentXl : (typeColor[result.type] ?? EV.textMid),
        }}
      >
        {result.icon}
      </span>

      {/* Labels */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: active ? EV.textBright : "rgba(255,255,255,0.8)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            lineHeight: 1.3,
          }}
        >
          {result.label}
        </p>
        {result.sublabel && (
          <p
            style={{
              fontSize: 11,
              color: EV.textDim,
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {result.sublabel}
          </p>
        )}
      </div>

      {/* Badge */}
      {result.badge && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            padding: "2px 7px",
            borderRadius: 20,
            flexShrink: 0,
            color: result.badge.color,
            background: result.badge.color + "22",
            border: `1px solid ${result.badge.color}44`,
          }}
        >
          {result.badge.text}
        </span>
      )}

      {/* Arrow */}
      <ArrowRight
        size={12}
        style={{ color: active ? EV.accentXl : EV.textDim, flexShrink: 0 }}
      />
    </button>
  );
}

// ─── Group header ─────────────────────────────────────────────────────────────
function GroupHeader({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: "8px 16px 4px",
        fontSize: 9.5,
        fontWeight: 700,
        letterSpacing: "0.12em",
        color: EV.textDim,
        textTransform: "uppercase",
      }}
    >
      {label}
    </div>
  );
}

// ─── Palette principale ───────────────────────────────────────────────────────
export function GlobalCommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 200);

  // ── Raccourci clavier ──────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        if (!open) setQuery("");
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // Focus input à l'ouverture
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else {
      setQuery("");
      setResults([]);
      setActiveIdx(0);
    }
  }, [open]);

  // ── Recherche ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    searchAPI(debouncedQuery)
      .then((r) => {
        setResults(r);
        setActiveIdx(0);
      })
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  // ── Navigation clavier ─────────────────────────────────────────────────────
  const allItems = useMemo((): SearchResult[] => {
    if (query.length >= 2) {
      const filtered = NAV_COMMANDS.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          (c.sublabel ?? "").toLowerCase().includes(query.toLowerCase()),
      );
      return [
        ...results,
        ...filtered,
        ...ACTION_COMMANDS.filter((c) =>
          c.label.toLowerCase().includes(query.toLowerCase()),
        ),
      ];
    }
    return [...ACTION_COMMANDS, ...NAV_COMMANDS];
  }, [query, results]);

  // Deduplicate navs that match both API results and nav commands
  const dedupedItems = useMemo(() => {
    const seen = new Set<string>();
    return allItems.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [allItems]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, dedupedItems.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && dedupedItems[activeIdx]) {
        navigate(dedupedItems[activeIdx]);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, dedupedItems, activeIdx]);

  const navigate = (item: SearchResult) => {
    if (item.href === "/") window.open("/", "_blank");
    else router.push(item.href);
    setOpen(false);
  };

  // ── Groupement des résultats ───────────────────────────────────────────────
  const groupedSections = useMemo(() => {
    if (query.length >= 2 && results.length > 0) {
      const groups: { label: string; items: SearchResult[] }[] = [];
      const byType = (type: SearchResult["type"], label: string) => {
        const items = results.filter((r) => r.type === type);
        if (items.length > 0) groups.push({ label, items });
      };
      byType("produit", "Produits");
      byType("marque", "Marques");
      byType("actualite", "Actualités");
      byType("faq", "FAQs");
      byType("devis", "Devis");
      byType("rdv", "Rendez-vous");
      byType("contact", "Messages");
      return groups;
    }
    return [];
  }, [query, results]);

  const filteredNav = useMemo(() => {
    if (query.length < 2) return NAV_COMMANDS;
    return NAV_COMMANDS.filter(
      (c) =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        (c.sublabel ?? "").toLowerCase().includes(query.toLowerCase()),
    );
  }, [query]);

  const filteredActions = useMemo(() => {
    if (query.length < 2) return ACTION_COMMANDS;
    return ACTION_COMMANDS.filter((c) =>
      c.label.toLowerCase().includes(query.toLowerCase()),
    );
  }, [query]);

  const hasResults =
    groupedSections.length > 0 ||
    filteredNav.length > 0 ||
    filteredActions.length > 0;

  if (!open)
    return (
      // Bouton hint dans le header (optionnel, peut être enlevé)
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "5px 12px",
          borderRadius: 8,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.4)",
          cursor: "pointer",
          fontSize: 12,
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background =
            "rgba(255,255,255,0.07)";
          (e.currentTarget as HTMLElement).style.color =
            "rgba(255,255,255,0.65)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background =
            "rgba(255,255,255,0.04)";
          (e.currentTarget as HTMLElement).style.color =
            "rgba(255,255,255,0.4)";
        }}
      >
        <Search size={12} />
        <span>Recherche</span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            padding: "1px 6px",
            borderRadius: 5,
            background: "rgba(255,255,255,0.08)",
            fontSize: 10,
            fontWeight: 600,
            color: "rgba(255,255,255,0.35)",
          }}
        >
          <Command size={9} />K
        </span>
      </button>
    );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: 80,
      }}
      onClick={() => setOpen(false)}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 620,
          background: EV.bg,
          borderRadius: 16,
          boxShadow:
            "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)",
          overflow: "hidden",
          animation: "cmdPaletteIn 0.2s cubic-bezier(0.22,1,0.36,1)",
          maxHeight: "72vh",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes cmdPaletteIn {
            from { transform: scale(0.95) translateY(-10px); opacity: 0; }
            to   { transform: scale(1) translateY(0); opacity: 1; }
          }
        `}</style>

        {/* Input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 18px",
            borderBottom: `1px solid ${EV.border}`,
            flexShrink: 0,
          }}
        >
          {loading ? (
            <Loader2
              size={16}
              style={{
                color: EV.accentXl,
                animation: "spin 1s linear infinite",
                flexShrink: 0,
              }}
            />
          ) : (
            <Search size={16} style={{ color: EV.textDim, flexShrink: 0 }} />
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIdx(0);
            }}
            placeholder="Rechercher dans le dashboard…"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: 15,
              color: EV.textBright,
              fontFamily: "inherit",
            }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: EV.textDim,
                display: "flex",
                padding: 0,
              }}
            >
              <X size={14} />
            </button>
          )}
          <kbd
            style={{
              fontSize: 11,
              padding: "2px 7px",
              borderRadius: 5,
              background: "rgba(255,255,255,0.06)",
              color: EV.textDim,
              border: `1px solid ${EV.border}`,
              fontFamily: "inherit",
            }}
          >
            Échap
          </kbd>
        </div>

        {/* Résultats */}
        <div
          style={{
            overflowY: "auto",
            flex: 1,
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.1) transparent",
          }}
        >
          {!hasResults && query.length >= 2 && !loading && (
            <div style={{ padding: "32px 16px", textAlign: "center" }}>
              <Search
                size={24}
                style={{ color: EV.textDim, margin: "0 auto 8px" }}
              />
              <p style={{ fontSize: 13, color: EV.textMid }}>
                Aucun résultat pour &quot;{query}&quot;
              </p>
              <p style={{ fontSize: 11, color: EV.textDim, marginTop: 4 }}>
                Essayez un autre terme
              </p>
            </div>
          )}

          {/* Résultats API groupés */}
          {groupedSections.map((section) => (
            <div key={section.label}>
              <GroupHeader label={section.label} />
              {section.items.map((item) => {
                const idx = dedupedItems.indexOf(item);
                return (
                  <ResultItem
                    key={item.id}
                    result={item}
                    active={idx === activeIdx}
                    onClick={() => navigate(item)}
                  />
                );
              })}
            </div>
          ))}

          {/* Actions rapides */}
          {filteredActions.length > 0 && (
            <>
              <GroupHeader label="Actions rapides" />
              {filteredActions.map((item) => {
                const idx = dedupedItems.indexOf(item);
                return (
                  <ResultItem
                    key={item.id}
                    result={item}
                    active={idx === activeIdx}
                    onClick={() => navigate(item)}
                  />
                );
              })}
            </>
          )}

          {/* Navigation */}
          {filteredNav.length > 0 && (
            <>
              <GroupHeader label="Navigation" />
              {filteredNav.map((item) => {
                const idx = dedupedItems.indexOf(item);
                return (
                  <ResultItem
                    key={item.id}
                    result={item}
                    active={idx === activeIdx}
                    onClick={() => navigate(item)}
                  />
                );
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "8px 16px",
            borderTop: `1px solid ${EV.border}`,
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexShrink: 0,
            background: EV.bg2,
          }}
        >
          {[
            { key: "↑↓", desc: "Naviguer" },
            { key: "⏎", desc: "Ouvrir" },
            { key: "Échap", desc: "Fermer" },
          ].map(({ key, desc }) => (
            <div
              key={key}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              <kbd
                style={{
                  fontSize: 10,
                  padding: "1px 6px",
                  borderRadius: 4,
                  background: "rgba(255,255,255,0.08)",
                  color: EV.textMid,
                  border: `1px solid ${EV.border}`,
                }}
              >
                {key}
              </kbd>
              <span style={{ fontSize: 10.5, color: EV.textDim }}>{desc}</span>
            </div>
          ))}
          <span style={{ marginLeft: "auto", fontSize: 10, color: EV.textDim }}>
            {dedupedItems.length} résultat{dedupedItems.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
