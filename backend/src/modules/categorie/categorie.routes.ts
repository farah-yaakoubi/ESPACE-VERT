// src/modules/categorie/categorie.routes.ts
import { Router } from "express";
import { authenticate, requirePermission } from "../../middleware/authMiddleware";
import * as ctrl from "./categorie.controller";

// ── Public ───────────────────────────────────────────────────────────────────

export const categoriePublicRouter = Router();

// Liste plate / arborescence filtrée
// GET /api/public/categories?id_marque=1&tree=true
categoriePublicRouter.get("/", ctrl.listPublic);
categoriePublicRouter.get("/:slug", ctrl.getBySlugPublic);

// ── Route arbre complet d'une marque ─────────────────────────────────────────
// À monter dans src/index.ts sur : /api/public/marques/:slug/tree
// Exemple : GET /api/public/marques/samsung/tree
export const marqueTreeRouter = Router({ mergeParams: true });
marqueTreeRouter.get("/tree", ctrl.getMarqueTree);

// ── Admin ────────────────────────────────────────────────────────────────────

export const categorieAdminRouter = Router();
categorieAdminRouter.use(authenticate);

categorieAdminRouter.get("/",       requirePermission("produits.read"),    ctrl.list);
categorieAdminRouter.post("/",      requirePermission("categories.write"), ctrl.create);
categorieAdminRouter.get("/:id",    requirePermission("produits.read"),    ctrl.getById);
categorieAdminRouter.put("/:id",    requirePermission("categories.write"), ctrl.update);
categorieAdminRouter.delete("/:id", requirePermission("categories.write"), ctrl.remove);
