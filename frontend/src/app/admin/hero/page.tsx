"use client";
import { pushToast } from "@/components/admin/Toast";
import { ImageUploader } from "@/components/admin/ImageUploader";
import {
  ImageIcon, Plus, Trash2, Eye, EyeOff,
  GripVertical, Edit2, X, Check, RefreshCw, ExternalLink,
  LayoutTemplate, Tag, Activity, Globe,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { tokenStore } from "@/lib/admin-api";

/* ─── Types ────────────────────────────────────────────────────── */
interface HeroSlide {
  id:         number;
  page:       string;
  image:      string;
  href?:      string;
  titre?:     string;
  sousTitre?: string;
  ctaLabel?:  string;
  ordre:      number;
  actif:      boolean;
  /** Point de recadrage vertical (0 = haut de l'image, 100 = bas), par format d'écran. */
  focalYMobile?:   number;
  focalYTablette?: number;
  focalYDesktop?:  number;
}

interface MarqueItem  { id_marque:   number; nom: string; slug: string; logo: string | null }
interface ActiviteItem { id_activite: number; nom: string; slug: string; image: string | null }

/* Pages fixes */
const STATIC_PAGES = [
  { value: "home",            label: "Accueil",         desc: "Carousel principal de la page d'accueil", carousel: true },
  { value: "contact",         label: "Contact",         desc: "Bannière de la page Contact" },
  { value: "qui-sommes-nous", label: "Qui sommes-nous", desc: "Bannière À propos" },
  { value: "rendez-vous",     label: "Rendez-vous",     desc: "Bannière de la page RDV" },
  { value: "activites",       label: "Activités",       desc: "Bannière de la liste des activités" },
  { value: "marques",         label: "Marques",         desc: "Bannière de la liste des marques" },
  { value: "produits",        label: "Produits",        desc: "Bannière de la page Produits" },
];

/* ─── Config ─────────────────────────────────────────────────────── */
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function authHeaders(): Record<string, string> {
  const token = tokenStore.get();
  const base: Record<string, string> = { "Content-Type": "application/json" };
  if (token) base["Authorization"] = `Bearer ${token}`;
  return base;
}

const hasImage = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const toApiSlidePayload = (slide: Partial<HeroSlide>) => {
  const {
    page,
    image,
    href,
    titre,
    sousTitre,
    ctaLabel,
    ordre,
    actif,
    focalYMobile,
    focalYTablette,
    focalYDesktop,
  } = slide;
  return { page, image, href, titre, sousTitre, ctaLabel, ordre, actif, focalYMobile, focalYTablette, focalYDesktop };
};

const api = {
  list:    (page: string) =>
    fetch(`${BASE}/admin/hero-slides?page=${encodeURIComponent(page)}`, { headers: authHeaders() }).then(r => r.json()),
  create:  (body: Omit<HeroSlide, "id">) =>
    fetch(`${BASE}/admin/hero-slides`, { method: "POST", headers: authHeaders(), body: JSON.stringify(toApiSlidePayload(body)) }).then(r => r.json()),
  update:  (id: number, body: Partial<HeroSlide>) =>
    fetch(`${BASE}/admin/hero-slides/${id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(toApiSlidePayload(body)) }).then(r => r.json()),
  delete:  (id: number) =>
    fetch(`${BASE}/admin/hero-slides/${id}`, { method: "DELETE", headers: authHeaders() }),
  reorder: (ids: number[]) =>
    fetch(`${BASE}/admin/hero-slides/reorder`, { method: "PUT", headers: authHeaders(), body: JSON.stringify({ ids }) }),
  marques:  () =>
    fetch(`${BASE}/marques`, { headers: { "Content-Type": "application/json" } }).then(r => r.json()),
  activites: () =>
    fetch(`${BASE}/activites`, { headers: { "Content-Type": "application/json" } }).then(r => r.json()),
};

const EMPTY = (page: string): Omit<HeroSlide, "id"> => ({
  page, image: "", href: "", titre: "", sousTitre: "", ctaLabel: "", actif: true, ordre: 0,
  focalYMobile: 38, focalYTablette: 42, focalYDesktop: 45,
});

const normalizeSlide = (s: any): HeroSlide | null => {
  const id = Number(s?.id ?? s?.id_slide);
  if (!Number.isFinite(id)) return null;

  return {
    ...s,
    id,
    image: typeof s?.image === "string" ? s.image : "",
    ordre: Number.isFinite(Number(s?.ordre)) ? Number(s.ordre) : 0,
    actif: Boolean(s?.actif),
    focalYMobile: Number.isFinite(Number(s?.focalYMobile)) ? Number(s.focalYMobile) : 38,
    focalYTablette: Number.isFinite(Number(s?.focalYTablette)) ? Number(s.focalYTablette) : 42,
    focalYDesktop: Number.isFinite(Number(s?.focalYDesktop)) ? Number(s.focalYDesktop) : 45,
  };
};

/* ─── Composant principal ──────────────────────────────────────── */
export default function HeroAdminPage() {
  /* Onglet global : "static" | "marques" | "activites" */
  const [tab, setTab] = useState<"static" | "marques" | "activites">("static");

  /* Page active */
  const [activePage,  setActivePage]  = useState<string>("home");
  const [slides,      setSlides]      = useState<HeroSlide[]>([]);
  const [loading,     setLoading]     = useState(true);

  /* Listes depuis le backend */
  const [marquesList,   setMarquesList]   = useState<MarqueItem[]>([]);
  const [activitesList, setActivitesList] = useState<ActiviteItem[]>([]);
  const [listsLoaded,   setListsLoaded]   = useState(false);

  /* Formulaire slide */
  const [editing,  setEditing]  = useState<HeroSlide | null>(null);
  const [creating, setCreating] = useState(false);
  const [form,     setForm]     = useState<Omit<HeroSlide, "id">>(EMPTY("home"));

  /* Drag & drop */
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  /* ── Chargement des slides ── */
  const load = useCallback(async (page: string) => {
    setLoading(true);
    try {
      const raw  = await api.list(page);
      const data: HeroSlide[] = (Array.isArray(raw) ? raw : [])
        .map(normalizeSlide)
        .filter((s): s is HeroSlide => s !== null)
        .sort((a: HeroSlide, b: HeroSlide) => a.ordre - b.ordre);
      setSlides(data);
    } catch { pushToast({ type: "error", title: "Erreur", message: "Impossible de charger les slides" }); }
    finally { setLoading(false); }
  }, []);

  /* ── Chargement marques + activites ── */
  const loadLists = useCallback(async () => {
    if (listsLoaded) return;
    try {
      const [mRaw, aRaw] = await Promise.all([api.marques(), api.activites()]);
      setMarquesList(Array.isArray(mRaw) ? mRaw : (mRaw?.data ?? []));
      setActivitesList(Array.isArray(aRaw) ? aRaw : (aRaw?.data ?? []));
      setListsLoaded(true);
    } catch { pushToast({ type: "error", title: "Erreur", message: "Impossible de charger marques/activités" }); }
  }, [listsLoaded]);

  useEffect(() => { load(activePage); }, [activePage, load]);
  useEffect(() => { if (tab !== "static") loadLists(); }, [tab, loadLists]);

  /* ── Sélection d'une page ── */
  const selectPage = (page: string) => {
    setActivePage(page);
    setEditing(null);
    setCreating(false);
    load(page);
  };

  /* ── Formulaire ── */
  const F = (k: keyof Omit<HeroSlide, "id">, v: string | boolean | number) =>
    setForm(f => ({ ...f, [k]: v }));

  const openCreate = () => { setForm(EMPTY(activePage)); setEditing(null); setCreating(true); };
  const openEdit   = (s: HeroSlide) => {
    setForm({ page: s.page, image: hasImage(s.image) ? s.image : "", href: s.href ?? "", titre: s.titre ?? "",
              sousTitre: s.sousTitre ?? "", ctaLabel: s.ctaLabel ?? "", actif: s.actif, ordre: s.ordre,
              focalYMobile: s.focalYMobile ?? 38, focalYTablette: s.focalYTablette ?? 42, focalYDesktop: s.focalYDesktop ?? 45 });
    setEditing(s); setCreating(false);
  };
  const closePanel = () => { setEditing(null); setCreating(false); };

  /* ── Sauvegarde ── */
  const save = async () => {
    if (!form.image) return pushToast({ type: "error", title: "Erreur", message: "L'image est obligatoire" });
    try {
      if (creating) {
        const newSlide = normalizeSlide(await api.create({ ...form, page: activePage, ordre: slides.length + 1 }));
        if (!newSlide) throw new Error("Slide invalide");
        setSlides(s => [...s, newSlide]);
        pushToast({ type: "success", title: "Succès", message: "Slide créé" });
      } else if (editing) {
        const updated = normalizeSlide(await api.update(editing.id, form));
        if (!updated) throw new Error("Slide invalide");
        setSlides(s => s.map(x => x.id === editing.id ? updated : x));
        pushToast({ type: "success", title: "Succès", message: "Slide mis à jour" });
      }
      closePanel();
    } catch { pushToast({ type: "error", title: "Erreur", message: "Erreur lors de la sauvegarde" }); }
  };

  /* ── Toggle actif ── */
  const toggle = async (s: HeroSlide) => {
    try {
      await api.update(s.id, { actif: !s.actif });
      setSlides(sl => sl.map(x => x.id === s.id ? { ...x, actif: !x.actif } : x));
    } catch { pushToast({ type: "error", title: "Erreur", message: "Erreur" }); }
  };

  /* ── Suppression ── */
  const del = async (id: number) => {
    if (!confirm("Supprimer ce slide ?")) return;
    try {
      await api.delete(id);
      setSlides(s => s.filter(x => x.id !== id));
      pushToast({ type: "success", title: "Succès", message: "Slide supprimé" });
    } catch { pushToast({ type: "error", title: "Erreur", message: "Erreur" }); }
  };

  /* ── Drag & drop ── */
  const onDragStart = (id: number) => setDrag(id);
  const onDragOver  = (e: React.DragEvent, id: number) => { e.preventDefault(); setOver(id); };
  const onDrop      = async (targetId: number) => {
    if (drag === null || drag === targetId) { setDrag(null); setOver(null); return; }
    const reordered = [...slides];
    const fromIdx = reordered.findIndex(s => s.id === drag);
    const toIdx   = reordered.findIndex(s => s.id === targetId);
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const withOrder = reordered.map((s, i) => ({ ...s, ordre: i + 1 }));
    setSlides(withOrder);
    setDrag(null); setOver(null);
    try { await api.reorder(withOrder.map(s => s.id)); }
    catch { pushToast({ type: "error", title: "Erreur", message: "Erreur réordonnement" }); }
  };

  /* ── Infos page courante ── */
  const staticInfo  = STATIC_PAGES.find(p => p.value === activePage);
  const marqueInfo  = marquesList.find(m => `marque:${m.slug}` === activePage);
  const activiteInfo = activitesList.find(a => `activite:${a.slug}` === activePage);
  const isCarousel  = activePage === "home";

  const pageLabel = staticInfo?.label
    ?? (marqueInfo   ? `Marque — ${marqueInfo.nom}`    : null)
    ?? (activiteInfo ? `Activité — ${activiteInfo.nom}` : null)
    ?? activePage;
  const activeSlides = slides.filter(s => s.actif);
  const previewSlide = activeSlides.find(s => hasImage(s.image));

  /* ──────────────────────────────────────────────────────────────── */
  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <LayoutTemplate size={20} className="text-ev-600" /> Hero Slider
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Gérez les bannières par page, marque ou activité.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => load(activePage)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw size={14} /> Actualiser
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-ev-700 rounded-lg hover:bg-ev-800"
          >
            <Plus size={15} /> Nouveau slide
          </button>
        </div>
      </div>

      {/* ── Onglets principaux : Pages / Marques / Activités ── */}
      <div className="flex gap-1 mb-5 p-1 bg-gray-100 rounded-xl w-fit">
        {[
          { key: "static",    icon: Globe,    label: "Pages" },
          { key: "marques",   icon: Tag,      label: "Marques" },
          { key: "activites", icon: Activity, label: "Activités" },
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key as typeof tab)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              tab === key ? "bg-white text-ev-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[240px,1fr] gap-6">

        {/* ── Colonne gauche : sélection ── */}
        <div className="space-y-1">

          {/* Pages statiques */}
          {tab === "static" && (
            <>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">
                Pages du site
              </p>
              {STATIC_PAGES.map(p => (
                <button
                  key={p.value}
                  onClick={() => selectPage(p.value)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    activePage === p.value
                      ? "bg-ev-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Globe size={13} className="shrink-0" />
                  <span className="flex-1 truncate">{p.label}</span>
                  {p.carousel && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                      activePage === p.value ? "bg-white/20 text-white" : "bg-ev-50 text-ev-600"
                    }`}>
                      CAROUSEL
                    </span>
                  )}
                </button>
              ))}
            </>
          )}

          {/* Marques */}
          {tab === "marques" && (
            <>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">
                Choisir une marque
              </p>
              {marquesList.length === 0 && (
                <p className="text-xs text-gray-400 px-2 py-4 text-center">Chargement…</p>
              )}
              {marquesList.map(m => {
                const pageKey = `marque:${m.slug}`;
                const active  = activePage === pageKey;
                return (
                  <button
                    key={m.id_marque}
                    onClick={() => selectPage(pageKey)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${
                      active ? "bg-ev-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {/* Logo miniature */}
                    <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center overflow-hidden border ${
                      active ? "bg-white/20 border-white/20" : "bg-gray-50 border-gray-200"
                    }`}>
                      {m.logo
                        ? <img src={m.logo} alt="" className="w-full h-full object-contain p-1" />
                        : <Tag size={12} className={active ? "text-white" : "text-gray-400"} />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-semibold">{m.nom}</p>
                      <p className={`text-[10px] font-mono truncate ${active ? "text-white/70" : "text-gray-400"}`}>
                        /marques/{m.slug}
                      </p>
                    </div>
                  </button>
                );
              })}
            </>
          )}

          {/* Activités */}
          {tab === "activites" && (
            <>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">
                Choisir une activité
              </p>
              {activitesList.length === 0 && (
                <p className="text-xs text-gray-400 px-2 py-4 text-center">Chargement…</p>
              )}
              {activitesList.map(a => {
                const pageKey = `activite:${a.slug}`;
                const active  = activePage === pageKey;
                return (
                  <button
                    key={a.id_activite}
                    onClick={() => selectPage(pageKey)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${
                      active ? "bg-ev-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {/* Image miniature */}
                    <div className={`w-8 h-8 rounded-lg shrink-0 overflow-hidden border ${
                      active ? "border-white/20" : "border-gray-200"
                    }`}>
                      {a.image
                        ? <img src={a.image} alt="" className="w-full h-full object-cover" />
                        : <div className={`w-full h-full flex items-center justify-center ${active ? "bg-white/20" : "bg-gray-50"}`}>
                            <Activity size={12} className={active ? "text-white" : "text-gray-400"} />
                          </div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-semibold">{a.nom}</p>
                      <p className={`text-[10px] font-mono truncate ${active ? "text-white/70" : "text-gray-400"}`}>
                        /activites/{a.slug}
                      </p>
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* ── Colonne droite : slides ── */}
        <div>
          {/* Info bannière courante */}
          <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-ev-50 border border-ev-200 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-ev-500 shrink-0" />
            <p className="text-xs text-ev-700 font-medium flex-1 truncate">
              {pageLabel}
            </p>
            {isCarousel
              ? <span className="text-xs text-ev-500 bg-ev-100 px-2 py-0.5 rounded-full shrink-0">Carousel</span>
              : <span className="text-xs text-ev-500 bg-ev-100 px-2 py-0.5 rounded-full shrink-0">Image fixe</span>
            }
          </div>

          {/* Liste slides */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-ev-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : slides.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
              <ImageIcon size={36} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500 font-medium">Aucun slide pour « {pageLabel} »</p>
              <button
                onClick={openCreate}
                className="mt-4 px-4 py-2 text-sm font-medium text-ev-700 border border-ev-300 rounded-lg hover:bg-ev-50"
              >
                Ajouter une image
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              {slides.map((s) => (
                <div
                  key={s.id}
                  draggable
                  onDragStart={() => onDragStart(s.id)}
                  onDragOver={e => onDragOver(e, s.id)}
                  onDrop={() => onDrop(s.id)}
                  onDragEnd={() => { setDrag(null); setOver(null); }}
                  className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-3 transition-all"
                  style={{
                    opacity:   drag === s.id ? 0.45 : 1,
                    boxShadow: over === s.id ? "0 0 0 2px #7dc040" : undefined,
                  }}
                >
                  <GripVertical size={16} className="text-gray-300 cursor-grab shrink-0" />

                  <div className="w-20 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0 relative">
                    {hasImage(s.image)
                      ? <Image src={s.image} alt="" fill sizes="80px" style={{ objectFit: "cover" }} />
                      : <div className="flex items-center justify-center h-full"><ImageIcon size={18} className="text-gray-300" /></div>
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">
                      {s.titre || <span className="text-gray-400 italic">Sans titre</span>}
                    </p>
                    {s.href && (
                      <p className="text-xs text-gray-400 truncate mt-0.5 flex items-center gap-1">
                        <ExternalLink size={10} /> {s.href}
                      </p>
                    )}
                    {s.sousTitre && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">{s.sousTitre}</p>
                    )}
                  </div>

                  <span className="text-xs font-bold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5 shrink-0">
                    #{s.ordre}
                  </span>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggle(s)}
                      title={s.actif ? "Désactiver" : "Activer"}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                        s.actif ? "text-ev-600 bg-ev-50 hover:bg-ev-100" : "text-gray-400 hover:bg-gray-100"
                      }`}
                    >
                      {s.actif ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button
                      onClick={() => openEdit(s)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => del(s.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Aperçu */}
          {previewSlide && (
            <div className="mt-5 rounded-xl overflow-hidden border border-gray-200">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
                <span className="text-xs font-semibold text-gray-500">APERÇU</span>
                <span className="text-xs text-gray-400">{activeSlides.length} slide(s) actif(s)</span>
              </div>
              <div className="relative h-44 bg-gray-900">
                <Image
                  src={previewSlide.image}
                  alt="preview" fill
                  sizes="(max-width: 768px) 100vw, 640px"
                  style={{ objectFit: "cover", opacity: 0.6 }}
                />
                <div className="absolute inset-0 flex items-end p-5">
                  <div>
                    {previewSlide.titre && (
                      <p className="text-white font-bold text-lg leading-tight">
                        {previewSlide.titre}
                      </p>
                    )}
                    {previewSlide.sousTitre && (
                      <p className="text-white/70 text-sm mt-1">{previewSlide.sousTitre}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Panneau formulaire (slide edit/create) ── */}
      {(creating || editing) && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={closePanel} />
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-y-auto">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div>
                <h2 className="font-bold text-gray-900">
                  {creating ? "Nouveau slide" : "Modifier le slide"}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Page : <span className="font-semibold text-ev-600">{pageLabel}</span>
                </p>
              </div>
              <button onClick={closePanel} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 px-6 py-5 space-y-5">

              {/* Image */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Image <span className="text-red-500">*</span>
                </label>
                {form.image && (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden mb-2 bg-gray-100">
                    <Image
                      src={form.image}
                      alt=""
                      fill
                      sizes="384px"
                      style={{ objectFit: "cover", objectPosition: `center ${form.focalYDesktop ?? 45}%` }}
                    />
                  </div>
                )}
                <ImageUploader onUpload={url => F("image", url)} />
                <p className="text-xs text-gray-400 mt-1">Ou saisissez une URL :</p>
                <input
                  type="text" value={form.image}
                  onChange={e => F("image", e.target.value)}
                  placeholder="/images/hero/mon-image.webp"
                  className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ev-400"
                />
              </div>

              {/* Point de recadrage — mobile / tablette / desktop */}
              {form.image && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Point de recadrage (cadrage vertical de l'image)
                  </label>
                  <p className="text-xs text-gray-400 mb-2">
                    Réglez où l'image se cadre selon le format d'écran. La ligne repère indique le centre du cadrage.
                  </p>
                  {([
                    { key: "focalYMobile" as const,   label: "Mobile" },
                    { key: "focalYTablette" as const,  label: "Tablette" },
                    { key: "focalYDesktop" as const,   label: "Desktop" },
                  ]).map(({ key, label }) => (
                    <div key={key} className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-600">{label}</span>
                        <span className="text-xs text-gray-400">{form[key] ?? 45}%</span>
                      </div>
                      <div className="relative w-full h-20 rounded-lg overflow-hidden mb-1.5 bg-gray-100">
                        <Image
                          src={form.image}
                          alt=""
                          fill
                          sizes="384px"
                          style={{ objectFit: "cover", objectPosition: `center ${form[key] ?? 45}%` }}
                        />
                        <div
                          className="absolute left-0 right-0 h-0.5 bg-ev-500 shadow-[0_0_0_1px_rgba(255,255,255,0.8)]"
                          style={{ top: `${form[key] ?? 45}%` }}
                        />
                      </div>
                      <input
                        type="range" min={0} max={100} value={form[key] ?? 45}
                        onChange={e => F(key, Number(e.target.value))}
                        className="w-full accent-ev-600"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Titre */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Titre</label>
                <input
                  type="text" value={form.titre} onChange={e => F("titre", e.target.value)}
                  placeholder="Semences de qualité pour votre jardin"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ev-400"
                />
              </div>

              {/* Sous-titre */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Sous-titre</label>
                <textarea
                  value={form.sousTitre} onChange={e => F("sousTitre", e.target.value)} rows={2}
                  placeholder="Découvrez notre gamme complète…"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ev-400 resize-none"
                />
              </div>

              {/* Lien */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Lien (href)</label>
                <input
                  type="text" value={form.href} onChange={e => F("href", e.target.value)}
                  placeholder="/marques/fertivert"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ev-400"
                />
              </div>

              {/* CTA — seulement carousel */}
              {isCarousel && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Texte du bouton CTA</label>
                  <input
                    type="text" value={form.ctaLabel} onChange={e => F("ctaLabel", e.target.value)}
                    placeholder="Découvrir"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ev-400"
                  />
                  <p className="text-xs text-gray-400 mt-1">Laissez vide pour rendre tout le slide cliquable.</p>
                </div>
              )}

              {/* Actif */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => F("actif", !form.actif)}
                  className={`relative w-10 h-6 rounded-full transition-colors ${form.actif ? "bg-ev-600" : "bg-gray-200"}`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.actif ? "translate-x-4" : ""}`} />
                </button>
                <span className="text-sm text-gray-700">
                  {form.actif ? "Slide actif (visible)" : "Slide inactif (masqué)"}
                </span>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-2 sticky bottom-0 bg-white">
              <button
                onClick={closePanel}
                className="flex-1 px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={save}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-ev-700 rounded-lg hover:bg-ev-800"
              >
                <Check size={15} /> {creating ? "Créer" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
