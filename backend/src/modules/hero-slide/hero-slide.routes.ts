import { Router } from "express";
import { authenticate, requirePermission } from "../../middleware/authMiddleware";
import * as ctrl from "./hero-slide.controller";

export const heroSlidePublicRouter = Router();
heroSlidePublicRouter.get("/", ctrl.listPublic);  // ?page=home (défaut)

export const heroSlideAdminRouter = Router();
heroSlideAdminRouter.use(authenticate);
heroSlideAdminRouter.get("/pages",     requirePermission("actualites.write"), ctrl.listPages);   // liste des pages disponibles
heroSlideAdminRouter.get("/",          requirePermission("actualites.write"), ctrl.list);        // ?page=home (optionnel)
heroSlideAdminRouter.post("/",         requirePermission("actualites.write"), ctrl.create);
heroSlideAdminRouter.put("/reorder",   requirePermission("actualites.write"), ctrl.reorder);
heroSlideAdminRouter.get("/:id",       requirePermission("actualites.write"), ctrl.getById);
heroSlideAdminRouter.put("/:id",       requirePermission("actualites.write"), ctrl.update);
heroSlideAdminRouter.delete("/:id",    requirePermission("actualites.write"), ctrl.remove);
