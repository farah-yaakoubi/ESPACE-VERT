/**
 * Duplique l'arborescence de catégories existante de l'activité
 * "jardinage-et-machinisme" (Tondeuses, Taille-haies, Tronçonneuses, ...)
 * en sous-catégories sous CHACUNE des 7 catégories-marques
 * (jm-weibang, jm-agricut, jm-wiedenmann, jm-staub, jm-etesia, jm-wolf, jm-active)
 * créées par la migration `20260709120000_add_jardinage_brand_categories`.
 *
 * ⚠️ Ce script est 100% ADDITIF :
 *   - il ne supprime rien
 *   - il ne touche à aucun produit existant
 *   - il est idempotent (relançable sans créer de doublons)
 *
 * Après l'avoir exécuté, tu devras réaffecter manuellement chaque produit
 * existant vers la bonne sous-catégorie de marque (back-office > Catalogue
 * > Produits > modifier > catégorie), car rien dans la base actuelle ne
 * permet de savoir automatiquement à quelle marque appartient un produit
 * donné.
 *
 * Utilisation :
 *   cd backend
 *   node scripts/reorganize-jardinage-brands.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ACTIVITE_SLUG = 'jardinage-et-machinisme';
const BRAND_SLUGS = [
  'jm-weibang',
  'jm-agricut',
  'jm-wiedenmann',
  'jm-staub',
  'jm-etesia',
  'jm-wolf',
  'jm-active',
];

async function cloneSubtree(oldCat, newParentId, brandCat, idActivite) {
  const newSlug = `${brandCat.slug}-${oldCat.slug}`;

  let clone = await prisma.categorie.findUnique({ where: { slug: newSlug } });
  if (!clone) {
    clone = await prisma.categorie.create({
      data: {
        nom: oldCat.nom,
        description: oldCat.description,
        image: oldCat.image,
        slug: newSlug,
        id_activite: idActivite,
        id_marque: brandCat.id_marque,
        parent_id: newParentId,
        ordre: oldCat.ordre,
        actif: oldCat.actif,
      },
    });
    console.log(`  + créée : ${clone.nom}  (${clone.slug})`);
  } else {
    console.log(`  = déjà présente : ${clone.nom}  (${clone.slug})`);
  }

  const children = await prisma.categorie.findMany({
    where: { parent_id: oldCat.id_categorie },
  });
  for (const child of children) {
    await cloneSubtree(child, clone.id_categorie, brandCat, idActivite);
  }
}

async function main() {
  const activite = await prisma.activite.findUnique({ where: { slug: ACTIVITE_SLUG } });
  if (!activite) {
    throw new Error(`Activité "${ACTIVITE_SLUG}" introuvable.`);
  }

  const brandCats = await prisma.categorie.findMany({
    where: { slug: { in: BRAND_SLUGS } },
  });
  if (brandCats.length !== BRAND_SLUGS.length) {
    const trouvees = brandCats.map((c) => c.slug);
    const manquantes = BRAND_SLUGS.filter((s) => !trouvees.includes(s));
    throw new Error(
      `Catégories de marque manquantes : ${manquantes.join(', ')}. ` +
      `As-tu bien exécuté la migration "add_jardinage_brand_categories" avant ce script ?`
    );
  }

  const oldCats = await prisma.categorie.findMany({
    where: {
      id_activite: activite.id_activite,
      parent_id: null,
      slug: { notIn: BRAND_SLUGS },
    },
  });

  console.log(`${oldCats.length} catégorie(s) existante(s) à dupliquer sous chaque marque :`);
  oldCats.forEach((c) => console.log(`  - ${c.nom} (${c.slug})`));

  for (const brandCat of brandCats) {
    console.log(`\n→ Marque : ${brandCat.nom} (${brandCat.slug})`);
    for (const oldCat of oldCats) {
      await cloneSubtree(oldCat, brandCat.id_categorie, brandCat, activite.id_activite);
    }
  }

  console.log('\n✅ Terminé.');
  console.log('   Les anciennes catégories et leurs produits n\'ont PAS été modifiés.');
  console.log('   Prochaine étape : réaffecter chaque produit existant vers la bonne');
  console.log('   sous-catégorie de marque via le back-office.');
}

main()
  .catch((e) => {
    console.error('❌ Erreur :', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
