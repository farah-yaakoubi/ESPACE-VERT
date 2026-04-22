import { Router } from "express";
import { authenticate } from "../../middleware/authMiddleware";
import * as ctrl from "./activite.controller";

export const activitePublicRouter = Router();
activitePublicRouter.get("/",      ctrl.listPublic);
activitePublicRouter.get("/:slug", ctrl.getBySlugPublic); // ← AJOUTÉ

export const activiteAdminRouter = Router();
activiteAdminRouter.use(authenticate);
activiteAdminRouter.get("/",       ctrl.list);
activiteAdminRouter.post("/",      ctrl.create);
activiteAdminRouter.get("/:id",    ctrl.getById);
activiteAdminRouter.put("/:id",    ctrl.update);
activiteAdminRouter.delete("/:id", ctrl.remove);
