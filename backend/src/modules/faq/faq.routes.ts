// src/modules/faq/faq.routes.ts
import { Router } from "express";
import { authenticate } from "../../middleware/authMiddleware";
import * as ctrl from "./faq.controller";

export const faqPublicRouter = Router();
faqPublicRouter.get("/",            ctrl.listPublic);
faqPublicRouter.get("/categories",  ctrl.getCategories);

export const faqAdminRouter = Router();
faqAdminRouter.use(authenticate);
faqAdminRouter.get("/",      ctrl.listAdmin);
faqAdminRouter.post("/",     ctrl.create);
faqAdminRouter.put("/:id",   ctrl.update);
faqAdminRouter.delete("/:id", ctrl.remove);
