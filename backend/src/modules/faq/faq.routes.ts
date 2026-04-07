// src/modules/faq/faq.routes.ts
import { Router } from "express";
import { authenticate } from "../../middleware/authMiddleware";
import * as ctrl from "./faq.controller";

export const faqPublicRouter = Router();
faqPublicRouter.get("/",    ctrl.listPublic);
faqPublicRouter.get("/:id", ctrl.getById);

export const faqAdminRouter = Router();
faqAdminRouter.use(authenticate);
faqAdminRouter.get("/",    ctrl.list);
faqAdminRouter.post("/",   ctrl.create);
faqAdminRouter.get("/:id", ctrl.getById);
faqAdminRouter.put("/:id", ctrl.update);
faqAdminRouter.delete("/:id", ctrl.remove);
