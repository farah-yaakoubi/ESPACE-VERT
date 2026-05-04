// src/modules/admin/admin.routes.ts
// REMPLACE l'ancien fichier — ajoute PATCH /me accessible à tous les admins
import { Router }                              from "express";
import { authenticate, requireSuperAdmin }     from "../../middleware/authMiddleware";
import * as ctrl                               from "./admin.controller";

export const adminAdminRouter = Router();

// ── Route "me" — tout admin connecté peut modifier son profil ────────────────
adminAdminRouter.patch("/me", authenticate, ctrl.updateMe);

// ── Routes super-admin uniquement ────────────────────────────────────────────
adminAdminRouter.use(authenticate, requireSuperAdmin);
adminAdminRouter.get("/roles",  ctrl.getRoles);
adminAdminRouter.get("/",       ctrl.list);
adminAdminRouter.post("/",      ctrl.create);
adminAdminRouter.get("/:id",    ctrl.getById);
adminAdminRouter.put("/:id",    ctrl.update);
adminAdminRouter.delete("/:id", ctrl.remove);
