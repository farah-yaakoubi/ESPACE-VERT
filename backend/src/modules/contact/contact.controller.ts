// src/modules/contact/contact.controller.ts
import { Request, Response } from "express";
import { contactService } from "./contact.service";
import { CreateContactSchema, UpdateContactSchema, ContactQuerySchema } from "./contact.schema";
import { ok, created, badRequest, notFound, serverError } from "../../lib/response";

const parseId = (p: string) => { const n = Number(p); return isNaN(n) ? null : n; };
const handle  = (res: Response, err: unknown) => {
  const e = err as any;
  if (e?.status === 404) return notFound(res, e.message);
  if (e?.name === "ZodError") return badRequest(res, JSON.stringify(e.errors));
  console.error("[contact.controller]", err);
  return serverError(res);
};

// Public
export const send = async (req: Request, res: Response) => {
  try {
    const dto     = CreateContactSchema.parse(req.body);
    const contact = await contactService.send(dto);
    created(res, {
      id_contact: contact.id_contact,
      message:    "Message envoyé avec succès. Nous vous répondrons dans les plus brefs délais.",
    });
  } catch (e) { handle(res, e); }
};

// Admin
export const list    = async (req: Request, res: Response) => {
  try { const q = ContactQuerySchema.parse(req.query); const r = await contactService.list(q); ok(res, r.data, r.meta); } catch (e) { handle(res, e); }
};
export const getById = async (req: Request, res: Response) => {
  try { const id = parseId(req.params.id); if (!id) return badRequest(res, "ID invalide"); ok(res, await contactService.getById(id)); } catch (e) { handle(res, e); }
};
export const update  = async (req: Request, res: Response) => {
  try { const id = parseId(req.params.id); if (!id) return badRequest(res, "ID invalide"); ok(res, await contactService.update(id, UpdateContactSchema.parse(req.body), req.admin!.id_admin)); } catch (e) { handle(res, e); }
};
export const remove  = async (req: Request, res: Response) => {
  try { const id = parseId(req.params.id); if (!id) return badRequest(res, "ID invalide"); await contactService.delete(id, req.admin!.id_admin); ok(res, { message: "Message supprimé" }); } catch (e) { handle(res, e); }
};
