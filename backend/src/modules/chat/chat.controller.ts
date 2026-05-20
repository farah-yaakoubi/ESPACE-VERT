import { Request, Response } from "express";
import { z } from "zod";
import { chatRepository } from "./chat.repository";
import { badRequest, forbidden, notFound, ok, serverError } from "../../lib/response";
import { upload, fileUrl } from "../../middleware/upload";
import { notifRepository } from "../notifications/notifications.repository";
import { notifSseNotify } from "../notifications/notifications.controller";

const handle = (res: Response, err: unknown) => {
  console.error("[chat.controller]", err);
  const e = err as any;
  if (e?.status === 400) return badRequest(res, e.message);
  if (e?.status === 403) return forbidden(res, e.message);
  if (e?.status === 404) return notFound(res, e.message);
  return serverError(res);
};

const SendSchema = z.object({
  contenu: z.string().max(4000).optional().default(""),
  type_message: z.enum(["texte", "fichier", "image", "pdf"]).optional().default("texte"),
  fichier_url: z.string().url().optional(),
  fichier_nom: z.string().max(255).optional(),
  fichier_size: z.number().optional(),
});

const UpdateSchema = z.object({
  contenu: z.string().max(4000),
});

const CreateGroupSchema = z.object({
  nom: z.string().min(2).max(160),
  description: z.string().max(255).optional().nullable(),
  member_ids: z.array(z.number().int().positive()).min(1),
});

function previewFromMessage(msg: {
  contenu?: string | null;
  fichier_nom?: string | null;
  deleted_at?: string | Date | null;
  type_message?: string | null;
} | null | undefined) {
  if (!msg) return "Nouveau message interne";
  if (msg.deleted_at) return "Message supprimé";
  if (msg.contenu?.trim()) return msg.contenu.trim().slice(0, 80);
  if (msg.fichier_nom) return `Fichier : ${msg.fichier_nom}`;
  if (msg.type_message && msg.type_message !== "texte") return "Pièce jointe";
  return "Nouveau message interne";
}

async function notifyAdmins(
  recipientIds: number[],
  actorId: number,
  titre: string,
  corps: string,
  sourceLabel: string,
  lien = "/admin/chat"
) {
  const uniqueRecipientIds = [...new Set(recipientIds.filter((id) => id !== actorId))];
  await Promise.all(uniqueRecipientIds.map(async (id_admin) => {
    await notifRepository.createOne(
      id_admin,
      "message_interne",
      titre,
      corps,
      lien,
      { id_emetteur: actorId, source_label: sourceLabel }
    );
    notifSseNotify(id_admin, {
      type: "message_interne",
      titre,
      source_label: sourceLabel,
    });
  }));
}

// ─── GET /api/admin/chat/available-admins ───────────────────────────────────
export const getAvailableAdmins = async (req: Request, res: Response) => {
  try {
    const id_admin = req.admin!.id_admin;
    ok(res, await chatRepository.availableAdmins(id_admin));
  } catch (e) { handle(res, e); }
};

// ─── GET /api/admin/chat/conversations ──────────────────────────────────────
export const getConversations = async (req: Request, res: Response) => {
  try {
    const id_admin = req.admin!.id_admin;
    ok(res, await chatRepository.getConversations(id_admin));
  } catch (e) { handle(res, e); }
};

// ─── GET /api/admin/chat/groups ─────────────────────────────────────────────
export const getGroups = async (req: Request, res: Response) => {
  try {
    const id_admin = req.admin!.id_admin;
    ok(res, await chatRepository.getGroups(id_admin));
  } catch (e) { handle(res, e); }
};

// ─── POST /api/admin/chat/groups ────────────────────────────────────────────
export const createGroup = async (req: Request, res: Response) => {
  try {
    const id_admin = req.admin!.id_admin;
    const parsed = CreateGroupSchema.parse(req.body);
    const group = await chatRepository.createGroup(id_admin, parsed);
    const memberIds = group.members.map((member) => member.id_admin);

    await notifyAdmins(
      memberIds,
      id_admin,
      "Nouveau groupe interne",
      `Vous avez été ajouté au groupe “${group.nom}”`,
      group.members.find((member) => member.id_admin === id_admin)?.nom ?? "Administrateur",
      `/admin/chat?group=${group.id_group}`
    );

    chatSseNotifyMany(memberIds, { kind: "group_created", group });
    ok(res, group);
  } catch (e) { handle(res, e); }
};

// ─── GET /api/admin/chat/:id_other?page=1 ───────────────────────────────────
export const getMessages = async (req: Request, res: Response) => {
  try {
    const id_admin = req.admin!.id_admin;
    const id_other = parseInt(req.params.id_other, 10);
    const page = parseInt((req.query.page as string) ?? "1", 10);
    if (isNaN(id_other)) return ok(res, { messages: [], total: 0, page: 1, pages: 0 });
    ok(res, await chatRepository.getMessages(id_admin, id_other, page));
  } catch (e) { handle(res, e); }
};

