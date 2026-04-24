-- ============================================================
-- Supabase Migration 003: Professional Visibility Status
-- (mirrors docker/05-professional-visibility.sql)
-- ============================================================

ALTER TABLE professionals
  ADD COLUMN IF NOT EXISTS visibility_status TEXT NOT NULL DEFAULT 'draft'
    CONSTRAINT professionals_visibility_status_check
    CHECK (visibility_status IN ('draft', 'active', 'inactive')),
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

UPDATE professionals p
SET
  visibility_status = 'active',
  published_at = now()
FROM account_roles ar
INNER JOIN profiles pr ON pr.id = ar.profile_id
WHERE ar.profile_id = p.profile_id
  AND ar.role = 'professional'
  AND ar.is_active = true
  AND p.specialty IS NOT NULL AND trim(p.specialty) <> ''
  AND p.bio IS NOT NULL AND length(trim(p.bio)) >= 10
  AND pr.full_name IS NOT NULL AND trim(pr.full_name) <> '';

CREATE OR REPLACE VIEW professionals_public AS
SELECT
  p.id,
  p.profile_id,
  COALESCE(p.display_name, pr.full_name) AS display_name,
  p.specialty,
  p.bio,
  p.city,
  p.rating_avg,
  p.jobs_completed,
  p.is_verified,
  p.latitude,
  p.longitude,
  p.visibility_status,
  p.published_at,
  p.created_at,
  pr.id          AS pr_id,
  pr.clerk_id    AS pr_clerk_id,
  pr.full_name   AS pr_full_name,
  pr.avatar_url  AS pr_avatar_url,
  pr.phone       AS pr_phone,
  pr.role        AS pr_role,
  pr.created_at  AS pr_created_at,
  pr.updated_at  AS pr_updated_at
FROM professionals p
INNER JOIN profiles pr            ON pr.id = p.profile_id
INNER JOIN account_roles ar       ON ar.profile_id = p.profile_id
                                  AND ar.role = 'professional'
                                  AND ar.is_active = true
WHERE p.visibility_status = 'active'
  AND trim(p.specialty) <> ''
  AND p.bio IS NOT NULL
  AND length(trim(p.bio)) >= 10
  AND pr.full_name IS NOT NULL
  AND trim(pr.full_name) <> '';

CREATE INDEX IF NOT EXISTS idx_professionals_visibility_status
  ON professionals (visibility_status);

CREATE INDEX IF NOT EXISTS idx_account_roles_professional_active
  ON account_roles (profile_id, role, is_active)
  WHERE role = 'professional';
