/**
 * EXEMPLE D'INTÉGRATION DES WIDGETS
 * 
 * Copiez ce code pour intégrer les widgets sur votre site
 * Vous pouvez l'utiliser dans layout.tsx ou dans une page spécifique
 */

'use client';

import { RecommendationWidget, SeedCalculatorWidget } from '@/components/widgets';

export function WidgetsProvider() {
  return (
    <>
      {/* Widget de Recommandation (✨) */}
      <RecommendationWidget
        triggerIcon="/logos/recommendation.png"
        // products={initialProducts} // Optionnel: passer les produits initiaux
      />

      {/* Calculateur de Semences (🌱) */}
      <SeedCalculatorWidget
        triggerIcon="/logos/seed-calculator.png"
      />
    </>
  );
}

/**
 * INTÉGRATION ÉTAPE PAR ÉTAPE:
 * 
 * STEP 1: Dans votre layout.tsx principal
 * ========================================
 * 
 * import { WidgetsProvider } from '@/components/widgets/WidgetsProvider';
 * 
 * export default function RootLayout({
 *   children,
 * }: {
 *   children: React.ReactNode;
 * }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <WidgetsProvider />
 *       </body>
 *     </html>
 *   );
 * }
 * 
 * 
 * STEP 2: Ou dans une page spécifique (sans provider)
 * ====================================================
 * 
 * 'use client';
 * import { RecommendationWidget, SeedCalculatorWidget } from '@/components/widgets';
 * 
 * export default function HomePage() {
 *   return (
 *     <>
 *       <h1>Notre catalogue</h1>
 *       {/* ... votre contenu ... */}
 *       <RecommendationWidget triggerIcon="/logos/recommendation.png" />
 *       <SeedCalculatorWidget triggerIcon="/logos/seed-calculator.png" />
 *     </>
 *   );
 * }
 * 
 * 
 * STEP 3: Créer les dossiers pour les logos
 * ===========================================
 * 
 * 1. Assurez-vous que le dossier existe:
 *    frontend/public/logos/
 * 
 * 2. Placez vos logos (images):
 *    - frontend/public/logos/recommendation.png
 *    - frontend/public/logos/seed-calculator.png
 * 
 * 3. Si les logos n'existent pas, les widgets utiliseront les icônes par défaut
 * 
 * 
 * STEP 4: Tester localement
 * ==========================
 * 
 * 1. Démarrez votre serveur de développement:
 *    npm run dev
 * 
 * 2. Allez sur http://localhost:3000
 * 
 * 3. Vous devriez voir deux boutons flottants en bas à droite
 * 
 * 4. Cliquez pour ouvrir les modals
 */
