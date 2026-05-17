// src/modules/chat/chat.repository.ts
import { prisma } from "../../lib/prisma";

type SendPayload = {
  contenu:      string;
  type_message: "texte" | "fichier" | "image" | "pdf";
  fichier_url?:  string;
  fichier_nom?:  string;
  fichier_size?: number;
};

const MSG_SELECT = {
  id_msg:       true,
  id_from:      true,
  id_to:        true,
  contenu:      true,
  type_message: true,
  fichier_url:  true,
  fichier_nom:  true,
  fichier_size: true,
  lu:           true,
  created_at:   true,
  emetteur:  { select: { id_admin: true, nom: true, avatar: true } },
  recepteur: { select: { id_admin: true, nom: true, avatar: true } },
} as const;

export const chatRepository = {

  // ── Liste conversations (derniers messages par interlocuteur) ──────────────
  async getConversations(id_admin: number) {
    const admins = await prisma.admin.findMany({
      where:  { actif: true, NOT: { id_admin } },
      select: { id_admin: true, nom: true, email: true, avatar: true },
    });

    const conversations = await Promise.all(
      admins.map(async (a) => {
        const lastMsg = await prisma.chatMessage.findFirst({
          where: {
            OR: [
              { id_from: id_admin, id_to: a.id_admin },
              { id_from: a.id_admin, id_to: id_admin },
            ],
          },
          orderBy: { created_at: "desc" },
          select: MSG_SELECT,
        });

        const unread = await prisma.chatMessage.count({
          where: { id_from: a.id_admin, id_to: id_admin, lu: false },
        });

        return { admin: a, last_message: lastMsg, unread };
      })
    );

    return conversations.sort((a, b) => {
      const tA = a.last_message?.created_at?.getTime() ?? 0;
      const tB = b.last_message?.created_at?.getTime() ?? 0;
      return tB - tA;
    });
  },

  // ── Messages entre deux admins (paginés, ordre chronologique) ─────────────
  async getMessages(id_admin: number, id_other: number, page = 1, limit = 50) {
    const where = {
      OR: [
        { id_from: id_admin, id_to: id_other },
        { id_from: id_other, id_to: id_admin },
      ],
    };

    const [total, messages] = await Promise.all([
      prisma.chatMessage.count({ where }),
      prisma.chatMessage.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip:    (page - 1) * limit,
        take:    limit,
        select:  MSG_SELECT,
      }),
    ]);

    // Marquer les messages reçus comme lus
    await prisma.chatMessage.updateMany({
      where: { id_from: id_other, id_to: id_admin, lu: false },
      data:  { lu: true },
    });

    return { messages: messages.reverse(), total, page, pages: Math.ceil(total / limit) };
  },

  // ── Envoyer un message (texte ou fichier) ──────────────────────────────────
  async send(id_from: number, id_to: number, payload: SendPayload) {
    return prisma.chatMessage.create({
      data: {
        id_from,
        id_to,
        contenu:      payload.contenu.substring(0, 4000),
        type_message: payload.type_message,
        fichier_url:  payload.fichier_url  ?? null,
        fichier_nom:  payload.fichier_nom  ?? null,
        fichier_size: payload.fichier_size ?? null,
      },
      select: MSG_SELECT,
    });
  },

  // ── Marquer tous les messages d'un expéditeur comme lus ───────────────────
  async markRead(id_to: number, id_from: number) {
    return prisma.chatMessage.updateMany({
      where: { id_from, id_to, lu: false },
      data:  { lu: true },
    });
  },

  // ── Nombre total de messages non lus pour un admin ─────────────────────────
  async totalUnread(id_admin: number) {
    return prisma.chatMessage.count({
      where: { id_to: id_admin, lu: false },
    });
  },
};
