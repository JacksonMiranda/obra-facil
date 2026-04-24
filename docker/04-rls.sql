-- ============================================================
-- Fase 4: Row-Level Security (RLS) — defense-in-depth
-- ============================================================
-- AVISO: O backend conecta via service-role / owner, portanto
-- o RLS em si não bloqueia queries do backend (o owner bypassa
-- as políticas). Este script é defesa em profundidade para
-- conexões diretas ao banco (ex: ferramentas BI, supabase-js,
-- acesso acidental com credentials de usuário).
--
-- Para ambientes Docker local, aplique manualmente:
--   psql -h localhost -p 5433 -U postgres -d obrafacil -f docker/04-rls.sql
-- ============================================================

-- Tabela: visits
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY visits_select_owner ON visits
  FOR SELECT
  USING (
    client_id::text = current_setting('app.profile_id', true)
    OR EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.id = visits.professional_id
        AND p.profile_id::text = current_setting('app.profile_id', true)
    )
  );

-- Tabela: works
ALTER TABLE works ENABLE ROW LEVEL SECURITY;

CREATE POLICY works_select_owner ON works
  FOR SELECT
  USING (
    client_id::text = current_setting('app.profile_id', true)
    OR EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.id = works.professional_id
        AND p.profile_id::text = current_setting('app.profile_id', true)
    )
  );

-- Tabela: material_lists
ALTER TABLE material_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY material_lists_select_owner ON material_lists
  FOR SELECT
  USING (
    professional_id::text = current_setting('app.profile_id', true)
    OR EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = material_lists.conversation_id
        AND c.client_id::text = current_setting('app.profile_id', true)
    )
  );

-- Tabela: orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY orders_select_owner ON orders
  FOR SELECT
  USING (
    client_id::text = current_setting('app.profile_id', true)
    OR EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.id = orders.professional_id
        AND p.profile_id::text = current_setting('app.profile_id', true)
    )
  );

-- Tabela: conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY conversations_select_participant ON conversations
  FOR SELECT
  USING (
    client_id::text = current_setting('app.profile_id', true)
    OR professional_id::text = current_setting('app.profile_id', true)
  );
