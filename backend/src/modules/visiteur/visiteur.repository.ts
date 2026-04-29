import { prisma } from "../../lib/prisma";
import { VisiteurQueryDto, StatsVisiteurQueryDto } from "./visiteur.schema";
import crypto from "crypto";
import https from "https";

// Résolution géo par IP via ip-api.com (gratuit, pas de clé)
async function resolveGeo(ip: string): Promise<{ pays: string | null; region: string | null }> {
  // Ignorer les IPs locales
  if (!ip || ip === "unknown" || ip.startsWith("127.") || ip.startsWith("::") || ip.startsWith("192.168") || ip.startsWith("10.")) {
    return { pays: null, region: null };
  }
  return new Promise((resolve) => {
    const req = https.get(`https://ip-api.com/json/${ip}?fields=country,regionName,status`, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          const j = JSON.parse(data);
          if (j.status === "success") {
            resolve({ pays: j.country ?? null, region: j.regionName ?? null });
          } else {
            resolve({ pays: null, region: null });
          }
        } catch { resolve({ pays: null, region: null }); }
      });
    });
    req.setTimeout(3000, () => { req.destroy(); resolve({ pays: null, region: null }); });
    req.on("error", () => resolve({ pays: null, region: null }));
  });
}

export const visiteurRepository = {

  async findByToken(token_visiteur: string) {
    return prisma.visiteur.findUnique({ where: { token_visiteur } });
  },

  async findById(id_visiteur: number) {
    return prisma.visiteur.findUnique({
      where:   { id_visiteur },
      include: {
        visites_pages:  { orderBy: { visited_at: "desc" }, take: 50 },
        search_queries: { orderBy: { searched_at: "desc" }, take: 20 },
        devis:          { orderBy: { created_at: "desc" } },
        rendez_vous:    { orderBy: { created_at: "desc" } },
        messages:       { orderBy: { created_at: "desc" } },
      },
    });
  },

  async findAll(params: VisiteurQueryDto) {
    const { page, limit } = params;
    const [total, visiteurs] = await Promise.all([
      prisma.visiteur.count(),
      prisma.visiteur.findMany({
        skip:    (page - 1) * limit,
        take:    limit,
        orderBy: { last_visit: "desc" },
        include: { _count: { select: { visites_pages: true, devis: true, rendez_vous: true, search_queries: true } } },
      }),
    ]);
    return { visiteurs, total };
  },

  // Statistiques comportementales agrégées
  async getStats(params: StatsVisiteurQueryDto) {
    const since = new Date(Date.now() - params.days * 24 * 60 * 60 * 1000);

    const [
      totalVisiteurs,
      visiteursActifs,
      totalPages,
      topPages,
      avgDuree,
      paysStats,
      searchStats,
      faqStats,
    ] = await Promise.all([
      prisma.visiteur.count(),
      prisma.visiteur.count({ where: { last_visit: { gte: since } } }),
      prisma.visitePage.count({ where: { visited_at: { gte: since } } }),

      // Top 10 pages les plus visitées
      prisma.visitePage.groupBy({
        by: ["url", "titre"],
        where: { visited_at: { gte: since } },
        _count: { url: true },
        _avg:   { duree: true },
        orderBy: { _count: { url: "desc" } },
        take: 10,
      }),

      // Durée moyenne par visite
      prisma.visitePage.aggregate({
        where: { visited_at: { gte: since }, duree: { gt: 0 } },
        _avg: { duree: true },
      }),

      // Répartition par pays
      prisma.visiteur.groupBy({
        by: ["pays"],
        where: { pays: { not: null } },
        _count: { pays: true },
        orderBy: { _count: { pays: "desc" } },
        take: 10,
      }),

      // Recherches les plus fréquentes
      prisma.searchQuery.groupBy({
        by: ["query"],
        where: { searched_at: { gte: since } },
        _count: { query: true },
        orderBy: { _count: { query: "desc" } },
        take: 10,
      }),

      // Top FAQs consultées
      prisma.faq.findMany({
        where:   { nb_consultations: { gt: 0 } },
        orderBy: { nb_consultations: "desc" },
        take:    10,
        select:  { id_faq: true, question: true, categorie: true, nb_consultations: true },
      }),
    ]);

    return {
      totalVisiteurs,
      visiteursActifs,
      totalPages,
      avgDuree: Math.round(avgDuree._avg.duree ?? 0),
      topPages: topPages.map((p: any) => ({
        url:   p.url,
        titre: p.titre ?? p.url,
        vues:  p._count.url,
        duree: Math.round(p._avg.duree ?? 0),
      })),
      paysStats: paysStats.map((p: any) => ({ pays: p.pays!, count: p._count.pays })),
      searchStats: searchStats.map((s: any) => ({ query: s.query, count: s._count.query })),
      faqStats,
    };
  },

  async upsert(token_visiteur: string | undefined, ip_address: string, user_agent: string | null) {
    if (token_visiteur) {
      const existing = await prisma.visiteur.findUnique({ where: { token_visiteur } });
      if (existing) {
        // Mettre à jour ip + résoudre pays si vide
        const updates: any = { ip_address };
        if (!existing.pays && ip_address && ip_address !== "unknown") {
          const geo = await resolveGeo(ip_address);
          if (geo.pays) { updates.pays = geo.pays; updates.region = geo.region; }
        }
        return prisma.visiteur.update({ where: { token_visiteur }, data: updates });
      }
    }
    // Nouveau visiteur — résoudre pays
    const geo = await resolveGeo(ip_address);
    return prisma.visiteur.create({
      data: {
        token_visiteur: crypto.randomBytes(32).toString("hex"),
        ip_address,
        user_agent,
        pays:   geo.pays,
        region: geo.region,
      },
    });
  },

  async logPage(id_visiteur: number, url: string, titre?: string, duree?: number) {
    return prisma.visitePage.create({
      data: {
        id_visiteur,
        url:   url.substring(0, 500),
        titre: titre?.substring(0, 255) ?? null,
        duree: duree ?? 0,
      },
    });
  },

  async logSearch(id_visiteur: number, query: string, nb_results: number) {
    return prisma.searchQuery.create({
      data: { id_visiteur, query: query.substring(0, 500), nb_results },
    });
  },
};
