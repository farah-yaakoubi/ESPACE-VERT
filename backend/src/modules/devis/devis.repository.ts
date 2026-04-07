// src/modules/devis/devis.repository.ts
import { prisma } from "../../lib/prisma";
import { DevisQueryDto, UpdateDevisDto } from "./devis.schema";

export const devisRepository = {

  async findAll(params: DevisQueryDto) {
    const { page, limit, statut } = params;
    const where = statut ? { statut } : {};
    const [total, devis] = await Promise.all([
      prisma.devisDemande.count({ where }),
      prisma.devisDemande.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { created_at: "desc" },
        include: {
          produit:  { select: { nom: true, slug: true } },
          admin:    { select: { nom: true } },
          visiteur: { select: { pays: true } },
        },
      }),
    ]);
    return { devis, total };
  },

  async findById(id_devis: number) {
    return prisma.devisDemande.findUnique({
      where:   { id_devis },
      include: {
        produit:  true,
        visiteur: { select: { ip_address: true, pays: true } },
        admin:    { select: { nom: true } },
      },
    });
  },

  async create(data: {
    nom: string; email: string; telephone?: string | null;
    message?: string | null; id_produit?: number | null; id_visiteur?: number | null;
  }) {
    return prisma.devisDemande.create({
      data: { ...data, statut: "nouveau" },
      include: { produit: { select: { nom: true } } },
    });
  },

  async update(id_devis: number, data: UpdateDevisDto & { id_admin: number }) {
    return prisma.devisDemande.update({ where: { id_devis }, data });
  },

  async delete(id_devis: number) {
    return prisma.devisDemande.delete({ where: { id_devis } });
  },
};
