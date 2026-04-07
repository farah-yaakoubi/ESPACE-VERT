// src/modules/admin/admin.service.ts
import { adminRepository } from "./admin.repository";
import { hashPassword } from "../../lib/auth";
import { logAudit } from "../../lib/audit";
import { CreateAdminDto, UpdateAdminDto } from "./admin.schema";

// Retire le mot de passe de la réponse
const sanitize = <T extends { mot_de_passe?: string }>(admin: T) => {
  const { mot_de_passe, ...safe } = admin;
  return safe;
};

export const adminService = {

  async list() {
    const admins = await adminRepository.findAll();
    return admins.map(sanitize);
  },

  async getRoles() {
    return adminRepository.findAllRoles();
  },

  async getById(id: number) {
    const a = await adminRepository.findById(id);
    if (!a) throw { status: 404, message: "Admin introuvable" };
    return sanitize(a);
  },

  async create(data: CreateAdminDto, id_admin_requester: number) {
    const existing = await adminRepository.findByEmail(data.email.toLowerCase().trim());
    if (existing) throw { status: 409, message: "Email déjà utilisé" };

    const mot_de_passe = await hashPassword(data.password);
    const admin = await adminRepository.create({
      nom:          data.nom,
      email:        data.email.toLowerCase().trim(),
      mot_de_passe,
      id_role:      data.id_role,
    });

    await logAudit({ id_admin: id_admin_requester, action: "CREATE", entity_name: "admin", entity_id: admin.id_admin });
    return sanitize(admin);
  },

  async update(id: number, data: UpdateAdminDto, id_admin_requester: number) {
    await adminService.getById(id);

    const updateData: any = { ...data };
    delete updateData.password;

    if (data.password) {
      updateData.mot_de_passe = await hashPassword(data.password);
    }
    if (data.email) {
      updateData.email = data.email.toLowerCase().trim();
    }

    const admin = await adminRepository.update(id, updateData);
    await logAudit({ id_admin: id_admin_requester, action: "UPDATE", entity_name: "admin", entity_id: id });
    return sanitize(admin);
  },

  async delete(id: number, id_admin_requester: number) {
    if (id === id_admin_requester)
      throw { status: 400, message: "Impossible de supprimer votre propre compte" };

    await adminService.getById(id);
    await adminRepository.delete(id);
    await logAudit({ id_admin: id_admin_requester, action: "DELETE", entity_name: "admin", entity_id: id });
  },
};
