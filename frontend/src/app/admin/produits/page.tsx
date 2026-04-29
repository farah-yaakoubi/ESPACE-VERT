"use client";
import {
  adminActivites,
  adminCategories,
  adminMarques,
  adminProduits,
  adminProduitsCreate,
  adminUpload,
  type ActiviteAdmin,
  type CategorieAdmin,
  type MarqueAdmin,
  type ProduitAdmin,
} from "@/lib/admin-api";
import {
  AlertCircle,
  Edit2,
  ExternalLink,
  FileText,
  ImageIcon,
  Info,
  Link as LinkIcon,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Star,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const DIVISIONS: Record<string, string> = {
  standard: "bg-gray-100 text-gray-600",
  pro: "bg-blue-100 text-blue-700",
  garden: "bg-green-100 text-green-700",
};
function toSlug(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
const EMPTY = {
  nom: "",
  slug: "",
  id_categorie: "",
  id_marque: "",
  id_activite: "",
  division: "standard",
  description: "",
  fiche_technique: "",
  ordre: 0,
  actif: true,
};

/* ─── Modal images ─────────────────────────────────────────────── */
function ImagesModal({
  produit,
  onClose,
}: {
  produit: ProduitAdmin;
  onClose: () => void;
}) {
  const [images, setImages] = useState(produit.images ?? []);
  const [tab, setTab] = useState<"file" | "url">("file");
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [principal, setPrincipal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const token =
    typeof window !== "undefined"
      ? (localStorage.getItem("ev_admin_token") ?? "")
      : "";

  const addByUrl = async () => {
    if (!url.trim()) {
      setErr("URL requise");
      return;
    }
    setSaving(true);
    setErr("");
    try {
      const res = await fetch(
        `${BASE}/admin/produits/${produit.id_produit}/images`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            url: url.trim(),
            alt: alt.trim() || null,
            is_principale: principal,
          }),
        },
      );
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error ?? "Erreur");
      }
      const d = await res.json();
      setImages((prev) =>
        principal
          ? [d.data, ...prev.map((i: any) => ({ ...i, is_principale: false }))]
          : [...prev, d.data],
      );
      setUrl("");
      setAlt("");
      setPrincipal(false);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const addByFile = async (file: File) => {
    setSaving(true);
    setErr("");
    const objUrl = URL.createObjectURL(file);
    setPreview(objUrl);
    try {
      const data = await adminUpload.produitImage(
        produit.id_produit,
        file,
        alt.trim() || undefined,
        principal,
      );
      setImages((prev) =>
        principal
          ? [data, ...prev.map((i: any) => ({ ...i, is_principale: false }))]
          : [...prev, data],
      );
      setAlt("");
      setPrincipal(false);
      setPreview(null);
      URL.revokeObjectURL(objUrl);
    } catch (e) {
      setErr((e as Error).message);
      setPreview(null);
      URL.revokeObjectURL(objUrl);
    } finally {
      setSaving(false);
    }
  };

  const setPrincipale = async (id_imgP: number) => {
    try {
      await fetch(
        `${BASE}/admin/produits/${produit.id_produit}/images/${id_imgP}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ is_principale: true }),
        },
      );
      setImages((prev) =>
        prev.map((i: any) => ({ ...i, is_principale: i.id_imgP === id_imgP })),
      );
    } catch {}
  };

  const deleteImage = async (id_imgP: number) => {
    if (!confirm("Supprimer cette image ?")) return;
    try {
      await fetch(
        `${BASE}/admin/produits/${produit.id_produit}/images/${id_imgP}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setImages((prev) => prev.filter((i: any) => i.id_imgP !== id_imgP));
    } catch (e) {
      alert((e as Error).message);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        <div className="p-5 border-b flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-bold text-gray-900">
              Photos catalogue — {produit.nom}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {images.length} photo{images.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          {images.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <ImageIcon size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Aucune photo de catalogue</p>
            </div>
          )}
          {images.map((img: any) => (
            <div
              key={img.id_imgP}
              className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50"
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                <Image
                  src={img.url}
                  alt={img.alt ?? ""}
                  width={64}
                  height={64}
                  className="object-contain w-full h-full"
                  onError={() => {}}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-gray-500 truncate">
                  {img.url}
                </p>
                {img.alt && (
                  <p className="text-xs text-gray-400 mt-0.5">{img.alt}</p>
                )}
                {img.is_principale && (
                  <span className="text-[10px] px-2 py-0.5 bg-ev-100 text-ev-700 rounded-full font-semibold">
                    ⭐ Principale
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!img.is_principale && (
                  <button
                    onClick={() => setPrincipale(img.id_imgP)}
                    title="Définir principale"
                    className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg"
                  >
                    <Star size={13} />
                  </button>
                )}
                <button
                  onClick={() => deleteImage(img.id_imgP)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-5 border-t shrink-0 space-y-3">
          {err && (
            <div className="p-2 bg-red-50 text-red-600 text-xs rounded-lg">
              {err}
            </div>
          )}
          <div className="flex gap-2">
            {(["file", "url"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${tab === t ? "bg-ev-700 text-white border-ev-700" : "bg-white text-gray-600 border-gray-200 hover:border-ev-300"}`}
              >
                {t === "file" ? (
                  <>
                    <Upload size={12} />
                    Depuis l&apos;ordinateur
                  </>
                ) : (
                  <>
                    <LinkIcon size={12} />
                    Par URL
                  </>
                )}
              </button>
            ))}
          </div>
          {tab === "file" ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files[0];
                if (f) addByFile(f);
              }}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${dragOver ? "border-ev-500 bg-ev-50" : "border-gray-200 hover:border-ev-400 hover:bg-gray-50"}`}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) addByFile(f);
                }}
              />
              {saving ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 size={24} className="animate-spin text-ev-600" />
                  <p className="text-sm text-ev-700">Upload en cours…</p>
                  {preview && (
                    <Image
                      src={preview}
                      alt="preview"
                      width={80}
                      height={80}
                      className="rounded-lg object-contain mx-auto mt-1"
                    />
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <Upload size={22} className="text-gray-400" />
                  <p className="text-sm font-medium text-gray-600">
                    Glisser une image ici ou cliquer
                  </p>
                  <p className="text-xs text-gray-400">
                    JPG, PNG, WEBP — Max 10 MB
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full h-9 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500"
              />
              {url && (
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                  <Image
                    src={url}
                    alt="Aperçu"
                    width={64}
                    height={64}
                    className="object-contain w-full h-full"
                    onError={() => {}}
                  />
                </div>
              )}
              <button
                onClick={addByUrl}
                disabled={saving || !url.trim()}
                className="w-full h-9 bg-ev-700 hover:bg-ev-800 text-white text-sm rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <>
                    <Plus size={13} />
                    Ajouter
                  </>
                )}
              </button>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <input
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Texte alt (optionnel)"
              className="h-8 px-3 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ev-500"
            />
            <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
              <input
                type="checkbox"
                checked={principal}
                onChange={(e) => setPrincipal(e.target.checked)}
                className="accent-ev-600 w-3.5 h-3.5"
              />
              Image principale
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal fiche technique PDF ────────────────────────────────── */
function FicheModal({
  produit,
  onClose,
  onUpdated,
}: {
  produit: ProduitAdmin;
  onClose: () => void;
  onUpdated: (url: string) => void;
}) {
  const [tab, setTab] = useState<"file" | "url">("file");
  const [url, setUrl] = useState((produit as any).fiche_technique ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const token =
    typeof window !== "undefined"
      ? (localStorage.getItem("ev_admin_token") ?? "")
      : "";
  const currentUrl = (produit as any).fiche_technique;

  const saveUrl = async () => {
    setSaving(true);
    setErr("");
    try {
      await fetch(`${BASE}/admin/produits/${produit.id_produit}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fiche_technique: url.trim() || null }),
      });
      onUpdated(url.trim());
      onClose();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const uploadPdf = async (file: File) => {
    setSaving(true);
    setErr("");
    try {
      const data = await adminUpload.produitFiche(produit.id_produit, file);
      onUpdated(data.url);
      onClose();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  /* ── NOUVEAU : Suppression du PDF ── */
  const deleteFiche = async () => {
    if (!confirm("Supprimer la fiche technique PDF ?")) return;
    setSaving(true);
    setErr("");
    try {
      await fetch(`${BASE}/admin/produits/${produit.id_produit}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fiche_technique: null }),
      });
      onUpdated("");
      onClose();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <div className="p-5 border-b flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900">Fiche technique PDF</h2>
            <p className="text-xs text-gray-400 mt-0.5">{produit.nom}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {err && (
            <div className="p-2 bg-red-50 text-red-600 text-xs rounded-lg">
              {err}
            </div>
          )}

          {/* Fiche actuelle avec bouton supprimer */}
          {currentUrl && (
            <div className="flex items-center gap-3 p-3 bg-ev-50 border border-ev-200 rounded-xl">
              <FileText size={18} className="text-ev-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-ev-800">
                  Fiche actuelle
                </p>
                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-ev-600 hover:underline truncate block font-mono"
                >
                  {currentUrl}
                </a>
              </div>
              <button
                onClick={deleteFiche}
                disabled={saving}
                title="Supprimer la fiche PDF"
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40 shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}

          <div className="flex gap-2">
            {(["file", "url"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${tab === t ? "bg-ev-700 text-white border-ev-700" : "bg-white text-gray-600 border-gray-200 hover:border-ev-300"}`}
              >
                {t === "file" ? (
                  <>
                    <Upload size={12} />
                    Uploader PDF
                  </>
                ) : (
                  <>
                    <LinkIcon size={12} />
                    Par URL
                  </>
                )}
              </button>
            ))}
          </div>
          {tab === "file" ? (
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 hover:border-ev-400 rounded-2xl p-8 text-center cursor-pointer transition-colors hover:bg-gray-50"
            >
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadPdf(f);
                }}
              />
              {saving ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 size={24} className="animate-spin text-ev-600" />
                  <p className="text-sm text-ev-700">Upload en cours…</p>
                </div>
              ) : (
                <>
                  <FileText size={28} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-medium text-gray-600">
                    Cliquer pour sélectionner un PDF
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Max 50 MB</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://...pdf"
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500"
              />
              <button
                onClick={saveUrl}
                disabled={saving}
                className="w-full h-10 bg-ev-700 hover:bg-ev-800 text-white text-sm rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  "Enregistrer l'URL"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Page principale ──────────────────────────────────────────── */
export default function AdminProduitsPage() {
  const [items, setItems] = useState<ProduitAdmin[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actif, setActif] = useState("");
  const [division, setDivision] = useState(""); // ← NOUVEAU filtre division
  const [marques, setMarques] = useState<MarqueAdmin[]>([]);
  const [categories, setCategories] = useState<CategorieAdmin[]>([]);
  const [activites, setActivites] = useState<ActiviteAdmin[]>([]);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [imgModal, setImgModal] = useState<ProduitAdmin | null>(null);
  const [ficheModal, setFicheModal] = useState<ProduitAdmin | null>(null);
  const [editing, setEditing] = useState<ProduitAdmin | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  /* ─── SMART CATEGORY FILTERING ────────────────────────────────
   * Logique identique à la page catégories :
   * - Si marque sélectionnée  → catégories liées à cette marque + non liées
   * - Si activité sélectionnée → catégories liées à cette activité + non liées
   * - Les deux → union (marque OU activité) + non liées
   * - Aucune → toutes
   * ─────────────────────────────────────────────────────────── */
  const catsFiltrees = (() => {
    const hasM = !!form.id_marque;
    const hasA = !!form.id_activite;
    if (!hasM && !hasA) return categories;
    return categories.filter((c) => {
      const cM = c.id_marque ? String(c.id_marque) : null;
      const cA = c.id_activite ? String(c.id_activite) : null;
      const unlinked = !cM && !cA;
      if (hasM && hasA)
        return unlinked || cM === form.id_marque || cA === form.id_activite;
      if (hasM) return unlinked || cM === form.id_marque;
      return unlinked || cA === form.id_activite;
    });
  })();

  /* ─── Arbre des catégories filtrées pour affichage hiérarchique ─ */
  interface CatNode extends CategorieAdmin {
    children: CatNode[];
    depth: number;
  }
  const catsTree = (() => {
    const map = new Map<number, CatNode>();
    catsFiltrees.forEach((c) =>
      map.set(c.id_categorie, { ...c, children: [], depth: 0 }),
    );
    const roots: CatNode[] = [];
    map.forEach((node) => {
      if (node.parent_id && map.has(node.parent_id)) {
        const parent = map.get(node.parent_id)!;
        node.depth = parent.depth + 1;
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });
    const sort = (arr: CatNode[]) =>
      arr.sort((a, b) => a.ordre - b.ordre || a.nom.localeCompare(b.nom));
    map.forEach((n) => sort(n.children));
    return sort(roots);
  })();
  const catsFlat = (() => {
    const result: CatNode[] = [];
    const walk = (arr: CatNode[]) =>
      arr.forEach((n) => {
        result.push(n);
        walk(n.children);
      });
    walk(catsTree);
    return result;
  })();

  const catFilterInfo = (() => {
    if (!form.id_marque && !form.id_activite) return null;
    const shown = catsFiltrees.length;
    const total = categories.length;
    if (shown === total) return null;
    const parts: string[] = [];
    if (form.id_marque) {
      const m = marques.find((m) => String(m.id_marque) === form.id_marque);
      if (m) parts.push(`🏷 ${m.nom}`);
    }
    if (form.id_activite) {
      const a = activites.find(
        (a) => String(a.id_activite) === form.id_activite,
      );
      if (a) parts.push(`⚡ ${a.nom}`);
    }
    return `${shown} / ${total} catégories pour ${parts.join(" + ")}`;
  })();

  const loadRefs = useCallback(async () => {
    const [mrqs, cats, acts] = await Promise.all([
      adminMarques.list(),
      adminCategories.list(),
      adminActivites.list(),
    ]);
    setMarques(Array.isArray(mrqs) ? mrqs : ((mrqs as any).data ?? []));
    setCategories(Array.isArray(cats) ? cats : ((cats as any).data ?? []));
    setActivites(Array.isArray(acts) ? acts : ((acts as any).data ?? []));
  }, []);

  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const p: Record<string, string> = { page: String(page), limit: "20" };
        if (search) p.search = search;
        if (actif) p.actif = actif;
        if (division) p.division = division; // ← NOUVEAU
        const res = await adminProduits.list(p);
        setItems(res.data);
        setMeta(res.meta as any);
      } finally {
        setLoading(false);
      }
    },
    [search, actif, division],
  );

  useEffect(() => {
    load(1);
    loadRefs();
  }, [load, loadRefs]);

  const openCreate = () => {
    setForm(EMPTY);
    setEditing(null);
    setErr("");
    setModal("create");
  };
  const openEdit = (p: ProduitAdmin) => {
    const cat = categories.find(
      (c) => c.id_categorie === (p as any).id_categorie,
    );
    const mrq = marques.find((m) => m.nom === (p.marque as any)?.nom);
    setForm({
      nom: p.nom,
      slug: p.slug,
      id_categorie: String(cat?.id_categorie ?? ""),
      id_marque: String(mrq?.id_marque ?? ""),
      id_activite: String((p as any).id_activite ?? ""),
      division: p.division,
      description: (p as any).description ?? "",
      fiche_technique: (p as any).fiche_technique ?? "",
      ordre: p.ordre,
      actif: p.actif,
    });
    setEditing(p);
    setErr("");
    setModal("edit");
  };

  const handleSave = async () => {
    // Validation : nom, slug et catégorie toujours requis
    if (!form.nom.trim() || !form.slug.trim() || !form.id_categorie) {
      setErr("Le nom, le slug et la catégorie sont requis.");
      return;
    }
    // Validation : au moins marque OU activité (pour que le produit soit accessible)
    if (!form.id_marque && !form.id_activite) {
      setErr(
        "Veuillez choisir au moins une marque ou une activité pour que le produit soit accessible.",
      );
      return;
    }

    setSaving(true);
    setErr("");
    try {
      const base = {
        nom: form.nom,
        slug: form.slug,
        id_categorie: Number(form.id_categorie),
        id_marque: form.id_marque ? Number(form.id_marque) : null,
        id_activite: form.id_activite ? Number(form.id_activite) : null,
        division: form.division,
        ordre: form.ordre,
        description: form.description || null,
        fiche_technique: form.fiche_technique || null,
      };
      if (modal === "create") {
        await adminProduitsCreate.create(base as any);
      } else if (editing) {
        await adminProduitsCreate.update(editing.id_produit, {
          ...base,
          actif: form.actif,
        });
      }
      setModal(null);
      load(meta.page);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActif = async (p: ProduitAdmin) => {
    await adminProduits.toggle(p.id_produit, !p.actif);
    load(meta.page);
  };
  const remove = async (id: number) => {
    if (!confirm("Supprimer ce produit ?")) return;
    await adminProduits.remove(id);
    load(meta.page);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {meta.total} produit{meta.total !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => load(1)}
            className="p-2 text-gray-500 hover:text-gray-800 rounded-xl hover:bg-gray-100"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-ev-700 hover:bg-ev-800 text-white text-sm font-medium px-4 py-2 rounded-xl"
          >
            <Plus size={16} />
            Nouveau produit
          </button>
        </div>
      </div>

      {/* ── Filtres ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            placeholder="Nom du produit…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500"
          />
        </div>
        <select
          value={actif}
          onChange={(e) => setActif(e.target.value)}
          className="h-9 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white"
        >
          <option value="">Tous statuts</option>
          <option value="true">Actifs</option>
          <option value="false">Inactifs</option>
        </select>
        {/* ── NOUVEAU filtre division ── */}
        <select
          value={division}
          onChange={(e) => setDivision(e.target.value)}
          className="h-9 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white"
        >
          <option value="">Toutes divisions</option>
          <option value="standard">Standard</option>
          <option value="pro">Pro</option>
          <option value="garden">Garden</option>
        </select>
      </div>

      {/* ── Tableau ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-4 border-ev-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            Aucun produit trouvé
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {[
                    "",
                    "Produit",
                    "Marque",
                    "Catégorie",
                    "Activité",
                    "Division",
                    "Fiche",
                    "Statut",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((p) => {
                  const img =
                    p.images.find((i) => i.is_principale) ?? p.images[0];
                  const hasFiche = !!(p as any).fiche_technique;
                  return (
                    <tr
                      key={p.id_produit}
                      className={`hover:bg-gray-50 ${!p.actif ? "opacity-50" : ""}`}
                    >
                      <td className="px-4 py-3 w-12">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center">
                          {img ? (
                            <Image
                              src={img.url}
                              alt={p.nom}
                              width={40}
                              height={40}
                              className="object-contain"
                            />
                          ) : (
                            <span className="text-gray-300 text-lg">🌿</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800 max-w-[160px] truncate">
                          {p.nom}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">
                          {p.slug}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs font-medium">
                        {(p.marque as any)?.nom ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-[110px] truncate">
                        {(p.categorie as any)?.nom ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-[110px] truncate">
                        {(p as any).activite?.nom ?? (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIVISIONS[p.division] ?? "bg-gray-100 text-gray-600"}`}
                        >
                          {p.division}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setFicheModal(p)}
                          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-colors ${hasFiche ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200 hover:border-ev-300"}`}
                        >
                          <FileText size={11} />
                          {hasFiche ? "PDF ✓" : "Ajouter"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.actif ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {p.actif ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setImgModal(p)}
                            className="p-1.5 text-gray-400 hover:text-ev-600 hover:bg-ev-50 rounded-lg"
                            title="Photos catalogue"
                          >
                            <ImageIcon size={13} />
                          </button>
                          <a
                            href={`/produits/${p.slug}`}
                            target="_blank"
                            className="p-1.5 text-gray-400 hover:text-ev-600 hover:bg-ev-50 rounded-lg"
                          >
                            <ExternalLink size={13} />
                          </a>
                          <button
                            onClick={() => openEdit(p)}
                            className="p-1.5 text-gray-400 hover:text-ev-600 hover:bg-ev-50 rounded-lg"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => toggleActif(p)}
                            className="p-1.5 text-gray-400 hover:text-ev-600 hover:bg-ev-50 rounded-lg"
                          >
                            {p.actif ? (
                              <ToggleRight size={16} className="text-ev-600" />
                            ) : (
                              <ToggleLeft size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => remove(p.id_produit)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
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
            <p className="text-xs text-gray-400">
              Page {meta.page} / {meta.pages} — {meta.total} produits
            </p>
            <div className="flex gap-2">
              <button
                disabled={meta.page <= 1}
                onClick={() => load(meta.page - 1)}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Précédent
              </button>
              <button
                disabled={meta.page >= meta.pages}
                onClick={() => load(meta.page + 1)}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {imgModal && (
        <ImagesModal
          produit={imgModal}
          onClose={() => {
            setImgModal(null);
            load(meta.page);
          }}
        />
      )}
      {ficheModal && (
        <FicheModal
          produit={ficheModal}
          onClose={() => setFicheModal(null)}
          onUpdated={(url) => {
            setItems((prev) =>
              prev.map((p) =>
                p.id_produit === ficheModal.id_produit
                  ? ({ ...p, fiche_technique: url || null } as any)
                  : p,
              ),
            );
            setFicheModal(null);
          }}
        />
      )}

      {/* ── Modal création / édition ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto">
            <div className="p-5 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="font-bold text-gray-900">
                {modal === "create"
                  ? "Nouveau produit"
                  : `Modifier — ${editing?.nom}`}
              </h2>
              <button
                onClick={() => setModal(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {err && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                  {err}
                </div>
              )}

              {/* Nom + Slug */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Nom *
                  </label>
                  <input
                    value={form.nom}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        nom: e.target.value,
                        slug:
                          modal === "create"
                            ? toSlug(e.target.value)
                            : form.slug,
                      })
                    }
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Slug *
                  </label>
                  <input
                    value={form.slug}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        slug: e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, ""),
                      })
                    }
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Marque + Catégorie */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  {/* Marque optionnelle (pas d'astérisque) — au moins marque ou activité requise */}
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Marque{" "}
                    <span className="text-gray-400 font-normal">
                      (ou activité)
                    </span>
                  </label>
                  <select
                    value={form.id_marque}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        id_marque: e.target.value,
                        id_categorie: "",
                      })
                    }
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white"
                  >
                    <option value="">— Aucune —</option>
                    {marques.map((m) => (
                      <option key={m.id_marque} value={m.id_marque}>
                        {m.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-gray-600">
                      Catégorie *
                    </label>
                    {catFilterInfo && (
                      <span className="flex items-center gap-1 text-[10px] text-blue-600 font-medium">
                        <Info size={10} />
                        {catFilterInfo}
                      </span>
                    )}
                  </div>
                  <select
                    value={form.id_categorie}
                    onChange={(e) => {
                      const cat = categories.find(
                        (c) => String(c.id_categorie) === e.target.value,
                      );
                      setForm({
                        ...form,
                        id_categorie: e.target.value,
                        id_activite: cat?.id_activite
                          ? String(cat.id_activite)
                          : form.id_activite,
                      });
                    }}
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white"
                  >
                    <option value="">— Choisir une catégorie —</option>
                    {catsFlat.map((c) => (
                      <option
                        key={c.id_categorie}
                        value={c.id_categorie}
                        style={{ paddingLeft: `${c.depth * 16}px` }}
                      >
                        {"　".repeat(c.depth)}
                        {c.depth > 0 ? "└ " : ""}
                        {c.nom}
                        {c.marque?.nom ? ` 🏷 ${(c.marque as any).nom}` : ""}
                        {c.activite?.nom
                          ? ` ⚡ ${(c.activite as any).nom}`
                          : ""}
                      </option>
                    ))}
                  </select>
                  {catsFiltrees.length === 0 &&
                    (form.id_marque || form.id_activite) && (
                      <p className="mt-1.5 text-xs text-amber-600 flex items-center gap-1">
                        <AlertCircle size={11} />
                        Aucune catégorie pour cette sélection. Créez-en une dans
                        la section Catégories.
                      </p>
                    )}
                </div>
              </div>

              {/* Activité */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Activité{" "}
                  <span className="text-gray-400 font-normal">
                    (auto depuis catégorie, ou choisir manuellement)
                  </span>
                </label>
                <select
                  value={form.id_activite}
                  onChange={(e) =>
                    setForm({ ...form, id_activite: e.target.value })
                  }
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white"
                >
                  <option value="">— Aucune —</option>
                  {activites.map((a) => (
                    <option key={a.id_activite} value={a.id_activite}>
                      {a.nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Division + Ordre */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Division
                  </label>
                  <select
                    value={form.division}
                    onChange={(e) =>
                      setForm({ ...form, division: e.target.value })
                    }
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white"
                  >
                    <option value="standard">Standard</option>
                    <option value="pro">Pro</option>
                    <option value="garden">Garden</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Ordre
                  </label>
                  <input
                    type="number"
                    value={form.ordre}
                    onChange={(e) =>
                      setForm({ ...form, ordre: Number(e.target.value) })
                    }
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500 resize-none"
                />
              </div>

              {modal === "edit" && (
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.actif}
                    onChange={(e) =>
                      setForm({ ...form, actif: e.target.checked })
                    }
                    className="accent-ev-600 w-4 h-4"
                  />
                  Produit actif
                </label>
              )}
              {modal === "create" && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
                  💡 Après création, utilisez les boutons{" "}
                  <strong>📷 Photos</strong> et <strong>📄 Fiche PDF</strong>{" "}
                  dans la liste.
                </div>
              )}
            </div>
            <div className="p-5 pt-0 flex gap-3">
              <button
                onClick={() => setModal(null)}
                className="flex-1 h-10 border text-sm text-gray-600 rounded-xl hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 h-10 bg-ev-700 text-white text-sm rounded-xl hover:bg-ev-800 disabled:opacity-60 flex items-center justify-center"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : modal === "create" ? (
                  "Créer"
                ) : (
                  "Enregistrer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
