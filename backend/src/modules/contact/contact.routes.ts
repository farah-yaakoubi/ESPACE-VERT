// src/modules/contact/contact.routes.ts
import { Router } from "express";
import { authenticate } from "../../middleware/authMiddleware";
import * as ctrl from "./contact.controller";

export const contactPublicRouter = Router();
contactPublicRouter.post("/", ctrl.send);

export const contactAdminRouter = Router();
contactAdminRouter.use(authenticate);
contactAdminRouter.get("/",       ctrl.list);
contactAdminRouter.get("/:id",    ctrl.getById);
contactAdminRouter.patch("/:id",  ctrl.update);
contactAdminRouter.delete("/:id", ctrl.remove);
