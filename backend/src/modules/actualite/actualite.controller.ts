// src/modules/actualite/actualite.controller.ts
import { Request, Response } from "express";
import { actualiteService } from "./actualite.service";
import { CreateActualiteSchema, UpdateActualiteSchema, ActualiteQuerySchema } from "./actualite.schema";
import { ok, created, badRequest, notFound, conflict, serverError } from "../../lib/response";

const parseId = (p: string) => { const n = Number(p); return isNaN(n) ? null : n; };
const handle  = (res: Response, err: unknown) => {
  const e = err as any;
  if (e?.status === 404) return notFound(res, e.message);
  if (e?.status === 409) return conflict(res, e.message);
  if (e?.name === "ZodError") return badRequest(res, JSON.stringify(e.errors));
  console.error("[actualite.controller]", err);
  return serverError(res);
};

// Public
export const listPublic      = async (req: Request, res: Response) => {
  try { const q = ActualiteQuerySchema.parse(req.query); const r = await actualiteService.listPublic(q); ok(res, r.data, r.meta); } catch (e) { handle(res, e); }
};
export const getBySlugPublic = async (req: Request, res: Response) => {
  try { ok(res, await actualiteService.getBySlugPublic(req.params.slug)); } catch (e) { handle(res, e); }
};

// Admin
export const list    = async (req: Request, res: Response) => {
  try { const q = ActualiteQuerySchema.parse(req.query); const r = await actualiteService.list(q); ok(res, r.data, r.meta); } catch (e) { handle(res, e); }
};
export const getById = async (req: Request, res: Response) => {
  try { const id = parseId(req.params.id); if (!id) return badRequest(res, "ID invalide"); ok(res, await actualiteService.getById(id)); } catch (e) { handle(res, e); }
};
export const create  = async (req: Request, res: Response) => {
  try { created(res, await actualiteService.create(CreateActualiteSchema.parse(req.body), req.admin!.id_admin)); } catch (e) { handle(res, e); }
};
export const update  = async (req: Request, res: Response) => {
  try { const id = parseId(req.params.id); if (!id) return badRequest(res, "ID invalide"); ok(res, await actualiteService.update(id, UpdateActualiteSchema.parse(req.body), req.admin!.id_admin)); } catch (e) { handle(res, e); }
};
export const remove  = async (req: Request, res: Response) => {
  try { const id = parseId(req.params.id); if (!id) return badRequest(res, "ID invalide"); await actualiteService.delete(id, req.admin!.id_admin); ok(res, { message: "Actualité supprimée" }); } catch (e) { handle(res, e); }
};
