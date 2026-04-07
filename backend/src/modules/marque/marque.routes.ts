// src/modules/marque/marque.routes.ts
import { Router } from "express";
import { authenticate } from "../../middleware/authMiddleware";
import * as ctrl from "./marque.controller";

export const marquePublicRouter = Router();
marquePublicRouter.get("/",      ctrl.listPublic);
marquePublicRouter.get("/:slug", ctrl.getBySlugPublic);

export const marqueAdminRouter = Router();
marqueAdminRouter.use(authenticate);
marqueAdminRouter.get("/",    ctrl.list);
marqueAdminRouter.post("/",   ctrl.create);
marqueAdminRouter.get("/:id", ctrl.getById);
marqueAdminRouter.put("/:id", ctrl.update);
marqueAdminRouter.delete("/:id", ctrl.remove);
