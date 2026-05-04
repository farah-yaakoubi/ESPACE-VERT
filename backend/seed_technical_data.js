
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ─── Données extraites des étiquettes officielles ─────────────────────────────
const PRODUITS = [
  // ══ ENGRAIS ORGANIQUES ════════════════════════════════════════════════════
  {
    slugPattern: "fertileaf",
    sku: "FV-FL-1L",
    nature: "Engrais organique azoté fluide",
    poids: "1 L",
    biologique: true,
    conditionnement: "Flacon 1 L",
    composition_chimique:
      "Azote (N) Total : 4 %\n" +
      "Azote (N) Organique : 3,7 %\n" +
      "Carbone (C) Organique : 14 %\n" +
      "Fer (Fe) Organique : 700 ppm",
    usage:
      "Traitement Racinaire : 7 – 9 L / ha\n" +
      "Traitement Foliaire : 300 – 500 ml / hl (selon la culture)\n" +
      "Compatible avec tous les produits phytosanitaires.",
  },
  {
    slugPattern: "fertitop",
    sku: "FV-FT-1L",
    nature: "Engrais organique azoté fluide — Gazon & Pelouse",
    poids: "1 L",
    biologique: true,
    conditionnement: "Flacon 1 L",
    composition_chimique:
      "Azote (N) Total : 4 %\n" +
      "Azote (N) Organique : 3,7 %\n" +
      "Carbone (C) Organique : 14 %\n" +
      "Fer (Fe) Organique : 700 ppm",
    usage:
      "Traitement Racinaire : 10 – 12 L / ha\n" +
      "Traitement Foliaire : 400 – 600 ml / hl\n" +
      "Pour une meilleure verdure et contre le jaunissement de la pelouse.",
  },
  {
    slugPattern: "fertiactif",
    sku: "FV-FA-1L",
    nature: "Engrais organique complet riche en acides aminés",
    poids: "1 L",
    biologique: true,
    conditionnement: "Flacon 1 L",
    composition_chimique:
      "Azote (N) Total : 5 %\n" +
      "Anhydride phosphorique (P₂O₅) soluble dans l'eau : 2 %\n" +
      "Oxyde de Potassium (K₂O) : 2,5 %\n" +
      "Carbone (C) Organique : 13,5 %\n" +
      "Manganèse (Mn) : 0,02 %\n" +
      "Zinc (Zn) : 0,02 %\n" +
      "Extrait Humique Total : 6,25 %\n" +
      "Acide Humique : 5 %\n" +
      "Acide Fulvique : 1,2 %\n" +
      "Acides Aminés Totaux : 34 %\n" +
      "Acides Aminés Libres : 15 %",
    usage:
      "Traitement Racinaire : 8 – 10 L / ha\n" +
      "Traitement Foliaire : 300 – 500 ml / hl (selon la culture)\n" +
      "Cultures horticoles, grandes cultures et arboricoles.\n" +
      "Applicable en pré-floraison, près-maturation et post-récolte.",
  },
  {
    slugPattern: "fertifruit",
    sku: "FV-FF-1L",
    nature: "Engrais organique pour fruits de qualité",
    poids: "1 L",
    biologique: true,
    conditionnement: "Flacon 1 L",
    composition_chimique:
      "Azote (N) Total : 3 %\n" +
      "Anhydride phosphorique (P₂O₅) soluble + citrate d'ammonium : 4 %\n" +
      "Oxyde de Potassium (K₂O) : 5 %\n" +
      "Carbone (C) Organique : 7 %\n" +
      "Manganèse (Mn) : 0,04 %\n" +
      "Zinc (Zn) : 0,04 %\n" +
      "Extrait Humique Total : 12,50 %\n" +
      "Acides Humiques : 10,04 %\n" +
      "Acides Fulviques : 2,46 %",
    usage:
      "Traitement Racinaire : 7 – 10 L / ha\n" +
      "Traitement Foliaire : 250 – 400 ml / hl (selon la culture)\n" +
      "Cultures maraîchères et arboricoles (vigne, pommier, poirier, agrume, olivier…)\n" +
      "Augmente le sucre (Brix) et le poids spécifique du fruit.",
  },
  {
    slugPattern: "fertigo",
    sku: "FV-FG-1L",
    nature: "Engrais organique toutes cultures N-P-K équilibré",
    poids: "1 L",
    biologique: true,
    conditionnement: "Flacon 1 L",
    composition_chimique:
      "Azote (N) Total : 5 %\n" +
      "Anhydride phosphorique (P₂O₅) soluble + citrate d'ammonium : 4 %\n" +
      "Oxyde de Potassium (K₂O) : 6 %\n" +
      "Carbone (C) Organique : 5 %\n" +
      "Acides Humiques et Fulviques : 5 %",
    usage:
      "Traitement Racinaire : 7 – 9 L / ha\n" +
      "Traitement Foliaire : 300 – 400 ml / hl (selon la culture)\n" +
      "Indispensable à chaque stade du cycle de vie des plantes.",
  },

  // ══ BIOSTIMULANTS ════════════════════════════════════════════════════════
  {
    slugPattern: "aminal",
    sku: "FV-AM-1L",
    nature: "Biostimulant concentré en Acides Aminés d'origine végétale",
    poids: "1 L",
    biologique: true,
    conditionnement: "Flacon 1 L",
    composition_chimique:
      "Acides Aminés libres d'origine végétale : 17,5 %\n" +
      "Azote Total (N) : 7,7 %\n" +
      "Phosphore (P₂O₅) : 2,2 %\n" +
      "Oxyde de Potassium (K₂O) : 1,6 %\n" +
      "pH = 6,5 ± 0,5 — d = 1,25",
    usage:
      "Arboriculture / Maraîchage — Foliaire : 0,25 – 0,5 L / 100 L d'eau\n" +
      "Arboriculture / Maraîchage — En Irrigation : 3 – 5 L / ha\n" +
      "Grandes Cultures — Foliaire : 1 – 3 L / 100 L d'eau\n" +
      "Utilisation sur toutes les cultures et tous stades physiologiques.",
  },
  {
    slugPattern: "oceano",
    sku: "FV-OC-1L",
    nature: "Extrait d'Algue (Ascophyllum Nodosum) — Biostimulant",
    poids: "1 L",
    biologique: true,
    conditionnement: "Flacon 1 L",
    composition_chimique:
      "Extrait d'Algue (Ascophyllum Nodosum) : 100 %\n" +
      "Acide Alginique* : > 20 %\n" +
      "Mannitol* : > 10 %\n" +
      "Fucoidans* : > 3 %\n" +
      "Matière sèche (MS)* : > 10 %\n" +
      "*Sur MS — pH = 4,0 ± 0,5 — d = 1,05",
    usage:
      "Arboriculture — Foliaire : 0,1 – 0,2 L / 100 L d'eau | Irrigation : 3 L / ha\n" +
      "Maraîchage — Foliaire : 0,1 – 0,2 L / 100 L d'eau | Irrigation : 3 L / ha\n" +
      "Grandes Cultures — Foliaire : 1 – 2 L / 100 L d'eau\n" +
      "Renforce la réaction en cas de stress abiotiques et phyto-toxicité.",
  },
  {
    slugPattern: "fortstart",
    sku: "FV-FS-1L",
    nature: "Solution Starter biostimulante — démarrage rapide des cultures",
    poids: "1 L",
    biologique: true,
    conditionnement: "Flacon 1 L",
    composition_chimique:
      "Acides Aminés Libres : 4,1 %\n" +
      "Azote Total (N) : 2,2 %\n" +
      "Phosphore (P₂O₅) : 29,8 %\n" +
      "Soufre (SO₃) : 6,0 %\n" +
      "Cuivre (Cu) : 0,9 %\n" +
      "Fer (Fe) : 0,2 %\n" +
      "Manganèse (Mn) : 1,2 %\n" +
      "Zinc (Zn) : 0,9 %\n" +
      "pH = 1,0 ± 0,5 — d = 1,37",
    usage:
      "Arboriculture / Maraîchage — Foliaire : 0,15 – 0,3 L / 100 L d'eau | Irrigation : 3 – 5 L / ha\n" +
      "Grandes Cultures — Foliaire : 1 – 2 L / ha\n" +
      "Favorise le développement racinaire et stimule la croissance.",
  },
  {
    slugPattern: "poussroots",
    sku: "FV-PR-1L",
    nature: "Enracineur biostimulant riche en Acides Aminés",
    poids: "1 L",
    biologique: true,
    conditionnement: "Flacon 1 L",
    composition_chimique:
      "Acides Aminés Libres : 11,2 %\n" +
      "Azote Total (N) : 5,0 %\n" +
      "Phosphore (P₂O₅) : 5,0 %\n" +
      "Potassium (K₂O) : 4,5 %\n" +
      "Bore (B) : 0,1 %\n" +
      "Cuivre EDTA (Cu) : 0,02 %\n" +
      "Fer EDTA (Fe) : 0,5 %\n" +
      "Manganèse EDTA (Mn) : 0,1 %\n" +
      "Molybdène (Mo) : 0,01 %\n" +
      "Zinc EDTA (Zn) : 0,1 %\n" +
      "Matière organique végétale : 37,0 %\n" +
      "pH = 6,0 ± 0,5 — d = 1,25",
    usage:
      "Arboriculture / Maraîchage — Foliaire : 0,25 – 0,5 L / 100 L d'eau | Irrigation : 3 – 5 L / ha\n" +
      "Grandes Cultures — Foliaire : 1 – 3 L / ha\n" +
      "En Pépinières — Foliaire : 0,2 L / 100 L d'eau\n" +
      "Induit l'enracinement et le développement radiculaire.",
  },

  // ══ CORRECTEURS DE CARENCES ══════════════════════════════════════════════
  {
    slugPattern: "calcial",
    sku: "FV-CA-1L",
    nature: "Fertilisant correcteur de carences — Riche en Calcium et Bore",
    poids: "1 L",
    biologique: false,
    conditionnement: "Flacon 1 L",
    composition_chimique:
      "Azote Total (N) : 7,0 %\n" +
      "Oxyde de Calcium (CaO) : 23,0 %\n" +
      "Bore (B) : 0,1 %\n" +
      "pH = 4,0 ± 0,5 — d = 1,41",
    usage:
      "Arboriculture / Maraîchage — Foliaire : 0,25 – 0,5 L / 100 L d'eau | Irrigation : 3 – 5 L / ha\n" +
      "Grandes Cultures — Foliaire : 1 – 3 L / 100 L d'eau\n" +
      "Assure une meilleure nutrition calcique et une nouaison parfaite.",
  },
  {
    slugPattern: "calcimag",
    sku: "FV-CM-1L",
    nature: "Fertilisant correcteur de carences — Calcium, Magnésium et Oligo-éléments",
    poids: "1 L",
    biologique: false,
    conditionnement: "Flacon 1 L",
    composition_chimique:
      "Azote Total (N) : 10,2 %\n" +
      "Oxyde de Calcium (CaO) : 7,6 %\n" +
      "Oxyde de Magnésium (MgO) : 7,6 %\n" +
      "Présence d'Oligo-éléments\n" +
      "pH = 2 ± 0,5 — d = 1,35",
    usage:
      "Arboriculture / Maraîchage — Foliaire : 0,25 – 0,5 L / 100 L d'eau | Irrigation : 3 – 5 L / ha\n" +
      "Grandes Cultures — Foliaire : 1 – 3 L / ha\n" +
      "Applicable dès le début de la nouaison jusqu'à la maturation. Améliore calibre, goût et couleur des fruits.",
  },

  // ══ GESTION DU SOL ════════════════════════════════════════════════════════
  {
    slugPattern: "fulvical",
    sku: "FV-FUL-1L",
    nature: "Fertilisant gestion du sol — Acides Fulviques + Extraits d'Algues",
    poids: "1 L",
    biologique: true,
    conditionnement: "Flacon 1 L",
    composition_chimique:
      "Acides Fulviques : 25,6 %\n" +
      "Mannitol : 0,1 %\n" +
      "Extraits d'Algues : 4,8 %\n" +
      "Azote Organique (N) : 2,4 %\n" +
      "Oxyde de Potassium (K₂O) : 6,1 %\n" +
      "pH = 5,5 ± 0,5 — d = 1,22",
    usage:
      "Arboriculture / Maraîchage — Foliaire : 0,3 – 0,5 L / 100 L d'eau | Irrigation : 5 – 10 L / ha\n" +
      "Grandes Cultures — Foliaire : 5 L / ha\n" +
      "Débloque les nutriments au niveau du sol, améliore la chélation et l'absorption racinaire.",
  },
  {
    slugPattern: "sweeter",
    sku: "FV-SW-1L",
    nature: "Fertilisant gestion du sol — Correcteur de salinité",
    poids: "1 L",
    biologique: false,
    conditionnement: "Flacon 1 L",
    composition_chimique:
      "Oxyde de Calcium (CaO) : 7,8 %\n" +
      "Soufre (SO₃) : 24,0 %\n" +
      "pH = 6,5 ± 0,5 — d = 1,2",
    usage:
      "Arboriculture — En Irrigation : 40 L / cycle (20 L en 1ère application)\n" +
      "Maraîchage / Grandes Cultures — 10 L en 2ème et 3ème application\n" +
      "Corrige les sols salins et sodiques. Élimine les excès de sodium, chlore et magnésium.",
  },
];

