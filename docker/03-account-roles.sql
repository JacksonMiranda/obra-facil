-- ============================================================
-- Fase 3: Multi-profile architecture
-- Adds account_roles table to support a single Clerk account
-- operating in multiple roles (client AND/OR professional).
-- ============================================================

-- Backfill-safe: idempotent via IF NOT EXISTS

CREATE TABLE IF NOT EXISTS account_roles (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role         user_role NOT NULL,
  is_active    boolean NOT NULL DEFAULT true,
  is_primary   boolean NOT NULL DEFAULT false,
  activated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_account_roles_profile_role UNIQUE (profile_id, role)
);

CREATE INDEX IF NOT EXISTS idx_account_roles_profile ON account_roles(profile_id);

-- Backfill: every existing profile gets an account_role entry from their current role.
-- ON CONFLICT makes this safe to run multiple times (idempotent).
INSERT INTO account_roles (profile_id, role, is_primary, is_active)
SELECT id, role, true, true
FROM profiles
ON CONFLICT (profile_id, role) DO NOTHING;
