// src/modules/marque/marque.routes.ts — CORRIGÉ
import { Router } from "express";
import { authenticate, requirePermission } from "../../middleware/authMiddleware";
import * as ctrl from "./marque.controller";

export const marquePublicRouter = Router();
marquePublicRouter.get("/",      ctrl.listPublic);
marquePublicRouter.get("/:slug", ctrl.getBySlugPublic);

export const marqueAdminRouter = Router();
marqueAdminRouter.use(authenticate);
marqueAdminRouter.get("/",    requirePermission("produits.read"),  ctrl.list);
marqueAdminRouter.post("/",   requirePermission("marques.write"),  ctrl.create);
marqueAdminRouter.put("/:id", requirePermission("marques.write"),  ctrl.update);
marqueAdminRouter.delete("/:id", requirePermission("marques.write"), ctrl.remove);
