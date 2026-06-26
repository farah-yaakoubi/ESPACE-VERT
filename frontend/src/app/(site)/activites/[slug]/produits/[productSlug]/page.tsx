import { notFound } from "next/navigation";
import ProductDetailPage, {
  generateMetadata as generateProductMetadata,
} from "../../../../produits/[slug]/page";
import { produitsService } from "@/services";

interface PageProps {
  params: Promise<{ slug: string; productSlug: string }>;
}

async function assertProductBelongsToActivite(activiteSlug: string, productSlug: string) {
  try {
    const product = await produitsService.bySlug(productSlug);
    const productActivitySlug = product.activite?.slug ?? product.categorie?.activite?.slug;
    if (productActivitySlug !== activiteSlug) notFound();
  } catch {
    notFound();
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { productSlug } = await params;
  return generateProductMetadata({ params: Promise.resolve({ slug: productSlug }) });
}

export default async function ActiviteProductDetailPage({ params }: PageProps) {
  const { slug, productSlug } = await params;
  await assertProductBelongsToActivite(slug, productSlug);

  return ProductDetailPage({
    params: Promise.resolve({ slug: productSlug }),
  });
}
