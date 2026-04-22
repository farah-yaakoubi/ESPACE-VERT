/*
  Warnings:

  - You are about to alter the column `statut` on the `devis_demandes` table. The data in that column could be lost. The data in that column will be cast from `VarChar(20)` to `Enum(EnumId(1))`.
  - You are about to alter the column `division` on the `produits` table. The data in that column could be lost. The data in that column will be cast from `VarChar(20)` to `Enum(EnumId(0))`.
  - The primary key for the `produits_images` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id_imgp` on the `produits_images` table. All the data in the column will be lost.
  - You are about to alter the column `statut` on the `rendez_vous` table. The data in that column could be lost. The data in that column will be cast from `VarChar(20)` to `Enum(EnumId(2))`.
  - Added the required column `id_imgP` to the `produits_images` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `devis_demandes` ADD COLUMN `reponse_admin` TEXT NULL,
    MODIFY `statut` ENUM('nouveau', 'en_cours', 'traite', 'rejete') NOT NULL DEFAULT 'nouveau';

-- AlterTable
ALTER TABLE `faqs` ADD COLUMN `nb_consultations` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `produits` ADD COLUMN `id_activite` INTEGER NULL,
    MODIFY `division` ENUM('standard', 'pro', 'garden') NOT NULL DEFAULT 'standard';

-- AlterTable
ALTER TABLE `produits_images` DROP PRIMARY KEY,
    DROP COLUMN `id_imgp`,
    ADD COLUMN `id_imgP` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id_imgP`);

-- AlterTable
ALTER TABLE `rendez_vous` MODIFY `statut` ENUM('nouveau', 'confirme', 'annule', 'termine') NOT NULL DEFAULT 'nouveau';

-- AlterTable
ALTER TABLE `visiteurs` ADD COLUMN `region` VARCHAR(120) NULL;

-- CreateTable
CREATE TABLE `search_queries` (
    `id_search` INTEGER NOT NULL AUTO_INCREMENT,
    `id_visiteur` INTEGER NOT NULL,
    `query` VARCHAR(500) NOT NULL,
    `nb_results` INTEGER NOT NULL DEFAULT 0,
    `searched_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `search_queries_id_visiteur_idx`(`id_visiteur`),
    INDEX `search_queries_searched_at_idx`(`searched_at`),
    PRIMARY KEY (`id_search`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `actualites_publiee_idx` ON `actualites`(`publiee`);

-- CreateIndex
CREATE INDEX `audit_logs_entity_name_idx` ON `audit_logs`(`entity_name`);

-- CreateIndex
CREATE INDEX `audit_logs_date_action_idx` ON `audit_logs`(`date_action`);

-- CreateIndex
CREATE INDEX `contact_messages_lu_idx` ON `contact_messages`(`lu`);

-- CreateIndex
CREATE INDEX `devis_demandes_statut_idx` ON `devis_demandes`(`statut`);

-- CreateIndex
CREATE INDEX `faqs_active_idx` ON `faqs`(`active`);

-- CreateIndex
CREATE INDEX `produits_id_activite_idx` ON `produits`(`id_activite`);

-- CreateIndex
CREATE INDEX `produits_actif_idx` ON `produits`(`actif`);

-- CreateIndex
CREATE INDEX `rendez_vous_statut_idx` ON `rendez_vous`(`statut`);

-- CreateIndex
CREATE INDEX `rendez_vous_date_souhaitee_idx` ON `rendez_vous`(`date_souhaitee`);

-- CreateIndex
CREATE INDEX `visites_pages_visited_at_idx` ON `visites_pages`(`visited_at`);

-- AddForeignKey
ALTER TABLE `search_queries` ADD CONSTRAINT `search_queries_id_visiteur_fkey` FOREIGN KEY (`id_visiteur`) REFERENCES `visiteurs`(`id_visiteur`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `produits` ADD CONSTRAINT `produits_id_activite_fkey` FOREIGN KEY (`id_activite`) REFERENCES `activites`(`id_activite`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RedefineIndex
CREATE INDEX `admins_id_role_idx` ON `admins`(`id_role`);
DROP INDEX `admins_id_role_fkey` ON `admins`;

-- RedefineIndex
CREATE INDEX `audit_logs_id_admin_idx` ON `audit_logs`(`id_admin`);
DROP INDEX `audit_logs_id_admin_fkey` ON `audit_logs`;

-- RedefineIndex
CREATE INDEX `categories_id_activite_idx` ON `categories`(`id_activite`);
DROP INDEX `categories_id_activite_fkey` ON `categories`;

-- RedefineIndex
CREATE INDEX `categories_id_marque_idx` ON `categories`(`id_marque`);
DROP INDEX `categories_id_marque_fkey` ON `categories`;

-- RedefineIndex
CREATE INDEX `categories_parent_id_idx` ON `categories`(`parent_id`);
DROP INDEX `categories_parent_id_fkey` ON `categories`;

-- RedefineIndex
CREATE INDEX `devis_demandes_id_admin_idx` ON `devis_demandes`(`id_admin`);
DROP INDEX `devis_demandes_id_admin_fkey` ON `devis_demandes`;

-- RedefineIndex
CREATE INDEX `produits_id_categorie_idx` ON `produits`(`id_categorie`);
DROP INDEX `produits_id_categorie_fkey` ON `produits`;

-- RedefineIndex
CREATE INDEX `produits_id_marque_idx` ON `produits`(`id_marque`);
DROP INDEX `produits_id_marque_fkey` ON `produits`;

-- RedefineIndex
CREATE INDEX `produits_images_id_produit_idx` ON `produits_images`(`id_produit`);
DROP INDEX `produits_images_id_produit_fkey` ON `produits_images`;

-- RedefineIndex
CREATE INDEX `sessions_admin_id_admin_idx` ON `sessions_admin`(`id_admin`);
DROP INDEX `sessions_admin_id_admin_fkey` ON `sessions_admin`;

-- RedefineIndex
CREATE INDEX `visites_pages_id_visiteur_idx` ON `visites_pages`(`id_visiteur`);
DROP INDEX `visites_pages_id_visiteur_fkey` ON `visites_pages`;
