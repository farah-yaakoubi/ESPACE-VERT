import Image from "next/image";
import Link from "next/link";
import {
  Bug,
  ChevronRight,
  Gauge,
  Headphones,
  Mail,
  Phone,
  ShieldCheck,
  SprayCan,
  Tractor,
  Trees,
  Wrench,
} from "lucide-react";
import type { Categorie } from "@/types/api";
import { SectionTitleLine } from "@/components/ui/SectionTitleIcon";
import type { IcoName } from "@/components/icons/AgriIcons";
import { getActivityCategoryHrefById } from "@/lib/category-url";

interface PulverisationShowcaseProps {
  categories: Categorie[];
  activiteSlug: string;
}

const HERO_IMAGE = "/images/activites/pulverisation.webp";
const PRODUCT_IMAGE = "/images/hero/pulvert-mobile.webp";
const FIELD_IMAGE = "/images/activites/pulverisation.webp";

const fallbackCategories = [
  {
    title: "Pulvérisateurs grandes cultures",
    description: "Pulvérisation efficace pour cultures de plein champ.",
    Icon: Tractor,
  },
  {
    title: "Pulvérisateurs vergers",
    description: "Solutions précises pour vergers et vignobles.",
    Icon: Trees,
  },
  {
    title: "Pulvérisateurs spécialisés",
    description: "Équipements adaptés aux usages spécifiques.",
    Icon: SprayCan,
  },
];

const advantages = [
  {
    title: "Technologie avancée",
    description: "Dernières innovations pour la pulvérisation.",
    Icon: SprayCan,
  },
  {
    title: "Support expert",
    description: "Conseil professionnel et service dédié.",
    Icon: Headphones,
  },
  {
    title: "Fiable et durable",
    description: "Conçu pour résister aux conditions difficiles.",
    Icon: ShieldCheck,
  },
];

const products = [
  {
    title: "Pulvérisateur manuel",
    description: "Pulvérisation de terrain haute capacité",
  },
  {
    title: "Pulvérisateur manuel",
    description: "Brumisation efficace pour vergers",
  },
  {
    title: "Pulvérisateur à batterie",
    description: "Design compact et polyvalent",
  },
];

const guides = [
  {
    title: "Conseils de calibration",
    description: "Améliorez la précision de vos applications.",
    image: FIELD_IMAGE,
    Icon: Gauge,
  },
  {
    title: "Ravageurs et adventices",
    description: "Protégez les cultures avec une application régulière.",
    image: FIELD_IMAGE,
    Icon: Bug,
  },
  {
    title: "Entretien essentiel",
    description: "Gardez votre matériel fiable saison après saison.",
    image: PRODUCT_IMAGE,
    Icon: Wrench,
  },
];

function getCategoryCards(categories: Categorie[], activiteSlug: string) {
  const roots = categories.filter((category) => !category.parent_id).slice(0, 3);

  return fallbackCategories.map((fallback, index) => {
    const category = roots[index];
    return {
      id: category?.id_categorie ?? index,
      title: category?.nom || fallback.title,
      description: category?.description || fallback.description,
      href: category
        ? `${getActivityCategoryHrefById(activiteSlug, categories, category.id_categorie)}#pulverisation-products`
        : "#pulverisation-products",
      Icon: fallback.Icon,
    };
  });
}

