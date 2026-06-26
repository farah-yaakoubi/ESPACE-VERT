import { Router } from "express";
import { authenticate, requirePermission } from "../../middleware/authMiddleware";
import * as ctrl from "./produit.controller";

// ── Public ────────────────────────────────────────────
export const produitPublicRouter = Router();
produitPublicRouter.get("/resolve-path", ctrl.resolvePath);
produitPublicRouter.get("/",      ctrl.listPublic);
produitPublicRouter.get("/:slug", ctrl.getBySlugPublic);

// ── Admin ─────────────────────────────────────────────
export const produitAdminRouter = Router();
produitAdminRouter.use(authenticate);

// Lecture : produits.read
produitAdminRouter.get("/preview-sku", requirePermission("produits.read"), ctrl.previewSku);
produitAdminRouter.get("/",      requirePermission("produits.read"), ctrl.list);
produitAdminRouter.get("/:id",   requirePermission("produits.read"), ctrl.getById);

// Écriture : produits.write
produitAdminRouter.post("/",                          requirePermission("produits.write"), ctrl.create);
produitAdminRouter.put("/:id",                        requirePermission("produits.write"), ctrl.update);
produitAdminRouter.post("/:id/images",                requirePermission("produits.write"), ctrl.addImage);
produitAdminRouter.post("/:id/images/upload",         requirePermission("produits.write"), ctrl.uploadImageFile);
produitAdminRouter.put("/:id/images/:imgId",          requirePermission("produits.write"), ctrl.updateImageHandler);
produitAdminRouter.post("/:id/fiche-technique",       requirePermission("produits.write"), ctrl.uploadFicheTechnique);

// Suppression : produits.delete
produitAdminRouter.delete("/:id",                     requirePermission("produits.delete"), ctrl.remove);
produitAdminRouter.delete("/:id/images/:imgId",       requirePermission("produits.delete"), ctrl.deleteImage);