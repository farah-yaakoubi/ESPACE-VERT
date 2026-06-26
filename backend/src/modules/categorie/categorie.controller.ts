// src/modules/categorie/categorie.controller.ts
import { Request, Response } from "express";
import { categorieService }    from "./categorie.service";
import { categorieRepository } from "./categorie.repository";
import { CreateCategorieSchema, UpdateCategorieSchema, CategorieQuerySchema } from "./categorie.schema";
import { z } from "zod";
import { ok, created, badRequest, notFound, conflict, serverError } from "../../lib/response";
const parseId = (p: string) => { const n = Number(p); return isNaN(n) ? null : n; };
const handle  = (res: Response, err: unknown) => {
  const e = err as { status?: number; message?: string; name?: string; errors?: unknown };
  if (e?.status === 404) return notFound(res, e.message ?? "Catégorie introuvable");
  if (e?.status === 409) return conflict(res, e.message ?? "Conflit");
  if (e?.status === 422) return badRequest(res, e.message ?? "Données invalides");
  if (e?.name === "ZodError") return badRequest(res, JSON.stringify(e.errors));
  console.error("[categorie.controller]", err);
  return serverError(res);
};

// ── Routes publiques ─────────────────────────────────────────────────────────

export const listPublic = async (req: Request, res: Response) => {
  try {
    const q = CategorieQuerySchema.parse(req.query);
    ok(res, await categorieService.listPublic(q));
  } catch (e) { handle(res, e); }
};

export const getMarqueTree = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    if (!slug) return badRequest(res, "Slug manquant");
    ok(res, await categorieService.getTreeByMarqueSlug(slug));
  } catch (e) { handle(res, e); }
};

export const getBySlugPublic = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const data = await categorieRepository.findBySlugWithChildren(slug);
    if (!data) return notFound(res, "Catégorie introuvable");
    ok(res, data);
  } catch (e) { handle(res, e); }
};

// ── Routes admin ─────────────────────────────────────────────────────────────

export const list = async (req: Request, res: Response) => {
  try {
    const q = CategorieQuerySchema.parse(req.query);
    ok(res, await categorieService.list(q));
  } catch (e) { handle(res, e); }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return badRequest(res, "ID invalide");
    ok(res, await categorieService.getById(id));
  } catch (e) { handle(res, e); }
};

export const create = async (req: Request, res: Response) => {
  try {
    created(res, await categorieService.create(CreateCategorieSchema.parse(req.body), req.admin!.id_admin));
  } catch (e) { handle(res, e); }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return badRequest(res, "ID invalide");
    ok(res, await categorieService.update(id, UpdateCategorieSchema.parse(req.body), req.admin!.id_admin));
  } catch (e) { handle(res, e); }
};

export const getDeleteImpact = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return badRequest(res, "ID invalide");
    ok(res, await categorieService.getDeleteImpact(id));
  } catch (e) { handle(res, e); }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return badRequest(res, "ID invalide");
    await categorieService.delete(id, req.admin!.id_admin);
    ok(res, { message: "Catégorie supprimée (cascade appliquée)" });
  } catch (e) { handle(res, e); }
};

// ── Suppression multiple ─────────────────────────────────────────────────────

const BulkDeleteSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1).max(200),
});

export const removeBulk = async (req: Request, res: Response) => {
  try {
    const { ids } = BulkDeleteSchema.parse(req.body);
    const results = await Promise.allSettled(
      ids.map((id) => categorieService.delete(id, req.admin!.id_admin)),
    );

    const succeeded = ids.filter((_, i) => results[i].status === "fulfilled");
    const failed    = ids.filter((_, i) => results[i].status === "rejected");

    ok(res, {
      deleted: succeeded.length,
      failed:  failed.length,
      ids_deleted: succeeded,
      ids_failed:  failed,
      message: failed.length === 0
        ? `${succeeded.length} catégorie(s) supprimée(s)`
        : `${succeeded.length} supprimée(s), ${failed.length} échec(s)`,
    });
  } catch (e) { handle(res, e); }
};