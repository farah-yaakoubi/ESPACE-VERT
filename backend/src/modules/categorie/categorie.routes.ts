// src/modules/categorie/categorie.routes.ts
import { Router } from "express";
import { authenticate } from "../../middleware/authMiddleware";
import * as ctrl from "./categorie.controller";

// ── Public ───────────────────────────────────────────────────────────────────

export const categoriePublicRouter = Router();

// Liste plate / arborescence filtrée
// GET /api/public/categories?id_marque=1&tree=true
categoriePublicRouter.get("/", ctrl.listPublic);

// ── Route arbre complet d'une marque ─────────────────────────────────────────
// À monter dans src/index.ts sur : /api/public/marques/:slug/tree
// Exemple : GET /api/public/marques/samsung/tree
export const marqueTreeRouter = Router({ mergeParams: true });
marqueTreeRouter.get("/tree", ctrl.getMarqueTree);

// ── Admin ────────────────────────────────────────────────────────────────────

export const categorieAdminRouter = Router();
categorieAdminRouter.use(authenticate);

categorieAdminRouter.get("/",     ctrl.list);
categorieAdminRouter.post("/",    ctrl.create);
categorieAdminRouter.get("/:id",  ctrl.getById);
categorieAdminRouter.put("/:id",  ctrl.update);
categorieAdminRouter.delete("/:id", ctrl.remove);
