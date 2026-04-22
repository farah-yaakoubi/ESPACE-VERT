"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  adminProduits, adminProduitsCreate, adminMarques, adminCategories, adminActivites,
  type ProduitAdmin, type MarqueAdmin, type CategorieAdmin, type ActiviteAdmin
} from "@/lib/admin-api";
import { Search, RefreshCw, ToggleLeft, ToggleRight, Trash2, Plus, Edit2, ExternalLink, ImageIcon, X } from "lucide-react";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const DIVISIONS: Record<string, string> = {
  standard: "bg-gray-100 text-gray-600",
  pro:      "bg-blue-100 text-blue-700",
  garden:   "bg-green-100 text-green-700",
};

function toSlug(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const EMPTY = {
  nom: "", slug: "", id_categorie: "", id_marque: "", id_activite: "",
  division: "standard", description: "", fiche_technique: "", ordre: 0, actif: true,
};

/* ─── Modal gestion images ─────────────────────────────────────── */
function ImagesModal({ produit, onClose }: { produit: ProduitAdmin; onClose: () => void }) {
  const [images, setImages] = useState(produit.images ?? []);
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [principal, setPrincipal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const addImage = async () => {
    if (!url.trim()) { setErr("URL requise"); return; }
    setSaving(true); setErr("");
    try {
      const res = await fetch(`${BASE}/admin/produits/${produit.id_produit}/images`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("ev_admin_token") ?? ""}`,
        },
        body: JSON.stringify({ url: url.trim(), alt: alt.trim() || null, is_principale: principal }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? "Erreur"); }
      const d = await res.json();
      setImages(prev => principal
        ? [d.data, ...prev.map(i => ({ ...i, is_principale: false }))]
        : [...prev, d.data]);
      setUrl(""); setAlt(""); setPrincipal(false);
    } catch (e) { setErr((e as Error).message); }
    finally { setSaving(false); }
  };

  const deleteImage = async (id_imgP: number) => {
    if (!confirm("Supprimer cette image ?")) return;
    try {
      await fetch(`${BASE}/admin/produits/${produit.id_produit}/images/${id_imgP}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("ev_admin_token") ?? ""}` },
      });
      setImages(prev => prev.filter(i => i.id_imgP !== id_imgP));
    } catch (e) { alert((e as Error).message); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-5 border-b flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-bold text-gray-900">Images — {produit.nom}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{images.length} image{images.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1"><X size={18} /></button>
        </div>

        {/* Liste images existantes */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {images.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <ImageIcon size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Aucune image</p>
            </div>
          )}
          {images.map((img: any) => (
            <div key={img.id_imgP} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                <Image src={img.url} alt={img.alt ?? ""} width={64} height={64} className="object-contain w-full h-full" onError={() => {}} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-gray-500 truncate">{img.url}</p>
                {img.alt && <p className="text-xs text-gray-400 mt-0.5">{img.alt}</p>}
                {img.is_principale && (
                  <span className="text-[10px] px-2 py-0.5 bg-ev-100 text-ev-700 rounded-full font-semibold">Principale</span>
                )}
              </div>
              <button onClick={() => deleteImage(img.id_imgP)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        {/* Ajout image */}
        <div className="p-5 border-t shrink-0 space-y-3">
          {err && <div className="p-2 bg-red-50 text-red-600 text-xs rounded-lg">{err}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">URL de l'image *</label>
              <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..."
                className="w-full h-9 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Texte alternatif</label>
              <input value={alt} onChange={e => setAlt(e.target.value)} placeholder="Description…"
                className="w-full h-9 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500" />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input type="checkbox" checked={principal} onChange={e => setPrincipal(e.target.checked)}
                  className="accent-ev-600 w-4 h-4" />
                Image principale
              </label>
            </div>
          </div>
          {url && (
            <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              <Image src={url} alt="Aperçu" width={80} height={80} className="object-contain w-full h-full" onError={() => {}} />
            </div>
          )}
          <button onClick={addImage} disabled={saving || !url.trim()}
            className="w-full h-10 bg-ev-700 hover:bg-ev-800 text-white text-sm rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
            {saving
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><Plus size={14} />Ajouter l'image</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page principale ──────────────────────────────────────────── */
export default function AdminProduitsPage() {
  const [items,      setItems]      = useState<ProduitAdmin[]>([]);
  const [meta,       setMeta]       = useState({ total: 0, page: 1, pages: 1 });
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [actif,      setActif]      = useState("");
  const [marques,    setMarques]    = useState<MarqueAdmin[]>([]);
  const [categories, setCategories] = useState<CategorieAdmin[]>([]);
  const [activites,  setActivites]  = useState<ActiviteAdmin[]>([]);
  const [modal,      setModal]      = useState<"create" | "edit" | null>(null);
  const [imgModal,   setImgModal]   = useState<ProduitAdmin | null>(null);
  const [editing,    setEditing]    = useState<ProduitAdmin | null>(null);
  const [form,       setForm]       = useState(EMPTY);
  const [saving,     setSaving]     = useState(false);
  const [err,        setErr]        = useState("");

  // Catégories filtrées selon marque sélectionnée
  const catsFiltrees = form.id_marque
    ? categories.filter(c => !c.id_marque || String(c.id_marque) === form.id_marque)
    : categories;

  const loadRefs = useCallback(async () => {
    const [mrqs, cats, acts] = await Promise.all([
      adminMarques.list(), adminCategories.list(), adminActivites.list(),
    ]);
    setMarques(Array.isArray(mrqs)  ? mrqs  : (mrqs  as any).data ?? []);
    setCategories(Array.isArray(cats) ? cats : (cats as any).data ?? []);
    setActivites(Array.isArray(acts) ? acts : (acts as any).data ?? []);
  }, []);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const p: Record<string, string> = { page: String(page), limit: "20" };
      if (search) p.search = search;
      if (actif)  p.actif  = actif;
      const res = await adminProduits.list(p);
      setItems(res.data); setMeta(res.meta as any);
    } finally { setLoading(false); }
  }, [search, actif]);

  useEffect(() => { load(1); loadRefs(); }, [load, loadRefs]);

  const openCreate = () => { setForm(EMPTY); setEditing(null); setErr(""); setModal("create"); };
  const openEdit   = (p: ProduitAdmin) => {
    const cat = categories.find(c => c.nom === (p.categorie as any)?.nom || c.id_categorie === (p as any).id_categorie);
    const mrq = marques.find(m => m.nom === (p.marque as any)?.nom);
    setForm({
      nom: p.nom, slug: p.slug,
      id_categorie: String(cat?.id_categorie ?? ""),
      id_marque:    String(mrq?.id_marque ?? ""),
      id_activite:  String((p as any).id_activite ?? ""),
      division: p.division, description: "", fiche_technique: "",
      ordre: p.ordre, actif: p.actif,
    });
    setEditing(p); setErr(""); setModal("edit");
  };

  const handleSave = async () => {
    if (!form.nom.trim() || !form.slug.trim() || !form.id_categorie || !form.id_marque) {
      setErr("Nom, slug, marque et catégorie sont requis."); return;
    }
    setSaving(true); setErr("");
    try {
      const payload = {
        nom: form.nom, slug: form.slug,
        id_categorie: Number(form.id_categorie),
        id_marque:    Number(form.id_marque),
        id_activite:  form.id_activite ? Number(form.id_activite) : null,
        division:     form.division as any,
        ordre:        form.ordre,
        description:       form.description || null,
        fiche_technique:   form.fiche_technique || null,
        ...(modal === "edit" ? { actif: form.actif } : {}),
      };
      if (modal === "create") await adminProduitsCreate.create(payload);
      else if (editing)       await adminProduitsCreate.update(editing.id_produit, payload);
      setModal(null); load(meta.page);
    } catch (e) { setErr((e as Error).message); }
    finally { setSaving(false); }
  };

  const toggleActif = async (p: ProduitAdmin) => {
    await adminProduits.toggle(p.id_produit, !p.actif); load(meta.page);
  };
  const remove = async (id: number) => {
    if (!confirm("Supprimer ce produit ?")) return;
    await adminProduits.remove(id); load(meta.page);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
          <p className="text-sm text-gray-500 mt-0.5">{meta.total} produit{meta.total !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => load(1)} className="p-2 text-gray-500 hover:text-gray-800 rounded-xl hover:bg-gray-100">
            <RefreshCw size={16} />
          </button>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-ev-700 hover:bg-ev-800 text-white text-sm font-medium px-4 py-2 rounded-xl">
            <Plus size={16} />Nouveau produit
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Nom du produit…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500" />
        </div>
        <select value={actif} onChange={e => setActif(e.target.value)}
          className="h-9 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white">
          <option value="">Tous statuts</option>
          <option value="true">Actifs</option>
          <option value="false">Inactifs</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-4 border-ev-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">Aucun produit trouvé</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["", "Produit", "Marque", "Catégorie", "Activité", "Division", "Statut", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map(p => {
                  const img = p.images.find(i => i.is_principale) ?? p.images[0];
                  return (
                    <tr key={p.id_produit} className={`hover:bg-gray-50 ${!p.actif ? "opacity-50" : ""}`}>
                      <td className="px-4 py-3 w-12">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center">
                          {img
                            ? <Image src={img.url} alt={p.nom} width={40} height={40} className="object-contain" />
                            : <span className="text-gray-300 text-lg">🌿</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800 max-w-[160px] truncate">{p.nom}</p>
                        <p className="text-xs text-gray-400 font-mono">{p.slug}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs font-medium">{(p.marque as any)?.nom ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-[110px] truncate">{(p.categorie as any)?.nom ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-[110px] truncate">
                        {(p as any).activite?.nom ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIVISIONS[p.division] ?? "bg-gray-100 text-gray-600"}`}>
                          {p.division}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.actif ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {p.actif ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setImgModal(p)} className="p-1.5 text-gray-400 hover:text-ev-600 hover:bg-ev-50 rounded-lg" title="Gérer les images">
                            <ImageIcon size={13} />
                          </button>
                          <a href={`/produits/${p.slug}`} target="_blank" className="p-1.5 text-gray-400 hover:text-ev-600 hover:bg-ev-50 rounded-lg">
                            <ExternalLink size={13} />
                          </a>
                          <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-ev-600 hover:bg-ev-50 rounded-lg">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => toggleActif(p)} className="p-1.5 text-gray-400 hover:text-ev-600 hover:bg-ev-50 rounded-lg">
                            {p.actif ? <ToggleRight size={16} className="text-ev-600" /> : <ToggleLeft size={16} />}
                          </button>
                          <button onClick={() => remove(p.id_produit)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {meta.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">Page {meta.page} / {meta.pages} — {meta.total} produits</p>
            <div className="flex gap-2">
              <button disabled={meta.page <= 1} onClick={() => load(meta.page - 1)}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Précédent</button>
              <button disabled={meta.page >= meta.pages} onClick={() => load(meta.page + 1)}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Suivant</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal images */}
      {imgModal && <ImagesModal produit={imgModal} onClose={() => { setImgModal(null); load(meta.page); }} />}

      {/* Modal créer/éditer */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto">
            <div className="p-5 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="font-bold text-gray-900">
                {modal === "create" ? "Nouveau produit" : `Modifier — ${editing?.nom}`}
              </h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>

            <div className="p-5 space-y-4">
              {err && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{err}</div>}

              {/* Nom + Slug */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nom *</label>
                  <input value={form.nom}
                    onChange={e => setForm({ ...form, nom: e.target.value, slug: modal === "create" ? toSlug(e.target.value) : form.slug })}
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Slug *</label>
                  <input value={form.slug}
                    onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500 font-mono text-xs" />
                </div>
              </div>

              {/* Marque + Catégorie */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Marque *</label>
                  <select value={form.id_marque}
                    onChange={e => setForm({ ...form, id_marque: e.target.value, id_categorie: "" })}
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white">
                    <option value="">— Choisir —</option>
                    {marques.map(m => <option key={m.id_marque} value={m.id_marque}>{m.nom}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Catégorie *
                    {form.id_marque && <span className="text-gray-400 font-normal ml-1">(filtrée par marque)</span>}
                  </label>
                  <select value={form.id_categorie}
                    onChange={e => {
                      const cat = categories.find(c => String(c.id_categorie) === e.target.value);
                      setForm({ ...form, id_categorie: e.target.value,
                        // auto-remplir l'activité depuis la catégorie
                        id_activite: cat?.id_activite ? String(cat.id_activite) : form.id_activite,
                      });
                    }}
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white">
                    <option value="">— Choisir —</option>
                    {catsFiltrees.map(c => (
                      <option key={c.id_categorie} value={c.id_categorie}>
                        {c.nom}{c.activite ? ` [${c.activite.nom}]` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Activité (optionnel — auto-remplie depuis catégorie) */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Activité
                  <span className="text-gray-400 font-normal ml-1">(auto-remplie depuis la catégorie, modifiable)</span>
                </label>
                <select value={form.id_activite}
                  onChange={e => setForm({ ...form, id_activite: e.target.value })}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white">
                  <option value="">— Aucune —</option>
                  {activites.map(a => <option key={a.id_activite} value={a.id_activite}>{a.nom}</option>)}
                </select>
              </div>

              {/* Division + Ordre */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Division</label>
                  <select value={form.division} onChange={e => setForm({ ...form, division: e.target.value })}
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white">
                    <option value="standard">Standard</option>
                    <option value="pro">Pro</option>
                    <option value="garden">Garden</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ordre</label>
                  <input type="number" value={form.ordre} onChange={e => setForm({ ...form, ordre: Number(e.target.value) })}
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500 resize-none" />
              </div>

              {/* Fiche technique */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fiche technique (HTML)</label>
                <textarea value={form.fiche_technique} onChange={e => setForm({ ...form, fiche_technique: e.target.value })} rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500 resize-none font-mono text-xs" />
              </div>

              {modal === "edit" && (
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.actif} onChange={e => setForm({ ...form, actif: e.target.checked })}
                    className="accent-ev-600 w-4 h-4" />
                  Produit actif
                </label>
              )}
            </div>

            <div className="p-5 pt-0 flex gap-3">
              <button onClick={() => setModal(null)}
                className="flex-1 h-10 border text-sm text-gray-600 rounded-xl hover:bg-gray-50">Annuler</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 h-10 bg-ev-700 text-white text-sm rounded-xl hover:bg-ev-800 disabled:opacity-60 flex items-center justify-center">
                {saving
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : (modal === "create" ? "Créer" : "Enregistrer")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
