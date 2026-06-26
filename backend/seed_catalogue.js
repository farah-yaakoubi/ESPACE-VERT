/**
 * seed_catalogue.js
 * Marques (groupe + partenaires) + catégories marques + activités + sous-catégories.
 * Usage : node seed_catalogue.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function upsertMarque({ nom, slug, description, type_marque }) {
  return prisma.marque.upsert({
    where:  { slug },
    update: { nom, description, type_marque, actif: true },
    create: { nom, slug, description: description ?? null, type_marque, actif: true },
  });
}

async function upsertActivite({ nom, slug, description, ordre }) {
  return prisma.activite.upsert({
    where:  { slug },
    update: { nom, description, ordre, actif: true },
    create: { nom, slug, description: description ?? null, ordre, actif: true },
  });
}

async function upsertCategorie({ nom, slug, id_marque, id_activite, parent_id, ordre }) {
  return prisma.categorie.upsert({
    where:  { slug },
    update: { nom, id_marque: id_marque ?? null, id_activite: id_activite ?? null, parent_id: parent_id ?? null, ordre, actif: true },
    create: { nom, slug, id_marque: id_marque ?? null, id_activite: id_activite ?? null, parent_id: parent_id ?? null, ordre, actif: true },
  });
}

async function main() {
  console.log('\n🌱 Seeding catalogue...\n');

  // ══════════════════════════════════════════════════════════════════
  // 1. MARQUES DU GROUPE (4 exactement)
  // ══════════════════════════════════════════════════════════════════
  console.log('── Marques Groupe ──');

  const baddar    = await upsertMarque({ nom: 'Baddar Semences', slug: 'baddar-semences', description: 'Semences & Plants — marque groupe.', type_marque: 'groupe' });
  const matar     = await upsertMarque({ nom: 'Matar',           slug: 'matar',           description: 'Irrigation — marque groupe.',       type_marque: 'groupe' });
  const fertivert = await upsertMarque({ nom: 'Fertivert',       slug: 'fertivert',       description: 'Fertilisation — marque groupe.',    type_marque: 'groupe' });
  const pulvert   = await upsertMarque({ nom: 'Pulvert',         slug: 'pulvert',         description: 'Pulvérisation — marque groupe.',    type_marque: 'groupe' });

  console.log('  ✅', baddar.nom, '|', matar.nom, '|', fertivert.nom, '|', pulvert.nom);

  // Catégories des marques groupe
  await upsertCategorie({ nom: 'Semences & Plants', slug: 'baddar-semences-plants',   id_marque: baddar.id_marque,    ordre: 1 });
  await upsertCategorie({ nom: 'Irrigation',        slug: 'matar-irrigation',         id_marque: matar.id_marque,     ordre: 1 });
  await upsertCategorie({ nom: 'Fertilisation',     slug: 'fertivert-fertilisation',  id_marque: fertivert.id_marque, ordre: 1 });
  await upsertCategorie({ nom: 'Pulvérisation',     slug: 'pulvert-pulverisation',     id_marque: pulvert.id_marque,  ordre: 1 });

  // ══════════════════════════════════════════════════════════════════
  // 2. MARQUES PARTENAIRES
  // ══════════════════════════════════════════════════════════════════
  console.log('\n── Marques Partenaires ──');

  // Semences & Plants
  const semencesPartenaires = [
    { nom: 'Elorn Plants',      slug: 'elorn-plants'      },
    { nom: 'Griffaton',         slug: 'griffaton'         },
    { nom: 'Nexeeds',           slug: 'nexeeds'           },
    { nom: 'Coraseeds',         slug: 'coraseeds'         },
    { nom: 'Service Plus',      slug: 'service-plus'      },
    { nom: 'TopGreen',          slug: 'topgreen'          },
    { nom: 'Seminart',          slug: 'seminart'          },
    { nom: 'Lidea',             slug: 'lidea'             },
    { nom: 'Caussade Semences', slug: 'caussade-semences' },
    { nom: 'Southern Seed',     slug: 'southern-seed'     },
    { nom: 'Tera Seeds',        slug: 'tera-seeds'        },
    { nom: 'Sem',               slug: 'sem'               },
  ];
  for (const m of semencesPartenaires) {
    const created = await upsertMarque({ ...m, description: 'Partenaire Semences & Plants.', type_marque: 'partenaire' });
    await upsertCategorie({ nom: 'Semences & Plants', slug: `${m.slug}-semences-plants`, id_marque: created.id_marque, ordre: 1 });
    console.log('  ✅', created.nom);
  }

  // Irrigation partenaires
  const irrigationPartenaires = [
    { nom: 'Mondiale Irrigation', slug: 'mondiale-irrigation' },
    { nom: 'Rivilus',             slug: 'rivilus'             },
    { nom: 'Idroland',            slug: 'idroland'            },
  ];
  for (const m of irrigationPartenaires) {
    const created = await upsertMarque({ ...m, description: 'Partenaire Irrigation.', type_marque: 'partenaire' });
    await upsertCategorie({ nom: 'Irrigation', slug: `${m.slug}-irrigation`, id_marque: created.id_marque, ordre: 1 });
    console.log('  ✅', created.nom);
  }

  // Jardinage & Machinisme
  const jardinagePartenaires = [
    { nom: 'Weibang',     slug: 'weibang'     },
    { nom: 'Agricut',     slug: 'agricut'     },
    { nom: 'Active',      slug: 'active'      },
    { nom: 'Etesia',      slug: 'etesia'      },
    { nom: 'Outils Wolf', slug: 'outils-wolf' },
    { nom: 'Staub',       slug: 'staub'       },
    { nom: 'Wiedenmann',  slug: 'wiedenmann'  },
  ];
  for (const m of jardinagePartenaires) {
    const created = await upsertMarque({ ...m, description: 'Partenaire Jardinage & Machinisme.', type_marque: 'partenaire' });
    await upsertCategorie({ nom: 'Jardinage & Machinisme', slug: `${m.slug}-jardinage`, id_marque: created.id_marque, ordre: 1 });
    console.log('  ✅', created.nom);
  }

  // ══════════════════════════════════════════════════════════════════
  // 3. ACTIVITÉS + sous-catégories
  // ══════════════════════════════════════════════════════════════════
  console.log('\n── Activités ──');

  // ── Semences & Plants ─────────────────────────────────────────────
  const actSemences = await upsertActivite({ nom: 'Semences & Plants', slug: 'semences-et-plants', description: 'Toute notre gamme semences et plants.', ordre: 1 });
  const actId = actSemences.id_activite;

  // Récupérer la marque "Sem" pour les florales
  const marqueSem = await prisma.marque.findUnique({ where: { slug: 'sem' } });
  // Récupérer la marque "Baddar Semences" pour Garden maraîchères
  const marqueBaddar = await prisma.marque.findUnique({ where: { slug: 'baddar-semences' } });
  // Récupérer la marque "TopGreen" pour gazon
  const marqueTopGreen = await prisma.marque.findUnique({ where: { slug: 'topgreen' } });

  // ── 1. Plants de pommes de terre (niveau 1, pas de sous-cats) ─────
  await upsertCategorie({
    nom: 'Plants de pommes de terre',
    slug: 'act-plants-pommes-de-terre',
    id_activite: actId,
    ordre: 1,
  });

  // ── 2. Semences maraîchères ────────────────────────────────────────
  //   └── Garden (niveau 2) — lié à Baddar Semences
  //       └── Baddar Semences (niveau 3) — marque
  //   └── Pro (niveau 2)
  //       └── Standard (niveau 3)
  //       └── Hybride  (niveau 3)
  const catMaraicheres = await upsertCategorie({
    nom: 'Semences maraîchères',
    slug: 'act-semences-maraicheres',
    id_activite: actId,
    ordre: 2,
  });

  const catMaraGarden = await upsertCategorie({
    nom: 'Garden',
    slug: 'act-semences-maraicheres-garden',
    id_activite: actId,
    parent_id: catMaraicheres.id_categorie,
    ordre: 1,
  });
  // Baddar Semences est le niveau 3 sous Garden
  await upsertCategorie({
    nom: 'Baddar Semences',
    slug: 'act-semences-maraicheres-garden-baddar',
    id_activite: actId,
    id_marque: marqueBaddar ? marqueBaddar.id_marque : null,
    parent_id: catMaraGarden.id_categorie,
    ordre: 1,
  });

  const catMaraPro = await upsertCategorie({
    nom: 'Pro',
    slug: 'act-semences-maraicheres-pro',
    id_activite: actId,
    parent_id: catMaraicheres.id_categorie,
    ordre: 2,
  });
  await upsertCategorie({
    nom: 'Standard',
    slug: 'act-semences-maraicheres-pro-standard',
    id_activite: actId,
    parent_id: catMaraPro.id_categorie,
    ordre: 1,
  });
  await upsertCategorie({
    nom: 'Hybride',
    slug: 'act-semences-maraicheres-pro-hybride',
    id_activite: actId,
    parent_id: catMaraPro.id_categorie,
    ordre: 2,
  });

  // ── 3. Semences fourragères ────────────────────────────────────────
  //   └── Luzerne (niveau 2)
  //   └── Avoine  (niveau 2)
  //   └── Maïs    (niveau 2)
  //   └── Sorgho  (niveau 2)
  const catFourrageres = await upsertCategorie({
    nom: 'Semences fourragères',
    slug: 'act-semences-fourrageres',
    id_activite: actId,
    ordre: 3,
  });
  await upsertCategorie({ nom: 'Luzerne', slug: 'act-semences-fourrageres-luzerne', id_activite: actId, parent_id: catFourrageres.id_categorie, ordre: 1 });
  await upsertCategorie({ nom: 'Avoine',  slug: 'act-semences-fourrageres-avoine',  id_activite: actId, parent_id: catFourrageres.id_categorie, ordre: 2 });
  await upsertCategorie({ nom: 'Maïs',    slug: 'act-semences-fourrageres-mais',    id_activite: actId, parent_id: catFourrageres.id_categorie, ordre: 3 });
  await upsertCategorie({ nom: 'Sorgho',  slug: 'act-semences-fourrageres-sorgho',  id_activite: actId, parent_id: catFourrageres.id_categorie, ordre: 4 });

  // ── 4. Semences gazon ─────────────────────────────────────────────
  //   └── Garden (niveau 2)
  //       └── Turfline (niveau 3)
  //   └── Pro (niveau 2)
  //       └── Top Green (niveau 3) — lié à marque TopGreen
  const catGazon = await upsertCategorie({
    nom: 'Semences gazon',
    slug: 'act-semences-gazon',
    id_activite: actId,
    ordre: 4,
  });

  const catGazonGarden = await upsertCategorie({
    nom: 'Garden',
    slug: 'act-semences-gazon-garden',
    id_activite: actId,
    parent_id: catGazon.id_categorie,
    ordre: 1,
  });
  await upsertCategorie({
    nom: 'Turfline',
    slug: 'act-semences-gazon-garden-turfline',
    id_activite: actId,
    parent_id: catGazonGarden.id_categorie,
    ordre: 1,
  });

  const catGazonPro = await upsertCategorie({
    nom: 'Pro',
    slug: 'act-semences-gazon-pro',
    id_activite: actId,
    parent_id: catGazon.id_categorie,
    ordre: 2,
  });
  await upsertCategorie({
    nom: 'Top Green',
    slug: 'act-semences-gazon-pro-topgreen',
    id_activite: actId,
    id_marque: marqueTopGreen ? marqueTopGreen.id_marque : null,
    parent_id: catGazonPro.id_categorie,
    ordre: 1,
  });

  // ── 5. Semences florales ───────────────────────────────────────────
  //   └── Garden (niveau 2) — lié à marque Sem
  //   └── Pro    (niveau 2)
  const catFlorales = await upsertCategorie({
    nom: 'Semences florales',
    slug: 'act-semences-florales',
    id_activite: actId,
    ordre: 5,
  });
  await upsertCategorie({
    nom: 'Garden',
    slug: 'act-semences-florales-garden',
    id_activite: actId,
    id_marque: marqueSem ? marqueSem.id_marque : null,
    parent_id: catFlorales.id_categorie,
    ordre: 1,
  });
  await upsertCategorie({
    nom: 'Pro',
    slug: 'act-semences-florales-pro',
    id_activite: actId,
    parent_id: catFlorales.id_categorie,
    ordre: 2,
  });

  console.log('  ✅ Semences & Plants — 5 catégories créées avec hiérarchie complète');

  // ── Autres activités ──────────────────────────────────────────────
  await upsertActivite({ nom: 'Irrigation',             slug: 'irrigation',            description: "Solutions d'irrigation.", ordre: 2 });
  await upsertActivite({ nom: 'Fertilisation',          slug: 'fertilisation',         description: 'Engrais et fertilisation.', ordre: 3 });
  await upsertActivite({ nom: 'Pulvérisation',          slug: 'pulverisation',         description: 'Matériel de pulvérisation.', ordre: 4 });
  await upsertActivite({ nom: 'Jardinage & Machinisme', slug: 'jardinage-machinisme',  description: 'Outils et machines.', ordre: 5 });

  console.log('  ✅ Irrigation / Fertilisation / Pulvérisation / Jardinage créées');
  console.log('\n✅ Seed catalogue terminé.\n');
}

main()
  .catch((e) => { console.error('❌ Erreur seed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());