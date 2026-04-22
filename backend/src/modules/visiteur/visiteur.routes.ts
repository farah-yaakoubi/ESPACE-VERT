import { Router } from "express";
import { authenticate, requireSuperAdmin } from "../../middleware/authMiddleware";
import * as ctrl from "./visiteur.controller";

export const visiteurPublicRouter = Router();
visiteurPublicRouter.post("/track", ctrl.track);

export const visiteurAdminRouter = Router();
visiteurAdminRouter.use(authenticate, requireSuperAdmin);
visiteurAdminRouter.get("/stats",  ctrl.getStats); // ← AJOUTÉ
visiteurAdminRouter.get("/",       ctrl.list);
visiteurAdminRouter.get("/:id",    ctrl.getById);
