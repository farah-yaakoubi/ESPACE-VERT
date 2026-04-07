// src/modules/activite/activite.controller.ts
import { Request, Response } from "express";
import { activiteService } from "./activite.service";
import { CreateActiviteSchema, UpdateActiviteSchema } from "./activite.schema";
import { ok, created, badRequest, notFound, conflict, serverError } from "../../lib/response";

const parseId = (p: string) => { const n = Number(p); return isNaN(n) ? null : n; };
const handle  = (res: Response, err: unknown) => {
  const e = err as any;
  if (e?.status === 404) return notFound(res, e.message);
  if (e?.status === 409) return conflict(res, e.message);
  if (e?.name === "ZodError") return badRequest(res, JSON.stringify(e.errors));
  console.error("[activite.controller]", err);
  return serverError(res);
};

export const listPublic = async (_req: Request, res: Response) => { try { ok(res, await activiteService.listPublic()); } catch (e) { handle(res, e); } };
export const list       = async (_req: Request, res: Response) => { try { ok(res, await activiteService.list()); } catch (e) { handle(res, e); } };
export const getById    = async (req: Request, res: Response) => {
  try { const id = parseId(req.params.id); if (!id) return badRequest(res, "ID invalide"); ok(res, await activiteService.getById(id)); } catch (e) { handle(res, e); }
};
export const create     = async (req: Request, res: Response) => {
  try { const dto = CreateActiviteSchema.parse(req.body); created(res, await activiteService.create(dto, req.admin!.id_admin)); } catch (e) { handle(res, e); }
};
export const update     = async (req: Request, res: Response) => {
  try { const id = parseId(req.params.id); if (!id) return badRequest(res, "ID invalide"); ok(res, await activiteService.update(id, UpdateActiviteSchema.parse(req.body), req.admin!.id_admin)); } catch (e) { handle(res, e); }
};
export const remove     = async (req: Request, res: Response) => {
  try { const id = parseId(req.params.id); if (!id) return badRequest(res, "ID invalide"); await activiteService.delete(id, req.admin!.id_admin); ok(res, { message: "Activité supprimée" }); } catch (e) { handle(res, e); }
};
