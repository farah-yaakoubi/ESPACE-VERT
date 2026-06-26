-- Rename column `categorie` to `rubrique` in `faqs` table
-- Adjust the VARCHAR length/type to match Prisma schema

ALTER TABLE `faqs`
  CHANGE COLUMN `categorie` `rubrique` VARCHAR(120) NULL;

-- If your MySQL version supports RENAME COLUMN, you can alternatively use:
-- ALTER TABLE `faqs` RENAME COLUMN `categorie` TO `rubrique`;
