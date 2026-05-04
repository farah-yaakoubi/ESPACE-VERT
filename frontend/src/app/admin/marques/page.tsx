"use client";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { pushToast } from "@/components/admin/Toast";
import {
  adminMarques,
  adminProduits,
  type MarqueAdmin,
  type ProduitAdmin,
} from "@/lib/admin-api";
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
const EMPTY = { nom: "", slug: "", description: "", logo: "", actif: true };

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

  useEffect(() => {
    setLoading(true);
    adminProduits
      .list({ id_marque: String(marque.id_marque), limit: "100" } as any)
      .then((r) => setProduits(r.data))
      .catch(() => setProduits([]))
      .finally(() => setLoading(false));
  }, [marque.id_marque]);

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
              style={{ background: "linear-gradient(135deg,#EEF2FF,#C7D2FE)" }}
            >
              <span
                className="text-4xl font-black"
                style={{ color: "#3C50E0" }}
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
        <div className="px-5 pb-5 grid grid-cols-3 gap-3">
          {[
            {
              label: "Produits",
              val: marque._count?.produits ?? produits.length,
              icon: Package,
              color: "#3C50E0",
              bg: "#EEF2FF",
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

      {/* Produits */}
      <div
        className="bg-white rounded-2xl border overflow-hidden"
        style={{ borderColor: "#E2E8F0" }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "#F1F5F9" }}
        >
          <div>
            <h2 className="font-bold text-gray-800 text-sm">
              Produits de cette marque
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {produits.length} produit{produits.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher…"
                className="h-8 pl-7 pr-3 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
              />
            </div>
            <Link
              href="/admin/produits"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-white"
              style={{ background: "linear-gradient(135deg,#3C50E0,#4F60E8)" }}
            >
              <Plus size={13} /> Nouveau produit
            </Link>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <div
              className="w-6 h-6 rounded-full border-4 animate-spin"
              style={{ borderColor: "#EEF2FF", borderTopColor: "#3C50E0" }}
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Package size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">
              {search ? "Aucun résultat" : "Aucun produit pour cette marque"}
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "#F8FAFC" }}>
            {filtered.map((p) => {
              const img = p.images.find((i) => i.is_principale) ?? p.images[0];
              return (
                <div
                  key={p.id_produit}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden border shrink-0 flex items-center justify-center">
                    {img ? (
                      <Image
                        src={img.url}
                        alt={p.nom}
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    ) : (
                      <span className="text-gray-300">🌿</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {p.nom}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {(p.categorie as any)?.nom ?? p.slug}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${p.actif ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                  >
                    {p.actif ? "Actif" : "Inactif"}
                  </span>
                  <a
                    href={`/produits/${p.slug}`}
                    target="_blank"
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg shrink-0 transition-colors"
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
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
  const F = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

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
        ...(modal === "edit" ? { actif: form.actif } : {}),
      };
      if (modal === "create") await adminMarques.create(p as any);
      else if (editing) await adminMarques.update(editing.id_marque, p as any);
      setModal(null);
      pushToast({
        type: "success",
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
      pushToast({ type: "success", message: `Marque « ${m.nom} » supprimée` });
      if (detail?.id_marque === m.id_marque) setDetail(null);
      load();
    } catch (e: any) {
      pushToast({ type: "error", message: e.message });
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
        {modal && <MarqueModal />}
      </>
    );

  /* Modal component (shared for list and detail) */
  function MarqueModal() {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
          <div className="p-5 border-b flex items-center justify-between">
            <h2 className="font-bold text-gray-900">
              {modal === "create"
                ? "Nouvelle marque"
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
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                {err}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Nom *
                </label>
                <input
                  value={form.nom}
                  onChange={(e) =>
                    F("nom", e.target.value) ||
                    (modal === "create" && F("slug", toSlug(e.target.value)))
                  }
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Slug *
                </label>
                <input
                  value={form.slug}
                  onChange={(e) =>
                    F(
                      "slug",
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                    )
                  }
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => F("description", e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Logo
              </label>
              <ImageUploader onUpload={(v) => F("logo", v)} />
            </div>
            {modal === "edit" && (
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.actif}
                  onChange={(e) => F("actif", e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                Marque active
              </label>
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
              className="flex-1 h-10 text-white text-sm rounded-xl disabled:opacity-60 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#3C50E0,#4F60E8)" }}
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
        <div className="flex gap-2">
          <button
            onClick={load}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm"
            style={{ background: "linear-gradient(135deg,#3C50E0,#4F60E8)" }}
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
            style={{ border: "3px solid #EEF2FF", borderTopColor: "#3C50E0" }}
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
                      background: "linear-gradient(135deg,#EEF2FF,#C7D2FE)",
                    }}
                  >
                    <span
                      className="text-2xl font-black"
                      style={{ color: "#3C50E0" }}
                    >
                      {m.nom[0]}
                    </span>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.actif ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
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
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <ExternalLink size={12} />
                    </a>
                    <button
                      onClick={() => openEdit(m)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
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
                    style={{ color: "#3C50E0" }}
                  >
                    Gérer <ChevronRight size={11} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && <MarqueModal />}
    </div>
  );
}
