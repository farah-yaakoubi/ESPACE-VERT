// src/modules/visiteur/visiteur.repository.ts
// REMPLACE ENTIÈREMENT l'ancien fichier
import { prisma }  from "../../lib/prisma";
import { VisiteurQueryDto, StatsVisiteurQueryDto, TrackDto } from "./visiteur.schema";
import crypto      from "crypto";
import https       from "https";

// ── Géolocalisation IP ────────────────────────────────────────────────────────
async function resolveGeo(ip: string): Promise<{ pays: string | null; region: string | null }> {
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
          resolve(j.status === "success" ? { pays: j.country ?? null, region: j.regionName ?? null } : { pays: null, region: null });
        } catch { resolve({ pays: null, region: null }); }
      });
    });
    req.setTimeout(3000, () => { req.destroy(); resolve({ pays: null, region: null }); });
    req.on("error", () => resolve({ pays: null, region: null }));
  });
}

// ── Détecter l'appareil depuis user-agent ─────────────────────────────────────
function detectDevice(ua: string | null): { device_type: string; browser: string; os: string } {
  if (!ua) return { device_type: "desktop", browser: "Inconnu", os: "Inconnu" };
  const u = ua.toLowerCase();

  // Device
  let device_type = "desktop";
  if (/tablet|ipad/i.test(u)) device_type = "tablet";
  else if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(u)) device_type = "mobile";

  // Browser
  let browser = "Autre";
  if (/edg\//i.test(u))       browser = "Edge";
  else if (/opr\//i.test(u))  browser = "Opera";
  else if (/chrome/i.test(u)) browser = "Chrome";
  else if (/safari/i.test(u)) browser = "Safari";
  else if (/firefox/i.test(u))browser = "Firefox";
  else if (/msie|trident/i.test(u)) browser = "IE";

  // OS
  let os = "Autre";
  if (/windows nt/i.test(u))       os = "Windows";
  else if (/macintosh|mac os x/i.test(u)) os = "macOS";
  else if (/android/i.test(u))     os = "Android";
  else if (/iphone|ipad|ipod/i.test(u)) os = "iOS";
  else if (/linux/i.test(u))       os = "Linux";

  return { device_type, browser, os };
}

// ── Extraire l'id produit depuis une URL ─────────────────────────────────────
// ex: /produits/engrais-soluble → cherche le produit par slug
async function resolveIdProduit(url: string): Promise<number | null> {
  try {
    // URL type /produits/[slug] ou /marques/[marque]/[slug]
    const match = url.match(/\/produits\/([^/?#]+)/i) ?? url.match(/\/marques\/[^/]+\/([^/?#]+)/i);
    if (!match) return null;
    const slug = match[1];
    const produit = await prisma.produit.findUnique({ where: { slug }, select: { id_produit: true } });
    return produit?.id_produit ?? null;
  } catch { return null; }
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

  // MODIFIÉ — upsert avec device detection
  async upsert(token_visiteur: string | undefined, ip_address: string, user_agent: string | null) {
    const device = detectDevice(user_agent);

    if (token_visiteur) {
      const existing = await prisma.visiteur.findUnique({ where: { token_visiteur } });
      if (existing) {
        const updates: any = { ip_address };
        if (!existing.pays && ip_address && ip_address !== "unknown") {
          const geo = await resolveGeo(ip_address);
          if (geo.pays) { updates.pays = geo.pays; updates.region = geo.region; }
        }
        // Mettre à jour device si pas encore détecté
        if (!existing.device_type) {
          updates.device_type = device.device_type;
          updates.browser     = device.browser;
          updates.os          = device.os;
        }
        return prisma.visiteur.update({ where: { token_visiteur }, data: updates });
      }
    }

    // Nouveau visiteur
    const geo = await resolveGeo(ip_address);
    return prisma.visiteur.create({
      data: {
        token_visiteur: crypto.randomBytes(32).toString("hex"),
        ip_address,
        user_agent,
        pays:        geo.pays,
        region:      geo.region,
        device_type: device.device_type,
        browser:     device.browser,
        os:          device.os,
      },
    });
  },

  // MODIFIÉ — logPage avec id_produit automatique
  async logPage(id_visiteur: number, url: string, titre?: string, duree?: number) {
    const id_produit = await resolveIdProduit(url);
    return prisma.visitePage.create({
      data: {
        id_visiteur,
        url:        url.substring(0, 500),
        titre:      titre?.substring(0, 255) ?? null,
        duree:      duree ?? 0,
        id_produit: id_produit,
      },
    });
  },

  async logSearch(id_visiteur: number, query: string, nb_results: number) {
    return prisma.searchQuery.create({
      data: { id_visiteur, query: query.substring(0, 500), nb_results },
    });
  },

  // NOUVEAU — incrémenter les consultations FAQ
  async incrementFaqConsultation(id_faq: number) {
    return prisma.faq.update({
      where: { id_faq },
      data:  { nb_consultations: { increment: 1 } },
    });
  },

  async getStats(params: StatsVisiteurQueryDto) {
    const since = new Date(Date.now() - params.days * 24 * 60 * 60 * 1000);

    const [
      totalVisiteurs, visiteursActifs, totalPages,
      topPages, avgDuree, paysStats, searchStats, faqStats,
      deviceStats, topProduits,
    ] = await Promise.all([
      prisma.visiteur.count(),
      prisma.visiteur.count({ where: { last_visit: { gte: since } } }),
      prisma.visitePage.count({ where: { visited_at: { gte: since } } }),

      prisma.visitePage.groupBy({
        by: ["url", "titre"],
        where:   { visited_at: { gte: since } },
        _count:  { url: true },
        _avg:    { duree: true },
        orderBy: { _count: { url: "desc" } },
        take:    10,
      }),

      prisma.visitePage.aggregate({
        where: { visited_at: { gte: since }, duree: { gt: 0 } },
        _avg:  { duree: true },
      }),

      prisma.visiteur.groupBy({
        by:      ["pays"],
        where:   { pays: { not: null } },
        _count:  { pays: true },
        orderBy: { _count: { pays: "desc" } },
        take:    10,
      }),

      prisma.searchQuery.groupBy({
        by:      ["query"],
        where:   { searched_at: { gte: since } },
        _count:  { query: true },
        orderBy: { _count: { query: "desc" } },
        take:    10,
      }),

      prisma.faq.findMany({
        where:   { nb_consultations: { gt: 0 } },
        orderBy: { nb_consultations: "desc" },
        take:    10,
        select:  { id_faq: true, question: true, categorie: true, nb_consultations: true },
      }),

      // NOUVEAU — stats appareils
      prisma.visiteur.groupBy({
        by:      ["device_type"],
        where:   { device_type: { not: null } },
        _count:  { device_type: true },
        orderBy: { _count: { device_type: "desc" } },
      }),

      // NOUVEAU — top produits par temps passé
      prisma.visitePage.groupBy({
        by:      ["id_produit"],
        where:   { visited_at: { gte: since }, id_produit: { not: null } },
        _count:  { id_produit: true },
        _avg:    { duree: true },
        orderBy: { _avg: { duree: "desc" } },
        take:    10,
      }),
    ]);

    // Résoudre les noms des produits
    const produitIds = topProduits.map((p: any) => p.id_produit).filter(Boolean);
    const produits   = produitIds.length
      ? await prisma.produit.findMany({
          where:  { id_produit: { in: produitIds } },
          select: { id_produit: true, nom: true, slug: true },
        })
      : [];
    const produitMap = new Map(produits.map(p => [p.id_produit, p]));

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
      deviceStats: deviceStats.map((d: any) => ({
        device: d.device_type ?? "inconnu",
        count:  d._count.device_type,
      })),
      topProduits: topProduits.map((p: any) => {
        const prod = produitMap.get(p.id_produit);
        return {
          id_produit: p.id_produit,
          nom:        prod?.nom   ?? "Produit inconnu",
          slug:       prod?.slug  ?? "",
          vues:       p._count.id_produit,
          duree_moy:  Math.round(p._avg.duree ?? 0),
        };
      }),
    };
  },
};
