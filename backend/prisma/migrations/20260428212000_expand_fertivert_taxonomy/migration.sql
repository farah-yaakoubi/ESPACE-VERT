UPDATE `categories`
SET `nom` = 'Granule'
WHERE `slug` IN ('fv-agri-org-granule', 'fv-gazon-org-granule', 'fv-garden-chimiques-granule');

UPDATE `categories`
SET `nom` = 'Engrais Organiques'
WHERE `slug` = 'fv-garden-ef-organique';

INSERT INTO `categories` (`nom`, `description`, `image`, `slug`, `id_activite`, `id_marque`, `parent_id`, `ordre`, `actif`, `created_at`)
SELECT 'Biostimulants', NULL, NULL, 'fv-agri-fertilisant-biostimulants', NULL, 1,
       (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-agri-fertilisant'),
       1, 1, NOW(3)
WHERE NOT EXISTS (
  SELECT 1 FROM `categories` WHERE `slug` = 'fv-agri-fertilisant-biostimulants'
);

INSERT INTO `categories` (`nom`, `description`, `image`, `slug`, `id_activite`, `id_marque`, `parent_id`, `ordre`, `actif`, `created_at`)
SELECT 'Gestion du Sol', NULL, NULL, 'fv-agri-fertilisant-gestion-sol', NULL, 1,
       (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-agri-fertilisant'),
       2, 1, NOW(3)
WHERE NOT EXISTS (
  SELECT 1 FROM `categories` WHERE `slug` = 'fv-agri-fertilisant-gestion-sol'
);

INSERT INTO `categories` (`nom`, `description`, `image`, `slug`, `id_activite`, `id_marque`, `parent_id`, `ordre`, `actif`, `created_at`)
SELECT 'Correcteur de Carences', NULL, NULL, 'fv-agri-fertilisant-correcteur-carences', NULL, 1,
       (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-agri-fertilisant'),
       3, 1, NOW(3)
WHERE NOT EXISTS (
  SELECT 1 FROM `categories` WHERE `slug` = 'fv-agri-fertilisant-correcteur-carences'
);

INSERT INTO `categories` (`nom`, `description`, `image`, `slug`, `id_activite`, `id_marque`, `parent_id`, `ordre`, `actif`, `created_at`)
SELECT 'Conditionnement 2 KG', NULL, NULL, 'fv-garden-chimiques-granule-2kg', NULL, 1,
       (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-garden-chimiques-granule'),
       1, 1, NOW(3)
WHERE NOT EXISTS (
  SELECT 1 FROM `categories` WHERE `slug` = 'fv-garden-chimiques-granule-2kg'
);

INSERT INTO `categories` (`nom`, `description`, `image`, `slug`, `id_activite`, `id_marque`, `parent_id`, `ordre`, `actif`, `created_at`)
SELECT 'Conditionnement 750 G', NULL, NULL, 'fv-garden-chimiques-soluble-750g', NULL, 1,
       (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-garden-chimiques-soluble'),
       1, 1, NOW(3)
WHERE NOT EXISTS (
  SELECT 1 FROM `categories` WHERE `slug` = 'fv-garden-chimiques-soluble-750g'
);

INSERT INTO `categories` (`nom`, `description`, `image`, `slug`, `id_activite`, `id_marque`, `parent_id`, `ordre`, `actif`, `created_at`)
SELECT 'Conditionnement 500 G', NULL, NULL, 'fv-garden-chimiques-soluble-500g', NULL, 1,
       (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-garden-chimiques-soluble'),
       2, 1, NOW(3)
WHERE NOT EXISTS (
  SELECT 1 FROM `categories` WHERE `slug` = 'fv-garden-chimiques-soluble-500g'
);

INSERT INTO `categories` (`nom`, `description`, `image`, `slug`, `id_activite`, `id_marque`, `parent_id`, `ordre`, `actif`, `created_at`)
SELECT 'Conditionnement 1 L', NULL, NULL, 'fv-garden-chimiques-liquide-1l', NULL, 1,
       (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-garden-chimiques-liquide'),
       1, 1, NOW(3)
WHERE NOT EXISTS (
  SELECT 1 FROM `categories` WHERE `slug` = 'fv-garden-chimiques-liquide-1l'
);

INSERT INTO `categories` (`nom`, `description`, `image`, `slug`, `id_activite`, `id_marque`, `parent_id`, `ordre`, `actif`, `created_at`)
SELECT 'Conditionnement 250 G', NULL, NULL, 'fv-garden-org-250g', NULL, 1,
       (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-garden-ef-organique'),
       1, 1, NOW(3)
WHERE NOT EXISTS (
  SELECT 1 FROM `categories` WHERE `slug` = 'fv-garden-org-250g'
);

INSERT INTO `categories` (`nom`, `description`, `image`, `slug`, `id_activite`, `id_marque`, `parent_id`, `ordre`, `actif`, `created_at`)
SELECT 'Conditionnement 500 G', NULL, NULL, 'fv-garden-org-500g', NULL, 1,
       (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-garden-ef-organique'),
       2, 1, NOW(3)
WHERE NOT EXISTS (
  SELECT 1 FROM `categories` WHERE `slug` = 'fv-garden-org-500g'
);

INSERT INTO `categories` (`nom`, `description`, `image`, `slug`, `id_activite`, `id_marque`, `parent_id`, `ordre`, `actif`, `created_at`)
SELECT 'Conditionnement 1 KG', NULL, NULL, 'fv-garden-org-1kg', NULL, 1,
       (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-garden-ef-organique'),
       3, 1, NOW(3)
WHERE NOT EXISTS (
  SELECT 1 FROM `categories` WHERE `slug` = 'fv-garden-org-1kg'
);

UPDATE `produits`
SET `nom` = 'Pouss Roots + 1/5/20 L',
    `id_categorie` = (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-agri-fertilisant-biostimulants')
WHERE `slug` = 'ferti-pouss-roots-pro';

UPDATE `produits`
SET `nom` = 'Aminal + 1/5/20 L',
    `id_categorie` = (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-agri-fertilisant-biostimulants')
WHERE `slug` = 'ferti-aminal-plus-pro';

UPDATE `produits`
SET `nom` = 'Fort Start + 1/5/20 L',
    `id_categorie` = (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-agri-fertilisant-biostimulants')
WHERE `slug` = 'ferti-fort-start-pro';

UPDATE `produits`
SET `nom` = 'Oceano + 1/5/20 L',
    `id_categorie` = (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-agri-fertilisant-biostimulants')
WHERE `slug` = 'ferti-oceano-plus-pro';

UPDATE `produits`
SET `nom` = 'Fulvical + 1/5/20 L',
    `id_categorie` = (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-agri-fertilisant-gestion-sol')
WHERE `slug` = 'ferti-fulvical-plus-pro';

UPDATE `produits`
SET `nom` = 'Sweeter + 1/5/20 L',
    `id_categorie` = (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-agri-fertilisant-gestion-sol')
WHERE `slug` = 'ferti-sweeter-plus-pro';

UPDATE `produits`
SET `nom` = 'CalciMag + 1/5/20 L',
    `id_categorie` = (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-agri-fertilisant-correcteur-carences')
WHERE `slug` = 'ferti-calcimag-plus-pro';

UPDATE `produits`
SET `nom` = 'Calcial + 1/5/20 L',
    `id_categorie` = (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-agri-fertilisant-correcteur-carences')
WHERE `slug` = 'ferti-calcial-plus-pro';

UPDATE `produits`
SET `nom` = 'Ferti Actif 1/5/20 L'
WHERE `slug` = 'ferti-actif-pro';

UPDATE `produits`
SET `nom` = 'Ferti Fruit 1/5/20 L'
WHERE `slug` = 'ferti-fruit-pro';

UPDATE `produits`
SET `nom` = 'Ferti Leaf 1/5/20 L'
WHERE `slug` = 'ferti-leaf-pro';

UPDATE `produits`
SET `nom` = 'Ferti Go 1/5/20 L'
WHERE `slug` = 'ferti-go-pro';

UPDATE `produits`
SET `nom` = 'FertiActif 1/5/20 L'
WHERE `slug` = 'fertiactif-gazon-pro';

UPDATE `produits`
SET `nom` = 'FertiTop 1/5/20 L'
WHERE `slug` = 'feritop-gazon-pro';

UPDATE `produits`
SET `nom` = 'FertiGo 1/5/20 L'
WHERE `slug` = 'fertigo-gazon-pro';

UPDATE `produits`
SET `nom` = 'Agrumes 750 g',
    `id_categorie` = (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-garden-chimiques-soluble-750g')
WHERE `slug` = 'fg-agrumes-soluble-750g';

UPDATE `produits`
SET `nom` = 'Legumes 750 g',
    `id_categorie` = (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-garden-chimiques-soluble-750g')
WHERE `slug` = 'fg-legumes-soluble-750g';

UPDATE `produits`
SET `nom` = 'Fruitiers 750 g',
    `id_categorie` = (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-garden-chimiques-soluble-750g')
WHERE `slug` = 'fg-fruitiers-soluble-750g';

UPDATE `produits`
SET `nom` = 'Fertivit 13.40.13 500 G',
    `id_categorie` = (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-garden-chimiques-soluble-500g')
WHERE `slug` = 'fertivit-13-40-13-500g';

UPDATE `produits`
SET `nom` = 'Fertivit 20.20.20 500 G',
    `id_categorie` = (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-garden-chimiques-soluble-500g')
WHERE `slug` = 'fertivit-20-20-20-500g';

UPDATE `produits`
SET `nom` = 'Universel 1 L',
    `id_categorie` = (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-garden-chimiques-liquide-1l')
WHERE `slug` = 'fg-universel-liquide-1l';

UPDATE `produits`
SET `nom` = 'Plantes Vert 1 L',
    `id_categorie` = (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-garden-chimiques-liquide-1l')
WHERE `slug` = 'fg-plantes-vertes-1l';

UPDATE `produits`
SET `nom` = 'Palmiers D''interieurs 1 L',
    `id_categorie` = (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-garden-chimiques-liquide-1l')
WHERE `slug` = 'fg-palmiers-interieurs-1l';

UPDATE `produits`
SET `nom` = 'Plantes Grasses Cactees 1 L',
    `id_categorie` = (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-garden-chimiques-liquide-1l')
WHERE `slug` = 'fg-plantes-grasses-1l';

UPDATE `produits`
SET `nom` = 'Plantes Fleuries 1 L',
    `id_categorie` = (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-garden-chimiques-liquide-1l')
WHERE `slug` = 'fg-plantes-fleuries-1l';

UPDATE `produits`
SET `nom` = 'Agrumes 1 L',
    `id_categorie` = (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-garden-chimiques-liquide-1l')
WHERE `slug` = 'fg-agrumes-liquide-1l';

UPDATE `produits`
SET `nom` = 'Geraniums 1 L',
    `id_categorie` = (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-garden-chimiques-liquide-1l')
WHERE `slug` = 'fg-geraniums-liquide-1l';

UPDATE `produits`
SET `nom` = 'Ferti Fort 250 G',
    `id_categorie` = (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-garden-org-250g')
WHERE `slug` = 'ferti-fort-250g';

UPDATE `produits`
SET `nom` = 'Ferti Micro 500 G',
    `id_categorie` = (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-garden-org-500g')
WHERE `slug` = 'ferti-micro-garden-500g';

UPDATE `produits`
SET `nom` = 'Ferti Max 1 KG',
    `id_categorie` = (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-garden-org-1kg')
WHERE `slug` = 'ferti-max-garden-1kg';

UPDATE `produits`
SET `nom` = 'Engrais Oliviers 2 KG',
    `id_categorie` = (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-garden-chimiques-granule-2kg')
WHERE `slug` = 'fg-oliviers-2kg';

UPDATE `produits`
SET `nom` = 'Engrais Agrumes 2 KG',
    `id_categorie` = (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-garden-chimiques-granule-2kg')
WHERE `slug` = 'fg-agrumes-2kg';

UPDATE `produits`
SET `nom` = 'Engrais Potager 2 KG',
    `id_categorie` = (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-garden-chimiques-granule-2kg')
WHERE `slug` = 'fg-potager-2kg';

UPDATE `produits`
SET `nom` = 'Engrais Fleurs 2 KG',
    `id_categorie` = (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-garden-chimiques-granule-2kg')
WHERE `slug` = 'fg-fleurs-2kg';

UPDATE `produits`
SET `nom` = 'Engrais Arbres 2 KG',
    `id_categorie` = (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-garden-chimiques-granule-2kg')
WHERE `slug` = 'fg-arbres-2kg';

UPDATE `produits`
SET `nom` = 'Engrais Geraniums 2 KG',
    `id_categorie` = (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-garden-chimiques-granule-2kg')
WHERE `slug` = 'fg-geraniums-2kg';

UPDATE `produits`
SET `nom` = 'Engrais Universel 2 KG',
    `id_categorie` = (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-garden-chimiques-granule-2kg')
WHERE `slug` = 'fg-universel-2kg';

UPDATE `produits`
SET `nom` = 'Engrais Gazon 2 KG',
    `id_categorie` = (SELECT `id_categorie` FROM `categories` WHERE `slug` = 'fv-garden-chimiques-granule-2kg')
WHERE `slug` = 'fg-gazon-2kg';
