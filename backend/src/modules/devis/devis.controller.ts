// src/modules/devis/devis.controller.ts
import { Request, Response } from "express";
import { devisService } from "./devis.service";
import { CreateDevisSchema, UpdateDevisSchema, DevisQuerySchema } from "./devis.schema";
import { ok, created, badRequest, notFound, serverError } from "../../lib/response";

const parseId = (p: string) => { const n = Number(p); return isNaN(n) ? null : n; };
const handle  = (res: Response, err: unknown) => {
  const e = err as any;
  if (e?.status === 404) return notFound(res, e.message);
  if (e?.status === 400) return badRequest(res, e.message);
  if (e?.name === "ZodError") return badRequest(res, JSON.stringify(e.errors));
  console.error("[devis.controller]", err);
  return serverError(res);
};

// Public
export const submit = async (req: Request, res: Response) => {
  try {
    const dto  = CreateDevisSchema.parse(req.body);
    const data = await devisService.submit(dto);
    created(res, {
      id_devis: data.id_devis,
      nom:      data.nom,
      produit:  (data as any).produit?.nom ?? null,
      message:  "Demande de devis enregistrée. Nous vous répondrons rapidement.",
    });
  } catch (e) { handle(res, e); }
};

// Admin
export const list    = async (req: Request, res: Response) => {
  try { const q = DevisQuerySchema.parse(req.query); const r = await devisService.list(q); ok(res, r.data, r.meta); } catch (e) { handle(res, e); }
};
export const getById = async (req: Request, res: Response) => {
  try { const id = parseId(req.params.id); if (!id) return badRequest(res, "ID invalide"); ok(res, await devisService.getById(id)); } catch (e) { handle(res, e); }
};
export const update  = async (req: Request, res: Response) => {
  try { const id = parseId(req.params.id); if (!id) return badRequest(res, "ID invalide"); ok(res, await devisService.update(id, UpdateDevisSchema.parse(req.body), req.admin!.id_admin)); } catch (e) { handle(res, e); }
};
export const remove  = async (req: Request, res: Response) => {
  try { const id = parseId(req.params.id); if (!id) return badRequest(res, "ID invalide"); await devisService.delete(id, req.admin!.id_admin); ok(res, { message: "Devis supprimé" }); } catch (e) { handle(res, e); }
};
