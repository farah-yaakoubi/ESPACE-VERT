// src/modules/actualite/actualite.routes.ts — CORRIGÉ
import { Router } from "express";
import { authenticate, requirePermission } from "../../middleware/authMiddleware";
import * as ctrl from "./actualite.controller";

export const actualitePublicRouter = Router();
actualitePublicRouter.get("/",      ctrl.listPublic);
actualitePublicRouter.get("/:slug", ctrl.getBySlugPublic);

export const actualiteAdminRouter = Router();
actualiteAdminRouter.use(authenticate);
actualiteAdminRouter.get("/",      requirePermission("actualites.write"), ctrl.list);
actualiteAdminRouter.get("/:id",   requirePermission("actualites.write"), ctrl.getById);
actualiteAdminRouter.post("/",     requirePermission("actualites.write"), ctrl.create);
actualiteAdminRouter.put("/:id",   requirePermission("actualites.write"), ctrl.update);
actualiteAdminRouter.delete("/:id",requirePermission("actualites.write"), ctrl.remove);
