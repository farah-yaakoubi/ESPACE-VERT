// src/modules/notifications/notifications.controller.ts
import { Request, Response } from "express";
import { notifRepository }   from "./notifications.repository";
import { ok, serverError }   from "../../lib/response";

const handle = (res: Response, err: unknown) => {
  console.error("[notif.controller]", err);
  return serverError(res);
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
