📊 RÉSUMÉ: SYSTÈME DE WIDGETS CRÉÉ
═════════════════════════════════════════════════════════════════

🎯 OBJECTIF
───────────
Créer deux widgets flottants qui s'ouvrent en modal pour:
1. Les produits recommandés
2. Un calculateur de semences

═════════════════════════════════════════════════════════════════

✅ CE QUI A ÉTÉ CRÉÉ

📁 FICHIERS CRÉÉS
─────────────────
frontend/src/components/widgets/
├── RecommendationWidget.tsx          ← Widget Recommandation (✨)
├── SeedCalculatorWidget.tsx          ← Widget Calculateur (🌱)
├── WidgetsProvider.tsx               ← Provider pour intégration facile
├── index.ts                          ← Exports
├── WIDGETS_USAGE_GUIDE.md            ← Guide complet
└── IMPLEMENTATION_STEPS.md           ← Prochaines étapes

frontend/src/config/
└── widgets.config.ts                 ← Configuration centralisée

═════════════════════════════════════════════════════════════════

🎨 WIDGET 1: RECOMMENDATION WIDGET (✨)

Position:      Bas droite (fixed: bottom-6 right-6)
Couleur:       Vert EV-700 / EV-900
Icône:         Emoji ✨ ou logo personnalisé
Modal:         Header vert dégradé

FONCTIONNALITÉS:
✓ Affiche les produits recommandés
✓ Filtrage par catégorie
✓ Grille responsive (1/2/3 colonnes)
✓ Badge avec nombre de produits
✓ Place réservée pour logo
✓ Footer avec conseil

UTILISATION:
<RecommendationWidget triggerIcon="/logos/recommendation.png" />

═════════════════════════════════════════════════════════════════

🌱 WIDGET 2: SEED CALCULATOR WIDGET

Position:      Bas droite (fixed: bottom-24 right-6)
Couleur:       Vert Émeraude (emerald-600)
Icône:         Sprout 🌱 ou logo personnalisé
Modal:         Header vert émeraude dégradé

FONCTIONNALITÉS:
✓ Formulaire interactif
✓ Sélection de plante (6 types)
✓ Entrée surface (m² ou hectare)
✓ Profondeur de semis
✓ Calcul automatique
✓ Résultats détaillés:
  - Quantité de semences
  - Espacement recommandé
  - Profondeur de semis
  - Conseils pratiques
✓ Place réservée pour logo

PLANTES SUPPORTÉES:
• Tomate (30 graines/m²)
• Laitue (20 graines/m²)
• Carotte (100 graines/m²)
• Oignon (50 graines/m²)
• Courge (2 graines/m²)
• Haricot (10 graines/m²)

UTILISATION:
<SeedCalculatorWidget triggerIcon="/logos/seed-calculator.png" />

═════════════════════════════════════════════════════════════════

🔌 INTÉGRATION

OPTION 1: Avec Provider (recommandé)
────────────────────────────────
// Dans frontend/src/app/layout.tsx
import { WidgetsProvider } from '@/components/widgets/WidgetsProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <WidgetsProvider />
      </body>
    </html>
  );
}


OPTION 2: Widget par widget
──────────────────────────
// Dans n'importe quel composant 'use client'
'use client';
import { RecommendationWidget, SeedCalculatorWidget } from '@/components/widgets';

export default function Page() {
  return (
    <>
      <RecommendationWidget triggerIcon="/logos/recommendation.png" />
      <SeedCalculatorWidget triggerIcon="/logos/seed-calculator.png" />
    </>
  );
}

═════════════════════════════════════════════════════════════════

🎯 PLACEMENT DES LOGOS

Le système a une "place réservée" pour vos logos dans chaque widget.
Si vous n'avez pas de logos, les widgets utiliseront des icônes par défaut.

ÉTAPES:
1. Créer: frontend/public/logos/
2. Placer vos images:
   - recommendation.png    (200x200px recommandé)
   - seed-calculator.png   (200x200px recommandé)
