// src/modules/rdv/rdv.service.ts
import { rdvRepository } from "./rdv.repository";
import { paginate } from "../../lib/response";
import { logAudit } from "../../lib/audit";
import { prisma } from "../../lib/prisma";
import { CreateRdvDto, UpdateRdvDto, RdvQueryDto, RDV_STATUTS } from "./rdv.schema";

const VALID_TRANSITIONS: Record<string, string[]> = {
  nouveau:  ["confirme", "annule"],
  confirme: ["termine", "annule"],
  annule:   [],
  termine:  [],
};

export const rdvService = {

  getCreneaux() {
    return rdvRepository.getCreneaux();
  },

  async book(data: CreateRdvDto) {
    const dateRdv = new Date(data.date_souhaitee);
    const today   = new Date(); today.setHours(0, 0, 0, 0);
    if (dateRdv < today) throw { status: 400, message: "La date ne peut pas être dans le passé" };

    let id_visiteur: number | undefined;
    if (data.token_visiteur) {
      const v = await prisma.visiteur.findUnique({ where: { token_visiteur: data.token_visiteur } });
      if (v) id_visiteur = v.id_visiteur;
    }

    return rdvRepository.create({
      nom:            data.nom.trim(),
      email:          data.email.toLowerCase().trim(),
      telephone:      data.telephone     ?? null,
      date_souhaitee: dateRdv,
      heure:          data.heure         ?? null,
      objet:          data.objet         ?? null,
      agence:         data.agence        ?? null,
      message:        data.message       ?? null,
      id_visiteur:    id_visiteur        ?? null,
    });
  },

  async list(params: RdvQueryDto) {
    const { rdvs, total } = await rdvRepository.findAll(params);
    return { data: rdvs, meta: paginate(total, params.page, params.limit) };
  },

  async getById(id: number) {
    const r = await rdvRepository.findById(id);
    if (!r) throw { status: 404, message: "Rendez-vous introuvable" };
    return r;
  },

  async update(id: number, data: UpdateRdvDto, id_admin: number) {
    const current = await rdvService.getById(id);

    if (data.statut && data.statut !== current.statut) {
      const allowed = VALID_TRANSITIONS[current.statut as string] ?? [];
      if (!allowed.includes(data.statut)) {
        throw {
          status:  422,
          message: `Transition invalide : ${current.statut} → ${data.statut}. Autorisées : ${allowed.join(", ") || "aucune"}`,
        };
      }
    }

    const rdv = await rdvRepository.update(id, { ...data, id_admin });

    await logAudit({
      id_admin,
      action:      data.statut ? "STATUS_CHANGE" : "UPDATE",
      entity_name: "rdv",
      entity_id:   id,
      detail:      { statut_avant: current.statut, statut_apres: data.statut ?? current.statut },
    });

    return rdv;
  },

  async stats() {
    const counts = await rdvRepository.countByStatut();
    return Object.fromEntries(
      RDV_STATUTS.map(s => [s, counts.find(c => c.statut === s)?._count.statut ?? 0])
    );
  },
};
