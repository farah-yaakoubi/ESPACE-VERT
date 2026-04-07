// src/modules/categorie/categorie.routes.ts
import { Router } from "express";
import { authenticate } from "../../middleware/authMiddleware";
import * as ctrl from "./categorie.controller";

export const categoriePublicRouter = Router();
categoriePublicRouter.get("/", ctrl.listPublic);

export const categorieAdminRouter = Router();
categorieAdminRouter.use(authenticate);
categorieAdminRouter.get("/",    ctrl.list);
categorieAdminRouter.post("/",   ctrl.create);
categorieAdminRouter.get("/:id", ctrl.getById);
categorieAdminRouter.put("/:id", ctrl.update);
categorieAdminRouter.delete("/:id", ctrl.remove);
