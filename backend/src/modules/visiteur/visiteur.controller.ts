// src/modules/visiteur/visiteur.controller.ts
import { Request, Response } from "express";
import { visiteurService } from "./visiteur.service";
import { TrackSchema, VisiteurQuerySchema } from "./visiteur.schema";
import { ok, badRequest, notFound, serverError } from "../../lib/response";

const parseId = (p: string) => { const n = Number(p); return isNaN(n) ? null : n; };
const handle  = (res: Response, err: unknown) => {
  const e = err as any;
  if (e?.status === 404) return notFound(res, e.message);
  if (e?.name === "ZodError") return badRequest(res, JSON.stringify(e.errors));
  console.error("[visiteur.controller]", err);
  return serverError(res);
};

// Public
export const track = async (req: Request, res: Response) => {
  try {
    const dto        = TrackSchema.parse(req.body);
    const ip         = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.ip ?? "unknown";
    const user_agent = req.headers["user-agent"] ?? null;
    const token      = await visiteurService.track(dto, ip, user_agent);
    ok(res, { token_visiteur: token });
  } catch (e) { handle(res, e); }
};

// Admin
export const list    = async (req: Request, res: Response) => {
  try { const q = VisiteurQuerySchema.parse(req.query); const r = await visiteurService.list(q); ok(res, r.data, r.meta); } catch (e) { handle(res, e); }
};
export const getById = async (req: Request, res: Response) => {
  try { const id = parseId(req.params.id); if (!id) return badRequest(res, "ID invalide"); ok(res, await visiteurService.getById(id)); } catch (e) { handle(res, e); }
};
