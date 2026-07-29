CREATE TABLE `tutorial_videos` (
  `id_video` INTEGER NOT NULL AUTO_INCREMENT,
  `titre` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `url` VARCHAR(500) NOT NULL,
  `thumbnail` VARCHAR(500) NULL,
  `page` VARCHAR(80) NOT NULL DEFAULT 'pulvert',
  `ordre` INTEGER NOT NULL DEFAULT 0,
  `actif` BOOLEAN NOT NULL DEFAULT true,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,

  INDEX `tutorial_videos_page_actif_idx`(`page`, `actif`),
  PRIMARY KEY (`id_video`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
