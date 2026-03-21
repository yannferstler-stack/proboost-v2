-- Migration 002 : Liens de paiement par facture
-- Ajoute les colonnes nécessaires pour générer et stocker
-- des liens de paiement Stripe par facture client

-- Colonnes sur factures : URL du lien de paiement Stripe
ALTER TABLE factures
  ADD COLUMN IF NOT EXISTS payment_session_id text,
  ADD COLUMN IF NOT EXISTS payment_url        text;

-- Colonne sur profiles : compte Stripe Connect de l'utilisateur ProBoost
-- (pour que les paiements des clients arrivent directement sur leur compte)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS stripe_connect_account_id text;

-- Index pour les lookups webhook (checkout.session.completed)
CREATE INDEX IF NOT EXISTS idx_factures_payment_session_id
  ON factures (payment_session_id)
  WHERE payment_session_id IS NOT NULL;
