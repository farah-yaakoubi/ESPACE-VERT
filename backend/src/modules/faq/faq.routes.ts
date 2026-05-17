import { Router } from "express";
import { authenticate, requirePermission } from "../../middleware/authMiddleware";
import * as ctrl from "./faq.controller";

export const faqPublicRouter = Router();
faqPublicRouter.get("/", ctrl.listPublic);
faqPublicRouter.get("/categories", ctrl.getCategories); // optional, if needed

export const faqAdminRouter = Router();
faqAdminRouter.use(authenticate);
faqAdminRouter.get("/",       requirePermission("faq.write"), ctrl.listAdmin); // fixed
faqAdminRouter.post("/",      requirePermission("faq.write"), ctrl.create);
faqAdminRouter.put("/:id",    requirePermission("faq.write"), ctrl.update);
faqAdminRouter.delete("/:id", requirePermission("faq.write"), ctrl.remove);