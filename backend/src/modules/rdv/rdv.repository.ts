// src/modules/rdv/rdv.repository.ts
import { prisma } from "../../lib/prisma";
import { RdvQueryDto, UpdateRdvDto } from "./rdv.schema";

export const CRENEAUX: string[] = [
  "08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
  "14:00","14:30","15:00","15:30","16:00","16:30",
];

export const rdvRepository = {

  async findAll(params: RdvQueryDto) {
    const { page, limit, statut } = params;
    const where = statut ? { statut } : {};
    const [total, rdvs] = await Promise.all([
      prisma.rendezVous.count({ where }),
      prisma.rendezVous.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { date_souhaitee: "asc" },
        include: { admin: { select: { nom: true } } },
      }),
    ]);
    return { rdvs, total };
  },

  async findById(id_rdv: number) {
    return prisma.rendezVous.findUnique({
      where:   { id_rdv },
      include: {
        visiteur: { select: { ip_address: true, pays: true } },
        admin:    { select: { nom: true } },
      },
    });
  },

  async create(data: {
    nom: string; email: string; telephone?: string | null;
    date_souhaitee: Date; heure?: string | null; objet?: string | null;
    agence?: string | null; message?: string | null; id_visiteur?: number | null;
  }) {
    return prisma.rendezVous.create({ data: { ...data, statut: "nouveau" } });
  },

  async update(id_rdv: number, data: UpdateRdvDto & { id_admin: number }) {
    return prisma.rendezVous.update({ where: { id_rdv }, data });
  },
};
