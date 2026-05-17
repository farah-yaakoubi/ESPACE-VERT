-- Ajouter l'emetteur et le libelle source aux notifications admin
ALTER TABLE `admin_notifications`
  ADD COLUMN `id_emetteur` INTEGER NULL,
  ADD COLUMN `source_label` VARCHAR(160) NULL,
  MODIFY `type` ENUM('nouveau_devis', 'nouveau_rdv', 'nouveau_message', 'message_interne') NOT NULL;

-- Index et clef etrangere pour l'emetteur admin
CREATE INDEX `admin_notifications_id_emetteur_idx` ON `admin_notifications`(`id_emetteur`);

ALTER TABLE `admin_notifications`
  ADD CONSTRAINT `admin_notifications_id_emetteur_fkey`
  FOREIGN KEY (`id_emetteur`) REFERENCES `admins`(`id_admin`)
  ON DELETE SET NULL
  ON UPDATE CASCADE;
