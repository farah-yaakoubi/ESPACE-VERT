/**
 * GUIDE D'UTILISATION DES WIDGETS
 * 
 * Ce fichier explique comment utiliser les widgets de recommandation et de calculateur de semences
 */

// ============================================================================
// WIDGET 1: RECOMMENDATION WIDGET (Produits Recommandés)
// ============================================================================

/**
 * Le RecommendationWidget s'affiche comme un bouton flottant en bas à droite de l'écran.
 * En cliquant, un modal s'ouvre avec les produits recommandés.
 * 
 * CARACTÉRISTIQUES:
 * - Bouton flottant avec icône personnalisable (ou emoji ✨)
 * - Modal avec header dégradé vert
 * - Affichage des produits en grille responsive
 * - Filtrage par catégorie
 * - Badge avec le nombre de produits
 * 
 * PROPS:
 * @param triggerIcon (optional) - URL de l'image du logo/icône du widget
 * @param products (optional) - Array de produits à afficher
 * 
 * EXEMPLE 1: Sans logo (avec emoji par défaut)
 * <RecommendationWidget />
 * 
 * EXEMPLE 2: Avec logo personnalisé
 * <RecommendationWidget 
 *   triggerIcon="/logos/recommendation.png"
 * />
 * 
 * EXEMPLE 3: Avec produits initiaux
 * <RecommendationWidget 
 *   triggerIcon="/logos/recommendation.png"
 *   products={productsArray}
 * />
 * 
 * INTÉGRATION DANS UNE PAGE:
 * 
 * - Dans layout.tsx (pour l'afficher sur toutes les pages):
 * 
 * import { RecommendationWidget } from '@/components/widgets';
 * 
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <RecommendationWidget triggerIcon="/logos/recommendation.png" />
 *       </body>
 *     </html>
 *   );
 * }
 * 
 * - Dans une page spécifique (page.tsx):
 * 
 * 'use client';
 * import { RecommendationWidget } from '@/components/widgets';
 * 
 * export default function HomePage() {
 *   return (
 *     <div>
 *       <h1>Accueil</h1>
 *       <RecommendationWidget triggerIcon="/logos/recommendation.png" />
 *     </div>
 *   );
 * }
 */

// ============================================================================
// WIDGET 2: SEED CALCULATOR WIDGET (Calculateur de Semences)
// ============================================================================

/**
 * Le SeedCalculatorWidget s'affiche comme un bouton flottant en vert (vert émeraude)
 * situé au-dessus du widget de recommandation.
 * En cliquant, un modal s'ouvre avec un formulaire de calcul.
 * 
 * CARACTÉRISTIQUES:
 * - Bouton flottant avec icône personnalisable (ou Sprout par défaut)
 * - Modal avec header dégradé émeraude
 * - Formulaire interactif avec:
 *   - Sélection de la plante (tomate, laitue, carotte, oignon, courge, haricot)
 *   - Entrée de la surface (m² ou hectare)
 *   - Profondeur de semis
 * - Résultats détaillés:
 *   - Quantité de semences
 *   - Espacement recommandé
 *   - Profondeur de semis
 *   - Conseils pratiques
 * 
 * PROPS:
 * @param triggerIcon (optional) - URL de l'image du logo/icône du widget
 * 
 * EXEMPLE 1: Sans logo (avec icône Sprout par défaut)
 * <SeedCalculatorWidget />
 * 
 * EXEMPLE 2: Avec logo personnalisé
 * <SeedCalculatorWidget 
 *   triggerIcon="/logos/seed-calculator.png"
 * />
 * 
 * INTÉGRATION DANS UNE PAGE:
 * 
 * import { SeedCalculatorWidget } from '@/components/widgets';
 * 
 * export default function HomePage() {
 *   return (
 *     <div>
 *       <h1>Accueil</h1>
 *       <SeedCalculatorWidget triggerIcon="/logos/seed-calculator.png" />
 *     </div>
 *   );
 * }
 */

// ============================================================================
// INTÉGRATION COMPLÈTE (Les Deux Widgets)
// ============================================================================

