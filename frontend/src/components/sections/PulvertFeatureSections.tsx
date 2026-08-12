import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Droplets, Gauge, ShieldCheck, SprayCan, Tractor, Trees, Wind } from "lucide-react";
import type { TutorialVideo } from "@/types/api";
import { SectionTitleLine } from "@/components/ui/SectionTitleIcon";
import type { IcoName } from "@/components/icons/AgriIcons";

interface PulvertCategory {
  id_categorie: number;
  nom: string;
  description?: string | null;
  image?: string | null;
  parent_id?: number | null;
}

interface PulvertFeatureSectionsProps {
  categories?: PulvertCategory[];
  videos?: TutorialVideo[];
  showCategories?: boolean;
  showVideos?: boolean;
  categoriesAnchorId?: string;
}

const FIELD_IMAGE = "/images/activites/pulverisation.webp";
const BRAND_LOGOS = [
  { src: "/logos/PULVERT LOGO1.png", alt: "Pulvert" },
  { src: "/logos/pulveragro.webp", alt: "PulverAgro" },
];

const ICONS = [SprayCan, Wind, Tractor, Trees];
const BENEFITS = [
  { label: "Précision", Icon: Droplets },
  { label: "Efficacité", Icon: Gauge },
  { label: "Fiabilité", Icon: ShieldCheck },
];

