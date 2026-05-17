import { Request, Response } from "express";
import { chatRepository }    from "./chat.repository";
import { ok, serverError }   from "../../lib/response";
import { upload, fileUrl }   from "../../middleware/upload";
import { notifRepository }   from "../notifications/notifications.repository";
import { notifSseNotify }    from "../notifications/notifications.controller";
import { z }                 from "zod";

const handle = (res: Response, err: unknown) => {
  console.error("[chat.controller]", err);
  return serverError(res);
};

const SendSchema = z.object({
  contenu:      z.string().max(4000).optional().default(""),
  type_message: z.enum(["texte", "fichier", "image", "pdf"]).optional().default("texte"),
  fichier_url:  z.string().url().optional(),
  fichier_nom:  z.string().max(255).optional(),
  fichier_size: z.number().optional(),
});

// ─── GET /api/admin/chat/conversations ────────────────────────────────────────
export const getConversations = async (req: Request, res: Response) => {
  try {
    const id_admin = (req as any).admin.id_admin as number;
    ok(res, await chatRepository.getConversations(id_admin));
  } catch (e) { handle(res, e); }
};

// ─── GET /api/admin/chat/:id_other?page=1 ────────────────────────────────────
export const getMessages = async (req: Request, res: Response) => {
  try {
    const id_admin = (req as any).admin.id_admin as number;
    const id_other = parseInt(req.params.id_other);
    const page     = parseInt((req.query.page as string) ?? "1");
    if (isNaN(id_other)) return ok(res, { messages: [], total: 0 });
    ok(res, await chatRepository.getMessages(id_admin, id_other, page));
  } catch (e) { handle(res, e); }
};

// ─── POST /api/admin/chat/:id_other  (texte) ─────────────────────────────────
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const id_admin = (req as any).admin.id_admin as number;
    const id_other = parseInt(req.params.id_other);
    if (isNaN(id_other)) return handle(res, new Error("id_other invalide"));

    const parsed = SendSchema.parse(req.body);

    // Au moins contenu ou fichier_url requis
    if (!parsed.contenu?.trim() && !parsed.fichier_url) {
      return res.status(400).json({ error: "Contenu ou fichier requis." });
    }

    const msg = await chatRepository.send(id_admin, id_other, {
      contenu:      parsed.contenu?.trim() ?? "",
      type_message: parsed.type_message,
      fichier_url:  parsed.fichier_url,
      fichier_nom:  parsed.fichier_nom,
      fichier_size: parsed.fichier_size,
    });

    const preview = parsed.contenu?.trim()
      ? parsed.contenu.trim().slice(0, 80)
      : parsed.fichier_nom
        ? `Fichier : ${parsed.fichier_nom}`
        : "Vous avez recu un nouveau message.";

    await notifRepository.createOne(
      id_other,
      "message_interne",
      "Nouveau message interne",
      preview,
      "/admin/chat",
      {
        id_emetteur: id_admin,
        source_label: msg.emetteur.nom,
      }
    );

    // Notifier via SSE si l'autre admin est connecté
    chatSseNotify(id_other, msg);
    notifSseNotify(id_other, {
      type: "message_interne",
      titre: "Nouveau message interne",
      source_label: msg.emetteur.nom,
    });

    ok(res, msg);
  } catch (e) { handle(res, e); }
};

// ─── POST /api/admin/chat/:id_other/upload  (pièce jointe) ───────────────────
export const sendFileMessage = [
  upload.single("fichier"),
  async (req: Request, res: Response) => {
    try {
      const id_admin = (req as any).admin.id_admin as number;
      const id_other = parseInt(req.params.id_other);
      if (isNaN(id_other)) return handle(res, new Error("id_other invalide"));
      if (!req.file)       return res.status(400).json({ error: "Aucun fichier reçu." });

      const url  = fileUrl(req, req.file.filename);
      const isImg = req.file.mimetype.startsWith("image/");
      const isPdf = req.file.mimetype === "application/pdf";
      const type  = isImg ? "image" : isPdf ? "pdf" : "fichier";

      // Récupère un texte optionnel accompagnant le fichier
      const contenu = (req.body?.contenu ?? "").slice(0, 500);

      const msg = await chatRepository.send(id_admin, id_other, {
        contenu,
        type_message: type,
        fichier_url:  url,
        fichier_nom:  req.file.originalname,
        fichier_size: req.file.size,
      });

      await notifRepository.createOne(
        id_other,
        "message_interne",
        "Nouveau message interne",
        contenu.trim()
          ? contenu.trim().slice(0, 80)
          : `Fichier : ${req.file.originalname}`,
        "/admin/chat",
        {
          id_emetteur: id_admin,
          source_label: msg.emetteur.nom,
        }
      );

      chatSseNotify(id_other, msg);
      notifSseNotify(id_other, {
        type: "message_interne",
        titre: "Nouveau message interne",
        source_label: msg.emetteur.nom,
      });
      ok(res, msg);
    } catch (e) { handle(res, e); }
  },
];

// ─── GET /api/admin/chat/unread ───────────────────────────────────────────────
export const getUnread = async (req: Request, res: Response) => {
  try {
    const id_admin = (req as any).admin.id_admin as number;
    const count    = await chatRepository.totalUnread(id_admin);
    ok(res, { unread: count });
  } catch (e) { handle(res, e); }
};

// ─── PATCH /api/admin/chat/:id_other/read ────────────────────────────────────
export const markRead = async (req: Request, res: Response) => {
  try {
    const id_admin = (req as any).admin.id_admin as number;
    const id_other = parseInt(req.params.id_other);
    await chatRepository.markRead(id_admin, id_other);
    ok(res, { ok: true });
  } catch (e) { handle(res, e); }
};

// ─── SSE : GET /api/admin/chat/events ────────────────────────────────────────
// Permet aux clients de recevoir les nouveaux messages en temps réel sans polling
const sseClients = new Map<number, Response[]>();

export const sseEvents = (req: Request, res: Response) => {
  const id_admin = (req as any).admin.id_admin as number;
  res.setHeader("Content-Type",  "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection",    "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  // Keepalive toutes les 25s
  const ping = setInterval(() => res.write(": ping\n\n"), 25_000);

  if (!sseClients.has(id_admin)) sseClients.set(id_admin, []);
  sseClients.get(id_admin)!.push(res);

  req.on("close", () => {
    clearInterval(ping);
    const arr = sseClients.get(id_admin) ?? [];
    sseClients.set(id_admin, arr.filter(r => r !== res));
  });
};

export function chatSseNotify(id_to: number, payload: unknown) {
  const clients = sseClients.get(id_to) ?? [];
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  clients.forEach(r => { try { r.write(data); } catch {} });
}
