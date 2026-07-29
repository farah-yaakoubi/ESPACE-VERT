import { prisma } from "../../lib/prisma";
export const HERO_PAGES = [
  "home",
  "contact",
  "qui-sommes-nous",
  "rendez-vous",
  "activites",
  "marques",
  "produits",
  "devis",
] as const;

export type HeroPageStatic = typeof HERO_PAGES[number];
/** Accepte aussi les pages dynamiques : "marque:fertivert", "activite:irrigation" */
export type HeroPage = HeroPageStatic | string;

/** Slides actifs d'une page précise (usage public / frontend) */
export const findActifs = (page: HeroPage = "home") =>
  prisma.heroSlide.findMany({
    where: { actif: true, page },
    orderBy: { ordre: "asc" },
  });

/** Tous les slides (admin) — optionnellement filtrés par page */
export const findAll = (page?: HeroPage) =>
  prisma.heroSlide.findMany({
    where: page ? { page } : undefined,
    orderBy: [{ page: "asc" }, { ordre: "asc" }],
  });

export const findById = (id: number) =>
  prisma.heroSlide.findUnique({ where: { id_slide: id } });

const pickHeroSlideData = (data: Record<string, unknown>) => ({
  page: data.page,
  image: data.image,
  href: data.href,
  titre: data.titre,
  sousTitre: data.sousTitre,
  ctaLabel: data.ctaLabel,
  ordre: data.ordre,
  actif: data.actif,
  focalYMobile: data.focalYMobile,
  focalYTablette: data.focalYTablette,
  focalYDesktop: data.focalYDesktop,
});

export const create = async (data: {
  page: HeroPage;
  image: string;
  href?: string;
  titre?: string;
  sousTitre?: string;
  ctaLabel?: string;
  ordre: number;
  actif: boolean;
  focalYMobile?: number;
  focalYTablette?: number;
  focalYDesktop?: number;
}) => prisma.heroSlide.create({ data: pickHeroSlideData(data) as any });

export const update = async (
  id: number,
  data: Partial<{
    page: HeroPage;
    image: string;
    href: string;
    titre: string;
    sousTitre: string;
    ctaLabel: string;
    ordre: number;
    actif: boolean;
    focalYMobile: number;
    focalYTablette: number;
    focalYDesktop: number;
  }>
) => prisma.heroSlide.update({ where: { id_slide: id }, data: pickHeroSlideData(data) as any });

export const remove = (id: number) =>
  prisma.heroSlide.delete({ where: { id_slide: id } });

export const reorder = async (ids: number[]) => {
  await prisma.$transaction(
    ids.map((id, i) =>
      prisma.heroSlide.update({
        where: { id_slide: id },
        data: { ordre: i + 1 },
      })
    )
  );
};
