// src/modules/marque/marque.controller.ts
import { Request, Response } from "express";
import { marqueService } from "./marque.service";
import { CreateMarqueSchema, UpdateMarqueSchema } from "./marque.schema";
import { ok, created, badRequest, notFound, conflict, serverError } from "../../lib/response";

const parseId = (p: string) => { const n = Number(p); return isNaN(n) ? null : n; };
const handleError = (res: Response, err: unknown) => {
  const e = err as any;
  if (e?.status === 404) return notFound(res, e.message);
  if (e?.status === 409) return conflict(res, e.message);
  if (e?.name === "ZodError") return badRequest(res, JSON.stringify(e.errors));
  console.error("[marque.controller]", err);
  return serverError(res);
};

export const listPublic      = async (req: Request, res: Response) => { try { ok(res, await marqueService.listPublic()); } catch (e) { handleError(res, e); } };
export const getBySlugPublic = async (req: Request, res: Response) => { try { ok(res, await marqueService.getBySlugPublic(req.params.slug)); } catch (e) { handleError(res, e); } };
export const list            = async (req: Request, res: Response) => { try { ok(res, await marqueService.list()); } catch (e) { handleError(res, e); } };
export const getById         = async (req: Request, res: Response) => {
  try { const id = parseId(req.params.id); if (!id) return badRequest(res, "ID invalide"); ok(res, await marqueService.getById(id)); } catch (e) { handleError(res, e); }
};
export const create          = async (req: Request, res: Response) => {
  try { const dto = CreateMarqueSchema.parse(req.body); created(res, await marqueService.create(dto, req.admin!.id_admin)); } catch (e) { handleError(res, e); }
};
export const update          = async (req: Request, res: Response) => {
  try { const id = parseId(req.params.id); if (!id) return badRequest(res, "ID invalide"); const dto = UpdateMarqueSchema.parse(req.body); ok(res, await marqueService.update(id, dto, req.admin!.id_admin)); } catch (e) { handleError(res, e); }
};
export const remove          = async (req: Request, res: Response) => {
  try { const id = parseId(req.params.id); if (!id) return badRequest(res, "ID invalide"); await marqueService.delete(id, req.admin!.id_admin); ok(res, { message: "Marque supprimée" }); } catch (e) { handleError(res, e); }
};
