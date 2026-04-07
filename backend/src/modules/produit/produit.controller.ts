// src/modules/produit/produit.controller.ts
// HTTP in/out uniquement — parse req, appelle service, envoie res
import { Request, Response } from "express";
import { produitService } from "./produit.service";
import {
  CreateProduitSchema, UpdateProduitSchema,
  ProduitQuerySchema, ProduitPublicQuerySchema, AddImageSchema,
} from "./produit.schema";
import { ok, created, badRequest, notFound, conflict, serverError } from "../../lib/response";

// ── Helpers ────────────────────────────────────────────────────
const parseId = (param: string) => {
  const n = Number(param);
  return isNaN(n) ? null : n;
};

const handleError = (res: Response, err: unknown) => {
  const e = err as any;
  if (e?.status === 404)       return notFound(res,    e.message);
  if (e?.status === 409)       return conflict(res,    e.message);
  if (e?.status === 400)       return badRequest(res,  e.message);
  console.error("[Controller]", err);
  return serverError(res);
};

// ══════════════════════════════════════════════════════════════
// PUBLIC
// ══════════════════════════════════════════════════════════════
export const listPublic = async (req: Request, res: Response) => {
  try {
    const params = ProduitPublicQuerySchema.parse(req.query);
    const result = await produitService.listPublic(params);
    ok(res, result.data, result.meta);
  } catch (err) { handleError(res, err); }
};

export const getBySlugPublic = async (req: Request, res: Response) => {
  try {
    const data = await produitService.getBySlugPublic(req.params.slug);
    ok(res, data);
  } catch (err) { handleError(res, err); }
};

// ══════════════════════════════════════════════════════════════
// ADMIN
// ══════════════════════════════════════════════════════════════
export const list = async (req: Request, res: Response) => {
  try {
    const params = ProduitQuerySchema.parse(req.query);
    const result = await produitService.list(params);
    ok(res, result.data, result.meta);
  } catch (err) { handleError(res, err); }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return badRequest(res, "ID invalide");
    const data = await produitService.getById(id);
    ok(res, data);
  } catch (err) { handleError(res, err); }
};

export const create = async (req: Request, res: Response) => {
  try {
    const dto  = CreateProduitSchema.parse(req.body);
    const data = await produitService.create(dto, req.admin!.id_admin);
    created(res, data);
  } catch (err) {
    if ((err as any)?.name === "ZodError") return badRequest(res, JSON.stringify((err as any).errors));
    handleError(res, err);
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id  = parseId(req.params.id);
    if (!id) return badRequest(res, "ID invalide");
    const dto  = UpdateProduitSchema.parse(req.body);
    const data = await produitService.update(id, dto, req.admin!.id_admin);
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
    await produitService.delete(id, req.admin!.id_admin);
    ok(res, { message: "Produit supprimé" });
  } catch (err) { handleError(res, err); }
};

export const addImage = async (req: Request, res: Response) => {
  try {
    const id  = parseId(req.params.id);
    if (!id) return badRequest(res, "ID invalide");
    const dto  = AddImageSchema.parse(req.body);
    const data = await produitService.addImage(id, dto, req.admin!.id_admin);
    created(res, data);
  } catch (err) {
    if ((err as any)?.name === "ZodError") return badRequest(res, JSON.stringify((err as any).errors));
    handleError(res, err);
  }
};

export const deleteImage = async (req: Request, res: Response) => {
  try {
    const imgId = parseId(req.params.imgId);
    if (!imgId) return badRequest(res, "ID image invalide");
    await produitService.deleteImage(imgId, req.admin!.id_admin);
    ok(res, { message: "Image supprimée" });
  } catch (err) { handleError(res, err); }
};
