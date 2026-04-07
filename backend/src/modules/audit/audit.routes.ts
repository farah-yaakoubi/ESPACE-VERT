// src/modules/audit/audit.routes.ts
import { Router } from "express";
import { authenticate, requireSuperAdmin } from "../../middleware/authMiddleware";
import * as ctrl from "./audit.controller";

export const auditAdminRouter = Router();
auditAdminRouter.use(authenticate, requireSuperAdmin);
auditAdminRouter.get("/", ctrl.list);
