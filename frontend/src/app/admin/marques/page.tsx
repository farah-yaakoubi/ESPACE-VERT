"use client";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { pushToast } from "@/components/admin/Toast";
import {
  adminMarques,
  adminProduits,
  adminCategories,
  type MarqueAdmin,
  type ProduitAdmin,
  type CategorieAdmin,
} from "@/lib/admin-api";
import { categoriesUnderMarque } from "@/lib/admin-catalog-utils";
import { ProduitsManager } from "@/components/admin/ProduitsManager";
import {
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Edit2,
  ExternalLink,
  Eye,
  Package,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

function toSlug(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
const EMPTY = { nom: "", slug: "", description: "", logo: "", banniere: "", type_marque: "groupe" as "groupe" | "partenaire", actif: true };

function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={22} className="text-red-600" />
        </div>
        <p className="text-gray-700 text-sm text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-10 border border-gray-200 text-sm text-gray-600 rounded-xl hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-10 bg-red-600 text-white text-sm rounded-xl hover:bg-red-700"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

function MarqueModal({
  modal,
  editing,
  form,
  err,
  saving,
  onFieldChange,
  onClose,
  onSave,
}: {
  modal: "create" | "edit";
  editing: MarqueAdmin | null;
  form: typeof EMPTY;
  err: string;
  saving: boolean;
  onFieldChange: (key: keyof typeof EMPTY, value: any) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="p-5 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="font-bold text-gray-900">
            {modal === "create" ? "Nouvelle marque" : `Modifier — ${editing?.nom}`}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {err && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-start gap-2">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              {err}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Nom *
              </label>
              <input
                value={form.nom}
                onChange={(e) => {
                  const value = e.target.value;
                  onFieldChange("nom", value);
                  if (modal === "create") onFieldChange("slug", toSlug(value));
                }}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2f6b4a]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Slug *
              </label>
              <input
                value={form.slug}
                onChange={(e) =>
                  onFieldChange(
                    "slug",
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                  )
                }
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2f6b4a] font-mono text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => onFieldChange("description", e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2f6b4a] resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Logo <span className="font-normal text-gray-400">(navbar / dropdown)</span>
            </label>
            {form.logo && (
              <div className="relative w-24 h-16 rounded-xl overflow-hidden mb-2 bg-gray-100">
                <img src={form.logo} alt="" className="w-full h-full object-contain p-2" />
              </div>
            )}
            <ImageUploader onUpload={(v) => onFieldChange("logo", v)} />
            <p className="text-xs text-gray-400 mt-1">Ou saisissez une URL :</p>
            <input
              type="text"
              value={form.logo}
              onChange={(e) => onFieldChange("logo", e.target.value)}
              placeholder="/logos/ma-marque.png"
              className="mt-1 w-full h-9 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2f6b4a]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Bannière <span className="font-normal text-gray-400">(hero de la page marque)</span>
            </label>
            {form.banniere && (
              <div className="relative w-full h-24 rounded-xl overflow-hidden mb-2 bg-gray-100">
                <img src={form.banniere} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <ImageUploader onUpload={(v) => onFieldChange("banniere", v)} />
            <p className="text-xs text-gray-400 mt-1">Ou saisissez une URL :</p>
            <input
              type="text"
              value={form.banniere}
              onChange={(e) => onFieldChange("banniere", e.target.value)}
              placeholder="/images/hero/fertivert.webp"
              className="mt-1 w-full h-9 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2f6b4a]"
            />
          </div>
          {modal === "edit" && (
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.actif}
                onChange={(e) => onFieldChange("actif", e.target.checked)}
                className="w-4 h-4 accent-[#1f4d34]"
              />
              Marque active
            </label>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Type de marque
            </label>
            <select
              value={form.type_marque}
              onChange={(e) => onFieldChange("type_marque", e.target.value)}
              className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white"
            >
              <option value="groupe">Groupe (marque propre)</option>
              <option value="partenaire">Partenaire</option>
            </select>
          </div>
        </div>
        <div className="p-5 pt-0 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 border text-sm text-gray-600 rounded-xl hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="flex-1 h-10 text-white text-sm rounded-xl disabled:opacity-60 flex items-center justify-center"
            style={{ background: "#1f4d34" }}
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
  );
}

/* ─── Detail panel ─────────────────────────────────────────────── */
function MarqueDetail({
  marque,
  onBack,
  onEdit,
  onDelete,
}: {
  marque: MarqueAdmin;
  onBack: () => void;
  onEdit: (m: MarqueAdmin) => void;
  onDelete: (m: MarqueAdmin) => void;
}) {
  const [produits, setProduits] = useState<ProduitAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [allCategories, setAllCategories] = useState<CategorieAdmin[]>([]);
  const [addOpen, setAddOpen] = useState(false);

  const loadProduits = useCallback(() => {
    setLoading(true);
    adminProduits
      .list({ id_marque: String(marque.id_marque), limit: "100" } as any)
      .then((r) => setProduits(r.data))
      .catch(() => setProduits([]))
      .finally(() => setLoading(false));
  }, [marque.id_marque]);

  useEffect(() => { loadProduits(); }, [loadProduits]);

  useEffect(() => {
    adminCategories.list().then((c) =>
      setAllCategories(Array.isArray(c) ? c : ((c as any).data ?? [])),
    ).catch(() => setAllCategories([]));
  }, []);

  const scopedCategories = categoriesUnderMarque(allCategories, marque.id_marque);

  const filtered = produits.filter((p) =>
    p.nom.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      {/* Back + actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={16} /> Retour aux marques
        </button>
      </div>

      {/* Hero card */}
      <div
        className="bg-white rounded-2xl border overflow-hidden"
        style={{ borderColor: "#E2E8F0" }}
      >
        <div
          className="h-40 flex items-center justify-center p-8 relative"
          style={{ background: "linear-gradient(135deg,#f8fafc,#f1f5f9)" }}
        >
          {marque.logo ? (
            <Image
              src={marque.logo}
              alt={marque.nom}
              width={180}
              height={80}
              className="object-contain max-h-24"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#dce8df,#C7D2FE)" }}
            >
              <span
                className="text-4xl font-black"
                style={{ color: "#1f4d34" }}
              >
                {marque.nom[0]}
              </span>
            </div>
          )}
          <div className="absolute top-4 right-4 flex gap-2">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${marque.actif ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
            >
              {marque.actif ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
        <div className="p-5 flex items-start justify-between gap-4">
          <div>
            <h1
              className="text-xl font-bold text-gray-900"
              style={{ letterSpacing: "-0.03em" }}
            >
              {marque.nom}
            </h1>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              /marques/{marque.slug}
            </p>
            {marque.description && (
              <p className="text-sm text-gray-600 mt-2 max-w-lg">
                {marque.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`/marques/${marque.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Eye size={13} /> Voir
            </a>
            <button
              onClick={() => onEdit(marque)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Edit2 size={13} /> Modifier
            </button>
            <button
              onClick={() => onDelete(marque)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={13} /> Supprimer
            </button>
          </div>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-3">
          {[
            {
              label: "Produits",
              val: marque._count?.produits ?? produits.length,
              icon: Package,
              color: "#1f4d34",
              bg: "#dce8df",
            },
            {
              label: "Catégories",
              val: marque._count?.categories ?? 0,
              icon: Tag,
              color: "#8B5CF6",
              bg: "#EDE9FE",
            },
            {
              label: "Statut",
              val: marque.actif ? "Active" : "Inactive",
              icon: Eye,
              color: marque.actif ? "#10B981" : "#6B7280",
              bg: marque.actif ? "#D1FAE5" : "#F3F4F6",
            },
          ].map(({ label, val, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: bg + "40" }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: bg }}
              >
                <Icon size={15} style={{ color }} />
              </div>
              <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-bold text-gray-800">{val}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Produits — gestion complète, limitée aux catégories de cette marque */}
      <ProduitsManager scope={{ type: "marque", id: marque.id_marque, label: marque.nom }} />
    </div>
  );
}

/* ─── Page principale ──────────────────────────────────────────── */
export default function AdminMarquesPage() {
  const [items, setItems] = useState<MarqueAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<MarqueAdmin | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [detail, setDetail] = useState<MarqueAdmin | null>(null);
  const [confirmDel, setConfirmDel] = useState<MarqueAdmin | null>(null);
  const handleFieldChange = (key: keyof typeof EMPTY, value: any) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await adminMarques.list();
      setItems(Array.isArray(d) ? d : ((d as any).data ?? []));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm(EMPTY);
    setEditing(null);
    setErr("");
    setModal("create");
  };
  const openEdit = (m: MarqueAdmin) => {
    setForm({
      nom: m.nom,
      slug: m.slug,
      description: m.description ?? "",
      logo: m.logo ?? "",
      banniere: (m as any).banniere ?? "",
      type_marque: m.type_marque ?? "groupe",
      actif: m.actif,
    });
    setEditing(m);
    setErr("");
    setModal("edit");
  };
  const handleSave = async () => {
    if (!form.nom.trim() || !form.slug.trim()) {
      setErr("Nom et slug requis.");
      return;
    }
    setSaving(true);
    setErr("");
    try {
      const p = {
        nom: form.nom,
        slug: form.slug,
        description: form.description || null,
        logo: form.logo || null,
        banniere: (form as any).banniere || null,
        type_marque: form.type_marque,
        ...(modal === "edit" ? { actif: form.actif } : {}),
      };
      if (modal === "create") await adminMarques.create(p as any);
      else if (editing) await adminMarques.update(editing.id_marque, p as any);
      setModal(null);
      pushToast({
        type: "success",
        title: modal === "create" ? "Succes" : "Mise a jour",
        message: modal === "create" ? "Marque créée !" : "Marque mise à jour !",
      });
      load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };
  const remove = async (m: MarqueAdmin) => {
    try {
      await adminMarques.remove(m.id_marque);
      pushToast({ type: "success", title: "Suppression", message: `Marque « ${m.nom} » supprimée` });
      if (detail?.id_marque === m.id_marque) setDetail(null);
      load();
    } catch (e: any) {
      pushToast({ type: "error", title: "Erreur", message: e.message });
    } finally {
      setConfirmDel(null);
    }
  };

  // if detail view
  if (detail)
    return (
      <>
        {confirmDel && (
          <ConfirmDialog
            message={`Supprimer « ${confirmDel.nom} » définitivement ?`}
            onConfirm={() => remove(confirmDel)}
            onCancel={() => setConfirmDel(null)}
          />
        )}
        <MarqueDetail
          marque={detail}
          onBack={() => setDetail(null)}
          onEdit={(m) => {
            openEdit(m);
          }}
          onDelete={(m) => setConfirmDel(m)}
        />
        {modal && (
          <MarqueModal
            modal={modal}
            editing={editing}
            form={form}
            err={err}
            saving={saving}
            onFieldChange={handleFieldChange}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
      </>
    );

  return (
    <div className="space-y-5">
      {confirmDel && (
        <ConfirmDialog
          message={`Supprimer « ${confirmDel.nom} » définitivement ?`}
          onConfirm={() => remove(confirmDel)}
          onCancel={() => setConfirmDel(null)}
        />
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1
            className="text-2xl font-bold text-gray-900"
            style={{ letterSpacing: "-0.04em" }}
          >
            Marques
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {items.length} marque{items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm"
            style={{ background: "#1f4d34" }}
          >
            <Plus size={16} />
            Nouvelle marque
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div
            className="w-8 h-8 rounded-full animate-spin"
            style={{ border: "3px solid #dce8df", borderTopColor: "#1f4d34" }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((m) => (
            <div
              key={m.id_marque}
              className={`bg-white rounded-2xl border overflow-hidden hover:shadow-md transition-all cursor-pointer group ${!m.actif ? "opacity-60" : ""}`}
              style={{ borderColor: "#E2E8F0" }}
              onClick={() => setDetail(m)}
            >
              {/* Logo */}
              <div
                className="h-36 flex items-center justify-center p-6 relative"
                style={{
                  background: "linear-gradient(135deg,#f8fafc,#f1f5f9)",
                }}
              >
                {m.logo ? (
                  <Image
                    src={m.logo}
                    alt={m.nom}
                    width={160}
                    height={80}
                    className="object-contain max-h-20"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg,#dce8df,#C7D2FE)",
                    }}
                  >
                    <span
                      className="text-2xl font-black"
                      style={{ color: "#1f4d34" }}
                    >
                      {m.nom[0]}
                    </span>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${m.actif ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                  >
                    {m.actif ? "Active" : "Inactive"}
                  </span>
                </div>
                {/* hover overlay */}
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "rgba(60,80,224,0.08)" }}
                >
                  <span
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full text-white"
                    style={{ background: "rgba(60,80,224,0.85)" }}
                  >
                    <Eye size={11} /> Gérer
                  </span>
                </div>
              </div>
              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold text-gray-900">{m.nom}</h3>
                  <div
                    className="flex gap-1 ml-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <a
                      href={`/marques/${m.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-gray-400 hover:text-[#1f4d34] hover:bg-[#f0f5f1] rounded-lg"
                    >
                      <ExternalLink size={12} />
                    </a>
                    <button
                      onClick={() => openEdit(m)}
                      className="p-1.5 text-gray-400 hover:text-[#1f4d34] hover:bg-[#f0f5f1] rounded-lg"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => setConfirmDel(m)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-400 font-mono mb-2">{m.slug}</p>
                {m.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                    {m.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex gap-3 text-xs text-gray-400">
                    {m._count?.produits !== undefined && (
                      <span className="flex items-center gap-1">
                        <Package size={10} />
                        {m._count.produits} produits
                      </span>
                    )}
                  </div>
                  <span
                    className="flex items-center gap-1 text-xs font-semibold"
                    style={{ color: "#1f4d34" }}
                  >
                    Gérer <ChevronRight size={11} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <MarqueModal
          modal={modal}
          editing={editing}
          form={form}
          err={err}
          saving={saving}
          onFieldChange={handleFieldChange}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}