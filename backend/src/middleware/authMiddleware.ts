// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, extractTokenFromHeader } from "../lib/auth";
import { unauthorized, forbidden } from "../lib/response";
import { prisma } from "../lib/prisma";

/**
 * Extrait le token depuis :
 *  1. le header Authorization: Bearer <token>   (requêtes normales)
 *  2. le query param ?token=<token>              (SSE : EventSource ne peut pas envoyer de headers)
 */
function extractToken(req: Request): string | null {
  const fromHeader = extractTokenFromHeader(req.headers.authorization);
  if (fromHeader) return fromHeader;

  const fromQuery = req.query?.token;
  if (typeof fromQuery === "string" && fromQuery.trim()) return fromQuery.trim();

  return null;
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) { unauthorized(res, "Token manquant"); return; }

  const payload = verifyAccessToken(token);
  if (!payload) { unauthorized(res, "Token invalide ou expiré"); return; }

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

export function requireRole(...roleIds: number[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.admin || !roleIds.includes(req.admin.id_role)) {
      forbidden(res, "Rôle insuffisant");
      return;
    }
    next();
  };
}

export function requirePermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.admin) { unauthorized(res, "Non authentifié"); return; }

    if (req.admin.id_role === 1) { next(); return; }

    try {
      const role = await prisma.role.findUnique({
        where: { id_role: req.admin.id_role },
      });

      if (!role) { forbidden(res, "Rôle introuvable"); return; }

      const perms: string[] = Array.isArray(role.permissions)
        ? role.permissions as string[]
        : JSON.parse(String(role.permissions) || "[]");

      if (!perms.includes(permission)) {
        forbidden(res, `Permission manquante : ${permission}`);
        return;
      }

      next();
    } catch {
      forbidden(res, "Erreur vérification permissions");
    }
  };
}