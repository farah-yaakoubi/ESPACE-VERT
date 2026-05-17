// src/modules/auth/auth.repository.ts — CORRIGÉ : inclut permissions du rôle
import { prisma } from "../../lib/prisma";

export const authRepository = {

  async findAdminByEmail(email: string) {
    return prisma.admin.findUnique({
      where:   { email: email.toLowerCase().trim() },
      include: { role: true }, // role.permissions inclus pour vérification
    });
  },

  async findAdminById(id_admin: number) {
    return prisma.admin.findUnique({
      where:   { id_admin },
      include: { role: { select: { nom: true, permissions: true } } },
    });
  },

  async createSession(data: {
    id_admin:      number;
    refresh_token: string;
    ip_address?:   string;
    user_agent?:   string;
    expires_at:    Date;
  }) {
    return prisma.sessionAdmin.create({ data });
  },

  async findSession(refresh_token: string) {
    return prisma.sessionAdmin.findFirst({
      where:   { refresh_token },
      include: { admin: { include: { role: { select: { nom: true, permissions: true } } } } },
    });
  },

  async deleteSession(refresh_token: string) {
    return prisma.sessionAdmin.deleteMany({ where: { refresh_token } });
  },

  async deleteAllSessions(id_admin: number) {
    return prisma.sessionAdmin.deleteMany({ where: { id_admin } });
  },

  async updatePassword(id_admin: number, mot_de_passe: string) {
    return prisma.admin.update({ where: { id_admin }, data: { mot_de_passe } });
  },
};