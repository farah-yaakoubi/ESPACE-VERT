// src/modules/rdv/rdv.routes.ts
import { Router } from "express";
import { authenticate } from "../../middleware/authMiddleware";
import * as ctrl from "./rdv.controller";

export const rdvPublicRouter = Router();
rdvPublicRouter.get("/creneaux", ctrl.getCreneaux);
rdvPublicRouter.post("/",        ctrl.book);

export const rdvAdminRouter = Router();
rdvAdminRouter.use(authenticate);
rdvAdminRouter.get("/",       ctrl.list);
rdvAdminRouter.get("/stats",  ctrl.stats);
rdvAdminRouter.get("/:id",    ctrl.getById);
rdvAdminRouter.put("/:id",    ctrl.update);
