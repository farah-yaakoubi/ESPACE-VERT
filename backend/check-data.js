const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('🔍 Vérification des données dans la base de données...\n');

    // Vérifier les rôles
    const roles = await prisma.role.findMany();
    console.log(`📋 Rôles: ${roles.length} enregistrement(s)`);
    if (roles.length > 0) {
      roles.forEach(role => console.log(`   - ${role.nom}`));
    }

    // Vérifier les admins
    const admins = await prisma.admin.findMany();
    console.log(`\n👤 Admins: ${admins.length} enregistrement(s)`);
    if (admins.length > 0) {
      admins.forEach(admin => console.log(`   - ${admin.email} (${admin.nom})`));
    }

    // Vérifier les FAQs
    const faqs = await prisma.faq.findMany();
    console.log(`\n❓ FAQs: ${faqs.length} enregistrement(s)`);

    // Vérifier les produits
    const produits = await prisma.produit.findMany();
    console.log(`\n🛍️  Produits: ${produits.length} enregistrement(s)`);

    // Vérifier les catégories
    const categories = await prisma.categorie.findMany();
    console.log(`\n📁 Catégories: ${categories.length} enregistrement(s)`);

    // Vérifier les activités
    const activites = await prisma.activite.findMany();
    console.log(`\n🎯 Activités: ${activites.length} enregistrement(s)`);

    console.log('\n✅ Vérification terminée!');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