// ─── GET /api/admin/chat/groups/:id_group ───────────────────────────────────
export const getGroupMessages = async (req: Request, res: Response) => {
  try {
    const id_admin = req.admin!.id_admin;
    const id_group = parseInt(req.params.id_group, 10);
    const page = parseInt((req.query.page as string) ?? "1", 10);
    if (isNaN(id_group)) return badRequest(res, "ID groupe invalide");
    ok(res, await chatRepository.getGroupMessages(id_admin, id_group, page));
  } catch (e) { handle(res, e); }
};

// ─── POST /api/admin/chat/:id_other  (texte direct) ─────────────────────────
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const id_admin = req.admin!.id_admin;
    const id_other = parseInt(req.params.id_other, 10);
    if (isNaN(id_other)) return badRequest(res, "ID admin invalide");

    const parsed = SendSchema.parse(req.body);
    if (!parsed.contenu?.trim() && !parsed.fichier_url) {
      return badRequest(res, "Contenu ou fichier requis.");
    }

    const msg = await chatRepository.send(id_admin, id_other, {
      contenu: parsed.contenu?.trim() ?? "",
      type_message: parsed.type_message,
      fichier_url: parsed.fichier_url,
      fichier_nom: parsed.fichier_nom,
      fichier_size: parsed.fichier_size,
    });

    await notifyAdmins(
      [id_other],
      id_admin,
      "Nouveau message interne",
      previewFromMessage(msg),
      msg?.emetteur.nom ?? "Administrateur"
    );

    chatSseNotifyMany([id_admin, id_other], { kind: "created", message: msg });
    ok(res, msg);
  } catch (e) { handle(res, e); }
};

// ─── POST /api/admin/chat/:id_other/upload  (direct) ────────────────────────
export const sendFileMessage = [
  upload.single("fichier"),
  async (req: Request, res: Response) => {
    try {
      const id_admin = req.admin!.id_admin;
      const id_other = parseInt(req.params.id_other, 10);
      if (isNaN(id_other)) return badRequest(res, "ID admin invalide");
      if (!req.file) return badRequest(res, "Aucun fichier reçu.");

      const url = fileUrl(req, req.file.filename);
      const isImg = req.file.mimetype.startsWith("image/");
      const isPdf = req.file.mimetype === "application/pdf";
      const type = isImg ? "image" : isPdf ? "pdf" : "fichier";
      const contenu = (req.body?.contenu ?? "").slice(0, 500);

      const msg = await chatRepository.send(id_admin, id_other, {
        contenu,
        type_message: type,
        fichier_url: url,
        fichier_nom: req.file.originalname,
        fichier_size: req.file.size,
      });

      await notifyAdmins(
        [id_other],
        id_admin,
        "Nouvelle pièce jointe interne",
        previewFromMessage(msg),
        msg?.emetteur.nom ?? "Administrateur"
      );

      chatSseNotifyMany([id_admin, id_other], { kind: "created", message: msg });
      ok(res, msg);
    } catch (e) { handle(res, e); }
  },
];

// ─── POST /api/admin/chat/groups/:id_group/messages ─────────────────────────
export const sendGroupMessage = async (req: Request, res: Response) => {
  try {
    const id_admin = req.admin!.id_admin;
    const id_group = parseInt(req.params.id_group, 10);
    if (isNaN(id_group)) return badRequest(res, "ID groupe invalide");

    const parsed = SendSchema.parse(req.body);
    if (!parsed.contenu?.trim() && !parsed.fichier_url) {
      return badRequest(res, "Contenu ou fichier requis.");
    }

    const msg = await chatRepository.sendGroupMessage(id_admin, id_group, {
      contenu: parsed.contenu?.trim() ?? "",
      type_message: parsed.type_message,
      fichier_url: parsed.fichier_url,
      fichier_nom: parsed.fichier_nom,
      fichier_size: parsed.fichier_size,
    });

    const memberIds = await chatRepository.getGroupMemberIds(id_group);
    await notifyAdmins(
      memberIds,
      id_admin,
      `Nouveau message dans ${msg?.group_name ?? "le groupe"}`,
      previewFromMessage(msg),
      msg?.emetteur.nom ?? "Administrateur",
      `/admin/chat?group=${id_group}`
    );

    chatSseNotifyMany(memberIds, { kind: "created", message: msg });
    ok(res, msg);
  } catch (e) { handle(res, e); }
};

