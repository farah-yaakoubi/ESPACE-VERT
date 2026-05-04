"use client";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { pushToast } from "@/components/admin/Toast";
import {
  adminActivites,
  adminProduits,
  type ActiviteAdmin,
  type ProduitAdmin,
} from "@/lib/admin-api";
import {
  Activity,
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
const EMPTY = {
  nom: "",
  slug: "",
  description: "",
  image: "",
  ordre: 0,
  actif: true,
};

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
function ActiviteDetail({
  activite,
  onBack,
  onEdit,
  onDelete,
}: {
  activite: ActiviteAdmin;
  onBack: () => void;
  onEdit: (a: ActiviteAdmin) => void;
  onDelete: (a: ActiviteAdmin) => void;
}) {
  const [produits, setProduits] = useState<ProduitAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    adminProduits
      .list({ id_activite: String(activite.id_activite), limit: "100" } as any)
      .then((r) => setProduits(r.data))
      .catch(() => setProduits([]))
      .finally(() => setLoading(false));
  }, [activite.id_activite]);

  const filtered = produits.filter((p) =>
    p.nom.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft size={16} /> Retour aux activités
      </button>

      {/* Hero */}
      <div
        className="bg-white rounded-2xl border overflow-hidden"
        style={{ borderColor: "#E2E8F0" }}
      >
        <div
          className="h-48 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg,#f0fdf4,#dcfce7)" }}
        >
          {activite.image && (
            <Image
              src={activite.image}
              alt={activite.nom}
              fill
              className="object-cover opacity-20"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              {activite.image ? (
                <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-3 shadow-lg">
                  <Image
                    src={activite.image}
                    alt={activite.nom}
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{
                    background: "linear-gradient(135deg,#D1FAE5,#A7F3D0)",
                  }}
                >
                  <Activity size={32} className="text-green-600" />
                </div>
              )}
            </div>
          </div>
          <div className="absolute top-4 right-4">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${activite.actif ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
            >
              {activite.actif ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
        <div className="p-5 flex items-start justify-between gap-4">
          <div>
            <h1
              className="text-xl font-bold text-gray-900"
              style={{ letterSpacing: "-0.03em" }}
            >
              {activite.nom}
            </h1>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              /activites/{activite.slug}
            </p>
            {activite.description && (
              <p className="text-sm text-gray-600 mt-2 max-w-lg">
                {activite.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`/activites/${activite.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <Eye size={13} /> Voir
            </a>
            <button
              onClick={() => onEdit(activite)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <Edit2 size={13} /> Modifier
            </button>
            <button
              onClick={() => onDelete(activite)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
            >
              <Trash2 size={13} /> Supprimer
            </button>
          </div>
        </div>
        <div className="px-5 pb-5 grid grid-cols-3 gap-3">
          {[
            {
              label: "Produits",
              val: produits.length,
              color: "#3C50E0",
              bg: "#EEF2FF",
            },
            {
              label: "Ordre",
              val: `#${activite.ordre}`,
              color: "#8B5CF6",
              bg: "#EDE9FE",
            },
            {
              label: "Statut",
              val: activite.actif ? "Active" : "Inactive",
              color: activite.actif ? "#10B981" : "#6B7280",
              bg: activite.actif ? "#D1FAE5" : "#F3F4F6",
            },
          ].map(({ label, val, color, bg }) => (
            <div
              key={label}
              className="p-3 rounded-xl"
              style={{ background: bg + "40" }}
            >
              <p className="text-xs text-gray-400 mb-0.5">{label}</p>
              <p className="text-sm font-bold" style={{ color }}>
                {val}
              </p>
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
              Produits liés à cette activité
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
                className="h-8 pl-7 pr-3 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-44"
              />
            </div>
            <Link
              href="/admin/produits"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-white"
              style={{ background: "linear-gradient(135deg,#10B981,#059669)" }}
            >
              <Plus size={13} /> Nouveau produit
            </Link>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <div
              className="w-6 h-6 rounded-full border-4 animate-spin"
              style={{ borderColor: "#D1FAE5", borderTopColor: "#10B981" }}
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Package size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">
              {search ? "Aucun résultat" : "Aucun produit pour cette activité"}
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
                      {(p.marque as any)?.nom ?? ""}
                      {(p.categorie as any)?.nom
                        ? ` · ${(p.categorie as any).nom}`
                        : ""}
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
                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg shrink-0"
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
export default function AdminActivitesPage() {
  const [items, setItems] = useState<ActiviteAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<ActiviteAdmin | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [detail, setDetail] = useState<ActiviteAdmin | null>(null);
  const [confirmDel, setConfirmDel] = useState<ActiviteAdmin | null>(null);
  const F = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await adminActivites.list();
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
  const openEdit = (a: ActiviteAdmin) => {
    setForm({
      nom: a.nom,
      slug: a.slug,
      description: a.description ?? "",
      image: a.image ?? "",
      ordre: a.ordre,
      actif: a.actif,
    });
    setEditing(a);
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
        image: form.image || null,
        ordre: form.ordre,
        ...(modal === "edit" ? { actif: form.actif } : {}),
      };
      if (modal === "create") await adminActivites.create(p as any);
      else if (editing)
        await adminActivites.update(editing.id_activite, p as any);
      setModal(null);
      pushToast({
        type: "success",
        message:
          modal === "create" ? "Activité créée !" : "Activité mise à jour !",
      });
      load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };
  const remove = async (a: ActiviteAdmin) => {
    try {
      await adminActivites.remove(a.id_activite);
      pushToast({
        type: "success",
        message: `Activité « ${a.nom} » supprimée`,
      });
      if (detail?.id_activite === a.id_activite) setDetail(null);
      load();
    } catch (e: any) {
      pushToast({ type: "error", message: e.message });
    } finally {
      setConfirmDel(null);
    }
  };

  function ActiviteModal() {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
          <div className="p-5 border-b flex items-center justify-between">
            <h2 className="font-bold text-gray-900">
              {modal === "create"
                ? "Nouvelle activité"
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
                  onChange={(e) => {
                    F("nom", e.target.value);
                    modal === "create" && F("slug", toSlug(e.target.value));
                  }}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-xs"
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
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Image
              </label>
              <ImageUploader onUpload={(v) => F("image", v)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Ordre
              </label>
              <input
                type="number"
                value={form.ordre}
                onChange={(e) => F("ordre", Number(e.target.value))}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            {modal === "edit" && (
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.actif}
                  onChange={(e) => F("actif", e.target.checked)}
                  className="w-4 h-4 accent-green-600"
                />
                Activité active
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
              style={{ background: "linear-gradient(135deg,#10B981,#059669)" }}
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

  if (detail)
    return (
      <>
        {confirmDel && (
          <ConfirmDialog
            message={`Supprimer l'activité « ${confirmDel.nom} » ?`}
            onConfirm={() => remove(confirmDel)}
            onCancel={() => setConfirmDel(null)}
          />
        )}
        <ActiviteDetail
          activite={detail}
          onBack={() => setDetail(null)}
          onEdit={(a) => {
            openEdit(a);
          }}
          onDelete={(a) => setConfirmDel(a)}
        />
        {modal && <ActiviteModal />}
      </>
    );

  return (
    <div className="space-y-6">
      {confirmDel && (
        <ConfirmDialog
          message={`Supprimer l'activité « ${confirmDel.nom} » ?`}
          onConfirm={() => remove(confirmDel)}
          onCancel={() => setConfirmDel(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-gray-900"
            style={{ letterSpacing: "-0.04em" }}
          >
            Activités
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {items.length} activité{items.length !== 1 ? "s" : ""}
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
            style={{ background: "linear-gradient(135deg,#10B981,#059669)" }}
          >
            <Plus size={16} />
            Nouvelle activité
          </button>
        </div>
      </div>

      <div
        className="bg-white rounded-2xl border overflow-hidden"
        style={{ borderColor: "#E2E8F0" }}
      >
        {loading ? (
          <div className="flex justify-center py-16">
            <div
              className="w-7 h-7 rounded-full border-4 animate-spin"
              style={{ borderColor: "#D1FAE5", borderTopColor: "#10B981" }}
            />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">Aucune activité</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead
                style={{
                  background: "#F8FAFC",
                  borderBottom: "1px solid #E2E8F0",
                }}
              >
                <tr>
                  {["Image", "Nom", "Slug", "Ordre", "Statut", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((a) => (
                  <tr
                    key={a.id_activite}
                    className="hover:bg-gray-50 transition-colors cursor-pointer group"
                    onClick={() => setDetail(a)}
                  >
                    <td className="px-4 py-3 w-12">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border flex items-center justify-center">
                        {a.image ? (
                          <Image
                            src={a.image}
                            alt={a.nom}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        ) : (
                          <Activity size={18} className="text-gray-300" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800 group-hover:text-green-700 transition-colors">
                        {a.nom}
                      </p>
                      {a.description && (
                        <p className="text-xs text-gray-400 truncate max-w-[200px]">
                          {a.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">
                      {a.slug}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        #{a.ordre}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${a.actif ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {a.actif ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setDetail(a)}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                          title="Voir détail"
                        >
                          <ChevronRight size={13} />
                        </button>
                        <a
                          href={`/activites/${a.slug}`}
                          target="_blank"
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                        >
                          <ExternalLink size={13} />
                        </a>
                        <button
                          onClick={() => openEdit(a)}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => setConfirmDel(a)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && <ActiviteModal />}
    </div>
  );
}
