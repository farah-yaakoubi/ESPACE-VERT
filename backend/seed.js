const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...\n');

  // ── Rôles ─────────────────────────────────────────────────────
  const superAdminRole = await prisma.role.upsert({
    where:  { id_role: 1 },
    update: { nom: 'super_admin', permissions: ['all'] },
    create: { id_role: 1, nom: 'super_admin', permissions: ['all'] },
  });
  console.log('✅ Rôle 1 :', superAdminRole.nom);

  const adminRole = await prisma.role.upsert({
    where:  { id_role: 2 },
    update: { nom: 'admin', permissions: ['read', 'write'] },
    create: { id_role: 2, nom: 'admin', permissions: ['read', 'write'] },
  });
  console.log('✅ Rôle 2 :', adminRole.nom);

  // ── Super Admin ────────────────────────────────────────────────
  const superPassword = 'Admin1234!';
  const superHash     = await bcrypt.hash(superPassword, 10);

  const superAdmin = await prisma.admin.upsert({
    where:  { email: 'admin@espacevert.tn' },
    update: { mot_de_passe: superHash, id_role: 1, actif: true },
    create: {
      nom:          'Super Admin',
      email:        'admin@espacevert.tn',
      mot_de_passe: superHash,
      id_role:      1,
      actif:        true,
    },
  });
  console.log('✅ Super Admin :', superAdmin.email);

  // ── Admin normal (pour tester les rôles) ──────────────────────
  const adminPassword = 'Admin1234!';
  const adminHash     = await bcrypt.hash(adminPassword, 10);

  const normalAdmin = await prisma.admin.upsert({
    where:  { email: 'gestionnaire@espacevert.tn' },
    update: { mot_de_passe: adminHash, id_role: 2, actif: true },
    create: {
      nom:          'Gestionnaire',
      email:        'gestionnaire@espacevert.tn',
      mot_de_passe: adminHash,
      id_role:      2,
      actif:        true,
    },
  });
  console.log('✅ Admin :', normalAdmin.email);

  console.log('\n📋 Comptes créés :');
  console.log('   Super Admin  → admin@espacevert.tn       / Admin1234!');
  console.log('   Admin        → gestionnaire@espacevert.tn / Admin1234!');
  console.log('\n🚀 Démarrez le backend : npm run dev');
  console.log('🌐 Dashboard admin   : http://localhost:3000/admin\n');
}

seed()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(()  => prisma.$disconnect());
