CREATE TABLE `produits_embeddings` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `id_produit` INTEGER NOT NULL,
  `chunk` TEXT NOT NULL,
  `embedding` JSON NOT NULL,

  UNIQUE INDEX `produits_embeddings_id_produit_key`(`id_produit`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `produits_embeddings`
  ADD CONSTRAINT `produits_embeddings_id_produit_fkey`
  FOREIGN KEY (`id_produit`) REFERENCES `produits`(`id_produit`)
  ON DELETE CASCADE ON UPDATE CASCADE;
