// src/modules/stats/stats.routes.ts
import { Router } from "express";
import { authenticate } from "../../middleware/authMiddleware";
import * as ctrl from "./stats.controller";

export const statsAdminRouter = Router();
statsAdminRouter.use(authenticate);

// Existant (INCHANGÉ)
statsAdminRouter.get("/", ctrl.getDashboard);

// Nouveaux endpoints analytics
statsAdminRouter.get("/analytics",  ctrl.getAdvancedAnalytics);
statsAdminRouter.get("/heatmap",    ctrl.getHeatmap);
statsAdminRouter.get("/entonnoir",  ctrl.getEntonnoir);
