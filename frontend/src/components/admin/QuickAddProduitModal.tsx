"use client";
import { adminProduitsCreate } from "@/lib/admin-api";
import { toast } from "@/components/admin/Toast";
import { type CatNodeFlat } from "@/lib/admin-catalog-utils";
import type { CategorieAdmin } from "@/lib/admin-api";
import { AlertCircle, X } from "lucide-react";
import { useState } from "react";
import { CategoryPicker } from "@/components/admin/CategoryPicker";

function toSlug(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const EMPTY = { nom: "", slug: "", id_categorie: "", division: "standard", description: "", ordre: 0 };

export function QuickAddProduitModal({
  scopeLabel,
  categories,
  allCategories,
  initialCategoryId,
  onClose,
  onCreated,
}: {
  /** Nom de la marque ou de l'activité, pour le titre de la modale */
  scopeLabel: string;
  /** Catégories déjà filtrées (aplaties, avec depth) pour ce scope */
  categories: CatNodeFlat[];
  /** Toutes les catégories, conservées pour compatibilité avec les appels existants */
  allCategories: CategorieAdmin[];
  /** Catégorie à pré-sélectionner quand l'ajout part d'une ligne d'arborescence */
  initialCategoryId?: number;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    ...EMPTY,
    id_categorie: initialCategoryId ? String(initialCategoryId) : "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const F = (k: keyof typeof EMPTY, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const options = categories;

  const handleSave = async () => {
    if (!form.nom.trim() || !form.slug.trim() || !form.id_categorie) {
      setErr("Nom, slug et catégorie sont requis.");
      return;
    }
    setSaving(true);
    setErr("");
    try {
      await adminProduitsCreate.create({
        nom: form.nom,
        slug: form.slug,
        id_categorie: Number(form.id_categorie),
        division: form.division,
        description: form.description || null,
        ordre: form.ordre,
      });
      toast.success("Produit créé !");
      onCreated();
      onClose();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">
        <div className="p-5 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-bold text-gray-900">Nouveau produit</h2>
            <p className="text-xs text-gray-400 mt-0.5">sous « {scopeLabel} »</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {err && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-start gap-2">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />{err}
            </div>
          )}

          {options.length === 0 ? (
            <p className="text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-xl p-3">
              Aucune catégorie disponible sous « {scopeLabel} ». Créez d'abord une
              catégorie ou sous-catégorie rattachée à ce scope depuis l'onglet Catégories.
            </p>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nom *</label>
                <input
                  value={form.nom}
                  onChange={(e) => { F("nom", e.target.value); F("slug", toSlug(e.target.value)); }}
                  className="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-[#1f4d34] focus:ring-[#1f4d34]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Slug *</label>
                <input
                  value={form.slug}
                  onChange={(e) => F("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  className="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-[#1f4d34] focus:ring-[#1f4d34]/20 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Catégorie *</label>
                <CategoryPicker
                  inline
                  value={form.id_categorie}
                  onChange={(id) => F("id_categorie", id)}
                  options={options}
                  allCategories={allCategories}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Division</label>
                  <select
                    value={form.division}
                    onChange={(e) => F("division", e.target.value)}
                    className="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none bg-white"
                  >
                    <option value="standard">Standard</option>
                    <option value="pro">Pro</option>
                    <option value="garden">Garden</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ordre</label>
                  <input
                    type="number" value={form.ordre}
                    onChange={(e) => F("ordre", Number(e.target.value))}
                    className="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-[#1f4d34] focus:ring-[#1f4d34]/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => F("description", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-[#1f4d34] focus:ring-[#1f4d34]/20 resize-none"
                />
              </div>
              <p className="text-[12px] text-gray-400">
                Les fiches techniques et champs avancés (images, calendrier, fiche technique…)
                restent modifiables depuis la page Produits.
              </p>
            </>
          )}
        </div>

        <div className="p-5 pt-0 flex gap-3">
          <button onClick={onClose} className="flex-1 h-10 border text-sm text-gray-600 rounded-xl hover:bg-gray-50">
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving || options.length === 0}
            className="flex-1 h-10 bg-[#1f4d34] text-white text-sm rounded-xl hover:bg-[#173b28] disabled:opacity-60 flex items-center justify-center"
          >
            {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
}