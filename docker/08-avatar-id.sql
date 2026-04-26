-- Migration: add avatar_id to profiles
-- Stores the identifier of the selected preset avatar (e.g. "professional-electrician-01").
-- The frontend resolves this id to the actual image path via PRESET_AVATARS.
-- avatar_url is kept as a legacy fallback (populated by Clerk during provisioning).

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_id TEXT DEFAULT NULL;

-- Update the view to include the new column
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
  -- profile fields (prefixed to avoid collision in joins)
  pr.id          AS pr_id,
  pr.clerk_id    AS pr_clerk_id,
  pr.full_name   AS pr_full_name,
  pr.avatar_url  AS pr_avatar_url,
  pr.avatar_id   AS pr_avatar_id,
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
