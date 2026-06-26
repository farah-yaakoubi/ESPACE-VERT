// src/modules/devis/devis.repository.ts
// Couche DB pure — aucune logique métier
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { DevisQueryDto, type DevisStatut } from "./devis.schema";

// ── Types internes ────────────────────────────────────────────────────────────
export type CreateDevisPayload = {
  nom:          string;
  email:        string;
  telephone?:   string | null;
  message?:     string | null;
  id_produit?:  number | null;
  id_visiteur?: number | null;
};

export type UpdateDevisPayload = {
  statut?:       DevisStatut;
  note_interne?: string | null;
  reponse_admin?: string | null;
  id_admin?:     number;
};

// ── Includes réutilisables ───────────────────────────────────────────────────
const LIST_INCLUDE = {
  produit:  { select: { nom: true, slug: true } },
  admin:    { select: { nom: true } },
  visiteur: { select: { pays: true, ip_address: true } },
} as const;

const DETAIL_INCLUDE = {
  produit:  { include: { images: { where: { is_principale: true }, take: 1 } } },
  visiteur: { select: { ip_address: true, pays: true, user_agent: true } },
  admin:    { select: { nom: true, email: true } },
} as const;

// ── Repository ────────────────────────────────────────────────────────────────
export const devisRepository = {

  async findAll(params: DevisQueryDto) {
    const { page, limit, statut, search } = params;

    const where: Record<string, unknown> = {};
    if (statut) where.statut = statut;
    if (search) {
      where.OR = [
        { nom:   { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [total, devis] = await Promise.all([
      prisma.devisDemande.count({ where }),
      prisma.devisDemande.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: "desc" },
        include: LIST_INCLUDE,
      }),
    ]);
    return { devis, total };
  },

  async findById(id_devis: number) {
    return prisma.devisDemande.findUnique({
      where:   { id_devis },
      include: DETAIL_INCLUDE,
    });
  },

  async create(data: CreateDevisPayload) {
    return prisma.devisDemande.create({
      data:    { ...data, statut: "nouveau" },
      include: { produit: { select: { nom: true, slug: true } } },
    });
  },

  async update(id_devis: number, data: UpdateDevisPayload) {
    const payload: Record<string, unknown> = {};
    if (data.statut !== undefined) payload.statut = data.statut;
    if (data.note_interne !== undefined) payload.note_interne = data.note_interne;
    if (data.reponse_admin !== undefined) payload.reponse_admin = data.reponse_admin;
    if (data.id_admin !== undefined) payload.id_admin = data.id_admin;

    return prisma.devisDemande.update({
      where:   { id_devis },
      data: payload,
      include: LIST_INCLUDE,
    });
  },

  async delete(id_devis: number) {
    return prisma.devisDemande.delete({ where: { id_devis } });
  },

  async countByStatut() {
    return prisma.devisDemande.groupBy({
      by:      ["statut"],
      _count:  { statut: true },
    });
  },
};
