import { Router } from "express";
import { authenticate, requirePermission } from "../../middleware/authMiddleware";
import * as ctrl from "./stats.controller";

export const statsAdminRouter = Router();
statsAdminRouter.use(authenticate);
statsAdminRouter.get("/",          ctrl.getDashboard);                                      // fixed
statsAdminRouter.get("/analytics", requirePermission("analytics.read"), ctrl.getAdvancedAnalytics); // fixed
statsAdminRouter.get("/heatmap",   requirePermission("analytics.read"), ctrl.getHeatmap);   // fixed
statsAdminRouter.get("/entonnoir", requirePermission("analytics.read"), ctrl.getEntonnoir); // fixed