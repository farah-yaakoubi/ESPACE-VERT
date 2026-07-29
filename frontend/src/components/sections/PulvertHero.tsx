import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Droplets, Gauge, ShieldCheck, Trees, Wind } from "lucide-react";

interface PulvertHeroCategory {
  id_categorie: number;
  nom: string;
  description?: string | null;
}

interface PulvertHeroProps {
  categories?: PulvertHeroCategory[];
  ctaHref?: string;
  image?: string;
}

const DEFAULT_HERO_IMAGE = "/images/activites/pulverisation.webp";

const fallbackCategories = [
  {
    title: "Pulvérisateurs grandes cultures",
    description: "Pulvérisation efficace pour cultures de plein champ.",
    Icon: Wind,
  },
  {
    title: "Pulvérisateurs vergers",
    description: "Solutions précises pour vergers et vignobles.",
    Icon: Trees,
  },
];

const benefitPills = [
  { label: "Couverture uniforme", Icon: Droplets },
  { label: "Moins de dérive", Icon: ShieldCheck },
  { label: "Rendement terrain", Icon: Gauge },
];

export function PulvertHero({
  categories = [],
  ctaHref = "#produits-marque",
  image = DEFAULT_HERO_IMAGE,
}: PulvertHeroProps) {
  const rootCategories = categories.filter((category) => !(category as any).parent_id).slice(0, 2);
  const sourceCategories = rootCategories.length > 0 ? rootCategories : fallbackCategories;
  const categoryCards = sourceCategories.map((source, index) => {
    const fallback = fallbackCategories[index] ?? fallbackCategories[0];
    const category = "id_categorie" in source ? source : undefined;
    return {
      id: category?.id_categorie ?? index,
      title: category?.nom || fallback.title,
      description: category?.description || fallback.description,
      href: category ? `?cat=${category.id_categorie}#catalogue-marque` : ctaHref,
      Icon: fallback.Icon,
    };
  });

  return (
    <section className="relative min-h-[610px] overflow-hidden bg-[#eef4e7] pt-[calc(var(--nav-h)+8px)] md:min-h-[690px]">
      <Image
        src={image}
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(11,61,42,0.82),rgba(21,147,58,0.36)_46%,rgba(244,185,35,0.12)_72%,rgba(238,244,231,0.18))]" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#eef4e7] via-[#eef4e7]/70 to-transparent" />
      <div className="absolute right-[7%] top-[18%] hidden h-40 w-40 rounded-full border border-[#f4b923]/50 md:block animate-[pulse_4s_ease-in-out_infinite]" />
      <div className="absolute right-[12%] top-[28%] hidden h-20 w-20 rounded-full border border-white/35 md:block animate-[ping_5s_cubic-bezier(0,0,0.2,1)_infinite]" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-4 text-center">
        <div className="mb-5 flex flex-wrap items-center justify-center gap-3">
          {benefitPills.map(({ label, Icon }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-[11px] font-black uppercase text-white shadow-sm backdrop-blur"
            >
              <Icon size={15} className="text-[#f4b923]" />
              {label}
            </span>
          ))}
        </div>
        <h1
          className="text-balance text-[2.25rem] font-black uppercase leading-none text-white drop-shadow-[0_3px_8px_rgba(20,42,78,0.45)] sm:text-5xl lg:text-6xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Solutions de pulvérisation avancées
        </h1>
        <p className="mt-3 text-lg font-bold text-white drop-shadow md:text-2xl">
          Précision, performance, productivité
        </p>
        <Link
          href={ctaHref}
          className="mt-6 inline-flex items-center gap-2 rounded bg-[#f4b923] px-7 py-3 text-sm font-extrabold text-[#0b3d2a] shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-white"
        >
          Explorer nos produits
          <ChevronRight size={15} />
        </Link>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 px-4">
        <div className="mx-auto grid max-w-[820px] overflow-hidden rounded-sm bg-white shadow-xl ring-1 ring-black/10 md:grid-cols-2">
          {categoryCards.map(({ id, title, description, href, Icon }) => (
            <Link
              key={id}
              href={href}
              className="group flex min-h-[138px] items-center gap-4 border-b border-slate-200 px-7 py-5 transition duration-300 hover:bg-[#f3faf1] md:border-b-0 md:border-r md:last:border-r-0"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm bg-[#eaf6e8] text-[#15933a] transition duration-300 group-hover:rotate-3 group-hover:bg-[#f4b923] group-hover:text-[#0b3d2a]">
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
  );
}
