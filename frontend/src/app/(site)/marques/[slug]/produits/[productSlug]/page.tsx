import { notFound } from "next/navigation";
import ProductDetailPage, {
  generateMetadata as generateProductMetadata,
} from "../../../../produits/[slug]/page";
import { produitsService } from "@/services";

interface PageProps {
  params: Promise<{ slug: string; productSlug: string }>;
}

async function assertProductBelongsToMarque(marqueSlug: string, productSlug: string) {
  try {
    const product = await produitsService.bySlug(productSlug);
    if (product.marque?.slug !== marqueSlug) notFound();
  } catch {
    notFound();
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { productSlug } = await params;
  return generateProductMetadata({ params: Promise.resolve({ slug: productSlug }) });
}

export default async function MarqueProductDetailPage({ params }: PageProps) {
  const { slug, productSlug } = await params;
  await assertProductBelongsToMarque(slug, productSlug);

  return ProductDetailPage({
    params: Promise.resolve({ slug: productSlug }),
  });
}