/**
 * Pour avoir les deux widgets sur votre site:
 * 
 * OPTION 1: Dans layout.tsx (visible sur toutes les pages)
 * 
 * import { RecommendationWidget, SeedCalculatorWidget } from '@/components/widgets';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <RecommendationWidget triggerIcon="/logos/recommendation.png" />
 *         <SeedCalculatorWidget triggerIcon="/logos/seed-calculator.png" />
 *       </body>
 *     </html>
 *   );
 * }
 * 
 * OPTION 2: Dans une page spécifique
 * 
 * 'use client';
 * import { RecommendationWidget, SeedCalculatorWidget } from '@/components/widgets';
 * 
 * export default function HomePage() {
 *   return (
 *     <>
 *       <h1>Catalogue</h1>
 *       {/* Contenu principal */}
 *       <RecommendationWidget triggerIcon="/logos/recommendation.png" />
 *       <SeedCalculatorWidget triggerIcon="/logos/seed-calculator.png" />
 *     </>
 *   );
 * }
 */

// ============================================================================
// PERSONNALISATION DES LOGOS
// ============================================================================

/**
 * COMMENT AJOUTER LES LOGOS:
 * 
 * 1. Placez vos images de logo dans: frontend/public/logos/
 *    - recommendation.png (pour le widget de recommandation) - Recommandé: 200x200px
 *    - seed-calculator.png (pour le calculateur de semences) - Recommandé: 200x200px
 * 
 * 2. Utilisez les chemins correspondants:
 *    triggerIcon="/logos/recommendation.png"
 *    triggerIcon="/logos/seed-calculator.png"
 * 
 * 3. Si vous n'avez pas de logo, les widgets utiliseront des icônes par défaut:
 *    - RecommendationWidget: ✨ (emoji)
 *    - SeedCalculatorWidget: 🌱 (icône Sprout de lucide-react)
 * 
 * RECOMMANDATIONS:
 * - Format: PNG, SVG ou JPG
 * - Taille: 200x200px minimum
 * - Arrière-plan: Transparent (PNG) ou couleur unie
 * - Poids: < 50KB pour les performances
 */

// ============================================================================
// FONCTIONNALITÉS FUTURES À IMPLÉMENTER
// ============================================================================

/**
 * 1. INTÉGRATION IA POUR LES RECOMMANDATIONS
 *    - Connecter l'endpoint /api/ai/recommend-semences du backend
 *    - Utiliser le contexte utilisateur (historique, préférences)
 *    - Afficher des recommandations personnalisées
 * 
 * 2. AMÉLIORATION DU CALCULATEUR
 *    - Ajouter plus de types de plantes
 *    - Permettre l'import des types de plantes depuis l'API
 *    - Calculer le coût estimé des semences
 *    - Exporter les résultats en PDF
 * 
 * 3. PERSISTANCE DES DONNÉES
 *    - Sauvegarder les préférences de l'utilisateur
 *    - Historique des calculs
 *    - Favoris/wishlist pour les recommandations
 * 
 * 4. PARTAGE ET EXPORT
 *    - Partager les résultats du calculateur
 *    - Ajouter au panier depuis le widget de recommandation
 *    - Exporter les résultats
 */

// ============================================================================
// STRUCTURE CSS/TAILWIND
// ============================================================================

/**
 * COULEURS UTILISÉES:
 * 
 * RecommendationWidget:
 * - Primary: bg-ev-700 (vert) / hover:bg-ev-900
 * - Text: text-white / text-gray-600
 * 
 * SeedCalculatorWidget:
 * - Primary: bg-emerald-600 (vert émeraude) / hover:bg-emerald-700
 * - Secondary: bg-emerald-50, border-emerald-200
 * 
 * ANIMATIONS:
 * - Modal: animate-in fade-in slide-in-from-bottom-4 duration-300
 * - Backdrop: backdrop-blur-sm transition-opacity
 * - Button: transition-all duration-300 (shadow, color)
 */

// ============================================================================
// RESPONSIVE
// ============================================================================

/**
 * Les widgets sont entièrement responsives:
 * - Mobile: Modal 100% width avec padding
 * - Tablet: Max-width 2xl avec grille 2 colonnes
 * - Desktop: Grille 3 colonnes
 * 
 * Boutons flottants:
 * - Position: fixed bottom-6/24 right-6
 * - Taille: 64x64px (w-16 h-16)
 * - Reste visible et cliquable sur tous les écrans
 */

export {};
