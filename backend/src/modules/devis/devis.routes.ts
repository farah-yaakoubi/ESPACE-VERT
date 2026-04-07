// src/modules/devis/devis.routes.ts
import { Router } from "express";
import { authenticate } from "../../middleware/authMiddleware";
import * as ctrl from "./devis.controller";

export const devisPublicRouter = Router();
devisPublicRouter.post("/", ctrl.submit);

export const devisAdminRouter = Router();
devisAdminRouter.use(authenticate);
devisAdminRouter.get("/",       ctrl.list);
devisAdminRouter.get("/:id",    ctrl.getById);
devisAdminRouter.patch("/:id",  ctrl.update);
devisAdminRouter.delete("/:id", ctrl.remove);
