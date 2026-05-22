🚀 QUICK START - INTEGRATION RAPIDE EN 5 MINUTES

Suivez ces étapes pour voir les widgets fonctionner immédiatement!

═════════════════════════════════════════════════════════════════

✅ ÉTAPE 1: Ouvrir le layout principal (2 min)
──────────────────────────────────────────────

1. Ouvrez: frontend/src/app/layout.tsx
2. En haut du fichier, ajoutez cette import:

   import { WidgetsProvider } from '@/components/widgets/WidgetsProvider';

3. Dans le <body>, ajoutez le WidgetsProvider:

   <body>
     {children}
     <WidgetsProvider />    ← AJOUTER ICI
   </body>

4. Sauvegardez le fichier (Ctrl+S)


✅ ÉTAPE 2: Créer le dossier pour les logos (1 min)
────────────────────────────────────────────────────

1. Ouvrez un terminal dans VS Code (Terminal > Nouveau terminal)
2. Allez dans le dossier frontend:
   cd frontend
3. Créez le dossier logos:
   mkdir -p public/logos


✅ ÉTAPE 3: Démarrer le serveur (2 min)
───────────────────────────────────────

1. Dans le terminal, lancez le dev server:
   npm run dev

2. Attendez que l'application compile
   Vous devriez voir: "ready - started server on 0.0.0.0:3000"


✅ ÉTAPE 4: Tester les widgets
─────────────────────────────

1. Ouvrez http://localhost:3000 dans votre navigateur
2. Allez en bas à droite de l'écran
3. Vous devriez voir 2 boutons flottants:
   - 🌱 (vert émeraude) = Calculateur de semences
   - ✨ (vert) = Recommandation produits

4. Cliquez sur chaque bouton pour voir les modals s'ouvrir ✨


═════════════════════════════════════════════════════════════════

📸 QUOI FAIRE ENSUITE

🎨 AJOUTER VOS LOGOS (optionnel)
─────────────────────────────────
Une fois que les widgets marchent:

1. Préparez vos images (200x200px min):
   - recommendation.png (logo pour recommandation)
   - seed-calculator.png (logo pour calculateur)

2. Placez-les dans: frontend/public/logos/

3. Les widgets utiliseront automatiquement vos logos!


🎨 PERSONNALISER LES COULEURS
────────────────────────────────
Modifiez les couleurs en éditant les fichiers:

RecommendationWidget.tsx:
- Ligne ~32: bg-ev-700 (couleur principale)
- Ligne ~32: hover:bg-ev-900 (au survol)

SeedCalculatorWidget.tsx:
- Ligne ~46: bg-emerald-600 (couleur principale)
- Ligne ~46: hover:bg-emerald-700 (au survol)


🎨 AJOUTER PLUS DE PLANTES AU CALCULATEUR
──────────────────────────────────────────
Dans SeedCalculatorWidget.tsx, trouvez l'objet seedDatabase:

const seedDatabase = {
  tomate: { name: 'Tomate', seedsPerM2: 30, ... },
  // Ajoutez votre plante ici:
  poivron: {
    name: 'Poivron',
    seedsPerM2: 25,
    unit: 'graines',
    spacing: '45-60 cm',
    depthCm: { min: 0.5, max: 1 },
  },
};


═════════════════════════════════════════════════════════════════

⚠️ DÉPANNAGE

Q: Les widgets ne s'affichent pas?
A: 1. Vérifiez que WidgetsProvider est bien dans layout.tsx
   2. Vérifiez la console (F12) pour les erreurs
   3. Rechargez la page (Ctrl+R)

Q: Les icônes ne s'affichent pas?
A: C'est normal! Elles s'affichent par défaut (✨ et 🌱)
   Ajoutez des logos pour les remplacer

Q: Le calculateur ne calcule pas?
A: Vérifiez que vous avez sélectionné une plante avant de cliquer

Q: Les produits recommandés sont vides?
A: C'est normal pour l'instant
   À faire: Intégrer l'API d'IA du backend


═════════════════════════════════════════════════════════════════

💻 COMMANDES UTILES

# Démarrer le dev server
npm run dev

# Arrêter le dev server
Ctrl+C

# Rebuild après changements
npm run build

# Vérifier les erreurs TypeScript
npm run type-check


═════════════════════════════════════════════════════════════════

✅ FAIT! 

Vous avez maintenant 2 widgets flottants sur votre site! 🎉

Prochaines étapes optionnelles:
1. Ajouter vos logos
2. Intégrer l'API d'IA pour les recommandations
3. Enrichir la base de données des semences
4. Ajouter la sauvegarde des calculs

═════════════════════════════════════════════════════════════════
