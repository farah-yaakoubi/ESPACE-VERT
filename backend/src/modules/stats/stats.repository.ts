// src/modules/stats/stats.repository.ts
import { prisma } from "../../lib/prisma";

export const statsRepository = {

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
        par_statut: devisStats.reduce<Record<string, number>>((acc, d) => { acc[d.statut] = d._count._all; return acc; }, {}),
        total:      devisStats.reduce((a, d) => a + d._count._all, 0),
      },
      rdv: {
        par_statut: rdvStats.reduce<Record<string, number>>((acc, r) => { acc[r.statut] = r._count._all; return acc; }, {}),
        total:      rdvStats.reduce((a, r) => a + r._count._all, 0),
      },
      messages: { non_lus: messagesNonLus },
      recents:  { devis: derniersDevis, rdv: derniersRdv, messages: derniersMessages },
    };
  },
};
