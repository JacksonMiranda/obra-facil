-- ============================================================
-- Supabase Migration 005: Fix profiles.full_name placeholder
--
-- When the ClerkAuthGuard first provisions a profile and
-- cannot extract a real name from the JWT, it inserts the
-- placeholder 'Usuário'. This blocks search results because
-- the ILIKE '%<real_name>%' query matches against 'Usuário'.
--
-- This migration:
--   1. Identifies profiles where full_name = 'Usuário' and
--      a corresponding professionals record exists with
--      visibility_status = 'active' (or 'draft').
--   2. Sets full_name to NULL for those rows so that on the
--      user's next login the ClerkAuthGuard UPSERT will fill
--      in the real name from the Clerk JWT (it updates when
--      full_name is '' OR 'Usuário').
--
-- The guard UPSERT condition (added in commit 4fba7b5):
--   ON CONFLICT (clerk_id) DO UPDATE SET
--     full_name = CASE
--       WHEN profiles.full_name = 'Usuário' OR profiles.full_name = ''
--         THEN EXCLUDED.full_name
--       ELSE profiles.full_name
--     END
--
-- NOTE: Running this migration on Supabase is safe — rows
-- where full_name is already a real name are NOT touched
-- because of the WHERE clause below.
-- ============================================================

-- Step 1: Report affected rows (for auditing purposes)
DO $$
DECLARE
  affected_count integer;
BEGIN
  SELECT count(*) INTO affected_count
  FROM profiles
  WHERE full_name = 'Usuário' OR full_name = '';

  RAISE NOTICE 'Migration 005: % profile(s) with placeholder full_name found.', affected_count;
END $$;

-- Step 2: Reset placeholder names to empty string so the
-- guard UPSERT will overwrite with the real name on next login.
UPDATE profiles
SET
  full_name  = '',
  updated_at = now()
WHERE full_name = 'Usuário';

-- Step 3: For any professional whose visibility was derived
-- from a now-fixed profile, recompute visibility.
-- Re-evaluate: if full_name is now '', computeCompleteness
-- will return { complete: false, missing: ['full_name'] }
-- and deriveVisibilityStatus will return 'draft'.
-- This is intentional — the profile becomes 'draft' until
-- the user logs in again and the guard fills in the real name.
UPDATE professionals
SET
  visibility_status = 'draft'
WHERE profile_id IN (
  SELECT id FROM profiles WHERE full_name = ''
)
AND visibility_status = 'active';

-- Verification query (informational — no changes):
DO $$
DECLARE
  still_broken integer;
BEGIN
  SELECT count(*) INTO still_broken
  FROM profiles
  WHERE full_name = 'Usuário';

  IF still_broken > 0 THEN
    RAISE WARNING 'Migration 005: % profile(s) still have full_name = Usuário after fix.', still_broken;
  ELSE
    RAISE NOTICE 'Migration 005: All placeholder full_names have been cleared. Users will get real names on next login.';
  END IF;
END $$;
