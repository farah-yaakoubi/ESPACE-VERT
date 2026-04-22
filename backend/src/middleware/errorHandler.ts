// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} introuvable` });
}

export function errorHandler(
  err: Error, _req: Request, res: Response, _next: NextFunction
): void {
  console.error("[UnhandledError]", err);
  res.status(500).json({ success: false, error: "Erreur serveur interne" });
}
