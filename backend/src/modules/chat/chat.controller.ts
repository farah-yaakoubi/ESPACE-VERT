// src/modules/chat/chat.controller.ts
import { Request, Response } from "express";
import { chatRepository }    from "./chat.repository";
import { ok, serverError }   from "../../lib/response";
import { z }                 from "zod";

const handle = (res: Response, err: unknown) => {
  console.error("[chat.controller]", err);
  return serverError(res);
};

const SendSchema = z.object({
  contenu: z.string().min(1).max(2000),
});

// GET /api/admin/chat/conversations
export const getConversations = async (req: Request, res: Response) => {
  try {
    const id_admin = (req as any).admin.id_admin as number;
    ok(res, await chatRepository.getConversations(id_admin));
  } catch (e) { handle(res, e); }
};

// GET /api/admin/chat/:id_other?page=1
export const getMessages = async (req: Request, res: Response) => {
  try {
    const id_admin = (req as any).admin.id_admin as number;
    const id_other = parseInt(req.params.id_other);
    const page     = parseInt((req.query.page as string) ?? "1");
    ok(res, await chatRepository.getMessages(id_admin, id_other, page));
  } catch (e) { handle(res, e); }
};

// POST /api/admin/chat/:id_other
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const id_admin = (req as any).admin.id_admin as number;
    const id_other = parseInt(req.params.id_other);
    const { contenu } = SendSchema.parse(req.body);
    const msg = await chatRepository.send(id_admin, id_other, contenu);
    ok(res, msg);
  } catch (e) { handle(res, e); }
};

// GET /api/admin/chat/unread
export const getUnread = async (req: Request, res: Response) => {
  try {
    const id_admin = (req as any).admin.id_admin as number;
    const count = await chatRepository.totalUnread(id_admin);
    ok(res, { unread: count });
  } catch (e) { handle(res, e); }
};
