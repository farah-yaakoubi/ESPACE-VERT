// src/modules/rdv/rdv.controller.ts
import { Request, Response } from "express";
import { rdvService } from "./rdv.service";
import { CreateRdvSchema, UpdateRdvSchema, RdvQuerySchema } from "./rdv.schema";
import { ok, created, badRequest, notFound, serverError } from "../../lib/response";

const parseId = (p: string) => { const n = Number(p); return isNaN(n) ? null : n; };
const handle  = (res: Response, err: unknown) => {
  const e = err as any;
  if (e?.status === 404) return notFound(res, e.message);
  if (e?.status === 400) return badRequest(res, e.message);
  if (e?.name === "ZodError") return badRequest(res, JSON.stringify(e.errors));
  console.error("[rdv.controller]", err);
  return serverError(res);
};

// Public
export const getCreneaux = (_req: Request, res: Response) => {
  ok(res, rdvService.getCreneaux());
};

export const book = async (req: Request, res: Response) => {
  try {
    const dto = CreateRdvSchema.parse(req.body);
    const rdv = await rdvService.book(dto);
    created(res, {
      id_rdv:         rdv.id_rdv,
      nom:            rdv.nom,
      date_souhaitee: rdv.date_souhaitee,
      statut:         rdv.statut,
      message:        "Rendez-vous enregistré. Nous vous contacterons pour confirmer.",
    });
  } catch (e) { handle(res, e); }
};

// Admin
export const list    = async (req: Request, res: Response) => {
  try { const q = RdvQuerySchema.parse(req.query); const r = await rdvService.list(q); ok(res, r.data, r.meta); } catch (e) { handle(res, e); }
};
export const getById = async (req: Request, res: Response) => {
  try { const id = parseId(req.params.id); if (!id) return badRequest(res, "ID invalide"); ok(res, await rdvService.getById(id)); } catch (e) { handle(res, e); }
};
export const update  = async (req: Request, res: Response) => {
  try { const id = parseId(req.params.id); if (!id) return badRequest(res, "ID invalide"); ok(res, await rdvService.update(id, UpdateRdvSchema.parse(req.body), req.admin!.id_admin)); } catch (e) { handle(res, e); }
};
