// src/modules/faq/faq.controller.ts
import { Request, Response } from "express";
import { faqService } from "./faq.service";
import { CreateFaqSchema, UpdateFaqSchema, FaqQuerySchema } from "./faq.schema";
import { ok, created, badRequest, notFound, serverError } from "../../lib/response";

const parseId = (p: string) => { const n = Number(p); return isNaN(n) ? null : n; };
const handleError = (res: Response, err: unknown) => {
  const e = err as Record<string, unknown>;
  if (e?.status === 404) return notFound(res, String(e.message));
  console.error("[FaqController]", err);
  return serverError(res);
};

export const listPublic = async (req: Request, res: Response) => {
  try {
    const params = FaqQuerySchema.parse(req.query);
    const data   = await faqService.listPublic(params);
    ok(res, data);
  } catch (err) { handleError(res, err); }
};

export const getCategories = async (_req: Request, res: Response) => {
  try { ok(res, await faqService.getCategories()); }
  catch (err) { handleError(res, err); }
};

export const listAdmin = async (req: Request, res: Response) => {
  try {
    const params = FaqQuerySchema.parse(req.query);
    ok(res, await faqService.listAdmin(params));
  } catch (err) { handleError(res, err); }
};

export const create = async (req: Request, res: Response) => {
  try {
    const dto  = CreateFaqSchema.parse(req.body);
    const data = await faqService.create(dto, req.admin!.id_admin);
    created(res, data);
  } catch (err) {
    if ((err as any)?.name === "ZodError") return badRequest(res, JSON.stringify((err as any).errors));
    handleError(res, err);
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id   = parseId(req.params.id);
    if (!id) return badRequest(res, "ID invalide");
    const dto  = UpdateFaqSchema.parse(req.body);
    const data = await faqService.update(id, dto, req.admin!.id_admin);
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
    await faqService.delete(id, req.admin!.id_admin);
    ok(res, { message: "FAQ supprimée" });
  } catch (err) { handleError(res, err); }
};
