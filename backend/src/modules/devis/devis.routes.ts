import { Router } from "express";
import { authenticate, requirePermission } from "../../middleware/authMiddleware";
import * as ctrl from "./devis.controller";

export const devisPublicRouter = Router();
devisPublicRouter.post("/", ctrl.submit);

export const devisAdminRouter = Router();
devisAdminRouter.use(authenticate);
devisAdminRouter.get("/stats",  requirePermission("devis.read"),  ctrl.stats); 
devisAdminRouter.get("/",       requirePermission("devis.read"),  ctrl.list);
devisAdminRouter.get("/:id",    requirePermission("devis.read"),  ctrl.getById);
devisAdminRouter.put("/:id",    requirePermission("devis.write"), ctrl.update);
devisAdminRouter.delete("/:id", requirePermission("devis.write"), ctrl.remove);