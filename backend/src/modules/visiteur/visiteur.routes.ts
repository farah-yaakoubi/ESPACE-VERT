// src/modules/visiteur/visiteur.routes.ts — CORRIGÉ
import { Router } from "express";
import { authenticate, requirePermission } from "../../middleware/authMiddleware";
import * as ctrl from "./visiteur.controller";

export const visiteurPublicRouter = Router();
visiteurPublicRouter.post("/track", ctrl.track);

export const visiteurAdminRouter = Router();
visiteurAdminRouter.use(authenticate);
visiteurAdminRouter.get("/stats", requirePermission("visiteurs.read"), ctrl.getStats);
visiteurAdminRouter.get("/",      requirePermission("visiteurs.read"), ctrl.list);
visiteurAdminRouter.get("/:id",   requirePermission("visiteurs.read"), ctrl.getById);
