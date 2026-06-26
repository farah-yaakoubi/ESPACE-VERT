type ProductRouteContext = {
  slug: string;
  marque?: { slug?: string | null } | null;
  activite?: { slug?: string | null } | null;
};

/**
 * Renvoie l'URL canonique d'un produit.
 * Priorité : activite + marque > marque seule > activite seule > fallback /produits/[slug]
 *
 * URL canonique : /activites/[activite]/[marque]/[produit]
 */
export function getProductHref(product: ProductRouteContext): string {
  if (product.activite?.slug && product.marque?.slug) {
    return `/activites/${product.activite.slug}/${product.marque.slug}/${product.slug}`;
  }

  if (product.marque?.slug) {
    return `/marques/${product.marque.slug}/produits/${product.slug}`;
  }

  if (product.activite?.slug) {
    return `/activites/${product.activite.slug}/produits/${product.slug}`;
  }

  return `/produits/${product.slug}`;
}