// ─── POST /api/admin/chat/groups/:id_group/messages/upload ──────────────────
export const sendGroupFileMessage = [
  upload.single("fichier"),
  async (req: Request, res: Response) => {
    try {
      const id_admin = req.admin!.id_admin;
      const id_group = parseInt(req.params.id_group, 10);
      if (isNaN(id_group)) return badRequest(res, "ID groupe invalide");
      if (!req.file) return badRequest(res, "Aucun fichier reçu.");

      const url = fileUrl(req, req.file.filename);
      const isImg = req.file.mimetype.startsWith("image/");
      const isPdf = req.file.mimetype === "application/pdf";
      const type = isImg ? "image" : isPdf ? "pdf" : "fichier";
      const contenu = (req.body?.contenu ?? "").slice(0, 500);

      const msg = await chatRepository.sendGroupMessage(id_admin, id_group, {
        contenu,
        type_message: type,
        fichier_url: url,
        fichier_nom: req.file.originalname,
        fichier_size: req.file.size,
      });

      const memberIds = await chatRepository.getGroupMemberIds(id_group);
      await notifyAdmins(
        memberIds,
        id_admin,
        `Nouvelle pièce jointe dans ${msg?.group_name ?? "le groupe"}`,
        previewFromMessage(msg),
        msg?.emetteur.nom ?? "Administrateur",
        `/admin/chat?group=${id_group}`
      );

      chatSseNotifyMany(memberIds, { kind: "created", message: msg });
      ok(res, msg);
    } catch (e) { handle(res, e); }
  },
];

// ─── GET /api/admin/chat/unread ─────────────────────────────────────────────
export const getUnread = async (req: Request, res: Response) => {
  try {
    const id_admin = req.admin!.id_admin;
    ok(res, { unread: await chatRepository.totalUnread(id_admin) });
  } catch (e) { handle(res, e); }
};

// ─── PATCH /api/admin/chat/:id_other/read ───────────────────────────────────
export const markRead = async (req: Request, res: Response) => {
  try {
    const id_admin = req.admin!.id_admin;
    const id_other = parseInt(req.params.id_other, 10);
    await chatRepository.markRead(id_admin, id_other);
    ok(res, { ok: true });
  } catch (e) { handle(res, e); }
};

// ─── PATCH /api/admin/chat/groups/:id_group/read ────────────────────────────
export const markGroupRead = async (req: Request, res: Response) => {
  try {
    const id_admin = req.admin!.id_admin;
    const id_group = parseInt(req.params.id_group, 10);
    if (isNaN(id_group)) return badRequest(res, "ID groupe invalide");
    ok(res, await chatRepository.markGroupRead(id_admin, id_group));
  } catch (e) { handle(res, e); }
};

// ─── PATCH /api/admin/chat/message/:id_msg ──────────────────────────────────
export const updateMessage = async (req: Request, res: Response) => {
  try {
    const id_admin = req.admin!.id_admin;
    const id_msg = parseInt(req.params.id_msg, 10);
    if (isNaN(id_msg)) return badRequest(res, "ID message invalide");

    const parsed = UpdateSchema.parse(req.body);
    const msg = await chatRepository.updateMessage(id_msg, id_admin, parsed.contenu);

    await notifyAdmins(
      [msg!.id_to as number],
      id_admin,
      "Message modifié",
      previewFromMessage(msg),
      msg?.emetteur.nom ?? "Administrateur"
    );

    chatSseNotifyMany([msg!.id_from, msg!.id_to as number], { kind: "updated", message: msg });
    ok(res, msg);
  } catch (e) { handle(res, e); }
};

// ─── PATCH /api/admin/chat/group-message/:id_msg ────────────────────────────
export const updateGroupMessage = async (req: Request, res: Response) => {
  try {
    const id_admin = req.admin!.id_admin;
    const id_msg = parseInt(req.params.id_msg, 10);
    if (isNaN(id_msg)) return badRequest(res, "ID message invalide");

    const parsed = UpdateSchema.parse(req.body);
    const msg = await chatRepository.updateGroupMessage(id_msg, id_admin, parsed.contenu);
    const memberIds = await chatRepository.getGroupMemberIds(msg!.id_group as number);

    await notifyAdmins(
      memberIds,
      id_admin,
      `Message modifié dans ${msg?.group_name ?? "le groupe"}`,
      previewFromMessage(msg),
      msg?.emetteur.nom ?? "Administrateur",
      `/admin/chat?group=${msg?.id_group ?? ""}`
    );

    chatSseNotifyMany(memberIds, { kind: "updated", message: msg });
    ok(res, msg);
  } catch (e) { handle(res, e); }
};

