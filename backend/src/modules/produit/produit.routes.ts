// src/modules/produit/produit.routes.ts
import { Router } from "express";
import { authenticate } from "../../middleware/authMiddleware";
import * as ctrl from "./produit.controller";

// ── Public ────────────────────────────────────────────
export const produitPublicRouter = Router();
produitPublicRouter.get("/",      ctrl.listPublic);
produitPublicRouter.get("/:slug", ctrl.getBySlugPublic);

// ── Admin ─────────────────────────────────────────────
export const produitAdminRouter = Router();
produitAdminRouter.use(authenticate);
produitAdminRouter.get("/",                        ctrl.list);
produitAdminRouter.post("/",                       ctrl.create);
produitAdminRouter.get("/:id",                     ctrl.getById);
produitAdminRouter.put("/:id",                     ctrl.update);
produitAdminRouter.delete("/:id",                  ctrl.remove);
produitAdminRouter.post("/:id/images",             ctrl.addImage);
produitAdminRouter.post("/:id/images/upload",      ctrl.uploadImageFile);
produitAdminRouter.put("/:id/images/:imgId",       ctrl.updateImageHandler);
produitAdminRouter.post("/:id/fiche-technique",    ctrl.uploadFicheTechnique);
produitAdminRouter.delete("/:id/images/:imgId",    ctrl.deleteImage);
