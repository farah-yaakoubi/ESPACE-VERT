import { Router } from "express";
import { authenticate } from "../../middleware/authMiddleware";
import * as ctrl from "./hero-slide.controller";

export const heroSlidePublicRouter = Router();
heroSlidePublicRouter.get("/", ctrl.listPublic);  // ?page=home (défaut)

export const heroSlideAdminRouter = Router();
heroSlideAdminRouter.use(authenticate);
heroSlideAdminRouter.get("/pages",     ctrl.listPages);   // liste des pages disponibles
heroSlideAdminRouter.get("/",          ctrl.list);        // ?page=home (optionnel)
heroSlideAdminRouter.post("/",         ctrl.create);
heroSlideAdminRouter.put("/reorder",   ctrl.reorder);
heroSlideAdminRouter.get("/:id",       ctrl.getById);
heroSlideAdminRouter.put("/:id",       ctrl.update);
heroSlideAdminRouter.delete("/:id",    ctrl.remove);