/**
 * CONFIGURATION DES WIDGETS
 * 
 * Ce fichier centralise la configuration des widgets
 * Modifiez-le selon vos besoins
 */

// Configuration du Widget de Recommandation
export const RECOMMENDATION_WIDGET_CONFIG = {
  // Position du bouton flottant
  position: {
    bottom: '1.5rem', // 24px
    right: '1.5rem',  // 24px
  },
  
  // Apparence
  appearance: {
    // Couleur du bouton (Tailwind classes)
    bgColor: 'bg-ev-700',
    hoverColor: 'hover:bg-ev-900',
    
    // Icône/Logo
    icon: '/logos/recommendation.png', // Remplacez par votre logo
    fallbackEmoji: '✨', // Emoji par défaut si pas de logo
    
    // Header du modal
    headerGradient: 'from-ev-700 to-ev-900',
  },
  
  // Contenu
  content: {
    title: 'Produits Recommandés',
    subtitle: 'Découvrez les produits spécialement sélectionnés pour vous',
    categories: ['Tous', 'Semences', 'Engrais', 'Outils'],
    emptyMessage: 'Aucun produit recommandé pour l\'instant',
  },
  
  // Animation
  animation: {
    modalEnter: 'animate-in fade-in slide-in-from-bottom-4 duration-300',
    backdropBlur: 'backdrop-blur-sm',
  },
};

// Configuration du Widget Calculateur de Semences
export const SEED_CALCULATOR_CONFIG = {
  // Position du bouton flottant
  position: {
    bottom: '6rem', // 96px (au-dessus du widget de recommandation)
    right: '1.5rem', // 24px
  },
  
  // Apparence
  appearance: {
    // Couleur du bouton
    bgColor: 'bg-emerald-600',
    hoverColor: 'hover:bg-emerald-700',
    
    // Icône/Logo
    icon: '/logos/seed-calculator.png', // Remplacez par votre logo
    fallbackIcon: 'Sprout', // Icône lucide-react par défaut
    
    // Header du modal
    headerGradient: 'from-emerald-600 to-emerald-800',
  },
  
  // Contenu
  content: {
    title: 'Calculateur de Semences',
    subtitle: 'Calculez facilement vos besoins en semences',
    
    // Plantes supportées (clé: ID, value: configuration)
    plantTypes: {
      tomate: {
        name: 'Tomate',
        seedsPerM2: 30,
        spacing: '45-60 cm entre les plants',
        depthCm: { min: 0.5, max: 1 },
      },
      laitue: {
        name: 'Laitue',
        seedsPerM2: 20,
        spacing: '30 cm entre les plants',
        depthCm: { min: 0.5, max: 1 },
      },
      carotte: {
        name: 'Carotte',
        seedsPerM2: 100,
        spacing: '5-8 cm entre les plants',
        depthCm: { min: 1, max: 2 },
      },
      oignon: {
        name: 'Oignon',
        seedsPerM2: 50,
        spacing: '15-20 cm entre les plants',
        depthCm: { min: 1, max: 1.5 },
      },
      courge: {
        name: 'Courge',
        seedsPerM2: 2,
        spacing: '1-1.5 m entre les plants',
        depthCm: { min: 2, max: 3 },
      },
      haricot: {
        name: 'Haricot',
        seedsPerM2: 10,
        spacing: '15-20 cm entre les plants',
        depthCm: { min: 2, max: 4 },
      },
    },
  },
  
  // Animation
  animation: {
    modalEnter: 'animate-in fade-in slide-in-from-bottom-4 duration-300',
    backdropBlur: 'backdrop-blur-sm',
  },
};

// Configuration générale
export const WIDGETS_GENERAL_CONFIG = {
  // Z-index des widgets
  zIndex: {
    backdrop: 40,
    modal: 50,
  },
  
  // Options de responsive
  responsive: {
    breakpoints: {
      mobile: 'max-w-full',
      tablet: 'max-w-2xl',
      desktop: 'max-w-4xl',
    },
    gridCols: {
      mobile: 'grid-cols-1',
      tablet: 'sm:grid-cols-2',
      desktop: 'lg:grid-cols-3',
    },
  },
};

// Fonction helper pour obtenir l'icône d'un widget
export function getWidgetIcon(widgetType: 'recommendation' | 'calculator'): string {
  if (widgetType === 'recommendation') {
    return RECOMMENDATION_WIDGET_CONFIG.appearance.icon || RECOMMENDATION_WIDGET_CONFIG.appearance.fallbackEmoji;
  }
  return SEED_CALCULATOR_CONFIG.appearance.icon || SEED_CALCULATOR_CONFIG.appearance.fallbackIcon;
}

// Fonction helper pour obtenir la position d'un widget
export function getWidgetPosition(widgetType: 'recommendation' | 'calculator') {
  if (widgetType === 'recommendation') {
    return RECOMMENDATION_WIDGET_CONFIG.position;
  }
  return SEED_CALCULATOR_CONFIG.position;
}

export default {
  RECOMMENDATION_WIDGET_CONFIG,
  SEED_CALCULATOR_CONFIG,
  WIDGETS_GENERAL_CONFIG,
  getWidgetIcon,
  getWidgetPosition,
};
