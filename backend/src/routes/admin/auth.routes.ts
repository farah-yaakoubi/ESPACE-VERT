import { Router, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../lib/auth";
import { logAudit } from "../../lib/audit";

const router = Router();

// POST /api/admin/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: "Email et mot de passe requis" });
      return;
    }

    const admin = await prisma.admin.findUnique({
      where:   { email: email.toLowerCase().trim() },
      include: { role: true },
    });

    if (!admin || !admin.actif) {
      res.status(401).json({ success: false, error: "Identifiants invalides" });
      return;
    }

    const ok = await comparePassword(password, admin.mot_de_passe);
    if (!ok) {
      res.status(401).json({ success: false, error: "Identifiants invalides" });
      return;
    }

    const payload = {
      id_admin: admin.id_admin,
      email:    admin.email,
      id_role:  admin.id_role,
      nom:      admin.nom,
    };

    const accessToken  = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await prisma.sessionAdmin.create({
      data: {
        id_admin:      admin.id_admin,
        refresh_token: refreshToken,
        ip_address:    req.ip ?? "unknown",
        user_agent:    req.headers["user-agent"],
        expires_at:    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await logAudit({
      id_admin:    admin.id_admin,
      action:      "LOGIN",
      entity_name: "admin",
      entity_id:   admin.id_admin,
      ip_address:  req.ip,
    });

    res.json({
      success:       true,
      access_token:  accessToken,
      refresh_token: refreshToken,
      admin: {
        id_admin: admin.id_admin,
        nom:      admin.nom,
        email:    admin.email,
        role:     admin.role.nom,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

// POST /api/admin/auth/logout
router.post("/logout", async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;
    if (refresh_token) {
      const payload = verifyRefreshToken(refresh_token);
      await prisma.sessionAdmin.deleteMany({ where: { refresh_token } });
      if (payload) {
        await logAudit({
          id_admin:    payload.id_admin,
          action:      "LOGOUT",
          entity_name: "admin",
        });
      }
    }
    res.json({ success: true, message: "Déconnecté" });
  } catch {
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

// POST /api/admin/auth/refresh
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      res.status(401).json({ error: "Token manquant" });
      return;
    }

    const payload = verifyRefreshToken(refresh_token);
    if (!payload) {
      res.status(401).json({ error: "Token invalide" });
      return;
    }

    const session = await prisma.sessionAdmin.findFirst({
      where: { refresh_token, expires_at: { gt: new Date() } },
    });
    if (!session) {
      res.status(401).json({ error: "Session expirée" });
      return;
    }

    const admin = await prisma.admin.findUnique({
      where: { id_admin: payload.id_admin },
    });
    if (!admin?.actif) {
      res.status(401).json({ error: "Compte désactivé" });
      return;
    }

    const newPayload = {
      id_admin: admin.id_admin,
      email:    admin.email,
      id_role:  admin.id_role,
      nom:      admin.nom,
    };

    const newAccess  = generateAccessToken(newPayload);
    const newRefresh = generateRefreshToken(newPayload);

    await prisma.sessionAdmin.update({
      where: { id_session: session.id_session },
      data: {
        refresh_token: newRefresh,
        expires_at:    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      success:       true,
      access_token:  newAccess,
      refresh_token: newRefresh,
    });

  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/admin/auth/me
router.get("/me", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Non autorisé" });
      return;
    }

    const token = authHeader.substring(7);
    const { verifyAccessToken } = await import("../../lib/auth");
    const payload = verifyAccessToken(token);

    if (!payload) {
      res.status(401).json({ error: "Token invalide" });
      return;
    }

    const admin = await prisma.admin.findUnique({
      where:   { id_admin: payload.id_admin },
      include: { role: true },
    });

    if (!admin) {
      res.status(404).json({ error: "Introuvable" });
      return;
    }

    const { mot_de_passe, ...adminSafe } = admin;
    res.json({ success: true, data: adminSafe });

  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;