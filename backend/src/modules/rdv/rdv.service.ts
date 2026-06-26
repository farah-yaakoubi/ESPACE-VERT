// src/modules/rdv/rdv.service.ts
import { rdvRepository } from "./rdv.repository";
import { paginate } from "../../lib/response";
import { logAudit } from "../../lib/audit";
import { prisma } from "../../lib/prisma";
import { CreateRdvDto, UpdateRdvDto, RdvQueryDto, RDV_STATUTS } from "./rdv.schema";
import { notifRepository } from "../notifications/notifications.repository";
import { notifSseBroadcast } from "../notifications/notifications.controller";
import {
  sendMail,
  tplRdvConfirmation,
  tplRdvStatutChange,
} from "../../lib/mailer";

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

    const rdv = await rdvRepository.create({
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

    // ── Email de confirmation au visiteur ──────────────────────────────────
    const { subject, html } = tplRdvConfirmation({
      nom:            data.nom.trim(),
      email:          data.email.toLowerCase().trim(),
      date_souhaitee: dateRdv,
      heure:          data.heure   ?? null,
      agence:         data.agence  ?? null,
      objet:          data.objet   ?? null,
    });
    sendMail({ to: data.email.toLowerCase().trim(), subject, html }).catch((e) =>
      console.error("[rdv.email.confirmation]", e)
    );

    // ── Notification admin ─────────────────────────────────────────────────
    try {
      const dateStr = dateRdv.toLocaleDateString("fr-FR");
      await notifRepository.createForAll(
        "nouveau_rdv",
        `Nouveau RDV — ${data.nom.trim()}`,
        `Souhaité le ${dateStr}`,
        "/admin/rdv",
        { source_label: data.nom.trim() }
      );
      notifSseBroadcast({ type: "nouveau_rdv", titre: `Nouveau RDV — ${data.nom.trim()}` });
    } catch (e) { console.error("[rdv notif]", e); }

    return rdv;
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


    // ── Statut automatique : si réponse admin envoyée et statut encore "nouveau" → "confirme" ──
    if (data.reponse_admin && data.reponse_admin.trim() && !data.statut && current.statut === "nouveau") {
      data = { ...data, statut: "confirme" };
    }

    const rdv = await rdvRepository.update(id, { ...data, id_admin });

    await logAudit({
      id_admin,
      action:      data.statut ? "STATUS_CHANGE" : "UPDATE",
      entity_name: "rdv",
      entity_id:   id,
      detail:      { statut_avant: current.statut, statut_apres: data.statut ?? current.statut },
    });

    // ── Email : toujours envoyer la réponse admin si présente ──────────────────
    if (data.reponse_admin && data.reponse_admin.trim()) {
      const { subject, html } = tplRdvStatutChange({
        nom:            current.nom,
        statut:         data.statut ?? current.statut,
        date_souhaitee: current.date_souhaitee,
        heure:          data.heure ?? current.heure ?? null,
        agence:         current.agence ?? null,
        message_admin:  data.reponse_admin,
      });
      sendMail({ to: current.email, subject, html }).catch((e) =>
        console.error("[rdv.email.reponse]", e)
      );
    }

    return rdv;
  },

  async stats() {
    const counts = await rdvRepository.countByStatut();
    return Object.fromEntries(
      RDV_STATUTS.map(s => [s, counts.find((c: { statut: string; _count: { statut: number } }) => c.statut === s)?._count.statut ?? 0])
    );
  },
};