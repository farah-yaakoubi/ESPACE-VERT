// src/modules/faq/faq.routes.ts
import { Router } from "express";
import { authenticate, requirePermission } from "../../middleware/authMiddleware";
import * as ctrl from "./faq.controller";

export const faqPublicRouter = Router();
faqPublicRouter.get("/",           ctrl.listPublic);
faqPublicRouter.get("/categories", ctrl.getCategories);
// Route publique pour incrémenter le compteur de consultations FAQ
// Appelée par le chatbot et la page FAQ publique via POST /faq/:id/view
faqPublicRouter.post("/:id/view",  ctrl.incrementView);

export const faqAdminRouter = Router();
faqAdminRouter.use(authenticate);
faqAdminRouter.get("/",       requirePermission("faq.write"), ctrl.listAdmin);
faqAdminRouter.post("/",      requirePermission("faq.write"), ctrl.create);
faqAdminRouter.put("/:id",    requirePermission("faq.write"), ctrl.update);
faqAdminRouter.delete("/:id", requirePermission("faq.write"), ctrl.remove);
