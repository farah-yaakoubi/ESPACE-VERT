// src/modules/auth/auth.routes.ts
import { Router } from "express";
import { authenticate } from "../../middleware/authMiddleware";
import * as ctrl from "./auth.controller";

// Toutes les routes auth sont sous /api/admin/auth
export const authAdminRouter = Router();

// Publiques (sans token)
authAdminRouter.post("/login",   ctrl.login);
authAdminRouter.post("/refresh", ctrl.refresh);

// Protégées
authAdminRouter.post("/logout",          authenticate, ctrl.logout);
authAdminRouter.get("/me",               authenticate, ctrl.me);
authAdminRouter.put("/change-password",  authenticate, ctrl.changePassword);
