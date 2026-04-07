// src/modules/categorie/categorie.controller.ts
import { Request, Response } from "express";
import { categorieService } from "./categorie.service";
import { CreateCategorieSchema, UpdateCategorieSchema, CategorieQuerySchema } from "./categorie.schema";
import { ok, created, badRequest, notFound, conflict, serverError } from "../../lib/response";

const parseId = (p: string) => { const n = Number(p); return isNaN(n) ? null : n; };
const handle  = (res: Response, err: unknown) => {
  const e = err as any;
  if (e?.status === 404) return notFound(res, e.message);
  if (e?.status === 409) return conflict(res, e.message);
  if (e?.name === "ZodError") return badRequest(res, JSON.stringify(e.errors));
  console.error("[categorie.controller]", err);
  return serverError(res);
};

export const listPublic = async (req: Request, res: Response) => {
  try { const q = CategorieQuerySchema.parse(req.query); ok(res, await categorieService.listPublic(q)); } catch (e) { handle(res, e); }
};
export const list = async (req: Request, res: Response) => {
  try { const q = CategorieQuerySchema.parse(req.query); ok(res, await categorieService.list(q)); } catch (e) { handle(res, e); }
};
export const getById = async (req: Request, res: Response) => {
  try { const id = parseId(req.params.id); if (!id) return badRequest(res, "ID invalide"); ok(res, await categorieService.getById(id)); } catch (e) { handle(res, e); }
};
export const create = async (req: Request, res: Response) => {
  try { created(res, await categorieService.create(CreateCategorieSchema.parse(req.body), req.admin!.id_admin)); } catch (e) { handle(res, e); }
};
export const update = async (req: Request, res: Response) => {
  try { const id = parseId(req.params.id); if (!id) return badRequest(res, "ID invalide"); ok(res, await categorieService.update(id, UpdateCategorieSchema.parse(req.body), req.admin!.id_admin)); } catch (e) { handle(res, e); }
};
export const remove = async (req: Request, res: Response) => {
  try { const id = parseId(req.params.id); if (!id) return badRequest(res, "ID invalide"); await categorieService.delete(id, req.admin!.id_admin); ok(res, { message: "Catégorie supprimée" }); } catch (e) { handle(res, e); }
};
