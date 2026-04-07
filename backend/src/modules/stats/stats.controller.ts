// src/modules/stats/stats.controller.ts
import { Request, Response } from "express";
import { statsService } from "./stats.service";
import { ok, serverError } from "../../lib/response";

export const getDashboard = async (_req: Request, res: Response) => {
  try {
    ok(res, await statsService.getDashboard());
  } catch (err) {
    console.error("[stats.controller]", err);
    serverError(res);
  }
};
