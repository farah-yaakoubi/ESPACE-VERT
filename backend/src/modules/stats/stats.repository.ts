// src/modules/stats/stats.repository.ts
// ══════════════════════════════════════════════════════════════════
//  ESPACE VERT — Stats Repository v3 (Advanced Analytics)
//  Étend le repository existant sans modifier la BDD
// ══════════════════════════════════════════════════════════════════
import { prisma } from "../../lib/prisma";

export const statsRepository = {

  // ── Dashboard existant (INCHANGÉ) ────────────────────────────────
  async getDashboard() {
    const [
      totalProduits, totalMarques, totalCategories,
      totalActivites, totalActualites, totalFaqs,
      devisStats, rdvStats, messagesNonLus,
      derniersDevis, derniersRdv, derniersMessages,
    ] = await Promise.all([
      prisma.produit.count({ where: { actif: true } }),
      prisma.marque.count({ where: { actif: true } }),
      prisma.categorie.count({ where: { actif: true } }),
      prisma.activite.count({ where: { actif: true } }),
      prisma.actualite.count({ where: { publiee: true } }),
      prisma.faq.count({ where: { active: true } }),

      prisma.devisDemande.groupBy({ by: ["statut"], _count: { _all: true } }),
      prisma.rendezVous.groupBy({ by: ["statut"], _count: { _all: true } }),
      prisma.contactMessage.count({ where: { lu: false } }),

      prisma.devisDemande.findMany({
        take: 5, orderBy: { created_at: "desc" },
        select: {
          id_devis: true, nom: true, email: true, statut: true, created_at: true,
          produit:  { select: { nom: true } },
        },
      }),
      prisma.rendezVous.findMany({
        take: 5,
        where: { statut: { in: ["nouveau", "confirme"] }, date_souhaitee: { gte: new Date() } },
        orderBy: { date_souhaitee: "asc" },
        select: { id_rdv: true, nom: true, date_souhaitee: true, statut: true, agence: true },
      }),
      prisma.contactMessage.findMany({
        take: 5, orderBy: { created_at: "desc" },
        select: { id_contact: true, nom: true, sujet: true, lu: true, created_at: true },
      }),
    ]);

    return {
      catalogue: {
        produits:   totalProduits,
        marques:    totalMarques,
        categories: totalCategories,
        activites:  totalActivites,
        actualites: totalActualites,
        faqs:       totalFaqs,
      },
      devis: {
        par_statut: (devisStats as any[]).reduce((acc: Record<string, number>, d: any) => { acc[d.statut] = d._count._all; return acc; }, {} as Record<string, number>),
        total:      (devisStats as any[]).reduce((a: number, d: any) => a + d._count._all, 0),
      },
      rdv: {
        par_statut: (rdvStats as any[]).reduce((acc: Record<string, number>, r: any) => { acc[r.statut] = r._count._all; return acc; }, {} as Record<string, number>),
        total:      (rdvStats as any[]).reduce((a: number, r: any) => a + r._count._all, 0),
      },
      messages: { non_lus: messagesNonLus },
      recents:  { devis: derniersDevis, rdv: derniersRdv, messages: derniersMessages },
    };
  },

  // ── NOUVEAU: Analytics avancées visiteurs ────────────────────────
  async getAdvancedAnalytics(days: number = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const sincePrev = new Date(Date.now() - days * 2 * 24 * 60 * 60 * 1000);

    const [
      // Visiteurs
      totalVisiteurs,
      visiteursActifs,
      visiteursActifsPrev,
      nouveauxVisiteurs,
      // Pages
      totalPageViews,
      totalPageViewsPrev,
      // Durée
      avgDureeResult,
      // Séries temporelles (30 derniers jours)
      visiteursSerie,
      pageViewsSerie,
      // Top pages
      topPages,
      // Géographie
      topPays,
      topRegions,
      // Comportement
      topRecherches,
      topProduitsVus,
      // Conversions
      devisParJour,
      totalDevisRecent,
      devisParStatut,
      // Sessions
      sessionStats,
    ] = await Promise.all([

      // ── Visiteurs totaux ──────────────────────────────────────────
      prisma.visiteur.count(),
      prisma.visiteur.count({ where: { last_visit: { gte: since } } }),
      prisma.visiteur.count({ where: { last_visit: { gte: sincePrev, lt: since } } }),
      prisma.visiteur.count({ where: { first_visit: { gte: since } } }),

      // ── Page views ───────────────────────────────────────────────
      prisma.visitePage.count({ where: { visited_at: { gte: since } } }),
      prisma.visitePage.count({ where: { visited_at: { gte: sincePrev, lt: since } } }),

      // ── Durée moyenne ────────────────────────────────────────────
      prisma.visitePage.aggregate({
        where: { visited_at: { gte: since }, duree: { gt: 5 } },
        _avg: { duree: true },
      }),

      // ── Série visiteurs par jour ─────────────────────────────────
      prisma.$queryRaw<{ date: string; nb: number }[]>`
        SELECT
          DATE(last_visit) as date,
          COUNT(DISTINCT id_visiteur) as nb
        FROM visiteurs
        WHERE last_visit >= ${since}
        GROUP BY DATE(last_visit)
        ORDER BY date ASC
      `,

      // ── Série pages vues par jour ────────────────────────────────
      prisma.$queryRaw<{ date: string; nb: number }[]>`
        SELECT
          DATE(visited_at) as date,
          COUNT(*) as nb
        FROM visites_pages
        WHERE visited_at >= ${since}
        GROUP BY DATE(visited_at)
        ORDER BY date ASC
      `,

      // ── Top 10 pages ─────────────────────────────────────────────
      prisma.visitePage.groupBy({
        by: ["url", "titre"],
        where: { visited_at: { gte: since } },
        _count: { url: true },
        _avg:   { duree: true },
        orderBy: { _count: { url: "desc" } },
        take: 10,
      }),

      // ── Top pays ─────────────────────────────────────────────────
      prisma.visiteur.groupBy({
        by: ["pays"],
        where: { pays: { not: null }, last_visit: { gte: since } },
        _count: { pays: true },
        orderBy: { _count: { pays: "desc" } },
        take: 10,
      }),

      // ── Top régions ──────────────────────────────────────────────
      prisma.visiteur.groupBy({
        by: ["region"],
        where: { region: { not: null }, last_visit: { gte: since } },
        _count: { region: true },
        orderBy: { _count: { region: "desc" } },
        take: 8,
      }),

      // ── Top recherches ───────────────────────────────────────────
      prisma.searchQuery.groupBy({
        by: ["query"],
        where: { searched_at: { gte: since } },
        _count: { query: true },
        orderBy: { _count: { query: "desc" } },
        take: 10,
      }),

      // ── Top produits vus (via URL /produits/ ou marques/) ────────
      prisma.$queryRaw<{ produit_slug: string; nb: number }[]>`
        SELECT
          SUBSTRING_INDEX(SUBSTRING_INDEX(url, '/produits/', -1), '?', 1) as produit_slug,
          COUNT(*) as nb
        FROM visites_pages
        WHERE visited_at >= ${since}
          AND (url LIKE '%/produits/%' OR url LIKE '%/marques/%')
          AND url NOT LIKE '%/admin/%'
        GROUP BY produit_slug
        ORDER BY nb DESC
        LIMIT 10
      `,

      // ── Devis par jour ───────────────────────────────────────────
      prisma.$queryRaw<{ date: string; nb: number }[]>`
        SELECT
          DATE(created_at) as date,
          COUNT(*) as nb
        FROM devis_demandes
        WHERE created_at >= ${since}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,

      // ── Total devis période ──────────────────────────────────────
      prisma.devisDemande.count({ where: { created_at: { gte: since } } }),

      // ── Devis par statut ─────────────────────────────────────────
      prisma.devisDemande.groupBy({
        by: ["statut"],
        where: { created_at: { gte: since } },
        _count: { _all: true },
      }),

      // ── Stats sessions (pages par visite) ───────────────────────
      prisma.$queryRaw<{ avg_pages: number; max_pages: number }[]>`
        SELECT
          AVG(cnt) as avg_pages,
          MAX(cnt) as max_pages
        FROM (
          SELECT id_visiteur, COUNT(*) as cnt
          FROM visites_pages
          WHERE visited_at >= ${since}
          GROUP BY id_visiteur
        ) sub
      `,
    ]);

    // ── Calcul KPIs dérivés ─────────────────────────────────────────
    const avgDuree = Math.round(avgDureeResult._avg.duree ?? 0);
    const growthVisiteurs = visiteursActifsPrev > 0
      ? Math.round(((visiteursActifs - visiteursActifsPrev) / visiteursActifsPrev) * 100)
      : 0;
    const growthPages = totalPageViewsPrev > 0
      ? Math.round(((totalPageViews - totalPageViewsPrev) / totalPageViewsPrev) * 100)
      : 0;
    const tauxConversion = visiteursActifs > 0
      ? Number(((totalDevisRecent / visiteursActifs) * 100).toFixed(2))
      : 0;
    const pagesParVisite = (sessionStats[0]?.avg_pages ?? 0);

    // ── Normalise les séries temporelles ────────────────────────────
    const normalizeSerie = (data: { date: string; nb: number }[]) =>
      data.map(d => ({ date: new Date(d.date).toISOString().split("T")[0], nb: Number(d.nb) }));

    return {
      // KPIs principaux
      kpis: {
        visiteurs_actifs:  visiteursActifs,
        total_visiteurs:   totalVisiteurs,
        nouveaux_visiteurs: nouveauxVisiteurs,
        page_views:        totalPageViews,
        avg_duree_sec:     avgDuree,
        pages_par_visite:  Number(Number(pagesParVisite).toFixed(1)),
        devis_total:       totalDevisRecent,
        taux_conversion:   tauxConversion,
        growth_visiteurs:  growthVisiteurs,
        growth_pages:      growthPages,
      },

      // Séries temporelles pour graphiques
      series: {
        visiteurs_par_jour: normalizeSerie(visiteursSerie),
        pages_par_jour:     normalizeSerie(pageViewsSerie),
        devis_par_jour:     normalizeSerie(devisParJour),
      },

      // Classements
      top_pages: topPages.map((p: any) => ({
        url:   p.url,
        titre: p.titre ?? p.url,
        vues:  Number(p._count.url),
        duree: Math.round(p._avg.duree ?? 0),
      })),

      // Géographie
      geo: {
        pays:    topPays.map((p: any) => ({ pays: p.pays!, nb: Number(p._count.pays) })),
        regions: topRegions.map((r: any) => ({ region: r.region!, nb: Number(r._count.region) })),
      },

      // Comportement
      recherches: topRecherches.map((s: any) => ({ query: s.query, nb: Number(s._count.query) })),
      produits_vus: topProduitsVus.map((p: any) => ({ slug: p.produit_slug, nb: Number(p.nb) })),

      // Conversions
      conversions: {
        devis_par_statut: (devisParStatut as any[]).reduce((acc: Record<string, number>, d: any) => {
          acc[d.statut] = d._count._all; return acc;
        }, {} as Record<string, number>),
        total: totalDevisRecent,
        taux:  tauxConversion,
      },

      // Méta
      periode: { days, depuis: since.toISOString() },
    };
  },

  // ── NOUVEAU: Heatmap horaire (heure × jour) ──────────────────────
  async getHeatmapHoraire(days: number = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const rows = await prisma.$queryRaw<{ heure: number; jour_semaine: number; nb: number }[]>`
      SELECT
        HOUR(visited_at)       as heure,
        DAYOFWEEK(visited_at)  as jour_semaine,
        COUNT(*)               as nb
      FROM visites_pages
      WHERE visited_at >= ${since}
      GROUP BY HOUR(visited_at), DAYOFWEEK(visited_at)
      ORDER BY jour_semaine, heure
    `;

    return rows.map(r => ({
      heure:         Number(r.heure),
      jour_semaine:  Number(r.jour_semaine),
      nb:            Number(r.nb),
    }));
  },

  // ── NOUVEAU: Entonnoir de conversion ────────────────────────────
  async getEntonnoir(days: number = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [visiteurs, produits, devis, rdv] = await Promise.all([
      prisma.visiteur.count({ where: { last_visit: { gte: since } } }),
      prisma.$queryRaw<{ nb: number }[]>`
        SELECT COUNT(DISTINCT id_visiteur) as nb
        FROM visites_pages
        WHERE visited_at >= ${since}
          AND (url LIKE '%/produits/%' OR url LIKE '%/marques/%')
          AND url NOT LIKE '%/admin/%'
      `,
      prisma.devisDemande.count({ where: { created_at: { gte: since } } }),
      prisma.rendezVous.count({ where: { created_at: { gte: since } } }),
    ]);

    const vProduits = Number((produits[0] as any)?.nb ?? 0);

    return [
      { label: "Visiteurs uniques",  nb: visiteurs,  pct: 100 },
      { label: "Ont vu un produit",  nb: vProduits,  pct: visiteurs > 0 ? Math.round((vProduits  / visiteurs) * 100) : 0 },
      { label: "Devis soumis",       nb: devis,       pct: visiteurs > 0 ? Math.round((devis      / visiteurs) * 100) : 0 },
      { label: "RDV pris",           nb: rdv,         pct: visiteurs > 0 ? Math.round((rdv        / visiteurs) * 100) : 0 },
    ];
  },
};
