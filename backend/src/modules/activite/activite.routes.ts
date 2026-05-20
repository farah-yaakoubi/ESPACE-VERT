import { Router } from "express";
import { authenticate, requirePermission } from "../../middleware/authMiddleware";
import * as ctrl from "./activite.controller";

export const activitePublicRouter = Router();
activitePublicRouter.get("/",      ctrl.listPublic);
activitePublicRouter.get("/:slug", ctrl.getBySlugPublic); // ← AJOUTÉ

export const activiteAdminRouter = Router();
activiteAdminRouter.use(authenticate);
activiteAdminRouter.get("/",       requirePermission("produits.read"),  ctrl.list);
activiteAdminRouter.post("/",      requirePermission("produits.write"), ctrl.create);
activiteAdminRouter.get("/:id",    requirePermission("produits.read"),  ctrl.getById);
activiteAdminRouter.put("/:id",    requirePermission("produits.write"), ctrl.update);
activiteAdminRouter.delete("/:id", requirePermission("produits.write"), ctrl.remove);
