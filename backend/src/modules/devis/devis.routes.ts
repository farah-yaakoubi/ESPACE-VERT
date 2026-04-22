// src/modules/devis/devis.routes.ts
import { Router } from "express";
import { authenticate } from "../../middleware/authMiddleware";
import * as ctrl from "./devis.controller";

// ── Public ─────────────────────────────────────────────────────────────────
// POST /api/devis         → soumettre une demande de devis
export const devisPublicRouter = Router();
devisPublicRouter.post("/", ctrl.submit);

// ── Admin ──────────────────────────────────────────────────────────────────
// GET    /api/admin/devis          → liste paginée + filtres
// GET    /api/admin/devis/stats    → compteurs par statut
// GET    /api/admin/devis/:id      → détail
// PUT    /api/admin/devis/:id      → mise à jour (statut + réponse)
// DELETE /api/admin/devis/:id      → suppression
export const devisAdminRouter = Router();
devisAdminRouter.use(authenticate);
devisAdminRouter.get("/",          ctrl.list);
devisAdminRouter.get("/stats",     ctrl.stats);
devisAdminRouter.get("/:id",       ctrl.getById);
devisAdminRouter.put("/:id",       ctrl.update);
devisAdminRouter.delete("/:id",    ctrl.remove);
