// src/modules/rdv/rdv.repository.ts
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { RdvQueryDto, type RdvStatut } from "./rdv.schema";

export const CRENEAUX = [
  "08:00","08:30","09:00","09:30","10:00","10:30",
  "11:00","11:30","14:00","14:30","15:00","15:30",
  "16:00","16:30","17:00",
];

export type CreateRdvPayload = {
  nom:            string;
  email:          string;
  telephone?:     string | null;
  date_souhaitee: Date;
  heure?:         string | null;
  objet?:         string | null;
  agence?:        string | null;
  message?:       string | null;
  id_visiteur?:   number | null;
};

export type UpdateRdvPayload = {
  statut?:       RdvStatut;
  note_interne?: string | null;
  heure?:        string | null;
  id_admin?:     number;
};

const LIST_INCLUDE = {
  admin:    { select: { nom: true } },
  visiteur: { select: { pays: true } },
} as const;

export const rdvRepository = {

  async findAll(params: RdvQueryDto) {
    const { page, limit, statut, agence } = params;
    const where: Record<string, unknown> = {};
    if (statut) where.statut = statut;
    if (agence) where.agence = agence;
    if (params.date) where.date_souhaitee = new Date(params.date);

    const [total, rdvs] = await Promise.all([
      prisma.rendezVous.count({ where }),
      prisma.rendezVous.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ date_souhaitee: "asc" }, { created_at: "desc" }],
        include: LIST_INCLUDE,
      }),
    ]);
    return { rdvs, total };
  },

  async findById(id_rdv: number) {
    return prisma.rendezVous.findUnique({
      where:   { id_rdv },
      include: {
        visiteur: { select: { ip_address: true, pays: true } },
        admin:    { select: { nom: true, email: true } },
      },
    });
  },

  async create(data: CreateRdvPayload) {
    return prisma.rendezVous.create({
      data: { ...data, statut: "nouveau" },
    });
  },

  async update(id_rdv: number, data: UpdateRdvPayload) {
    const payload: Record<string, unknown> = {};
    if (data.statut !== undefined) payload.statut = data.statut;
    if (data.note_interne !== undefined) payload.note_interne = data.note_interne;
    if (data.heure !== undefined) payload.heure = data.heure;
    if (data.id_admin !== undefined) payload.id_admin = data.id_admin;

    return prisma.rendezVous.update({
      where:   { id_rdv },
      data: payload,
      include: LIST_INCLUDE,
    });
  },

  async countByStatut() {
    return prisma.rendezVous.groupBy({
      by:     ["statut"],
      _count: { statut: true },
    });
  },

  async getCreneaux() {
    return CRENEAUX;
  },
};
