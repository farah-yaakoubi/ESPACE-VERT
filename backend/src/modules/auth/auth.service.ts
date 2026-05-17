// src/modules/auth/auth.service.ts
import { authRepository } from "./auth.repository";
import {
  comparePassword, hashPassword,
  generateAccessToken, generateRefreshToken, verifyRefreshToken,
} from "../../lib/auth";
import { logAudit } from "../../lib/audit";
import { LoginDto, RefreshDto, ChangePasswordDto } from "./auth.schema";

export const authService = {

  async login(data: LoginDto, ip?: string, userAgent?: string) {
    const admin = await authRepository.findAdminByEmail(data.email);

    if (!admin || !admin.actif)
      throw { status: 401, message: "Identifiants invalides" };

    const ok = await comparePassword(data.password, admin.mot_de_passe);
    if (!ok)
      throw { status: 401, message: "Identifiants invalides" };

    const payload = {
      id_admin: admin.id_admin,
      email:    admin.email,
      id_role:  admin.id_role,
      nom:      admin.nom,
    };

    const access_token  = generateAccessToken(payload);
    const refresh_token = generateRefreshToken(payload);
    await authRepository.createSession({
      id_admin:      admin.id_admin,
      refresh_token,
      ip_address:    ip         ?? "unknown",
      user_agent:    userAgent  ?? undefined,
      expires_at:    new Date(Date.now() + 7 * 24 * 36000* 60 * 1000),
    });

    await logAudit({
      id_admin:    admin.id_admin,
      action:      "LOGIN",
      entity_name: "admin",
      entity_id:   admin.id_admin,
      ip_address:  ip,
    });

    // Inclure les permissions du rôle dans la réponse
    const rolePerms = Array.isArray((admin as any).role?.permissions)
      ? (admin as any).role.permissions
      : [];
    return {
      access_token,
      refresh_token,
      admin: {
        id_admin: admin.id_admin,
        nom:      admin.nom,
        email:    admin.email,
        role:     admin.role.nom,
        id_role:  admin.id_role,
      },
    };
  },

  async refresh(data: RefreshDto) {
    const payload = verifyRefreshToken(data.refresh_token);
    if (!payload) throw { status: 401, message: "Refresh token invalide ou expiré" };

    const session = await authRepository.findSession(data.refresh_token);
    if (!session) throw { status: 401, message: "Session expirée, veuillez vous reconnecter" };

    const newPayload = {
      id_admin: session.admin.id_admin,
      email:    session.admin.email,
      id_role:  session.admin.id_role,
      nom:      session.admin.nom,
    };

    const access_token  = generateAccessToken(newPayload);
    const refresh_token = generateRefreshToken(newPayload);

    // Rotation du refresh token
    await authRepository.deleteSession(data.refresh_token);
    await authRepository.createSession({
      id_admin:      session.admin.id_admin,
      refresh_token,
      expires_at:    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { access_token, refresh_token };
  },

  async logout(refresh_token: string, id_admin: number) {
    await authRepository.deleteSession(refresh_token);
    await logAudit({ id_admin, action: "LOGOUT", entity_name: "admin", entity_id: id_admin });
  },

  async me(id_admin: number) {
    const admin = await authRepository.findAdminById(id_admin);
    if (!admin) throw { status: 404, message: "Admin introuvable" };
    const { mot_de_passe, ...rest } = admin;
    // Attacher les permissions du rôle directement sur l'objet admin
    const safe = {
      ...rest,
      permissions: Array.isArray((admin as any).role?.permissions)
        ? (admin as any).role.permissions
        : [],
    };
    return safe;
  },

  async changePassword(id_admin: number, data: ChangePasswordDto) {
    const admin = await authRepository.findAdminById(id_admin);
    if (!admin) throw { status: 404, message: "Admin introuvable" };

    const ok = await comparePassword(data.current_password, (admin as any).mot_de_passe ?? "");
    if (!ok) throw { status: 400, message: "Mot de passe actuel incorrect" };

    const hashed = await hashPassword(data.new_password);
    await authRepository.updatePassword(id_admin, hashed);

    // Invalider toutes les sessions (sécurité)
    await authRepository.deleteAllSessions(id_admin);
    await logAudit({ id_admin, action: "UPDATE", entity_name: "admin", entity_id: id_admin, detail: { action: "change_password" } });
  },
};
