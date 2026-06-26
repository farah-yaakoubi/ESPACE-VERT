// src/modules/categorie/categorie.routes.ts
import { Router } from "express";
import { authenticate, requirePermission } from "../../middleware/authMiddleware";
import * as ctrl from "./categorie.controller";

// ── Public ───────────────────────────────────────────────────────────────────

export const categoriePublicRouter = Router();

categoriePublicRouter.get("/", ctrl.listPublic);
categoriePublicRouter.get("/:slug", ctrl.getBySlugPublic);

// ── Route arbre complet d'une marque ─────────────────────────────────────────
export const marqueTreeRouter = Router({ mergeParams: true });
marqueTreeRouter.get("/tree", ctrl.getMarqueTree);

// ── Admin ────────────────────────────────────────────────────────────────────

export const categorieAdminRouter = Router();
categorieAdminRouter.use(authenticate);

categorieAdminRouter.get("/",                requirePermission("produits.read"),    ctrl.list);
categorieAdminRouter.post("/",               requirePermission("categories.write"), ctrl.create);
// IMPORTANT : /bulk AVANT /:id pour ne pas être capturé comme un id
categorieAdminRouter.delete("/bulk",         requirePermission("categories.write"), ctrl.removeBulk);
categorieAdminRouter.get("/:id/impact",      requirePermission("produits.read"),    ctrl.getDeleteImpact);
categorieAdminRouter.get("/:id",             requirePermission("produits.read"),    ctrl.getById);
categorieAdminRouter.put("/:id",             requirePermission("categories.write"), ctrl.update);
categorieAdminRouter.delete("/:id",          requirePermission("categories.write"), ctrl.remove);