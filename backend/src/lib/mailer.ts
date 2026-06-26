// src/lib/mailer.ts
// Service d'envoi d'emails via nodemailer
// Utilise SMTP configuré dans .env (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)
// Compatible Gmail (SMTP_HOST=smtp.gmail.com), Brevo, Mailgun, etc.
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST  ?? "smtp.gmail.com",
  port:   Number(process.env.SMTP_PORT ?? "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
  },
});

// ── Vérification de la connexion SMTP au démarrage ────────────────────────────
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter.verify((error) => {
    if (error) console.error("[mailer] ❌ Connexion SMTP échouée :", error.message);
    else        console.log("[mailer] ✅ Connexion SMTP OK");
  });
}

const FROM_NAME    = process.env.EMAIL_FROM_NAME    ?? "Groupe Espace Vert Tunisie";
const FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS ?? process.env.SMTP_USER ?? "noreply@espacevert.tn";

export interface MailOptions {
  to:      string;
  subject: string;
  html:    string;
  text?:   string;
}

export async function sendMail(opts: MailOptions): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    // En dev sans config SMTP, log uniquement — ne bloque pas
    console.warn("[mailer] SMTP non configuré — email non envoyé à", opts.to);
    console.info("[mailer] Sujet :", opts.subject);
    return;
  }
  await transporter.sendMail({
    from:    `"${FROM_NAME}" <${FROM_ADDRESS}>`,
    to:      opts.to,
    subject: opts.subject,
    html:    opts.html,
    text:    opts.text,
  });
}

// ── Templates ──────────────────────────────────────────────────────────────────

