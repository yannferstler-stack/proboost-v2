-- Migration 003 : Templates d'email personnalisables par relance
-- Permet à chaque utilisateur de personnaliser le corps de ses 3 relances
-- Variables disponibles : {client}, {montant}, {facture}, {echeance}, {entreprise}

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS template_relance_1 TEXT,
  ADD COLUMN IF NOT EXISTS template_relance_2 TEXT,
  ADD COLUMN IF NOT EXISTS template_relance_3 TEXT;