async function main() {
  console.log("🌱 Mise à jour des données techniques FertiVert…\n");
  let ok = 0, skip = 0, err = 0;

  for (const p of PRODUITS) {
    try {
      // Chercher le produit par slug (contient le pattern)
      const produits = await prisma.produit.findMany({
        where: { slug: { contains: p.slugPattern } },
        select: { id_produit: true, nom: true, slug: true },
      });

      if (produits.length === 0) {
        console.log(`  ⚠️  Introuvable (pattern: "${p.slugPattern}") — ignoré`);
        skip++;
        continue;
      }

      for (const prod of produits) {
        await prisma.produit.update({
          where: { id_produit: prod.id_produit },
          data: {
            sku:                  p.sku,
            nature:               p.nature,
            poids:                p.poids,
            biologique:           p.biologique,
            conditionnement:      p.conditionnement,
            composition_chimique: p.composition_chimique,
            usage:                p.usage,
          },
        });
        console.log(`  ✅ ${prod.nom} (${prod.slug})`);
        ok++;
      }
    } catch (e) {
      console.error(`  ❌ Erreur pour "${p.slugPattern}": ${e.message}`);
      err++;
    }
  }

  console.log(`\n📊 Résumé : ${ok} mis à jour — ${skip} ignorés — ${err} erreurs`);
  if (skip > 0) {
    console.log("💡 Les produits ignorés n'ont pas encore de slug correspondant.");
    console.log("   Modifiez les slugPattern[] ci-dessus pour les faire correspondre.");
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
