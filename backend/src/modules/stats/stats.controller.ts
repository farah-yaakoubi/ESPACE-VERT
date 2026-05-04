// src/modules/stats/stats.controller.ts
import { Request, Response } from "express";
import { statsService } from "./stats.service";
import { ok, serverError } from "../../lib/response";
import { z } from "zod";

const DaysSchema = z.object({
  days: z.coerce.number().int().min(7).max(365).default(30),
});

const handle = (res: Response, err: unknown) => {
  console.error("[stats.controller]", err);
  return serverError(res);
};

// GET /api/admin/stats  → dashboard existant (INCHANGÉ)
export const getDashboard = async (_req: Request, res: Response) => {
  try {
    ok(res, await statsService.getDashboard());
  } catch (e) { handle(res, e); }
};

// GET /api/admin/stats/analytics?days=30  → analytics avancées
export const getAdvancedAnalytics = async (req: Request, res: Response) => {
  try {
    const { days } = DaysSchema.parse(req.query);
    ok(res, await statsService.getAdvancedAnalytics(days));
  } catch (e) { handle(res, e); }
};

// GET /api/admin/stats/heatmap?days=30  → heatmap horaire
export const getHeatmap = async (req: Request, res: Response) => {
  try {
    const { days } = DaysSchema.parse(req.query);
    ok(res, await statsService.getHeatmapHoraire(days));
  } catch (e) { handle(res, e); }
};

// GET /api/admin/stats/entonnoir?days=30  → funnel de conversion
export const getEntonnoir = async (req: Request, res: Response) => {
  try {
    const { days } = DaysSchema.parse(req.query);
    ok(res, await statsService.getEntonnoir(days));
  } catch (e) { handle(res, e); }
};
