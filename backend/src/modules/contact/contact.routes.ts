// src/modules/contact/contact.routes.ts
import { Router } from "express";
import { authenticate, requirePermission } from "../../middleware/authMiddleware";
import * as ctrl from "./contact.controller";

export const contactPublicRouter = Router();
contactPublicRouter.post("/", ctrl.send);

export const contactAdminRouter = Router();
contactAdminRouter.use(authenticate);
contactAdminRouter.get("/",              requirePermission("contact.read"), ctrl.list);
contactAdminRouter.get("/unread-count",  requirePermission("contact.read"), ctrl.countUnread);
contactAdminRouter.get("/:id",           requirePermission("contact.read"), ctrl.getById);
contactAdminRouter.post("/:id/reply",    requirePermission("contact.read"), ctrl.reply);
contactAdminRouter.delete("/:id",        requirePermission("contact.read"), ctrl.remove);