// ─── DELETE /api/admin/chat/message/:id_msg ─────────────────────────────────
export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const id_admin = req.admin!.id_admin;
    const id_msg = parseInt(req.params.id_msg, 10);
    if (isNaN(id_msg)) return badRequest(res, "ID message invalide");

    const msg = await chatRepository.deleteMessage(id_msg, id_admin);

    await notifyAdmins(
      [msg!.id_to as number],
      id_admin,
      "Message supprimé",
      "Un message interne a été supprimé",
      msg?.emetteur.nom ?? "Administrateur"
    );

    chatSseNotifyMany([msg!.id_from, msg!.id_to as number], { kind: "deleted", message: msg });
    ok(res, msg);
  } catch (e) { handle(res, e); }
};

// ─── DELETE /api/admin/chat/group-message/:id_msg ───────────────────────────
export const deleteGroupMessage = async (req: Request, res: Response) => {
  try {
    const id_admin = req.admin!.id_admin;
    const id_msg = parseInt(req.params.id_msg, 10);
    if (isNaN(id_msg)) return badRequest(res, "ID message invalide");

    const msg = await chatRepository.deleteGroupMessage(id_msg, id_admin);
    const memberIds = await chatRepository.getGroupMemberIds(msg!.id_group as number);

    await notifyAdmins(
      memberIds,
      id_admin,
      `Message supprimé dans ${msg?.group_name ?? "le groupe"}`,
      "Un message de groupe a été supprimé",
      msg?.emetteur.nom ?? "Administrateur",
      `/admin/chat?group=${msg?.id_group ?? ""}`
    );

    chatSseNotifyMany(memberIds, { kind: "deleted", message: msg });
    ok(res, msg);
  } catch (e) { handle(res, e); }
};

// ─── POST /api/admin/chat/message/:id_msg/thumb ─────────────────────────────
export const toggleThumb = async (req: Request, res: Response) => {
  try {
    const id_admin = req.admin!.id_admin;
    const id_msg = parseInt(req.params.id_msg, 10);
    if (isNaN(id_msg)) return badRequest(res, "ID message invalide");

    const msg = await chatRepository.toggleThumb(id_msg, id_admin);
    const otherId = msg!.id_from === id_admin ? (msg!.id_to as number) : msg!.id_from;

    await notifyAdmins(
      [otherId],
      id_admin,
      "Réaction sur un message",
      `${msg?.emetteur.nom ?? "Un administrateur"} a réagi avec un thumb`,
      msg?.emetteur.nom ?? "Administrateur"
    );

    chatSseNotifyMany([msg!.id_from, msg!.id_to as number], { kind: "thumb", message: msg });
    ok(res, msg);
  } catch (e) { handle(res, e); }
};

// ─── POST /api/admin/chat/group-message/:id_msg/thumb ───────────────────────
export const toggleGroupThumb = async (req: Request, res: Response) => {
  try {
    const id_admin = req.admin!.id_admin;
    const id_msg = parseInt(req.params.id_msg, 10);
    if (isNaN(id_msg)) return badRequest(res, "ID message invalide");

    const msg = await chatRepository.toggleGroupThumb(id_msg, id_admin);
    const memberIds = await chatRepository.getGroupMemberIds(msg!.id_group as number);

    await notifyAdmins(
      memberIds,
      id_admin,
      `Réaction dans ${msg?.group_name ?? "le groupe"}`,
      `${msg?.emetteur.nom ?? "Un administrateur"} a réagi avec un thumb`,
      msg?.emetteur.nom ?? "Administrateur",
      `/admin/chat?group=${msg?.id_group ?? ""}`
    );

    chatSseNotifyMany(memberIds, { kind: "thumb", message: msg });
    ok(res, msg);
  } catch (e) { handle(res, e); }
};

// ─── GET /api/admin/chat/trace ──────────────────────────────────────────────
export const getTrace = async (req: Request, res: Response) => {
  try {
    const id_admin = req.admin!.id_admin;
    ok(res, await chatRepository.getTrace(id_admin));
  } catch (e) { handle(res, e); }
};

// ─── SSE : GET /api/admin/chat/events ───────────────────────────────────────
const sseClients = new Map<number, Response[]>();

export const sseEvents = (req: Request, res: Response) => {
  const id_admin = req.admin!.id_admin;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const ping = setInterval(() => res.write(": ping\n\n"), 25_000);

  if (!sseClients.has(id_admin)) sseClients.set(id_admin, []);
  sseClients.get(id_admin)!.push(res);

  req.on("close", () => {
    clearInterval(ping);
    const arr = sseClients.get(id_admin) ?? [];
    sseClients.set(id_admin, arr.filter((client) => client !== res));
  });
};

export function chatSseNotify(id_admin: number, payload: unknown) {
  const clients = sseClients.get(id_admin) ?? [];
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  clients.forEach((client) => {
    try { client.write(data); } catch {}
  });
}

export function chatSseNotifyMany(ids: number[], payload: unknown) {
  [...new Set(ids)].forEach((id_admin) => chatSseNotify(id_admin, payload));
}