export function PulverisationShowcase({ categories, activiteSlug }: PulverisationShowcaseProps) {
  const categoryCards = getCategoryCards(categories, activiteSlug);

  return (
    <main className="bg-[#f5f6f3] text-[#10214a]">
      <section className="relative min-h-[620px] overflow-hidden pt-[calc(var(--nav-h)+12px)]">
        <Image src={HERO_IMAGE} alt="" fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-sky-300/35 via-white/5 to-[#f5f6f3]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f5f6f3] via-transparent to-transparent" />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-4 text-center">
          <h1
            className="mt-2 text-balance text-[2.45rem] font-black uppercase leading-none text-white drop-shadow-[0_3px_8px_rgba(28,48,77,0.45)] sm:text-6xl lg:text-7xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Solutions de pulvérisation avancées
          </h1>
          <p className="mt-3 text-lg font-bold text-white drop-shadow md:text-2xl">
            Précision, performance, productivité
          </p>
          <Link
            href="#pulverisation-products"
            className="mt-6 inline-flex items-center gap-2 rounded bg-[#149a3b] px-7 py-3 text-sm font-extrabold text-white shadow-lg transition hover:bg-[#0f7d30]"
          >
            Explorer nos produits
            <ChevronRight size={15} />
          </Link>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 px-4">
          <div className="mx-auto grid max-w-[930px] overflow-hidden rounded-sm bg-white shadow-xl ring-1 ring-black/10 md:grid-cols-3">
            {categoryCards.map(({ id, title, description, href, Icon }) => (
              <Link
                key={id}
                href={href}
                className="group flex min-h-[108px] items-center gap-4 border-b border-slate-200 px-7 py-5 transition hover:bg-[#f3faf1] md:border-b-0 md:border-r md:last:border-r-0"
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center text-[#15933a]">
                  <Icon size={40} strokeWidth={1.8} />
                </span>
                <span className="text-left">
                  <span className="block text-[15px] font-black text-[#10214a] group-hover:text-[#15933a]">
                    {title}
                  </span>
                  <span className="mt-1 block text-[13px] leading-snug text-slate-600">
                    {description}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-9">
        <BackgroundField />
        <div className="relative mx-auto max-w-[930px] px-4">
          <SectionTitle title="Pourquoi nous choisir ?" />
          <div className="mt-7 grid bg-white/45 md:grid-cols-3">
            {advantages.map(({ title, description, Icon }) => (
              <div key={title} className="flex min-h-[86px] items-center gap-4 border-b border-slate-200 px-6 py-4 md:border-b-0 md:border-r md:last:border-r-0">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-[#149a3b] bg-white text-[#149a3b] shadow-sm">
                  <Icon size={27} strokeWidth={1.9} />
                </span>
                <div>
                  <h2 className="text-[15px] font-black text-[#10214a]">{title}</h2>
                  <p className="mt-1 text-[12px] leading-snug text-slate-600">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pulverisation-products" className="relative overflow-hidden py-7">
        <BackgroundField />
        <div className="relative mx-auto max-w-[930px] px-4">
          <SectionTitle title="Produits en vedette" />
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {products.map((product) => (
              <article key={`${product.title}-${product.description}`} className="overflow-hidden rounded-sm bg-white shadow-lg ring-1 ring-black/10">
                <div className="relative h-[200px] overflow-hidden">
                  <Image src={FIELD_IMAGE} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/55 to-transparent" />
                  <div className="absolute bottom-0 right-3 h-[86%] w-[45%]">
                    <Image src={PRODUCT_IMAGE} alt="" fill className="object-contain object-bottom" sizes="180px" />
                  </div>
                  <div className="absolute left-4 top-4 max-w-[68%]">
                    <h3 className="text-lg font-black leading-tight text-[#10214a]">{product.title}</h3>
                    <p className="mt-1 text-[12px] font-medium text-slate-600">{product.description}</p>
                  </div>
                  <Link
                    href="/marques/pulvert"
                    className="absolute bottom-4 left-4 inline-flex items-center justify-center rounded-sm bg-[#149a3b] px-5 py-2 text-[12px] font-black text-white shadow transition hover:bg-[#0f7d30]"
                  >
                    Voir détails
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-8">
        <BackgroundField />
        <div className="relative mx-auto max-w-[930px] px-4">
          <SectionTitle title="Guides & conseils" subtitle="Bonnes pratiques de pulvérisation" />
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {guides.map(({ title, description, image, Icon }) => (
              <article key={title} className="overflow-hidden rounded-sm bg-white shadow-lg ring-1 ring-black/10">
                <div className="relative h-[126px] overflow-hidden">
                  <Image src={image} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
                  <div className="absolute inset-0 bg-black/10" />
                  <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-sm bg-white text-[#149a3b] shadow">
                    <Icon size={25} />
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-[15px] font-black text-[#10214a]">{title}</h3>
                  <p className="mt-2 border-t border-dashed border-slate-300 pt-3 text-[12px] leading-snug text-slate-600">
                    {description}
                  </p>
                  <Link
                    href="/contact"
                    className="mt-5 ml-auto flex w-fit items-center justify-center rounded-sm bg-[#149a3b] px-6 py-2 text-[12px] font-black text-white shadow transition hover:bg-[#0f7d30]"
                  >
                    En savoir plus
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden pb-12 pt-5">
        <BackgroundField />
        <div className="relative mx-auto max-w-[930px] px-4">
          <div className="border-t border-slate-200 pt-6">
            <h2 className="text-2xl font-black uppercase text-[#10214a]">
              <SectionTitleLine icon="Barn" color="#149a3b" align="left">Contactez-nous</SectionTitleLine>
            </h2>
            <div className="mt-4 grid gap-4 text-sm font-semibold text-[#10214a] md:grid-cols-3">
              <p>Besoin d'assistance ? Nous sommes là pour vous aider.</p>
              <a href="tel:1234567890" className="inline-flex items-center gap-2 text-slate-700 hover:text-[#149a3b]">
                <Phone size={18} className="text-[#149a3b]" />
                Appelez-nous : 123-456-7890
              </a>
              <a href="mailto:info@pulverisationpro.com" className="inline-flex items-center gap-2 text-slate-700 hover:text-[#149a3b]">
                <Mail size={18} className="text-[#1d5d9b]" />
                Email : info@pulverisationpro.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionTitle({ title, subtitle, icon = "Spray" }: { title: string; subtitle?: string; icon?: IcoName }) {
  return (
    <div className="text-center">
      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-slate-300" />
        <h2
          className="flex items-center gap-3 text-xl font-black uppercase tracking-wide text-[#10214a] md:text-2xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <SectionTitleLine icon={icon} color="#149a3b">
            {title}
          </SectionTitleLine>
        </h2>
        <span className="h-px flex-1 bg-slate-300" />
      </div>
      {subtitle && <p className="mt-2 text-lg font-black text-[#273861]">{subtitle}</p>}
    </div>
  );
}

function BackgroundField() {
  return (
    <div className="absolute inset-x-0 bottom-0 h-[58%] opacity-20">
      <Image src={FIELD_IMAGE} alt="" fill className="object-cover" sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#f5f6f3] via-white/35 to-[#f5f6f3]" />
    </div>
  );
}
