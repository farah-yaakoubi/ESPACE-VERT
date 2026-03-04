import { NextRequest, NextResponse } from "next/server";

// ─── Types ───────────────────────────────────────────────────────────────────
interface RendezVousData {
  nom: string;
  telephone: string;
  email: string;
  date: string;
  heure: string;
  agence: string;
  service: string;
  message: string;
}

// ─── Validation ───────────────────────────────────────────────────────────────
function validateRendezVous(data: Partial<RendezVousData>): string[] {
  const errors: string[] = [];
  if (!data.nom?.trim())       errors.push("Le nom est requis");
  if (!data.telephone?.trim()) errors.push("Le téléphone est requis");
  if (!data.email?.trim())     errors.push("L'email est requis");
  if (!data.date?.trim())      errors.push("La date est requise");
  if (!data.service?.trim())   errors.push("Le service est requis");
  if (!data.agence?.trim())    errors.push("L'agence est requise");

  // Date validation — pas dans le passé
  if (data.date) {
    const rdvDate = new Date(data.date);
    const today   = new Date();
    today.setHours(0, 0, 0, 0);
    if (rdvDate < today) errors.push("La date ne peut pas être dans le passé");
  }

  // Email simple validation
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("Format email invalide");
  }

  return errors;
}

// ─── POST handler ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body: RendezVousData = await request.json();

    // Validation
    const errors = validateRendezVous(body);
    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, message: "Données invalides", errors },
        { status: 400 }
      );
    }

    // Log côté serveur (remplacer par Nodemailer/SendGrid en production)
    console.log("═══════ NOUVEAU RENDEZ-VOUS ═══════");
    console.log("Nom       :", body.nom);
    console.log("Téléphone :", body.telephone);
    console.log("Email     :", body.email);
    console.log("Date      :", body.date, body.heure || "");
    console.log("Agence    :", body.agence);
    console.log("Service   :", body.service);
    console.log("Message   :", body.message || "(aucun)");
    console.log("═══════════════════════════════════");

    // ── Option : envoyer un email via Nodemailer ──
    // Pour activer : npm install nodemailer
    // puis décommenter ci-dessous et configurer les variables d'env
    /*
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Espace Vert Site" <${process.env.SMTP_USER}>`,
      to:   "secretariat.groupeev@planet.tn",
      subject: `[RDV] ${body.service} - ${body.nom} - ${body.date}`,
      html: `
        <h2>Nouveau Rendez-vous</h2>
        <table>
          <tr><td><b>Nom</b></td><td>${body.nom}</td></tr>
          <tr><td><b>Téléphone</b></td><td>${body.telephone}</td></tr>
          <tr><td><b>Email</b></td><td>${body.email}</td></tr>
          <tr><td><b>Date</b></td><td>${body.date} ${body.heure}</td></tr>
          <tr><td><b>Agence</b></td><td>${body.agence}</td></tr>
          <tr><td><b>Service</b></td><td>${body.service}</td></tr>
          <tr><td><b>Message</b></td><td>${body.message}</td></tr>
        </table>
      `,
    });
    */

    return NextResponse.json({
      success: true,
      message: "Rendez-vous enregistré avec succès. Nous vous contacterons pour confirmer.",
      data: {
        nom:     body.nom,
        date:    body.date,
        service: body.service,
        agence:  body.agence,
      },
    });

  } catch (error) {
    console.error("Erreur rendez-vous:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur, veuillez réessayer" },
      { status: 500 }
    );
  }
}

// ─── GET handler — liste les créneaux disponibles ─────────────────────────────
export async function GET() {
  const creneaux = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
                    "14:00","14:30","15:00","15:30","16:00","16:30"];
  return NextResponse.json({ creneaux });
}