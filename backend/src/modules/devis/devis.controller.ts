// src/modules/devis/devis.controller.ts
// HTTP layer only — parse → service → response
import { Request, Response } from "express";
import { devisService } from "./devis.service";
import { CreateDevisSchema, UpdateDevisSchema, DevisQuerySchema } from "./devis.schema";
import { ok, created, badRequest, notFound, conflict, serverError } from "../../lib/response";

const parseId = (p: string) => { const n = Number(p); return isNaN(n) ? null : n; };

const handleError = (res: Response, err: unknown) => {
  const e = err as Record<string, unknown>;
  if (e?.status === 404) return notFound(res,   String(e.message));
  if (e?.status === 409) return conflict(res,   String(e.message));
  if (e?.status === 400) return badRequest(res, String(e.message));
  if (e?.status === 422) return res.status(422).json({ success: false, error: e.message });
  console.error("[DevisController]", err);
  return serverError(res);
};

// ── PUBLIC ────────────────────────────────────────────────────────────────────

export const submit = async (req: Request, res: Response) => {
  try {
    const dto  = CreateDevisSchema.parse(req.body);
    const data = await devisService.submit(dto);
    created(res, data);
  } catch (err) {
    if ((err as any)?.name === "ZodError") return badRequest(res, JSON.stringify((err as any).errors));
    handleError(res, err);
  }
};

// ── ADMIN ─────────────────────────────────────────────────────────────────────

export const list = async (req: Request, res: Response) => {
  try {
    const params = DevisQuerySchema.parse(req.query);
    const result = await devisService.list(params);
    ok(res, result.data, result.meta);
  } catch (err) { handleError(res, err); }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return badRequest(res, "ID invalide");
    const data = await devisService.getById(id);
    ok(res, data);
  } catch (err) { handleError(res, err); }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return badRequest(res, "ID invalide");
    const dto  = UpdateDevisSchema.parse(req.body);
    const data = await devisService.update(id, dto, req.admin!.id_admin);
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
    await devisService.delete(id, req.admin!.id_admin);
    ok(res, { message: "Devis supprimé" });
  } catch (err) { handleError(res, err); }
};

export const stats = async (_req: Request, res: Response) => {
  try {
    const data = await devisService.stats();
    ok(res, data);
  } catch (err) { handleError(res, err); }
};
