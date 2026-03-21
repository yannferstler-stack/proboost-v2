-- =========================================================
-- Migration 001 : Colonnes Stripe + Table relances + Index
-- À exécuter dans le SQL Editor du dashboard Supabase
-- =========================================================

-- 1. Nouveaux champs sur la table profiles (abonnement Stripe)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_period_end timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'active';
    -- Valeurs possibles : 'active' | 'past_due' | 'unpaid' | 'canceled'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_failed_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pending_plan text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pending_plan_effective_date timestamptz;

-- 2. Table relances (historique de chaque relance envoyée)
CREATE TABLE IF NOT EXISTS relances (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  facture_id      uuid REFERENCES factures(id) ON DELETE CASCADE NOT NULL,
  type            text DEFAULT 'email',     -- 'email' | 'sms' | 'email+sms'
  numero_relance  integer,                  -- numéro de relance dans la séquence (1, 2, 3...)
  statut          text DEFAULT 'envoyé',    -- 'envoyé' | 'erreur'
  envoye_le       timestamptz DEFAULT now(),
  created_at      timestamptz DEFAULT now()
);

-- 3. Sécurité Row Level Security sur relances
ALTER TABLE relances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "relances_select" ON relances;
CREATE POLICY "relances_select" ON relances
  FOR SELECT
  USING (
    facture_id IN (
      SELECT id FROM factures WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "relances_insert" ON relances;
CREATE POLICY "relances_insert" ON relances
  FOR INSERT
  WITH CHECK (
    facture_id IN (
      SELECT id FROM factures WHERE user_id = auth.uid()
    )
  );

-- Politique pour le service role (cron job)
DROP POLICY IF EXISTS "relances_service_role_all" ON relances;
CREATE POLICY "relances_service_role_all" ON relances
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. Index pour améliorer les performances du cron job
CREATE INDEX IF NOT EXISTS idx_relances_facture_id
  ON relances(facture_id);

CREATE INDEX IF NOT EXISTS idx_relances_envoye_le
  ON relances(envoye_le);

CREATE INDEX IF NOT EXISTS idx_factures_cron
  ON factures(next_relance_date, sequence_active)
  WHERE sequence_active = true;

-- 5. Index payment status pour le middleware
CREATE INDEX IF NOT EXISTS idx_profiles_payment_status
  ON profiles(payment_status)
  WHERE payment_status = 'past_due';
