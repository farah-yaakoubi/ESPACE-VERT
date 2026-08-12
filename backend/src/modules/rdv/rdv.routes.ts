// src/modules/rdv/rdv.routes.ts — CORRIGÉ
import { Router } from "express";
import { authenticate, requirePermission } from "../../middleware/authMiddleware";
import * as ctrl from "./rdv.controller";

export const rdvPublicRouter = Router();
rdvPublicRouter.get("/creneaux", ctrl.getCreneaux);
rdvPublicRouter.post("/", ctrl.book);

export const rdvAdminRouter = Router();
rdvAdminRouter.use(authenticate);
rdvAdminRouter.get("/",     requirePermission("rdv.read"),  ctrl.list);
rdvAdminRouter.get("/:id",  requirePermission("rdv.read"),  ctrl.getById);
rdvAdminRouter.put("/:id",  requirePermission("rdv.write"), ctrl.update);