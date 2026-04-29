-- Migration : passer parent_id de SET NULL à CASCADE
-- À exécuter via : npx prisma migrate dev --name category_cascade

-- 1. Supprimer l'ancienne contrainte FK sur parent_id
ALTER TABLE `categories`
  DROP FOREIGN KEY IF EXISTS `categories_parent_id_fkey`;

-- 2. Recréer avec ON DELETE CASCADE
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_parent_id_fkey`
  FOREIGN KEY (`parent_id`)
  REFERENCES `categories` (`id_categorie`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;
