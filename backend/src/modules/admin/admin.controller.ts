// src/modules/admin/admin.controller.ts
import { Request, Response } from "express";
import { adminService } from "./admin.service";
import { CreateAdminSchema, UpdateAdminSchema } from "./admin.schema";
import { ok, created, badRequest, notFound, conflict, serverError } from "../../lib/response";

const parseId = (p: string) => { const n = Number(p); return isNaN(n) ? null : n; };
const handle  = (res: Response, err: unknown) => {
  const e = err as any;
  if (e?.status === 404) return notFound(res, e.message);
  if (e?.status === 409) return conflict(res, e.message);
  if (e?.status === 400) return badRequest(res, e.message);
  if (e?.name === "ZodError") return badRequest(res, JSON.stringify(e.errors));
  console.error("[admin.controller]", err);
  return serverError(res);
};

export const list     = async (_req: Request, res: Response) => { try { ok(res, await adminService.list()); } catch (e) { handle(res, e); } };
export const getRoles = async (_req: Request, res: Response) => { try { ok(res, await adminService.getRoles()); } catch (e) { handle(res, e); } };
export const getById  = async (req: Request, res: Response) => {
  try { const id = parseId(req.params.id); if (!id) return badRequest(res, "ID invalide"); ok(res, await adminService.getById(id)); } catch (e) { handle(res, e); }
};
export const create   = async (req: Request, res: Response) => {
  try { created(res, await adminService.create(CreateAdminSchema.parse(req.body), req.admin!.id_admin)); } catch (e) { handle(res, e); }
};
export const update   = async (req: Request, res: Response) => {
  try { const id = parseId(req.params.id); if (!id) return badRequest(res, "ID invalide"); ok(res, await adminService.update(id, UpdateAdminSchema.parse(req.body), req.admin!.id_admin)); } catch (e) { handle(res, e); }
};
export const remove   = async (req: Request, res: Response) => {
  try { const id = parseId(req.params.id); if (!id) return badRequest(res, "ID invalide"); await adminService.delete(id, req.admin!.id_admin); ok(res, { message: "Admin supprimé" }); } catch (e) { handle(res, e); }
};
