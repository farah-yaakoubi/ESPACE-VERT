import { Router } from "express";
import { authenticate, requirePermission } from "../../middleware/authMiddleware";
import * as ctrl from "./tutorial-video.controller";

export const tutorialVideoPublicRouter = Router();
tutorialVideoPublicRouter.get("/", ctrl.listPublic);

export const tutorialVideoAdminRouter = Router();
tutorialVideoAdminRouter.use(authenticate);
tutorialVideoAdminRouter.get("/", requirePermission("actualites.write"), ctrl.list);
tutorialVideoAdminRouter.get("/:id", requirePermission("actualites.write"), ctrl.getById);
tutorialVideoAdminRouter.post("/", requirePermission("actualites.write"), ctrl.create);
tutorialVideoAdminRouter.put("/:id", requirePermission("actualites.write"), ctrl.update);
tutorialVideoAdminRouter.delete("/:id", requirePermission("actualites.write"), ctrl.remove);
