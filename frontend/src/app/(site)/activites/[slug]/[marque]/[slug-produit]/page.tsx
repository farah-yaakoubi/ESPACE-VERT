import { notFound } from "next/navigation";
import ProductDetailPage, {
  generateMetadata as generateProductMetadata,
} from "../../../../produits/[slug]/page";
import { produitsService } from "@/services";

interface PageProps {
  params: Promise<{ slug: string; marque: string; "slug-produit": string }>;
}

async function assertProductBelongsToActiviteAndMarque(
  activiteSlug: string,
  marqueSlug: string,
  produitSlug: string
) {
  try {
    const product = await produitsService.bySlug(produitSlug);
    // activite est portée par categorie.activite (pas sur le produit directement)
    if (product.marque?.slug !== marqueSlug) notFound();
    if (product.categorie?.activite?.slug !== activiteSlug) notFound();
  } catch {
    notFound();
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { "slug-produit": produitSlug } = await params;
  return generateProductMetadata({ params: Promise.resolve({ slug: produitSlug }) });
}

export default async function ActiviteMarqueProduitPage({ params }: PageProps) {
  const { slug, marque, "slug-produit": produitSlug } = await params;

  await assertProductBelongsToActiviteAndMarque(slug, marque, produitSlug);

  return ProductDetailPage({
    params: Promise.resolve({ slug: produitSlug }),
  });
}