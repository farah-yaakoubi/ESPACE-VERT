// src/modules/rdv/rdv.controller.ts
import { Request, Response } from "express";
import { rdvService } from "./rdv.service";
import { CreateRdvSchema, UpdateRdvSchema, RdvQuerySchema } from "./rdv.schema";
import { ok, created, badRequest, notFound, serverError } from "../../lib/response";

const parseId = (p: string) => { const n = Number(p); return isNaN(n) ? null : n; };

const handleError = (res: Response, err: unknown) => {
  const e = err as Record<string, unknown>;
  if (e?.status === 404) return notFound(res, String(e.message));
  if (e?.status === 400) return badRequest(res, String(e.message));
  if (e?.status === 422) return res.status(422).json({ success: false, error: e.message });
  console.error("[RdvController]", err);
  return serverError(res);
};

export const getCreneaux = (_req: Request, res: Response) => {
  ok(res, rdvService.getCreneaux());
};

export const book = async (req: Request, res: Response) => {
  try {
    const dto  = CreateRdvSchema.parse(req.body);
    const data = await rdvService.book(dto);
    created(res, data);
  } catch (err) {
    if ((err as any)?.name === "ZodError") return badRequest(res, JSON.stringify((err as any).errors));
    handleError(res, err);
  }
};

export const list = async (req: Request, res: Response) => {
  try {
    const params = RdvQuerySchema.parse(req.query);
    const result = await rdvService.list(params);
    ok(res, result.data, result.meta);
  } catch (err) { handleError(res, err); }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return badRequest(res, "ID invalide");
    const data = await rdvService.getById(id);
    ok(res, data);
  } catch (err) { handleError(res, err); }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return badRequest(res, "ID invalide");
    const dto  = UpdateRdvSchema.parse(req.body);
    const data = await rdvService.update(id, dto, req.admin!.id_admin);
    ok(res, data);
  } catch (err) {
    if ((err as any)?.name === "ZodError") return badRequest(res, JSON.stringify((err as any).errors));
    handleError(res, err);
  }
};

export const stats = async (_req: Request, res: Response) => {
  try {
    const data = await rdvService.stats();
    ok(res, data);
  } catch (err) { handleError(res, err); }
};
