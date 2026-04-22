// src/modules/contact/contact.controller.ts
import { Request, Response } from "express";
import { contactService } from "./contact.service";
import { CreateContactSchema, ReplyContactSchema, ContactQuerySchema } from "./contact.schema";
import { ok, created, badRequest, notFound, conflict, serverError } from "../../lib/response";

const parseId = (p: string) => { const n = Number(p); return isNaN(n) ? null : n; };

const handleError = (res: Response, err: unknown) => {
  const e = err as Record<string, unknown>;
  if (e?.status === 404) return notFound(res, String(e.message));
  if (e?.status === 409) return conflict(res, String(e.message));
  if (e?.status === 400) return badRequest(res, String(e.message));
  console.error("[ContactController]", err);
  return serverError(res);
};

export const send = async (req: Request, res: Response) => {
  try {
    const dto  = CreateContactSchema.parse(req.body);
    const data = await contactService.send(dto);
    created(res, data);
  } catch (err) {
    if ((err as any)?.name === "ZodError") return badRequest(res, JSON.stringify((err as any).errors));
    handleError(res, err);
  }
};

export const list = async (req: Request, res: Response) => {
  try {
    const params = ContactQuerySchema.parse(req.query);
    const result = await contactService.list(params);
    ok(res, result.data, result.meta);
  } catch (err) { handleError(res, err); }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return badRequest(res, "ID invalide");
    const data = await contactService.getById(id);
    // Auto-mark as read on admin view
    if (!data.lu) await contactService.markRead(id, req.admin!.id_admin);
    ok(res, { ...data, lu: true });
  } catch (err) { handleError(res, err); }
};

export const reply = async (req: Request, res: Response) => {
  try {
    const id  = parseId(req.params.id);
    if (!id) return badRequest(res, "ID invalide");
    const dto  = ReplyContactSchema.parse(req.body);
    const data = await contactService.reply(id, dto, req.admin!.id_admin);
    ok(res, data);
  } catch (err) {
    if ((err as any)?.name === "ZodError") return badRequest(res, JSON.stringify((err as any).errors));
    handleError(res, err);
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return badRequest(res, "ID invalide");
    await contactService.delete(id, req.admin!.id_admin);
    ok(res, { message: "Message supprimé" });
  } catch (err) { handleError(res, err); }
};

export const countUnread = async (_req: Request, res: Response) => {
  try {
    const count = await contactService.countUnread();
    ok(res, { count });
  } catch (err) { handleError(res, err); }
};
