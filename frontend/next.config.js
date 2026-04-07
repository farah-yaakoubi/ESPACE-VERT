const withNextIntl = require('next-intl/plugin')(
  './i18n.ts'
);

module.exports = withNextIntl({
  reactStrictMode: true,

  // ─── Fix warning workspace root (lockfile multiple) ───────────────────────
  outputFileTracingRoot: require('path').join(__dirname, '../'),

  // ─── Images : autoriser les URLs externes du backend ─────────────────────
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/**',
      },
    ],
    // Évite les erreurs "not a valid image" pour les images manquantes
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },
});