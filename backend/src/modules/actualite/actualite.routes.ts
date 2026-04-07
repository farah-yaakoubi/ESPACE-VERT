// src/modules/actualite/actualite.routes.ts
import { Router } from "express";
import { authenticate } from "../../middleware/authMiddleware";
import * as ctrl from "./actualite.controller";

export const actualitePublicRouter = Router();
actualitePublicRouter.get("/",      ctrl.listPublic);
actualitePublicRouter.get("/:slug", ctrl.getBySlugPublic);

export const actualiteAdminRouter = Router();
actualiteAdminRouter.use(authenticate);
actualiteAdminRouter.get("/",    ctrl.list);
actualiteAdminRouter.post("/",   ctrl.create);
actualiteAdminRouter.get("/:id", ctrl.getById);
actualiteAdminRouter.put("/:id", ctrl.update);
actualiteAdminRouter.delete("/:id", ctrl.remove);
