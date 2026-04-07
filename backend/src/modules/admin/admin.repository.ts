// src/modules/admin/admin.repository.ts
import { prisma } from "../../lib/prisma";

export const adminRepository = {

  async findAll() {
    return prisma.admin.findMany({
      orderBy: { created_at: "desc" },
      include: { role: { select: { nom: true } } },
    });
  },

  async findById(id_admin: number) {
    return prisma.admin.findUnique({
      where:   { id_admin },
      include: { role: { select: { nom: true } } },
    });
  },

  async findByEmail(email: string) {
    return prisma.admin.findUnique({ where: { email } });
  },

  async create(data: {
    nom: string; email: string; mot_de_passe: string; id_role: number;
  }) {
    return prisma.admin.create({
      data:    { ...data, actif: true },
      include: { role: { select: { nom: true } } },
    });
  },

  async update(id_admin: number, data: {
    nom?: string; email?: string; mot_de_passe?: string; id_role?: number; actif?: boolean;
  }) {
    return prisma.admin.update({
      where:   { id_admin },
      data,
      include: { role: { select: { nom: true } } },
    });
  },

  async delete(id_admin: number) {
    return prisma.admin.delete({ where: { id_admin } });
  },

  async findAllRoles() {
    return prisma.role.findMany({ orderBy: { id_role: "asc" } });
  },
};
