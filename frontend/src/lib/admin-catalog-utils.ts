import type { CategorieAdmin } from "@/lib/admin-api";

export interface CatNodeFlat extends CategorieAdmin {
  depth: number;
  optionKey?: string;
  isExtraLink?: boolean;
  inherited_id_marque?: number | null;
  inherited_id_activite?: number | null;
  effective_id_marque?: number | null;
  effective_id_activite?: number | null;
}

export interface CatTreeNode extends CatNodeFlat {
  children: CatTreeNode[];
}

type ScopePredicate = (c: CategorieAdmin, ctx: CategoryContext) => boolean;

export interface CategoryContext {
  inherited_id_marque: number | null;
  inherited_id_activite: number | null;
  effective_id_marque: number | null;
  effective_id_activite: number | null;
}

export function sortCategories<T extends Pick<CategorieAdmin, "ordre" | "nom">>(items: T[]): T[] {
  return [...items].sort((a, b) => a.ordre - b.ordre || a.nom.localeCompare(b.nom, "fr"));
}

function childParentIds(c: CategorieAdmin): number[] {
  return [c.parent_id, ...(c.parent_ids_extra ?? [])].filter((id): id is number => id != null);
}

export function buildCategoryTree(flat: CategorieAdmin[]): CatTreeNode[] {
  const map = new Map<number, CatTreeNode>();
  flat.forEach((c) =>
    map.set(c.id_categorie, {
      ...c,
      children: [],
      depth: 0,
      optionKey: String(c.id_categorie),
      inherited_id_marque: null,
      inherited_id_activite: null,
      effective_id_marque: c.id_marque ?? null,
      effective_id_activite: c.id_activite ?? null,
    }),
  );

  const roots: CatTreeNode[] = [];
  map.forEach((node) => {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const assign = (
    nodes: CatTreeNode[],
    depth: number,
    inheritedMarque: number | null,
    inheritedActivite: number | null,
  ) => {
    sortCategories(nodes).forEach((node) => {
      node.depth = depth;
      node.inherited_id_marque = inheritedMarque;
      node.inherited_id_activite = inheritedActivite;
      node.effective_id_marque = node.id_marque ?? inheritedMarque;
      node.effective_id_activite = node.id_activite ?? inheritedActivite;
      assign(node.children, depth + 1, node.effective_id_marque ?? null, node.effective_id_activite ?? null);
    });
  };

  assign(roots, 0, null, null);
  return sortCategories(roots);
}

export function flattenCategoryTree(nodes: CatTreeNode[]): CatTreeNode[] {
  const result: CatTreeNode[] = [];
  const walk = (arr: CatTreeNode[]) =>
    sortCategories(arr).forEach((n) => {
      result.push(n);
      walk(n.children);
    });
  walk(nodes);
  return result;
}

export function collectSubtreeIds(node: CatTreeNode): number[] {
  return [node.id_categorie, ...node.children.flatMap(collectSubtreeIds)];
}

export function flattenCategoriesForSelect(all: CategorieAdmin[], includeExtraLinks = true): CatNodeFlat[] {
  const tree = buildCategoryTree(all);
  const flat = flattenCategoryTree(tree).map((n) => ({ ...n, optionKey: String(n.id_categorie) }));

  if (!includeExtraLinks) return flat;

  const byId = new Map(flat.map((c) => [c.id_categorie, c]));
  const extraByParent = new Map<number, CatNodeFlat[]>();
  all.forEach((c) => {
    (c.parent_ids_extra ?? []).forEach((parentId) => {
      const node = byId.get(c.id_categorie);
      const parent = byId.get(parentId);
      if (!node || !parent || parentId === c.id_categorie) return;
      const arr = extraByParent.get(parentId) ?? [];
      arr.push({
        ...node,
        depth: parent.depth + 1,
        isExtraLink: true,
        optionKey: `${c.id_categorie}-extra-${parentId}`,
        inherited_id_marque: parent.effective_id_marque ?? null,
        inherited_id_activite: parent.effective_id_activite ?? null,
        effective_id_marque: c.id_marque ?? parent.effective_id_marque ?? null,
        effective_id_activite: c.id_activite ?? parent.effective_id_activite ?? null,
      });
      extraByParent.set(parentId, arr);
    });
  });

  const result: CatNodeFlat[] = [];
  flat.forEach((node) => {
    result.push(node);
    const extras = extraByParent.get(node.id_categorie);
    if (extras) result.push(...sortCategories(extras));
  });
  return result;
}

export function resolveCategoryContext(all: CategorieAdmin[], id: number | null | undefined): CategoryContext {
  if (!id) {
    return { inherited_id_marque: null, inherited_id_activite: null, effective_id_marque: null, effective_id_activite: null };
  }
  const byId = new Map(all.map((c) => [c.id_categorie, c]));
  const current = byId.get(id);
  if (!current) {
    return { inherited_id_marque: null, inherited_id_activite: null, effective_id_marque: null, effective_id_activite: null };
  }

  let inheritedMarque: number | null = null;
  let inheritedActivite: number | null = null;
  const visited = new Set<number>();
  let parentId = current.parent_id ?? null;
  while (parentId && byId.has(parentId) && !visited.has(parentId)) {
    visited.add(parentId);
    const parent = byId.get(parentId)!;
    inheritedMarque ??= parent.id_marque ?? null;
    inheritedActivite ??= parent.id_activite ?? null;
    parentId = parent.parent_id ?? null;
  }

  return {
    inherited_id_marque: inheritedMarque,
    inherited_id_activite: inheritedActivite,
    effective_id_marque: current.id_marque ?? inheritedMarque,
    effective_id_activite: current.id_activite ?? inheritedActivite,
  };
}

export function normalizeCategoryPayload<T extends { id_marque?: number | null; id_activite?: number | null; parent_id?: number | null }>(
  payload: T,
  all: CategorieAdmin[],
): T {
  if (!payload.parent_id) return payload;
  const inherited = resolveCategoryContext(all, payload.parent_id);
  return {
    ...payload,
    id_marque: payload.id_marque === inherited.effective_id_marque ? null : payload.id_marque ?? null,
    id_activite: payload.id_activite === inherited.effective_id_activite ? null : payload.id_activite ?? null,
  };
}

/**
 * Retourne toutes les catégories (racines + sous-catégories à tout niveau)
 * rattachées à une marque donnée, aplaties avec leur profondeur pour
 * l'affichage indenté dans un <select>.
 *
 * Une sous-catégorie est incluse dès qu'elle descend (via parent_id) d'une
 * catégorie racine de la marque — même si elle n'a pas elle-même id_marque
 * renseigné — pour rester cohérent avec la logique déjà utilisée côté
 * backend pour filtrer les produits d'une marque.
 */
export function categoriesUnderMarque(all: CategorieAdmin[], id_marque: number): CatNodeFlat[] {
  return categoriesUnderScope(all, (_c, ctx) => ctx.effective_id_marque === id_marque);
}

/** Équivalent pour une activité. */
export function categoriesUnderActivite(all: CategorieAdmin[], id_activite: number): CatNodeFlat[] {
  return categoriesUnderScope(all, (_c, ctx) => ctx.effective_id_activite === id_activite);
}

function categoriesUnderScope(
  all: CategorieAdmin[],
  isInScope: ScopePredicate,
): CatNodeFlat[] {
  return flattenCategoriesForSelect(all).filter((c) => isInScope(c, {
    inherited_id_marque: c.inherited_id_marque ?? null,
    inherited_id_activite: c.inherited_id_activite ?? null,
    effective_id_marque: c.effective_id_marque ?? null,
    effective_id_activite: c.effective_id_activite ?? null,
  }));
}

/** Ne garde que les catégories feuilles (sans sous-catégorie) — seules
 *  éligibles pour y attacher un produit. */
export function leavesOnly(nodes: CatNodeFlat[], all: CategorieAdmin[]): CatNodeFlat[] {
  const parentIds = new Set(all.flatMap(childParentIds));
  return nodes.filter((n) => !parentIds.has(n.id_categorie));
}
