import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seed en cours...");

  // Rôles
  const superAdminRole = await prisma.role.upsert({
    where:  { nom: "super_admin" },
    update: {},
    create: { nom: "super_admin", permissions: ["*"] },
  });

  await prisma.role.upsert({
    where:  { nom: "admin" },
    update: {},
    create: {
      nom: "admin",
      permissions: [
        "produits.*", "marques.*", "categories.*",
        "activites.*", "actualites.*", "faq.*",
        "devis.read", "devis.update",
        "rdv.read", "rdv.update",
        "messages.read", "messages.reply",
      ],
    },
  });

  // Super Admin
  const hash = await bcrypt.hash("Admin@EV2025!", 12);
  await prisma.admin.upsert({
    where:  { email: "admin@espacevert.tn" },
    update: {},
    create: {
      nom:          "Super Admin",
      email:        "admin@espacevert.tn",
      mot_de_passe: hash,
      id_role:      superAdminRole.id_role,
      actif:        true,
    },
  });

  // Marques
  for (const m of [
    { nom: "Fertivert", slug: "fertivert", description: "Solutions de fertilisation" },
    { nom: "Pulvert",   slug: "pulvert",   description: "Équipements de pulvérisation" },
    { nom: "Matar",     slug: "matar",     description: "Systèmes d'irrigation" },
  ]) {
    await prisma.marque.upsert({
      where:  { slug: m.slug },
      update: {},
      create: { ...m, actif: true },
    });
  }

  // Activités
  for (const a of [
    { nom: "Semences et Plants",      slug: "semences-et-plants",      ordre: 1 },
    { nom: "Irrigation",              slug: "irrigation",              ordre: 2 },
    { nom: "Fertilisation",           slug: "fertilisation",           ordre: 3 },
    { nom: "Machinisme et Jardinage", slug: "machinisme-et-jardinage", ordre: 4 },
    { nom: "Pulvérisation",           slug: "pulverisation",           ordre: 5 },
  ]) {
    await prisma.activite.upsert({
      where:  { slug: a.slug },
      update: {},
      create: { ...a, actif: true },
    });
  }

  console.log("✅ Seed terminé !");
  console.log("📧 Email    : admin@espacevert.tn");
  console.log("🔑 Password : Admin@EV2025!");
  console.log("⚠️  Changez le mot de passe après la 1ère connexion !");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());