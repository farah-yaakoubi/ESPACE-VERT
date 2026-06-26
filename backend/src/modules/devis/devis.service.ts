// src/modules/devis/devis.service.ts
import { devisRepository } from "./devis.repository";
import { paginate } from "../../lib/response";
import { logAudit } from "../../lib/audit";
import { prisma } from "../../lib/prisma";
import { CreateDevisDto, UpdateDevisDto, DevisQueryDto, DEVIS_STATUTS } from "./devis.schema";
import { notifRepository } from "../notifications/notifications.repository";
import { notifSseBroadcast } from "../notifications/notifications.controller";
import {
  sendMail,
  tplDevisConfirmation,
  tplDevisStatutChange,
} from "../../lib/mailer";

// ── Transitions de statut autorisées (workflow) ───────────────────────────────
const VALID_TRANSITIONS: Record<string, string[]> = {
  nouveau:  ["en_cours", "rejete"],
  en_cours: ["traite", "rejete"],
  traite:   [],
  rejete:   [],
};

export const devisService = {

  // ── PUBLIC : soumettre une demande ────────────────────────────────────────
  async submit(data: CreateDevisDto) {
    let id_visiteur: number | undefined;
    if (data.token_visiteur) {
      const v = await prisma.visiteur.findUnique({
        where: { token_visiteur: data.token_visiteur },
      });
      if (v) id_visiteur = v.id_visiteur;
    }

    if (data.id_produit) {
      const p = await prisma.produit.findUnique({ where: { id_produit: data.id_produit } });
      if (!p || !p.actif) throw { status: 400, message: "Produit introuvable ou inactif" };
    }

    // Récupérer le nom du produit pour l'email
    let nomProduit: string | undefined;
    if (data.id_produit) {
      const p = await prisma.produit.findUnique({
        where:  { id_produit: data.id_produit },
        select: { nom: true },
      });
      nomProduit = p?.nom ?? undefined;
    }

    const devis = await devisRepository.create({
      nom:         data.nom.trim(),
      email:       data.email.toLowerCase().trim(),
      telephone:   data.telephone  ?? null,
      message:     data.message    ?? null,
      id_produit:  data.id_produit ?? null,
      id_visiteur: id_visiteur     ?? null,
    });

    // ── Email de confirmation au visiteur ──────────────────────────────────
    const { subject, html } = tplDevisConfirmation({
      nom:     data.nom.trim(),
      email:   data.email.toLowerCase().trim(),
      produit: nomProduit,
      message: data.message ?? undefined,
    });
    sendMail({ to: data.email.toLowerCase().trim(), subject, html }).catch((e) =>
      console.error("[devis.email.confirmation]", e)
    );

    // ── Notification admin ─────────────────────────────────────────────────
    try {
      await notifRepository.createForAll(
        "nouveau_devis",
        `Nouveau devis — ${data.nom.trim()}`,
        data.message?.slice(0, 80) ?? undefined,
        "/admin/devis",
        { source_label: data.nom.trim() }
      );
      notifSseBroadcast({ type: "nouveau_devis", titre: `Nouveau devis — ${data.nom.trim()}` });
    } catch (e) { console.error("[devis notif]", e); }

    return devis;
  },

  // ── ADMIN : liste paginée ─────────────────────────────────────────────────
  async list(params: DevisQueryDto) {
    const { devis, total } = await devisRepository.findAll(params);
    return { data: devis, meta: paginate(total, params.page, params.limit) };
  },

  // ── ADMIN : détail ────────────────────────────────────────────────────────
  async getById(id: number) {
    const d = await devisRepository.findById(id);
    if (!d) throw { status: 404, message: "Devis introuvable" };
    return d;
  },

  // ── ADMIN : mise à jour avec workflow + email ────────────────────────────
  async update(id: number, data: UpdateDevisDto, id_admin: number) {
    const current = await devisService.getById(id);

    if (data.statut && data.statut !== current.statut) {
      const allowed = VALID_TRANSITIONS[current.statut as string] ?? [];
      if (!allowed.includes(data.statut)) {
        throw {
          status:  422,
          message: `Transition de statut invalide : ${current.statut} → ${data.statut}. Transitions autorisées : ${allowed.join(", ") || "aucune"}`,
        };
      }
    }


    // ── Statut automatique : si réponse admin et statut "nouveau" → "en_cours" ──
    if (data.reponse_admin && data.reponse_admin.trim() && !data.statut && current.statut === "nouveau") {
      data = { ...data, statut: "en_cours" };
    }

    const devis = await devisRepository.update(id, { ...data, id_admin });

    await logAudit({
      id_admin,
      action:      data.statut ? "STATUS_CHANGE" : "UPDATE",
      entity_name: "devis",
      entity_id:   id,
      detail:      { statut_avant: current.statut, statut_apres: data.statut ?? current.statut },
    });

    // ── Email au visiteur si changement de statut ──────────────────────────
    // Seuls les statuts visibles par le client déclenchent un email
    const STATUTS_NOTIFIABLES = ["en_cours", "traite", "rejete"];
    if (data.statut && data.statut !== current.statut && STATUTS_NOTIFIABLES.includes(data.statut)) {
      // Récupérer le nom du produit
      const nomProduit = (current as any)?.produit?.nom ?? undefined;
      const { subject, html } = tplDevisStatutChange({
        nom:           current.nom,
        statut:        data.statut,
        reponse_admin: data.reponse_admin ?? current.reponse_admin ?? null,
        produit:       nomProduit,
      });
      sendMail({ to: current.email, subject, html }).catch((e) =>
        console.error("[devis.email.statut]", e)
      );
    }

    return devis;
  },

  // ── ADMIN : suppression ──────────────────────────────────────────────────
  async delete(id: number, id_admin: number) {
    await devisService.getById(id);
    await devisRepository.delete(id);
    await logAudit({ id_admin, action: "DELETE", entity_name: "devis", entity_id: id });
  },

  // ── ADMIN : statistiques rapides ─────────────────────────────────────────
  async stats() {
    const counts = await devisRepository.countByStatut();
    return Object.fromEntries(
      DEVIS_STATUTS.map(s => [s, counts.find((c: { statut: string; _count: { statut: number } }) => c.statut === s)?._count.statut ?? 0])
    );
  },
};