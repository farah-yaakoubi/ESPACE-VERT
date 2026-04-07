// src/modules/stats/stats.routes.ts
import { Router } from "express";
import { authenticate } from "../../middleware/authMiddleware";
import * as ctrl from "./stats.controller";

export const statsAdminRouter = Router();
statsAdminRouter.use(authenticate);
statsAdminRouter.get("/", ctrl.getDashboard);
