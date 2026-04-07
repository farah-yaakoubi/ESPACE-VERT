// src/modules/devis/devis.service.ts
import { devisRepository } from "./devis.repository";
import { paginate } from "../../lib/response";
import { logAudit } from "../../lib/audit";
import { prisma } from "../../lib/prisma";
import { CreateDevisDto, UpdateDevisDto, DevisQueryDto } from "./devis.schema";

export const devisService = {

  // ── Public : soumettre une demande ────────────────────────────
  async submit(data: CreateDevisDto) {
    // Résoudre le visiteur depuis son token
    let id_visiteur: number | undefined;
    if (data.token_visiteur) {
      const v = await prisma.visiteur.findUnique({ where: { token_visiteur: data.token_visiteur } });
      if (v) id_visiteur = v.id_visiteur;
    }

    // Vérifier que le produit existe si fourni
    if (data.id_produit) {
      const p = await prisma.produit.findUnique({ where: { id_produit: data.id_produit } });
      if (!p) throw { status: 400, message: "Produit introuvable" };
    }

    return devisRepository.create({
      nom:        data.nom.trim(),
      email:      data.email.toLowerCase().trim(),
      telephone:  data.telephone  ?? null,
      message:    data.message    ?? null,
      id_produit: data.id_produit ?? null,
      id_visiteur: id_visiteur    ?? null,
    });
  },

  // ── Admin ─────────────────────────────────────────────────────
  async list(params: DevisQueryDto) {
    const { devis, total } = await devisRepository.findAll(params);
    return { data: devis, meta: paginate(total, params.page, params.limit) };
  },

  async getById(id: number) {
    const d = await devisRepository.findById(id);
    if (!d) throw { status: 404, message: "Devis introuvable" };
    return d;
  },

  async update(id: number, data: UpdateDevisDto, id_admin: number) {
    await devisService.getById(id);
    const devis = await devisRepository.update(id, { ...data, id_admin });
    await logAudit({ id_admin, action: "UPDATE", entity_name: "devis", entity_id: id, detail: { statut: data.statut } });
    return devis;
  },

  async delete(id: number, id_admin: number) {
    await devisService.getById(id);
    await devisRepository.delete(id);
    await logAudit({ id_admin, action: "DELETE", entity_name: "devis", entity_id: id });
  },
};
