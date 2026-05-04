// src/modules/chat/chat.repository.ts
import { prisma } from "../../lib/prisma";

export const chatRepository = {

  // Liste des conversations d'un admin (derniers messages par interlocuteur)
  async getConversations(id_admin: number) {
    // Tous les admins sauf soi-même
    const admins = await prisma.admin.findMany({
      where:  { actif: true, NOT: { id_admin } },
      select: { id_admin: true, nom: true, email: true, avatar: true },
    });

    // Pour chaque admin, récupérer le dernier message + nb non lus
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

  // Messages entre deux admins
  async getMessages(id_admin: number, id_other: number, page = 1, limit = 50) {
    const [total, messages] = await Promise.all([
      prisma.chatMessage.count({
        where: {
          OR: [
            { id_from: id_admin, id_to: id_other },
            { id_from: id_other, id_to: id_admin },
          ],
        },
      }),
      prisma.chatMessage.findMany({
        where: {
          OR: [
            { id_from: id_admin, id_to: id_other },
            { id_from: id_other, id_to: id_admin },
          ],
        },
        orderBy: { created_at: "desc" },
        skip:    (page - 1) * limit,
        take:    limit,
        include: {
          emetteur:  { select: { id_admin: true, nom: true, avatar: true } },
          recepteur: { select: { id_admin: true, nom: true, avatar: true } },
        },
      }),
    ]);

    // Marquer les messages reçus comme lus
    await prisma.chatMessage.updateMany({
      where: { id_from: id_other, id_to: id_admin, lu: false },
      data:  { lu: true },
    });

    return { messages: messages.reverse(), total };
  },

  // Envoyer un message
  async send(id_from: number, id_to: number, contenu: string) {
    return prisma.chatMessage.create({
      data: { id_from, id_to, contenu: contenu.substring(0, 2000) },
      include: {
        emetteur:  { select: { id_admin: true, nom: true, avatar: true } },
        recepteur: { select: { id_admin: true, nom: true, avatar: true } },
      },
    });
  },

  // Nombre total de messages non lus pour un admin
  async totalUnread(id_admin: number) {
    return prisma.chatMessage.count({
      where: { id_to: id_admin, lu: false },
    });
  },
};
