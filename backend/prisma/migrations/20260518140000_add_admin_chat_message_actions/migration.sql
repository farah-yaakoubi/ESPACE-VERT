ALTER TABLE `chat_messages`
  ADD COLUMN `thumbs` JSON NOT NULL DEFAULT ('[]'),
  ADD COLUMN `edited_at` DATETIME(3) NULL,
  ADD COLUMN `deleted_at` DATETIME(3) NULL,
  ADD COLUMN `deleted_by` INTEGER NULL;

CREATE INDEX `chat_messages_deleted_at_idx` ON `chat_messages`(`deleted_at`);