3. Utiliser dans les widgets:
   triggerIcon="/logos/recommendation.png"
   triggerIcon="/logos/seed-calculator.png"

═════════════════════════════════════════════════════════════════

📊 APERÇU VISUEL

┌────────────────────────────────────────┐
│         VOTRE SITE / PAGE              │
│                                        │
│     ┌──────────────────────────────┐   │
│     │                              │   │
│     │      CONTENU PRINCIPAL       │   │
│     │                              │   │
│     │                              │   │
│     │                              │   │
│     │                              │   │
│     └──────────────────────────────┘   │
│                                        │
│           ┌────┐                       │
│           │ 🌱 │  ← SeedCalculatorWidget
│           └────┘                       │
│           ┌────┐                       │
│           │ ✨ │  ← RecommendationWidget
│           └────┘                       │
└────────────────────────────────────────┘


QUAND ON CLIQUE SUR ✨ (RECOMMANDATION):

┌──────────────────────────────────────────┐
│ ✨ Produits Recommandés           [X]     │
│ Découvrez les produits...                │
├──────────────────────────────────────────┤
│ Filtrer: [Tous] [Semences] [Engrais] ... │
│                                          │
│ ┌─────────────┐  ┌─────────────┐        │
│ │   Produit   │  │   Produit   │ ...    │
│ │  [Image]    │  │  [Image]    │        │
│ │  Nom        │  │  Nom        │        │
│ └─────────────┘  └─────────────┘        │
│                                          │
│ 💡 Ces recommandations sont...           │
└──────────────────────────────────────────┘


QUAND ON CLIQUE SUR 🌱 (CALCULATEUR):

┌──────────────────────────────────────────┐
│ 🌱 Calculateur de Semences       [X]     │
│ Calculez vos besoins...                  │
├──────────────────────────────────────────┤
│ [i] Entrez vos paramètres...             │
│                                          │
│ Type: [Tomate ▼]                        │
│ Surface: [100    ] [m² ▼]                │
│ Profondeur: [0.5 ] cm                    │
│                                          │
│          [Calculer]                      │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ 📊 Résultats                         │ │
│ │ Quantité: 3000 graines               │ │
│ │ Espacement: 45-60 cm                 │ │
│ │ Profondeur: 0.5-1 cm                 │ │
│ │                                      │ │
│ │ 💡 Conseils: Ajouter 10-15%...      │ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘

═════════════════════════════════════════════════════════════════

🚀 PROCHAINES ÉTAPES

1. Créer le dossier: mkdir -p frontend/public/logos

2. Ajouter les logos (optionnel):
   - recommendation.png
   - seed-calculator.png

3. Intégrer dans layout.tsx:
   - Importer WidgetsProvider
   - Ajouter <WidgetsProvider /> dans le body

4. Tester:
   npm run dev
   → Devriez voir les 2 boutons flottants

5. (FUTURE) Intégrer l'API d'IA:
   - Connecter /api/ai/recommend-semences
   - Afficher les recommandations personnalisées

═════════════════════════════════════════════════════════════════

💾 FICHIERS DE CONFIGURATION

widgets.config.ts:
- Configuration centralisée
- Personnalisez couleurs, positions, textes
- Ajouter/modifier les plantes du calculateur

═════════════════════════════════════════════════════════════════

🎨 PERSONNALISATION

COULEURS:
- RecommendationWidget: bg-ev-700 (vert)
- SeedCalculatorWidget: bg-emerald-600 (vert émeraude)

POSITIONS:
- Widget Recommandation: bottom-6 right-6
- Widget Calculateur: bottom-24 right-6 (au-dessus)

TEXTE:
- Modifiable dans les fichiers .tsx
- Ou via widgets.config.ts

═════════════════════════════════════════════════════════════════

✨ C'EST PRÊT! 

Tous les widgets sont créés et prêts à utiliser.
Il suffit de les intégrer dans votre layout ou page.

Commencez par la première étape ci-dessus! 🚀

═════════════════════════════════════════════════════════════════
