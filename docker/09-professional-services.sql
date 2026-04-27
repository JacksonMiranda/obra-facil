-- ============================================================
-- Migration 09: Professional Services (multi-specialty)
--
-- Introduces the professional_services join table so a single
-- professional profile can offer more than one service.
-- Preserves professionals.specialty as a legacy snapshot only.
-- Adds nullable service_id to visits for normalized bookings.
-- Rewrites professionals_public view to join on active services.
-- ============================================================

-- 1. Create professional_services join table ──────────────────

CREATE TABLE IF NOT EXISTS professional_services (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id   uuid NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  service_id        uuid NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  visibility_status TEXT NOT NULL DEFAULT 'active'
    CONSTRAINT professional_services_visibility_check
    CHECK (visibility_status IN ('active', 'inactive')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT professional_services_unique UNIQUE (professional_id, service_id)
);

CREATE INDEX IF NOT EXISTS idx_professional_services_professional
  ON professional_services (professional_id);

CREATE INDEX IF NOT EXISTS idx_professional_services_service
  ON professional_services (service_id);

CREATE INDEX IF NOT EXISTS idx_professional_services_active
  ON professional_services (professional_id, service_id)
  WHERE visibility_status = 'active';

-- 2. Backfill from professionals.specialty ───────────────────
-- Best-effort: match trimmed/lowercased specialty against services.name.
-- Unmatched rows remain without a service link (visible via the
-- pre-check query below) and must be mapped manually.

INSERT INTO professional_services (professional_id, service_id, visibility_status)
SELECT
  p.id,
  s.id,
  'active'
FROM professionals p
JOIN services s
  ON lower(trim(s.name)) = lower(trim(p.specialty))
WHERE p.specialty IS NOT NULL
  AND trim(p.specialty) <> ''
ON CONFLICT (professional_id, service_id)
  DO UPDATE SET visibility_status = 'active', updated_at = now();

-- Fuzzy backfill: map common specialty text patterns to services via ILIKE.
-- Mirrors the normalizeAndMapTerm() logic in the backend repository.
-- Handles real production professionals whose specialty doesn't exactly match a service name.
CREATE EXTENSION IF NOT EXISTS unaccent;

INSERT INTO professional_services (professional_id, service_id, visibility_status)
SELECT DISTINCT ON (p.id, s.id)
  p.id,
  s.id,
  'active'
FROM professionals p
CROSS JOIN services s
WHERE p.specialty IS NOT NULL
  AND trim(p.specialty) <> ''
  AND (
    (s.name = 'Reparos elétricos'       AND lower(unaccent(p.specialty)) ILIKE '%eletric%')
    OR (s.name = 'Instalações Hidráulicas' AND (lower(unaccent(p.specialty)) ILIKE '%hidraul%' OR lower(unaccent(p.specialty)) ILIKE '%encanad%'))
    OR (s.name = 'Pinturas'               AND (lower(unaccent(p.specialty)) ILIKE '%pintur%'  OR lower(unaccent(p.specialty)) ILIKE '%pintor%'))
    OR (s.name = 'Diaristas'              AND (lower(unaccent(p.specialty)) ILIKE '%diarista%' OR lower(unaccent(p.specialty)) ILIKE '%limpez%'))
    OR (s.name = 'Pedreiro'               AND (lower(unaccent(p.specialty)) ILIKE '%pedreir%'  OR lower(unaccent(p.specialty)) ILIKE '%reform%'))
    OR (s.name = 'Marceneiro'             AND (lower(unaccent(p.specialty)) ILIKE '%marceneir%' OR lower(unaccent(p.specialty)) ILIKE '%moveis%' OR lower(unaccent(p.specialty)) ILIKE '%móveis%'))
  )
ON CONFLICT (professional_id, service_id)
  DO UPDATE SET visibility_status = 'active', updated_at = now();

-- Seed-specific backfill: only runs when seed UUIDs are present (local dev).
-- Production professionals are handled by the fuzzy ILIKE block above.
INSERT INTO professional_services (professional_id, service_id, visibility_status)
SELECT v.professional_id, v.service_id, v.visibility_status
FROM (VALUES
  -- Ricardo Silva (Eletricista Residencial) → Reparos elétricos
  ('10000000-0000-0000-0000-000000000001'::uuid, '20000000-0000-0000-0000-000000000001'::uuid, 'active'),
  -- José da Silva (Encanador Hidráulico) → Instalações Hidráulicas
  ('10000000-0000-0000-0000-000000000002'::uuid, '20000000-0000-0000-0000-000000000002'::uuid, 'active'),
  -- Ana Rodrigues (Pintora Residencial) → Pinturas
  ('10000000-0000-0000-0000-000000000003'::uuid, '20000000-0000-0000-0000-000000000003'::uuid, 'active'),
  -- Carlos Alberto as professional (Pedreiro e Reformas) → Pedreiro
  ('10000000-0000-0000-0000-000000000004'::uuid, '20000000-0000-0000-0000-000000000005'::uuid, 'active')
) AS v(professional_id, service_id, visibility_status)
WHERE EXISTS (SELECT 1 FROM professionals WHERE id = v.professional_id)
  AND EXISTS (SELECT 1 FROM services WHERE id = v.service_id)
ON CONFLICT (professional_id, service_id)
  DO UPDATE SET visibility_status = 'active', updated_at = now();

-- Pre-check: unmatched specialties (no row inserted)
-- SELECT p.id, p.specialty FROM professionals p
-- WHERE NOT EXISTS (
--   SELECT 1 FROM professional_services ps WHERE ps.professional_id = p.id
-- );

-- 3. Add service_id to visits (nullable, backward-compatible) ─

ALTER TABLE visits
  ADD COLUMN IF NOT EXISTS service_id uuid REFERENCES services(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_visits_service_id
  ON visits (service_id) WHERE service_id IS NOT NULL;

-- 4. Make professionals.specialty nullable ───────────────────
-- specialty is now a derived snapshot; NOT NULL constraint removed.

ALTER TABLE professionals
  ALTER COLUMN specialty DROP NOT NULL;

-- 5. Rewrite professionals_public view ───────────────────────
-- One row per professional-service pair for active professionals.
-- Aggregation (per professional) is done at the repository layer.

DROP VIEW IF EXISTS professionals_public;

CREATE VIEW professionals_public AS
SELECT
  p.id,
  p.profile_id,
  COALESCE(p.display_name, pr.full_name)  AS display_name,
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
  -- active service on this row
  ps.service_id,
  s.name       AS service_name,
  s.icon_name  AS service_icon,
  -- profile fields (prefixed to avoid collision in joins)
  pr.id          AS pr_id,
  pr.clerk_id    AS pr_clerk_id,
  pr.full_name   AS pr_full_name,
  pr.avatar_url  AS pr_avatar_url,
  pr.phone       AS pr_phone,
  pr.role        AS pr_role,
  pr.created_at  AS pr_created_at,
  pr.updated_at  AS pr_updated_at
FROM professionals p
INNER JOIN profiles pr
        ON pr.id = p.profile_id
INNER JOIN account_roles ar
        ON ar.profile_id = p.profile_id
       AND ar.role = 'professional'
       AND ar.is_active = true
INNER JOIN professional_services ps
        ON ps.professional_id = p.id
       AND ps.visibility_status = 'active'
INNER JOIN services s
        ON s.id = ps.service_id
WHERE p.visibility_status = 'active'
  AND p.bio IS NOT NULL
  AND length(trim(p.bio)) >= 10
  AND pr.full_name IS NOT NULL
  AND trim(pr.full_name) <> '';
