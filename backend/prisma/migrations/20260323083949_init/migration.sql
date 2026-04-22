-- ═══════════════════════════════════════════════════════════════
--  MIGRATION v3 → v4  —  Espace Vert
--  Exécuter avec : mysql -u root -p espace_vert < migration_v4.sql
--  OU dans MySQL Workbench/phpMyAdmin
-- ═══════════════════════════════════════════════════════════════

-- 1. Ajouter id_activite sur produits (lien direct, nullable)
ALTER TABLE produits
  ADD COLUMN id_activite INT NULL AFTER id_marque,
  ADD INDEX idx_produits_id_activite (id_activite),
  ADD CONSTRAINT fk_produits_activite
    FOREIGN KEY (id_activite) REFERENCES activites(id_activite)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- 2. Ajouter region sur visiteurs
ALTER TABLE visiteurs
  ADD COLUMN region VARCHAR(120) NULL AFTER pays;

-- 3. Créer la table search_queries
CREATE TABLE IF NOT EXISTS search_queries (
  id_search   INT          NOT NULL AUTO_INCREMENT,
  id_visiteur INT          NOT NULL,
  query       VARCHAR(500) NOT NULL,
  nb_results  INT          NOT NULL DEFAULT 0,
  searched_at DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id_search),
  INDEX idx_sq_visiteur   (id_visiteur),
  INDEX idx_sq_searched   (searched_at),
  CONSTRAINT fk_sq_visiteur
    FOREIGN KEY (id_visiteur) REFERENCES visiteurs(id_visiteur)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Ajouter nb_consultations sur faqs
ALTER TABLE faqs
  ADD COLUMN nb_consultations INT NOT NULL DEFAULT 0 AFTER active;

-- 5. Ajouter index date_action sur audit_logs (si absent)
ALTER TABLE audit_logs
  ADD INDEX IF NOT EXISTS idx_audit_date (date_action);

-- 6. Ajouter index visited_at sur visites_pages (si absent)
ALTER TABLE visites_pages
  ADD INDEX IF NOT EXISTS idx_vp_visited (visited_at);

-- ─── Mise à jour id_activite existants ──────────────────────────
-- Remplir id_activite des produits depuis leur catégorie
-- (propager la liaison catégorie → activité → produit)
UPDATE produits p
  JOIN categories c ON c.id_categorie = p.id_categorie
  SET p.id_activite = c.id_activite
  WHERE c.id_activite IS NOT NULL AND p.id_activite IS NULL;

SELECT CONCAT('✅ ', COUNT(*), ' produits mis à jour avec id_activite') AS resultat
  FROM produits WHERE id_activite IS NOT NULL;
