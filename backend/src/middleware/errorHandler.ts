import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("Error:", err.message);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === "production"
      ? "Erreur serveur interne"
      : err.message,
  });
}

export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Route non trouvée : ${req.method} ${req.path}`,
  });
}