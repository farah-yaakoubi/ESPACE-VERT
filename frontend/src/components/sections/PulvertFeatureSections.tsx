import Image from "next/image";
import Link from "next/link";
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

const BRAND_BANNERS = [
  { src: "/images/pulverisation/banner-pulvert.webp", position: "center 62%" },
  { src: "/images/pulverisation/banner-pulvert-agro.webp", position: "center 55%" },
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
    <>
      {showCategories && (
        <section
          id={categoriesAnchorId}
          className="py-12 md:py-16"
          style={{ backgroundColor: "#f3ecd9" }}
        >
          <div className="container-ev">
            <p className="mb-8 text-center text-[12px] font-extrabold uppercase tracking-[0.24em] text-[#1b2118]/70">
              Parcourir par catégorie :
            </p>

            {rootCategories.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-4 md:gap-5">
                {rootCategories.map((category, index) => {
                  const banner = BRAND_BANNERS[index % BRAND_BANNERS.length];
                  return (
                    <Link
                      key={category.id_categorie}
                      href={`?cat=${category.id_categorie}#catalogue-marque`}
                      className="group relative aspect-square w-[260px] shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:w-[340px]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={banner.src}
                        alt={category.nom}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      <div
                        className="absolute inset-x-0 bottom-0 px-3.5 pb-3.5 pt-10"
                        style={{
                          background: "linear-gradient(to top, rgba(27,33,24,0.88) 0%, rgba(27,33,24,0) 100%)",
                        }}
                      >
                        <p className="text-left text-[13.5px] font-bold leading-snug text-white">
                          {category.nom}
                        </p>
                      </div>

                      <span
                        className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                        style={{ backgroundColor: "#c9a24a" }}
                      />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-sm font-semibold text-[#1b2118]/60">
                Les catégories Pulvert apparaîtront ici dès leur création.
              </p>
            )}
          </div>
        </section>
      )}

      {showVideos && (
        <section className="relative overflow-hidden bg-[#eef4e7] py-10 text-[#10214a]">
          <BackgroundField />
          <div className="relative mx-auto max-w-[1080px] px-4">
        {showVideos && (
          <div>
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
      )}
    </>
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