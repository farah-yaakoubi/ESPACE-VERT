// src/modules/admin/admin.repository.ts
import { prisma } from "../../lib/prisma";
export const adminRepository = {

  async findAll() {
    return prisma.admin.findMany({
      orderBy: { created_at: "desc" },
      include: { role: { select: { nom: true, permissions: true } } },
    });
  },

  async findById(id_admin: number) {
    return prisma.admin.findUnique({
      where:   { id_admin },
      include: { role: { select: { nom: true, permissions: true } } },
    });
  },

  async findByEmail(email: string) {
    return prisma.admin.findUnique({
      where:   { email },
      include: { role: { select: { nom: true, permissions: true } } },
    });
  },

  async create(data: {
    nom: string; email: string; mot_de_passe: string; id_role: number;
  }) {
    return prisma.admin.create({
      data:    { ...data, actif: true, permissions: [] },
      include: { role: { select: { nom: true, permissions: true } } },
    });
  },

  async update(id_admin: number, data: {
    nom?: string; email?: string; mot_de_passe?: string; id_role?: number;
    actif?: boolean; avatar?: string | null; permissions?: string[];
  }) {
    const { permissions, ...rest } = data;
    return prisma.admin.update({
      where:   { id_admin },
      data: {
        ...rest,
        // Prisma stocke Json — on passe le tableau directement
        ...(permissions !== undefined && { permissions }),
      },
      include: { role: { select: { nom: true, permissions: true } } },
    });
  },

  async delete(id_admin: number) {
    return prisma.admin.delete({ where: { id_admin } });
  },

  async findAllRoles() {
    return prisma.role.findMany({ orderBy: { id_role: "asc" } });
  },
};