"use client";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { toast } from "@/components/admin/Toast";
import {
  adminActivites,
  adminCategories,
  adminMarques,
  adminProduits,
  type ActiviteAdmin,
  type CategorieAdmin,
  type MarqueAdmin,
  type ProduitAdmin,
} from "@/lib/admin-api";
import { categoriesUnderActivite } from "@/lib/admin-catalog-utils";
import { ProduitsManager } from "@/components/admin/ProduitsManager";
import {
  Activity,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Edit2,
  ExternalLink,
  Folder,
  FolderOpen,
  Image as ImageIcon,
  Info,
  Layers,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";

/* ══════════════════════════════════════════════════════════════════
   SECTION — Gestion des Activités (CRUD + bannière)
══════════════════════════════════════════════════════════════════ */

const EMPTY_ACT = { nom: "", slug: "", description: "", image: "", banniere: "", ordre: 0, actif: true };

function toSlugAct(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function ActivitesCrudPanel() {
  const [items, setItems] = useState<ActiviteAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<ActiviteAdmin | null>(null);
  const [form, setForm] = useState(EMPTY_ACT);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [confirmDel, setConfirmDel] = useState<ActiviteAdmin | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [allCategories, setAllCategories] = useState<CategorieAdmin[]>([]);

  useEffect(() => {
    adminCategories.list().then((c) =>
      setAllCategories(Array.isArray(c) ? c : ((c as any).data ?? [])),
    ).catch(() => setAllCategories([]));
  }, []);

  const F = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await adminActivites.list();
      setItems(Array.isArray(d) ? d : (d as any).data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setForm(EMPTY_ACT);
    setEditing(null);
    setErr("");
    setModal("create");
  };

  const openEdit = (a: ActiviteAdmin) => {
    setForm({
      nom:         a.nom,
      slug:        a.slug,
      description: a.description ?? "",
      image:       a.image ?? "",
      banniere:    (a as any).banniere ?? "",
      ordre:       a.ordre,
      actif:       a.actif,
    });
    setEditing(a);
    setErr("");
    setModal("edit");
  };

  const handleSave = async () => {
    if (!form.nom.trim() || !form.slug.trim()) { setErr("Nom et slug requis."); return; }
    setSaving(true); setErr("");
    try {
      const p = {
        nom:         form.nom,
        slug:        form.slug,
        description: form.description || null,
        image:       form.image || null,
        banniere:    form.banniere || null,
        ordre:       form.ordre,
        ...(modal === "edit" ? { actif: form.actif } : {}),
      };
      if (modal === "create") await adminActivites.create(p as any);
      else if (editing)       await adminActivites.update(editing.id_activite, p as any);
      setModal(null);
      toast.success(modal === "create" ? "Activité créée" : "Activité mise à jour", form.nom);
      load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (a: ActiviteAdmin) => {
    setConfirmDel(null);
    try {
      await adminActivites.remove(a.id_activite);
      toast.success("Activité supprimée", a.nom);
      load();
    } catch (e: any) {
      toast.error("Erreur", e.message);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <Activity size={24} className="text-[#1f4d34]" /> Activités
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gérez les activités et leur bannière héro respective
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 text-gray-500 hover:text-gray-800 rounded-xl hover:bg-gray-100">
            <RefreshCw size={15} />
          </button>
          <button
            onClick={openCreate}
            className="flex h-10 items-center gap-2 bg-[#1f4d34] hover:bg-[#173b28] text-white text-sm font-semibold px-4 rounded-xl"
          >
            <Plus size={15} /> Nouvelle activité
          </button>
        </div>
      </div>

      {/* Confirm delete */}
      {confirmDel && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={22} className="text-red-600" />
            </div>
            <p className="text-gray-700 text-sm text-center mb-6">
              Supprimer « {confirmDel.nom} » ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDel(null)} className="flex-1 h-10 border border-gray-200 text-sm text-gray-600 rounded-xl hover:bg-gray-50">Annuler</button>
              <button onClick={() => handleDelete(confirmDel)} className="flex-1 h-10 bg-red-600 text-white text-sm rounded-xl hover:bg-red-700">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Liste */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-7 h-7 border-4 border-[#2a5c40] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">Aucune activité</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Activité", "Image", "Bannière", "Ordre", "Statut", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3.5 text-left text-[13px] font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((a) => (
                  <React.Fragment key={a.id_activite}>
                  <tr className="group hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-bold text-gray-900 text-lg">{a.nom}</p>
                      <p className="text-xs text-gray-500 font-mono">{a.slug}</p>
                      {a.description && (
                        <p className="text-sm text-gray-600 mt-0.5 max-w-xs truncate">{a.description}</p>
                      )}
                    </td>
                    {/* Image miniature */}
                    <td className="px-4 py-3">
                      {a.image ? (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                          <Image src={a.image} alt="" fill style={{ objectFit: "cover" }} />
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    {/* Bannière */}
                    <td className="px-4 py-3">
                      {(a as any).banniere ? (
                        <div className="relative w-20 h-10 rounded-lg overflow-hidden bg-gray-100">
                          <Image src={(a as any).banniere} alt="" fill style={{ objectFit: "cover" }} />
                        </div>
                      ) : (
                        <span className="text-xs text-amber-500 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                          Non configurée
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-400">{a.ordre}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${a.actif ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {a.actif ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => setExpandedId(expandedId === a.id_activite ? null : a.id_activite)}
                          className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#1f4d34] px-4 text-sm font-bold text-white transition-colors hover:bg-[#173b28]"
                          title="Voir et gérer les produits de cette activité"
                        >
                          <Package size={16} />
                          {expandedId === a.id_activite ? "Masquer les produits" : "Gérer les produits"}
                          {expandedId === a.id_activite ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                        <button
                          onClick={() => openEdit(a)}
                          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#c3d6c9] bg-[#f0f5f1] px-3.5 text-sm font-semibold text-[#1f4d34] hover:bg-[#dce8df]"
                          title="Modifier l'activité"
                        >
                          <Pencil size={15} /> Modifier
                        </button>
                        <Link
                          href={`/activites/${a.slug}`}
                          target="_blank"
                          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                          title="Voir la page publique"
                        >
                          <ExternalLink size={15} /> Voir
                        </Link>
                        <button
                          onClick={() => setConfirmDel(a)}
                          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                          title="Supprimer l'activité"
                        >
                          <Trash2 size={15} /> Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === a.id_activite && (
                    <tr>
                      <td colSpan={6} className="bg-gray-50/70 px-4 py-4 border-t border-gray-100">
                        <ProduitsManager scope={{ type: "activite", id: a.id_activite, label: a.nom }} />
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
            <div className="p-5 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="font-bold text-gray-900">
                {modal === "create" ? "Nouvelle activité" : `Modifier — ${editing?.nom}`}
              </h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>

            <div className="p-5 space-y-4">
              {err && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-start gap-2">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />{err}
                </div>
              )}

              {/* Nom + Slug */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nom *</label>
                  <input
                    value={form.nom}
                    onChange={(e) => { F("nom", e.target.value); if (modal === "create") F("slug", toSlugAct(e.target.value)); }}
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2f6b4a]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Slug *</label>
                  <input
                    value={form.slug}
                    onChange={(e) => F("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2f6b4a] font-mono text-xs"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => F("description", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2f6b4a] resize-none"
                />
              </div>

              {/* Ordre */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Ordre</label>
                <input
                  type="number" value={form.ordre}
                  onChange={(e) => F("ordre", Number(e.target.value))}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2f6b4a]"
                />
              </div>

              {/* Icône emoji — navbar dropdown */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Icône <span className="text-gray-400 font-normal">(affichée dans le menu navbar)</span>
                </label>
                {/* Prévisualisation */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-[#f0f5f1] border border-[#dce8df] flex items-center justify-center text-2xl shrink-0">
                    {form.image || "🌿"}
                  </div>
                  <p className="text-xs text-gray-400">Cliquez une icône ci-dessous pour la sélectionner</p>
                </div>
                {/* Picker */}
                <div className="grid grid-cols-10 gap-1.5 p-3 bg-gray-50 rounded-xl border border-gray-100 max-h-44 overflow-y-auto">
                  {[
                    "🌱","🌿","🍃","🍀","🌾","🌻","🌺","🌸","🌼","🪴",
                    "🌳","🌲","🎋","🎍","🍂","🍁","🪵","🪨","🌊","💧",
                    "☀️","🌤️","🌦️","🌧️","❄️","🔥","💨","🌈","⚡","🌡️",
                    "🚜","🚛","🌍","🏭","🏗️","🏡","🔬","🧪","💊","🧴",
                    "🫘","🥬","🥕","🌽","🍅","🍇","🍊","🍋","🧅","🧄",
                    "🐄","🐓","🐟","🦋","🐝","🌙","⭐","✨","💚","🟢",
                  ].map(em => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => F("image", em)}
                      className={`h-9 w-full flex items-center justify-center rounded-lg text-xl transition-all hover:scale-110 ${
                        form.image === em
                          ? "bg-[#dce8df] ring-2 ring-[#2f6b4a] scale-110"
                          : "hover:bg-gray-200"
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
                {/* Saisie manuelle */}
                <input
                  type="text" value={form.image}
                  onChange={(e) => F("image", e.target.value)}
                  placeholder="Ou saisissez un emoji manuellement…"
                  className="mt-2 w-full h-9 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2f6b4a]"
                />
              </div>

              {/* Bannière */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Bannière héro <span className="text-gray-400 font-normal">(image pleine largeur sur la page /activites/slug)</span>
                </label>
                {form.banniere && (
                  <div className="relative w-full h-24 rounded-xl overflow-hidden mb-2 bg-gray-100">
                    <Image src={form.banniere} alt="" fill style={{ objectFit: "cover" }} />
                  </div>
                )}
                <ImageUploader onUpload={(v) => F("banniere", v)} />
                <input
                  type="text" value={form.banniere}
                  onChange={(e) => F("banniere", e.target.value)}
                  placeholder="/images/hero/mon-activite-banner.webp"
                  className="mt-1 w-full h-9 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2f6b4a]"
                />
              </div>

              {modal === "edit" && (
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.actif} onChange={(e) => F("actif", e.target.checked)} className="accent-[#2a5c40] w-4 h-4" />
                  Activité active
                </label>
              )}
            </div>

            <div className="p-5 pt-0 flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 h-10 border text-sm text-gray-600 rounded-xl hover:bg-gray-50">Annuler</button>
              <button
                onClick={handleSave} disabled={saving}
                className="flex-1 h-10 bg-[#1f4d34] text-white text-sm rounded-xl hover:bg-[#173b28] disabled:opacity-60 flex items-center justify-center"
              >
                {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : modal === "create" ? "Créer" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Panneau produits déroulant, scopé à une activité ─────────────── */
export default function AdminActivitesPage() {
  return <ActivitesCrudPanel />;
}