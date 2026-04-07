// src/modules/visiteur/visiteur.repository.ts
import { prisma } from "../../lib/prisma";
import { VisiteurQueryDto } from "./visiteur.schema";
import crypto from "crypto";

export const visiteurRepository = {

  async findByToken(token_visiteur: string) {
    return prisma.visiteur.findUnique({ where: { token_visiteur } });
  },

  async findById(id_visiteur: number) {
    return prisma.visiteur.findUnique({
      where:   { id_visiteur },
      include: {
        visites_pages: { orderBy: { visited_at: "desc" }, take: 20 },
        devis:         { orderBy: { created_at: "desc" } },
        rendez_vous:   { orderBy: { created_at: "desc" } },
        messages:      { orderBy: { created_at: "desc" } },
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
        include: { _count: { select: { visites_pages: true, devis: true, rendez_vous: true } } },
      }),
    ]);
    return { visiteurs, total };
  },

  async upsert(token_visiteur: string | undefined, ip_address: string, user_agent: string | null) {
    if (token_visiteur) {
      const existing = await prisma.visiteur.findUnique({ where: { token_visiteur } });
      if (existing) {
        return prisma.visiteur.update({
          where: { token_visiteur },
          data:  { ip_address },
        });
      }
    }
    // Nouveau visiteur
    return prisma.visiteur.create({
      data: {
        token_visiteur: crypto.randomBytes(32).toString("hex"),
        ip_address,
        user_agent,
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
};
