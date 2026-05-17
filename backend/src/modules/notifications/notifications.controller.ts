// src/modules/notifications/notifications.controller.ts
import { Request, Response } from "express";
import { notifRepository }   from "./notifications.repository";
import { ok, serverError }   from "../../lib/response";

const handle = (res: Response, err: unknown) => {
  console.error("[notif.controller]", err);
  return serverError(res);
};

// ─── SSE : connexions actives par admin ──────────────────────────────────────
const sseClients = new Map<number, Response[]>();

/** Diffuser un événement "new_notif" à tous les clients SSE d'un admin */
export function notifSseNotify(id_admin: number, payload: unknown) {
  const clients = sseClients.get(id_admin) ?? [];
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  clients.forEach(r => { try { r.write(data); } catch {} });
}

/** Diffuser à TOUS les admins connectés (ex : nouveau devis/rdv/message) */
export function notifSseBroadcast(payload: unknown) {
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  sseClients.forEach(clients => {
    clients.forEach(r => { try { r.write(data); } catch {} });
  });
}

// GET /api/admin/notifications/events  — flux SSE
export const sseEvents = (req: Request, res: Response) => {
  const id_admin = (req as any).admin.id_admin as number;

  res.setHeader("Content-Type",       "text/event-stream");
  res.setHeader("Cache-Control",      "no-cache");
  res.setHeader("Connection",         "keep-alive");
  res.setHeader("X-Accel-Buffering",  "no");
  res.flushHeaders();

  // Keepalive toutes les 25s
  const ping = setInterval(() => { try { res.write(": ping\n\n"); } catch {} }, 25_000);

  if (!sseClients.has(id_admin)) sseClients.set(id_admin, []);
  sseClients.get(id_admin)!.push(res);

  req.on("close", () => {
    clearInterval(ping);
    const arr = sseClients.get(id_admin) ?? [];
    sseClients.set(id_admin, arr.filter(r => r !== res));
  });
};

// GET /api/admin/notifications
export const list = async (req: Request, res: Response) => {
  try {
    const id_admin = (req as any).admin.id_admin as number;
    const [notifs, unread] = await Promise.all([
      notifRepository.findByAdmin(id_admin),
      notifRepository.countUnread(id_admin),
    ]);
    ok(res, { notifs, unread });
  } catch (e) { handle(res, e); }
};

// PATCH /api/admin/notifications/:id/lu
export const markRead = async (req: Request, res: Response) => {
  try {
    const id_admin = (req as any).admin.id_admin as number;
    const id_notif = parseInt(req.params.id);
    await notifRepository.markRead(id_notif, id_admin);
    ok(res, { success: true });
  } catch (e) { handle(res, e); }
};

// PATCH /api/admin/notifications/read-all
export const markAllRead = async (req: Request, res: Response) => {
  try {
    const id_admin = (req as any).admin.id_admin as number;
    await notifRepository.markAllRead(id_admin);
    ok(res, { success: true });
  } catch (e) { handle(res, e); }
};

// DELETE /api/admin/notifications/:id
export const remove = async (req: Request, res: Response) => {
  try {
    const id_admin = (req as any).admin.id_admin as number;
    const id_notif = parseInt(req.params.id);
    await notifRepository.delete(id_notif, id_admin);
    ok(res, { success: true });
  } catch (e) { handle(res, e); }
};

// DELETE /api/admin/notifications/clear-read
export const clearRead = async (req: Request, res: Response) => {
  try {
    const id_admin = (req as any).admin.id_admin as number;
    await notifRepository.clearRead(id_admin);
    ok(res, { success: true });
  } catch (e) { handle(res, e); }
};

