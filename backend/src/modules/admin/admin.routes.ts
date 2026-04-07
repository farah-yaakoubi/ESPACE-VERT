// src/modules/admin/admin.routes.ts
import { Router } from "express";
import { authenticate, requireSuperAdmin } from "../../middleware/authMiddleware";
import * as ctrl from "./admin.controller";

export const adminAdminRouter = Router();
adminAdminRouter.use(authenticate, requireSuperAdmin);
adminAdminRouter.get("/roles",  ctrl.getRoles);
adminAdminRouter.get("/",       ctrl.list);
adminAdminRouter.post("/",      ctrl.create);
adminAdminRouter.get("/:id",    ctrl.getById);
adminAdminRouter.put("/:id",    ctrl.update);
adminAdminRouter.delete("/:id", ctrl.remove);
