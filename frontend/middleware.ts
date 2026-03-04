import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

export default createMiddleware({
  // Liste des locales supportées
  locales,
  
  // Locale par défaut
  defaultLocale: 'fr',
  
  // Détection automatique de la langue du navigateur
  localeDetection: true,
  
  // Préfixe locale toujours visible dans l'URL
  localePrefix: 'always',
});

export const config = {
  // Matcher pour toutes les routes
  matcher: [
    // Matcher toutes les routes sauf les fichiers statiques
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // Matcher aussi la racine
    '/',
    // Matcher les locales
    '/(fr|ar|en|it|es)/:path*'
  ],
};