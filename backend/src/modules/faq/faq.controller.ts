// src/modules/faq/faq.controller.ts
import { Request, Response } from "express";
import { faqService } from "./faq.service";
import { CreateFaqSchema, UpdateFaqSchema, FaqQuerySchema } from "./faq.schema";
import { ok, created, badRequest, notFound, serverError } from "../../lib/response";

const parseId = (p: string) => { const n = Number(p); return isNaN(n) ? null : n; };
const handle  = (res: Response, err: unknown) => {
  const e = err as any;
  if (e?.status === 404) return notFound(res, e.message);
  if (e?.name === "ZodError") return badRequest(res, JSON.stringify(e.errors));
  console.error("[faq.controller]", err);
  return serverError(res);
};

export const listPublic = async (req: Request, res: Response) => {
  try { const q = FaqQuerySchema.parse(req.query); ok(res, await faqService.listPublic(q)); } catch (e) { handle(res, e); }
};
export const list = async (req: Request, res: Response) => {
  try { const q = FaqQuerySchema.parse(req.query); ok(res, await faqService.list(q)); } catch (e) { handle(res, e); }
};
export const getById = async (req: Request, res: Response) => {
  try { const id = parseId(req.params.id); if (!id) return badRequest(res, "ID invalide"); ok(res, await faqService.getById(id)); } catch (e) { handle(res, e); }
};
export const create = async (req: Request, res: Response) => {
  try { created(res, await faqService.create(CreateFaqSchema.parse(req.body), req.admin!.id_admin)); } catch (e) { handle(res, e); }
};
export const update = async (req: Request, res: Response) => {
  try { const id = parseId(req.params.id); if (!id) return badRequest(res, "ID invalide"); ok(res, await faqService.update(id, UpdateFaqSchema.parse(req.body), req.admin!.id_admin)); } catch (e) { handle(res, e); }
};
export const remove = async (req: Request, res: Response) => {
  try { const id = parseId(req.params.id); if (!id) return badRequest(res, "ID invalide"); await faqService.delete(id, req.admin!.id_admin); ok(res, { message: "FAQ supprimée" }); } catch (e) { handle(res, e); }
};
