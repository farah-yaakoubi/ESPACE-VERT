// src/modules/notifications/notifications.repository.ts
import { prisma } from "../../lib/prisma";

export type NotifType = "nouveau_devis" | "nouveau_rdv" | "nouveau_message" | "message_interne";

type NotifOptions = {
  id_emetteur?: number | null;
  source_label?: string | null;
};

const NOTIF_SELECT = {
  id_notif: true,
  type: true,
  titre: true,
  corps: true,
  lien: true,
  source_label: true,
  lu: true,
  created_at: true,
  emetteur: {
    select: {
      id_admin: true,
      nom: true,
      avatar: true,
    },
  },
} as const;

export const notifRepository = {

  // Créer une notif pour TOUS les admins actifs
  async createForAll(type: NotifType, titre: string, corps?: string, lien?: string, options: NotifOptions = {}) {
    const admins = await prisma.admin.findMany({
      where: { actif: true },
      select: { id_admin: true },
    });
    if (!admins.length) return;
    await prisma.adminNotification.createMany({
      data: admins.map(a => ({
        id_admin: a.id_admin,
        type,
        titre,
        corps: corps ?? null,
        lien:  lien  ?? null,
        id_emetteur: options.id_emetteur ?? null,
        source_label: options.source_label ?? null,
      })),
    });
  },

  // Créer une notification pour UN admin précis
  async createOne(id_admin: number, type: NotifType, titre: string, corps?: string, lien?: string, options: NotifOptions = {}) {
    return prisma.adminNotification.create({
      data: {
        id_admin,
        type,
        titre,
        corps: corps ?? null,
        lien: lien ?? null,
        id_emetteur: options.id_emetteur ?? null,
        source_label: options.source_label ?? null,
      },
      select: NOTIF_SELECT,
    });
  },

  // Liste des notifs d'un admin (non lues en tête)
  async findByAdmin(id_admin: number, limit = 30) {
    return prisma.adminNotification.findMany({
      where:   { id_admin },
      orderBy: [{ lu: "asc" }, { created_at: "desc" }],
      take:    limit,
      select:  NOTIF_SELECT,
    });
  },

  // Nombre de non lues
  async countUnread(id_admin: number) {
    return prisma.adminNotification.count({
      where: { id_admin, lu: false },
    });
  },

  // Marquer une notif comme lue
  async markRead(id_notif: number, id_admin: number) {
    return prisma.adminNotification.updateMany({
      where: { id_notif, id_admin },
      data:  { lu: true },
    });
  },

  // Marquer TOUTES les notifs d'un admin comme lues
  async markAllRead(id_admin: number) {
    return prisma.adminNotification.updateMany({
      where: { id_admin, lu: false },
      data:  { lu: true },
    });
  },

  // Supprimer une notif
  async delete(id_notif: number, id_admin: number) {
    return prisma.adminNotification.deleteMany({
      where: { id_notif, id_admin },
    });
  },

  // Supprimer toutes les notifs lues d'un admin
  async clearRead(id_admin: number) {
    return prisma.adminNotification.deleteMany({
      where: { id_admin, lu: true },
    });
  },
};
