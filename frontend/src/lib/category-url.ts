type CategoryPathNode = {
  id_categorie: number;
  slug: string;
  parent_id?: number | null;
  children?: CategoryPathNode[];
  sous_cats?: CategoryPathNode[];
};

function encodeSlugPath(slugs: string[]) {
  return slugs.map((slug) => encodeURIComponent(slug)).join("/");
}

export function getActivityCategoryHref(activiteSlug: string, slugs: string[]) {
  const path = encodeSlugPath(slugs.filter(Boolean));
  return path ? `/activites/${activiteSlug}/categorie/${path}` : `/activites/${activiteSlug}`;
}

export function getActivityCategoryHrefById(
  activiteSlug: string,
  categories: CategoryPathNode[],
  id: number,
) {
  const byId = new Map(categories.map((cat) => [cat.id_categorie, cat]));
  const slugs: string[] = [];
  const seen = new Set<number>();
  let current = byId.get(id);

  while (current && !seen.has(current.id_categorie) && slugs.length < 16) {
    seen.add(current.id_categorie);
    slugs.unshift(current.slug);
    current = current.parent_id ? byId.get(current.parent_id) : undefined;
  }

  return getActivityCategoryHref(activiteSlug, slugs);
}

export function findCategoryPathInTree(
  nodes: CategoryPathNode[],
  id: number,
  path: CategoryPathNode[] = [],
): CategoryPathNode[] | null {
  for (const node of nodes) {
    const next = [...path, node];
    if (node.id_categorie === id) return next;

    const children = node.children ?? node.sous_cats ?? [];
    const found = findCategoryPathInTree(children, id, next);
    if (found) return found;
  }

  return null;
}

export function findCategoryBySlugPath(
  nodes: CategoryPathNode[],
  slugs: string[],
): CategoryPathNode | null {
  if (slugs.length === 0) return null;

  let level = nodes;
  let current: CategoryPathNode | undefined;

  for (const slug of slugs) {
    current = level.find((node) => node.slug === slug);
    if (!current) return null;
    level = current.children ?? current.sous_cats ?? [];
  }

  return current ?? null;
}

export function getActivityCategoryHrefFromTree(
  activiteSlug: string,
  nodes: CategoryPathNode[],
  id: number,
) {
  const path = findCategoryPathInTree(nodes, id);
  return path
    ? getActivityCategoryHref(activiteSlug, path.map((cat) => cat.slug))
    : `/activites/${activiteSlug}`;
}
