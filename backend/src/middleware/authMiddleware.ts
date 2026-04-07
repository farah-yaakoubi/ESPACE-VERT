// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, extractTokenFromHeader } from "../lib/auth";
import { unauthorized, forbidden } from "../lib/response";

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token = extractTokenFromHeader(req.headers.authorization);
  if (!token)               { unauthorized(res, "Token manquant");          return; }

  const payload = verifyAccessToken(token);
  if (!payload)             { unauthorized(res, "Token invalide ou expiré"); return; }

  req.admin = payload;
  next();
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.admin || req.admin.id_role !== 1) {
    forbidden(res, "Super Admin requis");
    return;
  }
  next();
}