function baseLayout(title: string, bodyHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f7f6; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #2d7a3e; color: #fff; padding: 24px 32px; }
    .header h1 { margin: 0; font-size: 20px; }
    .body { padding: 28px 32px; color: #333; line-height: 1.6; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: bold; }
    .badge-nouveau    { background: #dbeafe; color: #1d4ed8; }
    .badge-en_cours   { background: #fef3c7; color: #92400e; }
    .badge-traite     { background: #d1fae5; color: #065f46; }
    .badge-rejete     { background: #fee2e2; color: #991b1b; }
    .badge-confirme   { background: #d1fae5; color: #065f46; }
    .badge-annule     { background: #fee2e2; color: #991b1b; }
    .badge-termine    { background: #e0e7ff; color: #3730a3; }
    .info-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    .info-table td { padding: 8px 12px; border-bottom: 1px solid #eee; }
    .info-table td:first-child { font-weight: bold; width: 38%; color: #555; }
    .footer { background: #f0f4f1; padding: 16px 32px; font-size: 12px; color: #888; text-align: center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header"><h1>🌿 ${title}</h1></div>
    <div class="body">${bodyHtml}</div>
    <div class="footer">Groupe Espace Vert Tunisie — Ce message est automatique, merci de ne pas y répondre directement.</div>
  </div>
</body>
</html>`;
}

// ── Template confirmation de demande de devis ──────────────────────────────────
export function tplDevisConfirmation(data: {
  nom: string;
  email: string;
  produit?: string;
  message?: string;
}): { subject: string; html: string } {
  return {
    subject: "Votre demande de devis — Espace Vert Tunisie",
    html: baseLayout("Demande de devis reçue", `
      <p>Bonjour <strong>${data.nom}</strong>,</p>
      <p>Nous avons bien reçu votre demande de devis. Notre équipe l'examinera dans les plus brefs délais.</p>
      <table class="info-table">
        <tr><td>Nom</td><td>${data.nom}</td></tr>
        <tr><td>Email</td><td>${data.email}</td></tr>
        ${data.produit ? `<tr><td>Produit concerné</td><td>${data.produit}</td></tr>` : ""}
        ${data.message ? `<tr><td>Message</td><td>${data.message}</td></tr>` : ""}
      </table>
      <p>Vous recevrez un email dès que votre demande sera traitée.</p>
      <p>Cordialement,<br><strong>L'équipe Espace Vert Tunisie</strong></p>
    `),
  };
}

// ── Template changement de statut devis ───────────────────────────────────────
export function tplDevisStatutChange(data: {
  nom: string;
  statut: string;
  reponse_admin?: string | null;
  produit?: string;
}): { subject: string; html: string } {
  return {
    subject: "Réponse à votre demande de devis — Espace Vert Tunisie",
    html: baseLayout("Réponse à votre demande de devis", `
      <p>Bonjour <strong>${data.nom}</strong>,</p>
      <br/>
      <p>${data.reponse_admin ?? ""}</p>
      <br/>
      <p>Cordialement,<br><strong>L'équipe Espace Vert Tunisie</strong></p>
    `),
  };
}

// ── Template confirmation de rendez-vous ──────────────────────────────────────
export function tplRdvConfirmation(data: {
  nom: string;
  email: string;
  date_souhaitee: Date | string;
  heure?: string | null;
  agence?: string | null;
  objet?: string | null;
}): { subject: string; html: string } {
  const dateStr = new Date(data.date_souhaitee).toLocaleDateString("fr-FR", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  return {
    subject: "Votre demande de rendez-vous — Espace Vert Tunisie",
    html: baseLayout("Demande de rendez-vous reçue", `
      <p>Bonjour <strong>${data.nom}</strong>,</p>
      <p>Nous avons bien reçu votre demande de rendez-vous et vous confirmerons sa date définitive sous peu.</p>
      <table class="info-table">
        <tr><td>Nom</td><td>${data.nom}</td></tr>
        <tr><td>Email</td><td>${data.email}</td></tr>
        <tr><td>Date souhaitée</td><td>${dateStr}</td></tr>
        ${data.heure   ? `<tr><td>Heure</td><td>${data.heure}</td></tr>` : ""}
        ${data.agence  ? `<tr><td>Agence</td><td>${data.agence}</td></tr>` : ""}
        ${data.objet   ? `<tr><td>Objet</td><td>${data.objet}</td></tr>` : ""}
      </table>
      <p>Cordialement,<br><strong>L'équipe Espace Vert Tunisie</strong></p>
    `),
  };
}

// ── Template changement de statut RDV ─────────────────────────────────────────
export function tplRdvStatutChange(data: {
  nom: string;
  statut: string;
  date_souhaitee: Date | string;
  heure?: string | null;
  agence?: string | null;
  message_admin?: string | null;
}): { subject: string; html: string } {
  return {
    subject: "Réponse à votre demande de rendez-vous — Espace Vert Tunisie",
    html: baseLayout("Réponse à votre demande de rendez-vous", `
      <p>Bonjour <strong>${data.nom}</strong>,</p>
      <br/>
      <p>${data.message_admin ?? ""}</p>
      <br/>
      <p>Cordialement,<br><strong>L'équipe Espace Vert Tunisie</strong></p>
    `),
  };
}

// ── Template confirmation de message de contact ───────────────────────────────
export function tplContactConfirmation(data: {
  nom: string;
  email: string;
  sujet?: string | null;
  message: string;
}): { subject: string; html: string } {
  return {
    subject: "Votre message a bien été reçu — Espace Vert Tunisie",
    html: baseLayout("Message bien reçu", `
      <p>Bonjour <strong>${data.nom}</strong>,</p>
      <p>Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.</p>
      <table class="info-table">
        ${data.sujet ? `<tr><td>Sujet</td><td>${data.sujet}</td></tr>` : ""}
        <tr><td>Message</td><td>${data.message.substring(0, 300)}${data.message.length > 300 ? "…" : ""}</td></tr>
      </table>
      <p>Cordialement,<br><strong>L'équipe Espace Vert Tunisie</strong></p>
    `),
  };
}

// ── Template réponse admin au contact ─────────────────────────────────────────
export function tplContactReply(data: {
  nom: string;
  sujet?: string | null;
  reponse: string;
}): { subject: string; html: string } {
  return {
    subject: "Réponse à votre message — Espace Vert Tunisie",
    html: baseLayout("Réponse à votre message", `
      <p>Bonjour <strong>${data.nom}</strong>,</p>
      <br/>
      <p>${data.reponse}</p>
      <br/>
      <p>Cordialement,<br><strong>L'équipe Espace Vert Tunisie</strong></p>
    `),
  };
}