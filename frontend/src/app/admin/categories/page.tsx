"use client";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { toast } from "@/components/admin/Toast";
import Image from "next/image";
import {
  adminActivites,
  adminCategories,
  adminMarques,
  type ActiviteAdmin,
  type CategorieAdmin,
  type MarqueAdmin,
} from "@/lib/admin-api";
import {
  Activity,
  AlertCircle,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Edit2,
  Folder,
  FolderOpen,
  Info,
  Plus,
  RefreshCw,
  Square,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

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
  id_activite: "",
  id_marque: "",
  parent_id: "",
  parent_ids_extra: [] as number[],
  ordre: 0,
  actif: true,
};

// ── Nœud d'arbre ─────────────────────────────────────────────────
interface TreeNode extends CategorieAdmin {
  children: TreeNode[];
  depth: number;
}

function buildTree(flat: CategorieAdmin[]): TreeNode[] {
  const map = new Map<number, TreeNode>();
  flat.forEach((c) =>
    map.set(c.id_categorie, { ...c, children: [], depth: 0 }),
  );
  const roots: TreeNode[] = [];
  map.forEach((node) => {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sort = (arr: TreeNode[]) =>
    arr.sort((a, b) => a.ordre - b.ordre || a.nom.localeCompare(b.nom, "fr"));

  const assignDepth = (nodes: TreeNode[], depth: number): TreeNode[] => {
    sort(nodes);
    nodes.forEach((n) => {
      n.depth = depth;
      assignDepth(n.children, depth + 1);
    });
    return nodes;
  };

  return assignDepth(roots, 0);
}

function flattenTree(nodes: TreeNode[]): TreeNode[] {
  const result: TreeNode[] = [];
  const walk = (arr: TreeNode[]) =>
    arr.forEach((n) => {
      result.push(n);
      walk(n.children);
    });
  walk(nodes);
  return result;
}

/** Collecte l'id d'un nœud + tous ses descendants */
function collectSubtreeIds(node: TreeNode): number[] {
  return [node.id_categorie, ...node.children.flatMap(collectSubtreeIds)];
}

// ── Badge marque/activité ────────────────────────────────────────
function Badge({ label, type }: { label: string; type: "marque" | "activite" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
        type === "marque"
          ? "bg-blue-50 text-blue-600 border border-blue-100"
          : "bg-green-50 text-green-600 border border-green-100"
      }`}
    >
      {type === "marque" ? <Tag size={8} /> : <Activity size={8} />}
      {label}
    </span>
  );
}

// ── Ligne de l'arbre ─────────────────────────────────────────────
function TreeRow({
  node,
  expanded,
  selected,
  onToggle,
  onSelect,
  onEdit,
  onDelete,
  onAddChild,
}: {
  node: TreeNode;
  expanded: boolean;
  selected: boolean;
  onToggle: () => void;
  onSelect: (id: number, withSubtree?: boolean) => void;
  onEdit: (c: CategorieAdmin) => void;
  onDelete: (c: CategorieAdmin) => void;
  onAddChild: (parent: CategorieAdmin) => void;
}) {
  const hasChildren = node.children.length > 0;
  const count = (node as any)._count;

  return (
    <tr
      className={`group transition-colors ${
        selected
          ? "bg-red-50/70 hover:bg-red-50"
          : "hover:bg-gray-50/80"
      } ${!node.actif ? "opacity-50" : ""}`}
    >
      {/* Checkbox */}
      <td className="pl-3 pr-1 py-2.5 w-8">
        <button
          onClick={() => onSelect(node.id_categorie)}
          className={`w-5 h-5 flex items-center justify-center rounded transition-colors ${
            selected
              ? "text-red-600"
              : "text-gray-300 hover:text-gray-500"
          }`}
        >
          {selected ? <CheckSquare size={16} /> : <Square size={16} />}
        </button>
      </td>

      {/* Nom avec indentation */}
      <td className="px-4 py-2.5">
        <div
          className="flex items-center"
          style={{ paddingLeft: `${node.depth * 22}px` }}
        >
          <button
            onClick={onToggle}
            className={`shrink-0 w-5 h-5 flex items-center justify-center rounded transition-colors mr-1 ${
              hasChildren
                ? "text-gray-500 hover:text-gray-800 hover:bg-gray-200"
                : "text-transparent cursor-default"
            }`}
          >
            {hasChildren ? (
              expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />
            ) : null}
          </button>

          <span className={`shrink-0 mr-2 ${hasChildren ? "text-amber-500" : "text-gray-400"}`}>
            {hasChildren ? (
              expanded ? <FolderOpen size={14} /> : <Folder size={14} />
            ) : (
              <span className="text-[10px] text-gray-300">└</span>
            )}
          </span>

          <div className="min-w-0">
            <p className={`font-medium text-gray-800 truncate ${node.depth === 0 ? "text-sm" : "text-xs"}`}>
              {node.nom}
            </p>
            <p className="text-[10px] text-gray-400 font-mono">{node.slug}</p>
          </div>
        </div>
      </td>

      {/* Badges */}
      <td className="px-4 py-2.5">
        <div className="flex flex-wrap gap-1">
          {node.marque && <Badge label={(node.marque as any).nom} type="marque" />}
          {node.activite && <Badge label={(node.activite as any).nom} type="activite" />}
        </div>
      </td>

      {/* Compteurs */}
      <td className="px-4 py-2.5 text-center">
        {count?.sous_cats > 0 && (
          <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-100">
            {count.sous_cats} sous-cat.
          </span>
        )}
      </td>
      <td className="px-4 py-2.5 text-center">
        {count?.produits > 0 && (
          <span className="text-xs bg-ev-50 text-ev-600 px-2 py-0.5 rounded-full border border-ev-100">
            {count.produits} produit{count.produits > 1 ? "s" : ""}
          </span>
        )}
      </td>

      {/* Ordre */}
      <td className="px-4 py-2.5 text-center text-xs text-gray-400">{node.ordre}</td>

      {/* Statut */}
      <td className="px-4 py-2.5">
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            node.actif ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
          }`}
        >
          {node.actif ? "Actif" : "Inactif"}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onAddChild(node)}
            title="Ajouter une sous-catégorie"
            className="p-1.5 text-gray-400 hover:text-ev-600 hover:bg-ev-50 rounded-lg"
          >
            <Plus size={12} />
          </button>
          <button
            onClick={() => onEdit(node)}
            className="p-1.5 text-gray-400 hover:text-ev-600 hover:bg-ev-50 rounded-lg"
          >
            <Edit2 size={12} />
          </button>
          <button
            onClick={() => onDelete(node)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Confirm Dialog ────────────────────────────────────────────────
function ConfirmDialog({
  title,
  message,
  confirmLabel = "Supprimer",
  onConfirm,
  onCancel,
}: {
  title?: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={22} className="text-red-600" />
        </div>
        {title && <h3 className="text-gray-900 font-semibold text-center mb-2">{title}</h3>}
        <p className="text-gray-600 text-sm text-center mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-10 border border-gray-200 text-sm text-gray-600 rounded-xl hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-10 bg-red-600 text-white text-sm rounded-xl hover:bg-red-700 font-medium"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Alert inline ─────────────────────────────────────────────────
function Alert({ type, children }: { type: "error" | "info"; children: React.ReactNode }) {
  const s =
    type === "error"
      ? "bg-red-50 border-red-200 text-red-700"
      : "bg-blue-50 border-blue-200 text-blue-700";
  const Icon = type === "error" ? AlertCircle : Info;
  return (
    <div className={`flex items-start gap-2.5 border rounded-xl px-4 py-3 text-sm ${s}`}>
      <Icon size={15} className="shrink-0 mt-0.5" />
      <span className="leading-relaxed">{children}</span>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────
export default function AdminCategoriesPage() {
  const [items, setItems] = useState<CategorieAdmin[]>([]);
  const [marques, setMarques] = useState<MarqueAdmin[]>([]);
  const [activites, setActivites] = useState<ActiviteAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<CategorieAdmin | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  // Sélection multiple
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<CategorieAdmin | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setSelected(new Set());
    try {
      const [cats, mrqs, acts] = await Promise.all([
        adminCategories.list(),
        adminMarques.list(),
        adminActivites.list(),
      ]);
      const catArr = Array.isArray(cats) ? cats : ((cats as any).data ?? []);
      setItems(catArr);
      setMarques(Array.isArray(mrqs) ? mrqs : ((mrqs as any).data ?? []));
      setActivites(Array.isArray(acts) ? acts : ((acts as any).data ?? []));
      setExpanded(
        new Set(
          catArr
            .filter((c: CategorieAdmin) => !c.parent_id)
            .map((c: CategorieAdmin) => c.id_categorie),
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const tree = useMemo(() => buildTree(items), [items]);

  const visibleRows = useMemo(() => {
    const result: TreeNode[] = [];
    const walk = (nodes: TreeNode[]) => {
      nodes.forEach((n) => {
        if (search) {
          const matches =
            n.nom.toLowerCase().includes(search.toLowerCase()) ||
            n.slug.includes(search.toLowerCase());
          if (
            !matches &&
            !flattenTree([n]).some((x) =>
              x.nom.toLowerCase().includes(search.toLowerCase()),
            )
          )
            return;
        }
        result.push(n);
        if (expanded.has(n.id_categorie)) walk(n.children);
      });
    };
    walk(tree);
    return result;
  }, [tree, expanded, search]);

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Sélection ────────────────────────────────────────────────────
  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(visibleRows.map((n) => n.id_categorie)));
  };

  const clearSelection = () => setSelected(new Set());

  const allVisibleSelected =
    visibleRows.length > 0 &&
    visibleRows.every((n) => selected.has(n.id_categorie));

  const toggleSelectAll = () => {
    allVisibleSelected ? clearSelection() : selectAll();
  };

  // ── Suppression unique ────────────────────────────────────────────
  const handleDelete = (c: CategorieAdmin) => {
    setConfirmDelete(c);
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;
    const c = confirmDelete;
    setConfirmDelete(null);
    try {
      await adminCategories.remove(c.id_categorie);
      toast.success("Catégorie supprimée", c.nom);
      load();
    } catch (e) {
      toast.error("Erreur", (e as Error).message);
    }
  };

  // ── Suppression multiple ──────────────────────────────────────────
  const handleBulkDelete = () => {
    if (selected.size === 0) return;
    setConfirmBulkDelete(true);
  };

  const confirmBulkDeleteAction = async () => {
    setConfirmBulkDelete(false);
    setBulkDeleting(true);
    try {
      const ids = Array.from(selected);
      // Appel bulk via fetch direct (à ajouter dans admin-api si besoin)
      const res = await (adminCategories as any).removeBulk
        ? (adminCategories as any).removeBulk(ids)
        : Promise.all(ids.map((id) => adminCategories.remove(id)));

      if ((res as any)?.deleted !== undefined) {
        const r = res as { deleted: number; failed: number; message: string };
        if (r.failed > 0) {
          toast.warning(
            "Suppression partielle",
            `${r.deleted} supprimée(s), ${r.failed} échec(s)`,
          );
        } else {
          toast.success("Suppression réussie", r.message);
        }
      } else {
        toast.success("Suppression réussie", `${ids.length} catégorie(s) supprimée(s)`);
      }
      load();
    } catch (e) {
      toast.error("Erreur", (e as Error).message);
    } finally {
      setBulkDeleting(false);
    }
  };

  // ── Formulaire ────────────────────────────────────────────────────
  const expandAll  = () => setExpanded(new Set(items.map((c) => c.id_categorie)));
  const collapseAll = () =>
    setExpanded(new Set(items.filter((c) => !c.parent_id).map((c) => c.id_categorie)));

  const openCreate = (parentCat?: CategorieAdmin) => {
    setForm({
      ...EMPTY,
      parent_id:   parentCat ? String(parentCat.id_categorie) : "",
      id_marque:   parentCat ? String(parentCat.id_marque   ?? "") : "",
      id_activite: parentCat ? String(parentCat.id_activite ?? "") : "",
    });
    setEditing(null);
    setErr("");
    setModal("create");
  };

  const openEdit = (c: CategorieAdmin) => {
    setForm({
      nom:         c.nom,
      slug:        c.slug,
      description: c.description ?? "",
      image:       c.image       ?? "",
      id_activite: c.id_activite ? String(c.id_activite) : "",
      id_marque:   c.id_marque   ? String(c.id_marque)   : "",
      parent_id:   c.parent_id   ? String(c.parent_id)   : "",
      parent_ids_extra: c.parent_ids_extra ?? [],
      ordre:       c.ordre,
      actif:       c.actif,
    });
    setEditing(c);
    setErr("");
    setModal("edit");
  };

  const handleSave = async () => {
    if (!form.nom.trim() || !form.slug.trim()) {
      setErr("Nom et slug sont requis.");
      return;
    }
    setSaving(true);
    setErr("");
    try {
      const p = {
        nom:         form.nom,
        slug:        form.slug,
        description: form.description || null,
        image:       form.image       || null,
        id_activite: form.id_activite ? Number(form.id_activite) : null,
        id_marque:   form.id_marque   ? Number(form.id_marque)   : null,
        parent_id:   form.parent_id   ? Number(form.parent_id)   : null,
        parent_ids_extra: form.parent_ids_extra.filter((id) => String(id) !== form.parent_id),
        ordre:       form.ordre,
        ...(modal === "edit" ? { actif: form.actif } : {}),
      };
      if (modal === "create") {
        await adminCategories.create(p as any);
        toast.success("Catégorie créée", form.nom);
      } else if (editing) {
        await adminCategories.update(editing.id_categorie, p as any);
        toast.success("Catégorie mise à jour", form.nom);
      }
      setModal(null);
      load();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const parentOptions = useMemo(() => {
    if (!editing) return items;
    const descendants = new Set<number>();
    const collect = (id: number) => {
      items
        .filter((c) => c.parent_id === id)
        .forEach((c) => {
          descendants.add(c.id_categorie);
          collect(c.id_categorie);
        });
    };
    collect(editing.id_categorie);
    return items.filter(
      (c) => c.id_categorie !== editing.id_categorie && !descendants.has(c.id_categorie),
    );
  }, [items, editing]);

  const parentOptionsOrdered = useMemo(() => {
    const result: { cat: CategorieAdmin; depth: number }[] = [];
    const walk = (nodes: TreeNode[]) => {
      nodes.forEach((n) => {
        const orig = parentOptions.find((c) => c.id_categorie === n.id_categorie);
        if (orig) result.push({ cat: orig, depth: n.depth });
        walk(n.children);
      });
    };
    walk(buildTree(parentOptions));
    return result;
  }, [parentOptions]);

  const rootCount = items.filter((c) => !c.parent_id).length;
  const subCount  = items.filter((c) =>  c.parent_id).length;

  // Calcul de l'impact de la sélection (inclut les descendants déjà sélectionnés)
  const selectionImpact = useMemo(() => {
    const nodeMap = new Map(flattenTree(tree).map((n) => [n.id_categorie, n]));
    let cats = 0;
    selected.forEach((id) => {
      const node = nodeMap.get(id);
      if (node) cats += collectSubtreeIds(node).length;
    });
    return cats;
  }, [selected, tree]);

  return (
    <div className="space-y-5">
      {/* Confirm delete unique */}
      {confirmDelete && (
        <ConfirmDialog
          title="Supprimer cette catégorie ?"
          message={`« ${confirmDelete.nom} » et toutes ses sous-catégories / produits associés seront définitivement supprimés.`}
          onConfirm={confirmDeleteAction}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* Confirm bulk delete */}
      {confirmBulkDelete && (
        <ConfirmDialog
          title={`Supprimer ${selected.size} catégorie${selected.size > 1 ? "s" : ""} ?`}
          message={`Cette action supprimera définitivement les ${selected.size} catégorie${selected.size > 1 ? "s" : ""} sélectionnée${selected.size > 1 ? "s" : ""} ainsi que toutes leurs sous-catégories et produits associés (${selectionImpact} éléments au total). Cette action est irréversible.`}
          confirmLabel={`Supprimer ${selected.size} catégorie${selected.size > 1 ? "s" : ""}`}
          onConfirm={confirmBulkDeleteAction}
          onCancel={() => setConfirmBulkDelete(false)}
        />
      )}

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catégories</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {rootCount} catégorie{rootCount !== 1 ? "s" : ""} racine ·{" "}
            {subCount} sous-catégorie{subCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="p-2 text-gray-500 hover:text-gray-800 rounded-xl hover:bg-gray-100"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => openCreate()}
            className="flex items-center gap-2 bg-ev-700 hover:bg-ev-800 text-white text-sm font-medium px-4 py-2 rounded-xl"
          >
            <Plus size={16} /> Nouvelle catégorie
          </button>
        </div>
      </div>

      {/* Légende + contrôles */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <input
            placeholder="Rechercher une catégorie…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-3 pr-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500"
          />
        </div>
        <div className="flex gap-2 text-xs">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
          >
            Tout déplier
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
          >
            Réduire
          </button>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Tag size={10} className="text-blue-500" />
            Marque
          </span>
          <span className="flex items-center gap-1">
            <Activity size={10} className="text-green-500" />
            Activité
          </span>
        </div>
      </div>

      {/* Barre d'actions flottante (visible si sélection active) */}
      {selected.size > 0 && (
        <div className="sticky top-4 z-30 mx-auto max-w-xl">
          <div className="bg-gray-900 text-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
            <span className="text-sm font-medium flex-1">
              <span className="bg-white text-gray-900 font-bold px-2 py-0.5 rounded-lg mr-2">
                {selected.size}
              </span>
              catégorie{selected.size > 1 ? "s" : ""} sélectionnée{selected.size > 1 ? "s" : ""}
            </span>
            <button
              onClick={clearSelection}
              className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10"
            >
              Désélectionner
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="flex items-center gap-2 text-sm bg-red-600 hover:bg-red-500 text-white px-4 py-1.5 rounded-xl font-medium disabled:opacity-60"
            >
              {bulkDeleting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
              Supprimer la sélection
            </button>
          </div>
        </div>
      )}

      {/* Arbre */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-4 border-ev-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : visibleRows.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            Aucune catégorie trouvée
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {/* Checkbox tout sélectionner */}
                  <th className="pl-3 pr-1 py-3 w-8">
                    <button
                      onClick={toggleSelectAll}
                      className={`w-5 h-5 flex items-center justify-center rounded transition-colors ${
                        allVisibleSelected
                          ? "text-red-600"
                          : "text-gray-300 hover:text-gray-500"
                      }`}
                      title={allVisibleSelected ? "Tout désélectionner" : "Tout sélectionner"}
                    >
                      {allVisibleSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>
                  </th>
                  {[
                    "Catégorie / Sous-catégorie",
                    "Rattachement",
                    "Sous-cats",
                    "Produits",
                    "Ordre",
                    "Statut",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibleRows.map((node) => (
                  <TreeRow
                    key={node.id_categorie}
                    node={node}
                    expanded={expanded.has(node.id_categorie)}
                    selected={selected.has(node.id_categorie)}
                    onToggle={() => toggleExpand(node.id_categorie)}
                    onSelect={toggleSelect}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onAddChild={openCreate}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal create/edit */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
            <div className="p-5 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="font-bold text-gray-900">
                {modal === "create" ? "Nouvelle catégorie" : `Modifier — ${editing?.nom}`}
              </h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {err && <Alert type="error">{err}</Alert>}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nom *</label>
                  <input
                    value={form.nom}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        nom:  e.target.value,
                        slug: modal === "create" ? toSlug(e.target.value) : form.slug,
                      })
                    }
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Slug *</label>
                  <input
                    value={form.slug}
                    onChange={(e) =>
                      setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })
                    }
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Catégorie parente{" "}
                  <span className="text-gray-400 font-normal">(laisser vide = catégorie racine)</span>
                </label>
                <select
                  value={form.parent_id}
                  onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white"
                >
                  <option value="">— Catégorie racine —</option>
                  {parentOptionsOrdered.map(({ cat, depth }) => (
                    <option key={cat.id_categorie} value={cat.id_categorie}>
                      {"　".repeat(depth)}
                      {depth > 0 ? "└ " : ""}
                      {cat.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Catégories parentes supplémentaires{" "}
                  <span className="text-gray-400 font-normal">
                    (optionnel — la catégorie apparaîtra aussi sous celles-ci, en plus de son parent principal)
                  </span>
                </label>
                <div className="max-h-40 overflow-y-auto rounded-xl border border-gray-200 p-2 space-y-0.5">
                  {parentOptionsOrdered
                    .filter(({ cat }) => String(cat.id_categorie) !== form.parent_id)
                    .map(({ cat, depth }) => {
                      const checked = form.parent_ids_extra.includes(cat.id_categorie);
                      return (
                        <label
                          key={cat.id_categorie}
                          className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-50 cursor-pointer text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                parent_ids_extra: e.target.checked
                                  ? [...form.parent_ids_extra, cat.id_categorie]
                                  : form.parent_ids_extra.filter((id) => id !== cat.id_categorie),
                              })
                            }
                            className="accent-ev-600"
                          />
                          <span>
                            {"　".repeat(depth)}
                            {depth > 0 ? "└ " : ""}
                            {cat.nom}
                          </span>
                        </label>
                      );
                    })}
                  {parentOptionsOrdered.length === 0 && (
                    <p className="text-xs text-gray-400 px-2 py-1">Aucune autre catégorie disponible.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Marque</label>
                  <select
                    value={form.id_marque}
                    onChange={(e) => setForm({ ...form, id_marque: e.target.value })}
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white"
                  >
                    <option value="">— Aucune —</option>
                    {marques.map((m) => (
                      <option key={m.id_marque} value={m.id_marque}>{m.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Activité</label>
                  <select
                    value={form.id_activite}
                    onChange={(e) => setForm({ ...form, id_activite: e.target.value })}
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white"
                  >
                    <option value="">— Aucune —</option>
                    {activites.map((a) => (
                      <option key={a.id_activite} value={a.id_activite}>{a.nom}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ordre d&apos;affichage</label>
                  <input
                    type="number"
                    value={form.ordre}
                    onChange={(e) => setForm({ ...form, ordre: Number(e.target.value) })}
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Image</label>
                  {form.image && (
                    <div className="mb-3 flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                        <Image src={form.image} alt={form.nom || "Image catégorie"} fill sizes="56px" className="object-contain p-1" />
                      </div>
                      <p className="min-w-0 flex-1 truncate font-mono text-xs text-gray-500">{form.image}</p>
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, image: "" }))}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                        title="Retirer l'image"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  )}
                  <ImageUploader onUpload={(v) => setForm((prev) => ({ ...prev, image: v }))} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500 resize-none"
                />
              </div>

              {modal === "edit" && (
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.actif}
                    onChange={(e) => setForm({ ...form, actif: e.target.checked })}
                    className="accent-ev-600 w-4 h-4"
                  />
                  Catégorie active
                </label>
              )}

              {form.parent_id && (
                <Alert type="info">
                  Cette catégorie sera rattachée comme sous-catégorie de «{" "}
                  {items.find((c) => String(c.id_categorie) === form.parent_id)?.nom ?? "…"} ».
                </Alert>
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
