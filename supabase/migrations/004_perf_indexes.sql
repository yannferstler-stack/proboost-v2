-- =========================================================
-- Migration 004 : Index de performance
-- À exécuter dans le SQL Editor du dashboard Supabase
-- =========================================================

-- Index sur user_id pour les requêtes dashboard (chargement des factures par utilisateur)
CREATE INDEX IF NOT EXISTS idx_factures_user_id
  ON factures(user_id);

-- Index composite user_id + created_at pour le tri par date
CREATE INDEX IF NOT EXISTS idx_factures_user_created
  ON factures(user_id, created_at DESC);
