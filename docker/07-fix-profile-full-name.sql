-- Migration 07: Fix profiles.full_name for real accounts
--
-- Root cause: clerk-auth.guard.ts ON CONFLICT never updated full_name after first login.
-- Accounts created when Clerk JWT lacked name claims got saved as 'Usuário'.
-- This migration corrects existing records so professionals become searchable.
--
-- Run directly on Supabase Dashboard → SQL Editor.
-- The guard fix (ON CONFLICT DO UPDATE) handles all future logins automatically.
--
-- STEP 1: Inspect which profiles are affected
-- SELECT p.id, p.clerk_id, p.full_name, pro.specialty, pro.visibility_status
-- FROM profiles p
-- LEFT JOIN professionals pro ON pro.profile_id = p.id
-- WHERE p.full_name = 'Usuário' OR p.full_name = '';

-- STEP 2: Correct each affected profile manually (fill in real name from Clerk dashboard)
-- Example — replace 'Jackson Miranda' and the clerk_id with the real values:
UPDATE profiles
SET full_name = 'Jackson Miranda', updated_at = now()
WHERE full_name = 'Usuário'
  AND clerk_id = (
    SELECT clerk_id FROM profiles
    WHERE full_name = 'Usuário'
      AND id IN (SELECT profile_id FROM professionals WHERE visibility_status = 'active')
    LIMIT 1
  );

-- After running, recompute visibility for affected professionals:
UPDATE professionals p
SET
  visibility_status = 'active',
  published_at = COALESCE(p.published_at, now())
FROM profiles pr
WHERE pr.id = p.profile_id
  AND pr.full_name IS NOT NULL
  AND trim(pr.full_name) <> ''
  AND p.specialty IS NOT NULL AND trim(p.specialty) <> ''
  AND p.bio IS NOT NULL AND length(trim(p.bio)) >= 10
  AND p.visibility_status IN ('draft', 'inactive')
  AND EXISTS (
    SELECT 1 FROM account_roles ar
    WHERE ar.profile_id = p.profile_id
      AND ar.role = 'professional'
      AND ar.is_active = true
  );
