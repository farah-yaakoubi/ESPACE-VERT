UPDATE `categories`
SET `parent_id` = 107, `ordre` = 3
WHERE `slug` = 'fv-agri-ef-organique';

UPDATE `categories`
SET `ordre` = 4
WHERE `slug` = 'fv-agri-fertilisant';

UPDATE `categories`
SET `parent_id` = 108, `ordre` = 3
WHERE `slug` = 'fv-gazon-ef-organique';

UPDATE `categories`
SET `parent_id` = 106, `ordre` = 3
WHERE `slug` = 'fv-garden-ef-chimiques';

UPDATE `categories`
SET `parent_id` = 106, `ordre` = 4
WHERE `slug` = 'fv-garden-ef-organique';

ALTER TABLE `categories`
  ADD CONSTRAINT `fk_categories_parent_id`
  FOREIGN KEY (`parent_id`)
  REFERENCES `categories` (`id_categorie`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE `produits`
  ADD CONSTRAINT `fk_produits_id_categorie`
  FOREIGN KEY (`id_categorie`)
  REFERENCES `categories` (`id_categorie`)
  ON DELETE RESTRICT
  ON UPDATE CASCADE;