export function PulvertFeatureSections({
  categories = [],
  videos = [],
  showCategories = true,
  showVideos = true,
  categoriesAnchorId,
}: PulvertFeatureSectionsProps) {
  const rootCategories = categories
    .filter((category) => !category.parent_id)
    .slice(0, 2);

  if (!showCategories && !showVideos) return null;

  return (
    <section
      id={showCategories ? categoriesAnchorId : undefined}
      className="relative overflow-hidden bg-[#eef4e7] py-10 text-[#10214a]"
    >
      <BackgroundField />
      <div className="relative mx-auto max-w-[1080px] px-4">
        {showCategories && (
          <>
            <SectionTitle title="Catégories Pulvert" subtitle="Pulvérisation agricole précise et productive" />
            {rootCategories.length > 0 ? (
              <div className="mt-8 grid gap-7 md:grid-cols-2">
                {rootCategories.map((category, index) => {
                  const Icon = ICONS[index % ICONS.length];
                  const logo = BRAND_LOGOS[index % BRAND_LOGOS.length];
                  return (
                    <Link
                      key={category.id_categorie}
                      href={`?cat=${category.id_categorie}#catalogue-marque`}
                      className="group overflow-hidden rounded-sm bg-white shadow-lg ring-1 ring-black/10 transition duration-300 hover:-translate-y-1.5 hover:scale-[1.025] hover:shadow-2xl hover:ring-[#149a3b]/35"
                    >
                      <div className="relative h-[250px] overflow-hidden md:h-[270px]">
                        <Image
                          src={category.image || FIELD_IMAGE}
                          alt=""
                          fill
                          className="object-cover transition duration-500 group-hover:scale-110"
                          sizes="(max-width:768px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(11,61,42,0.88),rgba(21,147,58,0.52)_48%,rgba(244,185,35,0.18)_78%,transparent)]" />
                        <div className="absolute left-5 top-5 flex h-14 w-14 items-center justify-center rounded-sm bg-white text-[#149a3b] shadow transition duration-300 group-hover:rotate-3 group-hover:bg-[#f4b923] group-hover:text-[#0b3d2a]">
                          <Icon size={30} />
                        </div>
                        <div className="absolute right-5 top-5 flex flex-col gap-2">
                          {BENEFITS.map(({ label, Icon: BenefitIcon }) => (
                            <span
                              key={label}
                              className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black uppercase text-[#0b3d2a] shadow-sm backdrop-blur transition duration-300 group-hover:translate-x-[-3px]"
                            >
                              <BenefitIcon size={12} className="text-[#149a3b]" />
                              {label}
                            </span>
                          ))}
                        </div>
                        <div className="absolute inset-x-5 bottom-5">
                          <h3 className="text-xl font-black text-white">{category.nom}</h3>
                          {category.description && (
                            <p className="mt-2 max-w-[30rem] text-sm font-semibold leading-snug text-white/85">
                              {category.description}
                            </p>
                          )}
                          <span className="mt-4 inline-flex items-center gap-2 rounded-sm bg-[#f4b923] px-5 py-2 text-xs font-black text-[#0b3d2a] shadow transition group-hover:bg-white">
                            Voir les produits
                            <ChevronRight size={14} />
                          </span>
                        </div>
                      </div>
                      <div className="flex h-24 items-center justify-center border-t border-[#e2ead9] bg-white px-6 py-4">
                        <span className="relative block h-16 w-48">
                          <Image src={logo.src} alt={logo.alt} fill className="object-contain" sizes="192px" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="mt-6 rounded-sm bg-white p-8 text-center text-sm font-semibold text-slate-500 shadow ring-1 ring-black/10">
                Les catégories Pulvert apparaîtront ici dès leur création.
              </div>
            )}
          </>
        )}

        {showVideos && (
          <div className={showCategories ? "mt-10 border-t border-slate-200 pt-9" : ""}>
            <SectionTitle title="Vidéos tutoriels" subtitle="Conseils pratiques de pulvérisation" />
            {videos.length > 0 ? (
              <div className="mt-6 grid gap-5 md:grid-cols-3">
                {videos.map((video) => {
                  const embed = getVideoEmbed(video.url);
                  return (
                    <article key={video.id_video} className="overflow-hidden rounded-sm bg-white shadow-lg ring-1 ring-black/10">
                      <div className={embed?.isVertical ? "flex min-h-[420px] items-center justify-center overflow-hidden bg-slate-900 p-3" : "relative aspect-video overflow-hidden bg-slate-900"}>
                        {embed ? (
                          <iframe
                            src={embed.url}
                            title={video.titre}
                            className={embed.isVertical ? "aspect-[9/16] h-full max-h-[420px] w-full max-w-[236px] rounded-sm bg-black" : "h-full w-full"}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center px-5 text-center text-sm font-semibold text-white/80">
                            Format vidéo non pris en charge pour l&apos;aperçu intégré.
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="text-[15px] font-black text-[#10214a]">{video.titre}</h3>
                        {video.description && (
                          <p className="mt-2 border-t border-dashed border-slate-300 pt-3 text-[12px] leading-snug text-slate-600">
                            {video.description}
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="mt-6 rounded-sm bg-white p-8 text-center text-sm font-semibold text-slate-500 shadow ring-1 ring-black/10">
                Les vidéos ajoutées depuis le dashboard admin seront affichées ici.
              </div>
            )}
          </div>
        )}
      </div>
    </section>
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
          <SectionTitleLine icon={icon} color="#10214a">
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
    <div className="absolute inset-x-0 top-[92px] h-[210px] opacity-20">
      <Image src={FIELD_IMAGE} alt="" fill className="object-cover" sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#eef4e7] via-white/15 to-[#eef4e7]" />
    </div>
  );
}

function getVideoEmbed(url: string): { url: string; isVertical: boolean } | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtube.com" || host === "m.youtube.com") {
      const parts = parsed.pathname.split("/").filter(Boolean);
      const id =
        parsed.searchParams.get("v") ||
        (parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "live" ? parts[1] : null);
      return id ? { url: `https://www.youtube.com/embed/${id}`, isVertical: parts[0] === "shorts" } : null;
    }

    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id ? { url: `https://www.youtube.com/embed/${id}`, isVertical: false } : null;
    }

    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const id = parsed.pathname.split("/").filter(Boolean).pop();
      return id ? { url: `https://player.vimeo.com/video/${id}`, isVertical: false } : null;
    }

    if (host === "facebook.com" || host === "m.facebook.com" || host === "fb.watch") {
      return { url: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=560`, isVertical: false };
    }

    if (host === "tiktok.com" || host === "vm.tiktok.com" || host === "vt.tiktok.com") {
      const id = extractTikTokId(parsed);
      return id ? { url: `https://www.tiktok.com/embed/v2/${id}`, isVertical: true } : null;
    }
  } catch {
    return null;
  }
  return null;
}

function extractTikTokId(url: URL) {
  const parts = url.pathname.split("/").filter(Boolean);
  const videoIndex = parts.indexOf("video");
  if (videoIndex >= 0 && parts[videoIndex + 1]) return parts[videoIndex + 1];
  return null;
}