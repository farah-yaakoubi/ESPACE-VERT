/**
 * cleanup_before_reseed.js
 * 
 * Supprime les activités et catégories en double / obsolètes
 * avant de relancer seed_catalogue.js
 * 
 * Usage : node cleanup_before_reseed.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Slugs d'activités VALIDES (ceux qui seront créés par seed_catalogue.js)
const SLUGS_ACTIVITES_VALIDES = new Set([
  'semences-et-plants',
  'irrigation',
  'fertilisation',
  'pulverisation',
  'jardinage-machinisme',
]);

// Slugs de catégories d'activités VALIDES (tous ceux créés par seed_catalogue.js)
const SLUGS_CATEGORIES_ACTIVITES_VALIDES = new Set([
  'act-plants-pommes-de-terre',
  'act-semences-maraicheres',
  'act-semences-maraicheres-garden',
  'act-semences-maraicheres-garden-baddar',
  'act-semences-maraicheres-pro',
  'act-semences-maraicheres-pro-standard',
  'act-semences-maraicheres-pro-hybride',
  'act-semences-fourrageres',
  'act-semences-fourrageres-luzerne',
  'act-semences-fourrageres-avoine',
  'act-semences-fourrageres-mais',
  'act-semences-fourrageres-sorgho',
  'act-semences-gazon',
  'act-semences-gazon-garden',
  'act-semences-gazon-garden-turfline',
  'act-semences-gazon-pro',
  'act-semences-gazon-pro-topgreen',
  'act-semences-florales',
  'act-semences-florales-garden',
  'act-semences-florales-pro',
]);

async function main() {
  console.log('\n🧹 Nettoyage avant re-seed...\n');

  // ── 1. Supprimer les catégories liées aux activités qui ne sont PAS dans la liste valide
  const toutesLesCatsActivite = await prisma.categorie.findMany({
    where: { id_activite: { not: null } },
    select: { id_categorie: true, nom: true, slug: true },
  });

  const catsASupprimer = toutesLesCatsActivite.filter(c => !SLUGS_CATEGORIES_ACTIVITES_VALIDES.has(c.slug));

  if (catsASupprimer.length > 0) {
    console.log(`🗑️  Suppression de ${catsASupprimer.length} catégorie(s) obsolète(s) :`);
    for (const c of catsASupprimer) {
      console.log(`   - [${c.id_categorie}] ${c.nom} (${c.slug})`);
    }
    await prisma.categorie.deleteMany({
      where: { id_categorie: { in: catsASupprimer.map(c => c.id_categorie) } },
    });
    console.log('   ✅ Catégories supprimées\n');
  } else {
    console.log('✅ Aucune catégorie d\'activité obsolète trouvée\n');
  }

  // ── 2. Supprimer les activités dont le slug n'est PAS dans la liste valide
  const toutesLesActivites = await prisma.activite.findMany({
    select: { id_activite: true, nom: true, slug: true },
  });

  const activitesASupprimer = toutesLesActivites.filter(a => !SLUGS_ACTIVITES_VALIDES.has(a.slug));

  if (activitesASupprimer.length > 0) {
    console.log(`🗑️  Suppression de ${activitesASupprimer.length} activité(s) obsolète(s) :`);
    for (const a of activitesASupprimer) {
      console.log(`   - [${a.id_activite}] ${a.nom} (${a.slug})`);
    }
    await prisma.activite.deleteMany({
      where: { id_activite: { in: activitesASupprimer.map(a => a.id_activite) } },
    });
    console.log('   ✅ Activités supprimées\n');
  } else {
    console.log('✅ Aucune activité obsolète trouvée\n');
  }

  // ── 3. Rapport final
  const activitesRestantes = await prisma.activite.findMany({ select: { nom: true, slug: true } });
  const catsRestantes = await prisma.categorie.findMany({
    where: { id_activite: { not: null } },
    select: { nom: true, slug: true, parent_id: true },
  });

  console.log(`📊 État après nettoyage :`);
  console.log(`   Activités : ${activitesRestantes.length}`);
  activitesRestantes.forEach(a => console.log(`      • ${a.nom} (${a.slug})`));
  console.log(`   Catégories d'activités : ${catsRestantes.length}`);
  console.log('\n✅ Nettoyage terminé. Lance maintenant : node seed_catalogue.js\n');
}

main()
  .catch(e => { console.error('❌ Erreur:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());