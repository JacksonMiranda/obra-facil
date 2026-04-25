-- ============================================================
-- Migration 004: Alinhar visit_status com contrato da aplicação
--                e criar vínculo explícito entre works e visits
-- ============================================================

-- 1. Adicionar valores faltantes ao enum visit_status
--    (ADD VALUE é idempotente em Postgres 14+ com IF NOT EXISTS)
ALTER TYPE visit_status ADD VALUE IF NOT EXISTS 'pending'   BEFORE 'confirmed';
ALTER TYPE visit_status ADD VALUE IF NOT EXISTS 'rejected'  AFTER  'cancelled';

-- 2. Alterar default para pending (correto para novas visitas)
ALTER TABLE visits
  ALTER COLUMN status SET DEFAULT 'pending';

-- 3. Adicionar coluna rejection_reason se ainda não existir
ALTER TABLE visits
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 4. Corrigir índice de double-booking para excluir também rejected
DROP INDEX IF EXISTS idx_visits_no_double_booking;
CREATE UNIQUE INDEX idx_visits_no_double_booking
  ON visits (professional_id, scheduled_at)
  WHERE status NOT IN ('cancelled', 'rejected');

-- 5. Adicionar visit_id em works (vínculo opcional com a visita de origem)
ALTER TABLE works
  ADD COLUMN IF NOT EXISTS visit_id UUID REFERENCES visits(id) ON DELETE SET NULL;

-- 6. Índice único parcial: cada visita gera no máximo uma obra
CREATE UNIQUE INDEX IF NOT EXISTS works_visit_id_unique
  ON works (visit_id)
  WHERE visit_id IS NOT NULL;

-- 7. Índice auxiliar de lookup por visit_id
CREATE INDEX IF NOT EXISTS idx_works_visit_id
  ON works (visit_id);
