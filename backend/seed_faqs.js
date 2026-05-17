// seed_faqs.js — FAQs Espace Vert basées sur le vrai contenu du site
// Lancer depuis le dossier backend : node seed_faqs.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const faqs = [

  // ══════════════════════════════════════════════════════════════════════════
  // GROUPE & CONTACT
  // ══════════════════════════════════════════════════════════════════════════
  {
    categorie: "À propos",
    ordre: 1,
    question: "Qu'est-ce qu'Espace Vert ?",
    reponse:
      "Espace Vert est un groupe tunisien fondé en 1995, composé de 4 sociétés complémentaires :\n" +
      "• Espace Vert SARL (maison mère) : semences, plants, irrigation, matériels agricoles, fertilisants, jardinage et animalerie.\n" +
      "• STAJAP : matériels pour parcs, stades, golfs et installations sportives.\n" +
      "• Mondiale Irrigation : fabrication de tuyaux PEHD Ø25–110mm.\n" +
      "• BADDAR AGRICOLE : plants francs et greffés, semences maraîchères et florales.\n" +
      "Notre mission : accompagner les agriculteurs dans toutes les phases de la production agricole avec des produits modernes et un service d'assistance technique personnalisé.",
  },
  {
    categorie: "À propos",
    ordre: 2,
    question: "Où se trouvent vos agences ?",
    reponse:
      "Nous avons 4 agences en Tunisie :\n" +
      "• Tunis (Siège) : 69, rue Abderrazak Chraibi, 1001 Tunis — Tél : (+216) 71 333 858 / (+216) 71 348 404 — Email : secretariat.groupeev@planet.tn\n" +
      "• Soliman : Route R43, Soliman — Tél : (+216) 72 333 143\n" +
      "• Borj Amri : Sidi Ali El Hattab, Borj Amri — Tél : (+216) 71 234 567\n" +
      "• Sfax : Route de Gabes, Sfax 3049 — Tél : (+216) 74 000 000\n" +
      "Horaires : Lun–Ven 08h–17h · Sam 08h–12h",
  },
  {
    categorie: "À propos",
    ordre: 3,
    question: "Comment contacter Espace Vert ?",
    reponse:
      "Plusieurs façons de nous joindre :\n" +
      "• Par téléphone (siège Tunis) : (+216) 71 333 858 ou (+216) 71 348 404\n" +
      "• Par email : secretariat.groupeev@planet.tn\n" +
      "• Via le formulaire de contact sur notre site → /contact\n" +
      "• Demande de devis en ligne → /devis (réponse sous 24–48h)\n" +
      "• Rendez-vous avec un commercial → /rendez-vous",
  },
  {
    categorie: "À propos",
    ordre: 4,
    question: "Quels sont vos horaires d'ouverture ?",
    reponse:
      "Toutes nos agences sont ouvertes du Lundi au Vendredi de 08h à 17h, et le Samedi de 08h à 12h. Fermées les dimanches et jours fériés tunisiens.",
  },
  {
    categorie: "À propos",
    ordre: 5,
    question: "Quelles sont vos marques propres ?",
    reponse:
      "Espace Vert distribue 3 marques propres :\n" +
      "• Fertivert : gamme complète de fertilisants et biostimulants biologiques → /marques/fertivert\n" +
      "• Matar : équipements d'irrigation (tuyaux, goutte-à-goutte, aspersion, pompes) → /marques/matar\n" +
      "• Pulvert : pulvérisateurs agricoles à dos et à moteur → /marques/pulvert",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // DEVIS & COMMANDES
  // ══════════════════════════════════════════════════════════════════════════
  {
    categorie: "Devis & Commandes",
    ordre: 10,
    question: "Comment obtenir un devis ?",
    reponse:
      "C'est simple et gratuit :\n" +
      "1. Remplissez le formulaire sur notre page /devis en décrivant votre besoin.\n" +
      "2. Un expert de notre équipe vous contacte sous 24–48h.\n" +
      "3. Vous recevez une offre personnalisée et sans engagement.\n" +
      "Le devis est gratuit et sans engagement.",
  },
  {
    categorie: "Devis & Commandes",
    ordre: 11,
    question: "Livrez-vous partout en Tunisie ?",
    reponse:
      "Oui, nous livrons dans toute la Tunisie depuis nos agences de Tunis, Soliman, Borj Amri et Sfax. Pour les grandes commandes, une livraison directe sur exploitation peut être organisée. Contactez-nous pour les détails et tarifs de livraison selon votre localisation.",
  },
  {
    categorie: "Devis & Commandes",
    ordre: 12,
    question: "Proposez-vous des tarifs professionnels pour les agriculteurs et coopératives ?",
    reponse:
      "Oui. Nous proposons des conditions commerciales adaptées aux agriculteurs professionnels, coopératives agricoles, paysagistes et revendeurs. Contactez notre équipe commerciale au (+216) 71 333 858 ou via le formulaire /contact pour discuter d'un partenariat.",
  },
  {
    categorie: "Devis & Commandes",
    ordre: 13,
    question: "Puis-je prendre un rendez-vous avec un commercial ?",
    reponse:
      "Oui, vous pouvez réserver un rendez-vous directement sur notre site → /rendez-vous. Ce service est assuré par Matar Irrigation pour les besoins en irrigation. Un expert se déplace pour évaluer votre projet et vous proposer la solution la plus adaptée.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ACTIVITÉS / DOMAINES
  // ══════════════════════════════════════════════════════════════════════════
  {
    categorie: "Activités",
    ordre: 20,
    question: "Quelles sont vos activités et domaines d'expertise ?",
    reponse:
      "Espace Vert couvre 5 grandes activités agricoles :\n" +
      "• Irrigation (marque Matar) : goutte-à-goutte, aspersion, tuyaux PEHD, pompes → /activites/irrigation\n" +
      "• Fertilisation (marque Fertivert) : engrais organiques, biostimulants, correcteurs → /activites/fertilisation\n" +
      "• Semences (marque Matar) : légumes, grandes cultures, gazon → /activites/semences\n" +
      "• Pulvérisation (marque Pulvert) : pulvérisateurs à dos 8–20L, atomiseurs → /activites/pulverisation\n" +
      "• Jardinage / Espace vert : substrats, outils, arrosage automatique → /activites/jardinage",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // FERTILISATION — FERTIVERT
  // ══════════════════════════════════════════════════════════════════════════
  {
    categorie: "Fertivert — Fertilisation",
    ordre: 30,
    question: "Qu'est-ce que la gamme Fertivert ?",
    reponse:
      "Fertivert est la marque d'engrais biologiques et biostimulants d'Espace Vert. Tous les produits Fertivert sont d'origine organique, certifiés biologiques, et adaptés à toutes les cultures (maraîchères, arboricoles, grandes cultures, gazon). Voir la gamme complète → /marques/fertivert",
  },
  {
    categorie: "Fertivert — Fertilisation",
    ordre: 31,
    question: "Quels sont les engrais Fertivert disponibles ?",
    reponse:
      "La gamme Fertivert comprend :\n" +
      "• Fertileaf : engrais azoté fluide (N:4%, C organique:14%) — racinaire 7–9L/ha, foliaire 300–500ml/hl\n" +
      "• Fertitop : azoté fluide spécial gazon & pelouse — racinaire 10–12L/ha\n" +
      "• Fertiactif : NPK complet + acides aminés (34%) + humiques — cultures horticoles et arboricoles\n" +
      "• Fertifruit : spécial qualité des fruits, riche en K et P — augmente le Brix et le poids\n" +
      "• Fertigo : NPK équilibré + humiques — toutes cultures, tous stades\n" +
      "Pour connaître les tarifs et disponibilités, contactez-nous ou consultez /produits",
  },
  {
    categorie: "Fertivert — Fertilisation",
    ordre: 32,
    question: "Qu'est-ce que Fertiactif et comment l'utiliser ?",
    reponse:
      "Fertiactif (SKU: FV-FA-1L) est un engrais organique complet riche en acides aminés totaux (34%) et libres (15%), NPK 5-2-2,5, avec acides humiques (5%) et fulviques (1,2%). Il convient aux cultures horticoles, grandes cultures et arboricoles. Application en pré-floraison, près-maturation et post-récolte. Dose racinaire : 8–10 L/ha, foliaire : 300–500 ml/hl. Compatible avec tous les produits phytosanitaires.",
  },
  {
    categorie: "Fertivert — Fertilisation",
    ordre: 33,
    question: "Qu'est-ce que Fertifruit et pour quelles cultures ?",
    reponse:
      "Fertifruit (SKU: FV-FF-1L) est un engrais organique spécial qualité des fruits. Composition : N:3%, P₂O₅:4%, K₂O:5%, acides humiques 10%. Idéal pour vigne, pommier, poirier, agrume, olivier, cultures maraîchères. Il augmente le taux de sucre (Brix) et le poids spécifique du fruit. Dose racinaire : 7–10 L/ha, foliaire : 250–400 ml/hl.",
  },
  {
    categorie: "Fertivert — Fertilisation",
    ordre: 34,
    question: "Quels sont vos biostimulants Fertivert ?",
    reponse:
      "La gamme biostimulants Fertivert comprend :\n" +
      "• Aminal (FV-AM-1L) : concentré en acides aminés d'origine végétale (17,5%) — stimule la croissance et réduit le stress\n" +
      "• Oceano (FV-OC-1L) : extrait d'algue Ascophyllum Nodosum — biostimulant naturel\n" +
      "• Fortstart (FV-FS-1L) : solution starter pour démarrage rapide des cultures\n" +
      "• Poussroots (FV-PR-1L) : enracineur biostimulant riche en acides aminés — favorise l'enracinement",
  },
  {
    categorie: "Fertivert — Fertilisation",
    ordre: 35,
    question: "Avez-vous des correcteurs de carences ?",
    reponse:
      "Oui, Fertivert propose :\n" +
      "• Calcial (FV-CA-1L) : correcteur de carences en Calcium et Bore — prévient la nécrose apicale et la pourriture\n" +
      "• Calcimag (FV-CM-1L) : correcteur Calcium + Magnésium + Oligo-éléments\n" +
      "• Fulvical (FV-FUL-1L) : acides fulviques + extraits d'algues pour la gestion du sol\n" +
      "• Sweeter (FV-SW-1L) : correcteur de salinité du sol — idéal en sol salin",
  },
  {
    categorie: "Fertivert — Fertilisation",
    ordre: 36,
    question: "Les engrais Fertivert sont-ils utilisables en agriculture biologique ?",
    reponse:
      "Oui. Tous les produits de la gamme Fertivert sont d'origine organique et biologiques. Ils sont compatibles avec le cahier des charges de l'agriculture biologique. Consultez nos fiches techniques pour les certifications de chaque produit.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // IRRIGATION — MATAR
  // ══════════════════════════════════════════════════════════════════════════
  {
    categorie: "Matar — Irrigation",
    ordre: 40,
    question: "Que propose la marque Matar en irrigation ?",
    reponse:
      "Matar est notre marque spécialisée en irrigation. La gamme comprend : tuyaux goutte-à-goutte, rampes d'aspersion, tuyaux PEHD (fabriqués par Mondiale Irrigation en Ø25 à 110mm), filtres, raccords, programmateurs et pompes (surface, immergées, solaires). Voir les solutions irrigation → /activites/irrigation ou /marques/matar",
  },
  {
    categorie: "Matar — Irrigation",
    ordre: 41,
    question: "Quelle différence entre le goutte-à-goutte et l'aspersion ?",
    reponse:
      "• Goutte-à-goutte : eau délivrée directement à la base de chaque plant avec un débit faible et précis. Économise jusqu'à 50% d'eau. Idéal pour légumes, arbres fruitiers, vignes et cultures en rangs.\n" +
      "• Aspersion : eau distribuée en pluie fine sur une large surface. Adapté aux grandes cultures (céréales), pelouses et espaces verts.\n" +
      "Pour choisir, contactez nos techniciens Matar via /rendez-vous.",
  },
  {
    categorie: "Matar — Irrigation",
    ordre: 42,
    question: "Proposez-vous des systèmes d'irrigation solaire ?",
    reponse:
      "Oui. Matar distribue des kits d'irrigation solaire complets (pompe solaire + panneau + régulateur) adaptés aux zones sans réseau électrique. Très utilisés dans les régions intérieures de Tunisie. Contactez-nous pour un dimensionnement selon votre surface et votre culture.",
  },
  {
    categorie: "Matar — Irrigation",
    ordre: 43,
    question: "Mes goutteurs sont bouchés, que faire ?",
    reponse:
      "Les bouchages viennent souvent du calcaire ou des algues. Solutions :\n" +
      "1. Rincez à contre-courant.\n" +
      "2. Faites circuler de l'acide citrique dilué ou du vinaigre blanc pendant 30 min dans les lignes.\n" +
      "3. Nettoyez les filtres (souvent la cause principale).\n" +
      "4. Vérifiez la pression : les goutteurs Matar autocompensants fonctionnent entre 0,8 et 3,5 bars.\n" +
      "Si le problème persiste, contactez notre service technique → /contact",
  },
  {
    categorie: "Matar — Irrigation",
    ordre: 44,
    question: "Comment dimensionner mon installation d'irrigation ?",
    reponse:
      "Le dimensionnement dépend de la surface (ha), la culture, la source d'eau et la pression disponible. Nos techniciens Matar se déplacent sur site pour établir un plan d'irrigation complet. Prenez rendez-vous → /rendez-vous. Ce service est gratuit pour les projets importants.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // PULVÉRISATION — PULVERT
  // ══════════════════════════════════════════════════════════════════════════
  {
    categorie: "Pulvert — Pulvérisation",
    ordre: 50,
    question: "Que propose la marque Pulvert ?",
    reponse:
      "Pulvert est notre marque de pulvérisateurs agricoles, conçus pour résister aux produits phytosanitaires et au soleil tunisien. Gamme disponible : pulvérisateurs à dos de 8L, 12L, 16L et 20L, pulvérisateurs à roue, atomiseurs et pulvérisateurs à moteur pour grandes surfaces. Voir la gamme → /marques/pulvert ou /activites/pulverisation",
  },
  {
    categorie: "Pulvert — Pulvérisation",
    ordre: 51,
    question: "Quelle contenance de pulvérisateur Pulvert choisir ?",
    reponse:
      "• 8–12 litres : potager, jardinage amateur, traitement ponctuel\n" +
      "• 16 litres : exploitation maraîchère, verger familial — le plus polyvalent\n" +
      "• 20 litres : grandes surfaces maraîchères, utilisation intensive\n" +
      "• Atomiseur / pulvérisateur à moteur : vergers, grandes cultures, surfaces > 1 ha\n" +
      "Pour les professionnels, nous recommandons le 16L à pression constante pour un débit régulier.",
  },
  {
    categorie: "Pulvert — Pulvérisation",
    ordre: 52,
    question: "Comment entretenir mon pulvérisateur Pulvert ?",
    reponse:
      "Après chaque utilisation :\n" +
      "1. Rincez abondamment avec de l'eau claire.\n" +
      "2. Passez un rinçage avec eau légèrement savonneuse.\n" +
      "3. Laissez la cuve ouverte pour séchage complet.\n" +
      "En fin de saison : démontez le filtre et la buse pour nettoyage approfondi, vérifiez les joints.\n" +
      "Les pièces de rechange Pulvert sont disponibles dans nos agences.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SEMENCES
  // ══════════════════════════════════════════════════════════════════════════
  {
    categorie: "Semences",
    ordre: 60,
    question: "Quelles semences proposez-vous ?",
    reponse:
      "Sous la marque Matar, nous distribuons des semences sélectionnées pour le climat tunisien :\n" +
      "• Semences potagères : tomate, poivron, concombre, pastèque, melon, oignon, courgette, piment…\n" +
      "• Semences de grandes cultures : céréales, légumineuses\n" +
      "• Gazons : mélanges résistants à la chaleur pour jardins, stades et espaces verts\n" +
      "Voir l'activité semences → /activites/semences",
  },
  {
    categorie: "Semences",
    ordre: 61,
    question: "Proposez-vous des semences de gazon adaptées à la Tunisie ?",
    reponse:
      "Oui. La gamme Matar propose des mélanges gazon résistants à la chaleur et à la sécheresse tunisiennes, pour jardins particuliers, espaces verts municipaux et stades sportifs (également via notre filiale STAJAP spécialisée stades et golfs). Nous proposons aussi du gazon en rouleau pour une installation rapide.",
  },
  {
    categorie: "Semences",
    ordre: 62,
    question: "Comment conserver des semences non utilisées ?",
    reponse:
      "Conservez les semences dans un endroit sec, frais (5–15°C) et à l'abri de la lumière. Refermez hermétiquement les sachets après ouverture. Dans de bonnes conditions, les semences potagères restent viables 2 à 4 ans. Évitez les variations de température et l'humidité excessive.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // JARDINAGE & ESPACE VERT
  // ══════════════════════════════════════════════════════════════════════════
  {
    categorie: "Jardinage",
    ordre: 70,
    question: "Proposez-vous des produits pour le jardinage amateur ?",
    reponse:
      "Oui. Notre gamme jardinage comprend : substrats et terres de rempotage, engrais Fertivert Garden pour plantes ornementales et potager, outils de jardinage, systèmes d'arrosage automatique, semences Matar pour potager, et animalerie. Idéal pour les jardiniers amateurs et les particuliers.",
  },
  {
    categorie: "Jardinage",
    ordre: 71,
    question: "Comment arroser une pelouse en été en Tunisie ?",
    reponse:
      "En été tunisien, respectez ces règles :\n" +
      "• Arrosez tôt le matin (avant 8h) ou le soir (après 19h) pour limiter l'évaporation.\n" +
      "• Comptez 20 à 30 mm d'eau par semaine en plein soleil.\n" +
      "• Préférez 2–3 arrosages profonds par semaine plutôt qu'un arrosage superficiel quotidien.\n" +
      "• Un système d'arrosage automatique Matar avec programmateur est la solution la plus économique.",
  },
  {
    categorie: "Jardinage",
    ordre: 72,
    question: "Proposez-vous des équipements pour les stades et espaces verts municipaux ?",
    reponse:
      "Oui, via notre filiale STAJAP spécialisée dans les espaces verts et le sport. Nous équipons les stades, golfs, parcs et installations sportives avec du matériel professionnel d'arrosage, de maintenance et d'entretien des gazons. Contactez-nous pour un devis professionnel → /devis",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // NAVIGATION SITE
  // ══════════════════════════════════════════════════════════════════════════
  {
    categorie: "Navigation",
    ordre: 80,
    question: "Comment trouver un produit sur votre site ?",
    reponse:
      "Plusieurs façons de naviguer :\n" +
      "• Par activité (irrigation, fertilisation, semences, pulvérisation, jardinage) → /activites\n" +
      "• Par marque (Fertivert, Matar, Pulvert) → /marques\n" +
      "• Par catégorie de produit → /categories\n" +
      "• Catalogue général → /produits\n" +
      "Si vous ne trouvez pas ce que vous cherchez, posez-moi votre question directement !",
  },
  {
    categorie: "Navigation",
    ordre: 81,
    question: "Où puis-je voir les actualités et conseils agricoles d'Espace Vert ?",
    reponse:
      "Notre blog d'actualités et conseils agricoles est disponible sur → /actualites. Vous y trouverez des guides techniques, des conseils de saison et les dernières nouvelles du groupe Espace Vert.",
  },
  {
    categorie: "Navigation",
    ordre: 82,
    question: "Qui sont vos partenaires ?",
    reponse:
      "Le groupe Espace Vert regroupe 4 entités partenaires : Espace Vert SARL (maison mère), STAJAP (espaces verts et sport), Mondiale Irrigation (fabrication de tuyaux PEHD) et BADDAR AGRICOLE (pépinière, plants greffés et semences). Découvrez l'histoire du groupe → /qui-sommes-nous",
  },
];

async function main() {
  console.log(`\n🌱 Insertion de ${faqs.length} FAQs Espace Vert...\n`);

  // Supprimer les anciennes FAQs pour repartir proprement
  const deleted = await prisma.faq.deleteMany({});
  if (deleted.count > 0) {
    console.log(`🗑️  ${deleted.count} anciennes FAQs supprimées.`);
  }

  let created = 0;
  for (const faq of faqs) {
    await prisma.faq.create({ data: { ...faq, active: true } });
    created++;
    process.stdout.write(`\r  ✓ ${created}/${faqs.length} insérées`);
  }

  console.log(`\n\n✅ ${created} FAQs insérées avec succès !`);
  console.log("💡 Le chatbot utilisera automatiquement ces données.");
  console.log("📝 Vous pouvez les modifier depuis /admin/faq\n");
}

main()
  .catch(e => { console.error("\n❌ Erreur :", e); process.exit(1); })
  .finally(() => prisma.$disconnect());