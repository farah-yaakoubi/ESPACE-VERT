-- CreateTable
CREATE TABLE `roles` (
    `id_role` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(80) NOT NULL,
    `permissions` JSON NOT NULL,

    UNIQUE INDEX `roles_nom_key`(`nom`),
    PRIMARY KEY (`id_role`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admins` (
    `id_admin` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(120) NOT NULL,
    `email` VARCHAR(180) NOT NULL,
    `mot_de_passe` VARCHAR(255) NOT NULL,
    `actif` BOOLEAN NOT NULL DEFAULT true,
    `id_role` INTEGER NOT NULL DEFAULT 2,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admins_email_key`(`email`),
    PRIMARY KEY (`id_admin`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions_admin` (
    `id_session` INTEGER NOT NULL AUTO_INCREMENT,
    `id_admin` INTEGER NOT NULL,
    `refresh_token` VARCHAR(512) NOT NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_session`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visiteurs` (
    `id_visiteur` INTEGER NOT NULL AUTO_INCREMENT,
    `token_visiteur` VARCHAR(128) NOT NULL,
    `ip_address` VARCHAR(45) NOT NULL,
    `user_agent` TEXT NULL,
    `pays` VARCHAR(80) NULL,
    `first_visit` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `last_visit` DATETIME(3) NOT NULL,

    UNIQUE INDEX `visiteurs_token_visiteur_key`(`token_visiteur`),
    PRIMARY KEY (`id_visiteur`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visites_pages` (
    `id_vp` INTEGER NOT NULL AUTO_INCREMENT,
    `id_visiteur` INTEGER NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `titre` VARCHAR(255) NULL,
    `duree` INTEGER NOT NULL DEFAULT 0,
    `visited_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_vp`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `marques` (
    `id_marque` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(120) NOT NULL,
    `logo` VARCHAR(500) NULL,
    `description` TEXT NULL,
    `slug` VARCHAR(160) NOT NULL,
    `actif` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `marques_slug_key`(`slug`),
    PRIMARY KEY (`id_marque`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activites` (
    `id_activite` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `image` VARCHAR(500) NULL,
    `slug` VARCHAR(180) NOT NULL,
    `ordre` INTEGER NOT NULL DEFAULT 0,
    `actif` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `activites_slug_key`(`slug`),
    PRIMARY KEY (`id_activite`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id_categorie` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `image` VARCHAR(500) NULL,
    `slug` VARCHAR(180) NOT NULL,
    `id_activite` INTEGER NULL,
    `id_marque` INTEGER NULL,
    `parent_id` INTEGER NULL,
    `ordre` INTEGER NOT NULL DEFAULT 0,
    `actif` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `categories_slug_key`(`slug`),
    PRIMARY KEY (`id_categorie`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `produits` (
    `id_produit` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `fiche_technique` TEXT NULL,
    `slug` VARCHAR(220) NOT NULL,
    `id_categorie` INTEGER NOT NULL,
    `id_marque` INTEGER NOT NULL,
    `division` VARCHAR(20) NOT NULL DEFAULT 'standard',
    `tags` JSON NULL,
    `actif` BOOLEAN NOT NULL DEFAULT true,
    `ordre` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `produits_slug_key`(`slug`),
    PRIMARY KEY (`id_produit`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `produits_images` (
    `id_imgp` INTEGER NOT NULL AUTO_INCREMENT,
    `id_produit` INTEGER NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `alt` VARCHAR(255) NULL,
    `ordre` INTEGER NOT NULL DEFAULT 0,
    `is_principale` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id_imgp`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `actualites` (
    `id_actualite` INTEGER NOT NULL AUTO_INCREMENT,
    `titre` VARCHAR(255) NOT NULL,
    `contenu` LONGTEXT NOT NULL,
    `image` VARCHAR(500) NULL,
    `slug` VARCHAR(280) NOT NULL,
    `publiee` BOOLEAN NOT NULL DEFAULT false,
    `published_at` DATETIME(3) NULL,
    `id_admin` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `actualites_slug_key`(`slug`),
    PRIMARY KEY (`id_actualite`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faqs` (
    `id_faq` INTEGER NOT NULL AUTO_INCREMENT,
    `question` TEXT NOT NULL,
    `reponse` TEXT NOT NULL,
    `categorie` VARCHAR(120) NULL,
    `ordre` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_faq`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `devis_demandes` (
    `id_devis` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(150) NOT NULL,
    `email` VARCHAR(180) NOT NULL,
    `telephone` VARCHAR(30) NULL,
    `message` TEXT NULL,
    `statut` VARCHAR(20) NOT NULL DEFAULT 'nouveau',
    `id_produit` INTEGER NULL,
    `id_visiteur` INTEGER NULL,
    `id_admin` INTEGER NULL,
    `note_interne` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_devis`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rendez_vous` (
    `id_rdv` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(150) NOT NULL,
    `email` VARCHAR(180) NOT NULL,
    `telephone` VARCHAR(30) NULL,
    `date_souhaitee` DATE NOT NULL,
    `heure` VARCHAR(10) NULL,
    `objet` VARCHAR(255) NULL,
    `agence` VARCHAR(120) NULL,
    `message` TEXT NULL,
    `statut` VARCHAR(20) NOT NULL DEFAULT 'nouveau',
    `id_visiteur` INTEGER NULL,
    `id_admin` INTEGER NULL,
    `note_interne` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_rdv`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_messages` (
    `id_contact` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(150) NOT NULL,
    `email` VARCHAR(180) NOT NULL,
    `sujet` VARCHAR(255) NULL,
    `message` TEXT NOT NULL,
    `reponse` TEXT NULL,
    `lu` BOOLEAN NOT NULL DEFAULT false,
    `id_visiteur` INTEGER NULL,
    `id_admin` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `replied_at` DATETIME(3) NULL,

    PRIMARY KEY (`id_contact`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id_log` INTEGER NOT NULL AUTO_INCREMENT,
    `id_admin` INTEGER NULL,
    `action` VARCHAR(100) NOT NULL,
    `entity_name` VARCHAR(80) NOT NULL,
    `entity_id` INTEGER NULL,
    `detail` JSON NULL,
    `ip_address` VARCHAR(45) NULL,
    `date_action` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_log`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `admins` ADD CONSTRAINT `admins_id_role_fkey` FOREIGN KEY (`id_role`) REFERENCES `roles`(`id_role`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessions_admin` ADD CONSTRAINT `sessions_admin_id_admin_fkey` FOREIGN KEY (`id_admin`) REFERENCES `admins`(`id_admin`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visites_pages` ADD CONSTRAINT `visites_pages_id_visiteur_fkey` FOREIGN KEY (`id_visiteur`) REFERENCES `visiteurs`(`id_visiteur`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_id_activite_fkey` FOREIGN KEY (`id_activite`) REFERENCES `activites`(`id_activite`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_id_marque_fkey` FOREIGN KEY (`id_marque`) REFERENCES `marques`(`id_marque`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id_categorie`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `produits` ADD CONSTRAINT `produits_id_categorie_fkey` FOREIGN KEY (`id_categorie`) REFERENCES `categories`(`id_categorie`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `produits` ADD CONSTRAINT `produits_id_marque_fkey` FOREIGN KEY (`id_marque`) REFERENCES `marques`(`id_marque`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `produits_images` ADD CONSTRAINT `produits_images_id_produit_fkey` FOREIGN KEY (`id_produit`) REFERENCES `produits`(`id_produit`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `actualites` ADD CONSTRAINT `actualites_id_admin_fkey` FOREIGN KEY (`id_admin`) REFERENCES `admins`(`id_admin`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `devis_demandes` ADD CONSTRAINT `devis_demandes_id_produit_fkey` FOREIGN KEY (`id_produit`) REFERENCES `produits`(`id_produit`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `devis_demandes` ADD CONSTRAINT `devis_demandes_id_visiteur_fkey` FOREIGN KEY (`id_visiteur`) REFERENCES `visiteurs`(`id_visiteur`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `devis_demandes` ADD CONSTRAINT `devis_demandes_id_admin_fkey` FOREIGN KEY (`id_admin`) REFERENCES `admins`(`id_admin`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rendez_vous` ADD CONSTRAINT `rendez_vous_id_visiteur_fkey` FOREIGN KEY (`id_visiteur`) REFERENCES `visiteurs`(`id_visiteur`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rendez_vous` ADD CONSTRAINT `rendez_vous_id_admin_fkey` FOREIGN KEY (`id_admin`) REFERENCES `admins`(`id_admin`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contact_messages` ADD CONSTRAINT `contact_messages_id_visiteur_fkey` FOREIGN KEY (`id_visiteur`) REFERENCES `visiteurs`(`id_visiteur`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contact_messages` ADD CONSTRAINT `contact_messages_id_admin_fkey` FOREIGN KEY (`id_admin`) REFERENCES `admins`(`id_admin`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_id_admin_fkey` FOREIGN KEY (`id_admin`) REFERENCES `admins`(`id_admin`) ON DELETE SET NULL ON UPDATE CASCADE;
