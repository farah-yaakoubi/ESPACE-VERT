import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, extractTokenFromHeader } from "../lib/auth";
import { JwtPayload } from "../types";

declare global {
  namespace Express {
    interface Request {
      admin?: JwtPayload;
    }
  }
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = extractTokenFromHeader(req.headers.authorization);

  if (!token) {
    res.status(401).json({ success: false, error: "Token manquant" });
    return;
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    res.status(401).json({ success: false, error: "Token invalide ou expiré" });
    return;
  }

  req.admin = payload;
  next();
}

export function requireSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.admin || req.admin.id_role !== 1) {
    res.status(403).json({ success: false, error: "Super Admin requis" });
    return;
  }
  next();
}
