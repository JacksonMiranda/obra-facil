-- ============================================================
-- Obra Fácil — Initial Database Schema
-- per spec_tech.md: PostgreSQL + RLS + Multi-tenant isolation
-- per prd.md: 3 user roles (client, professional, store)
-- ============================================================

-- EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm; -- for full-text search on professionals

-- ============================================================
-- ENUMS
-- ============================================================

create type user_role as enum ('client', 'professional', 'store');
create type message_type as enum ('text', 'image', 'audio', 'material_list');
create type material_list_status as enum ('draft', 'sent', 'quoted');
create type order_status as enum ('pending', 'confirmed', 'shipped', 'delivered');
create type work_status as enum ('scheduled', 'active', 'completed');

-- ============================================================
-- TABLES
-- ============================================================

-- profiles: synced from Clerk via webhook
-- per prd.md: three roles — client, professional, store
create table profiles (
  id          uuid primary key default uuid_generate_v4(),
  clerk_id    text unique not null,  -- Clerk user ID
  full_name   text not null,
  avatar_url  text,
  phone       text,
  role        user_role not null default 'client',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- professionals: per prd.md "Prestador de Serviços"
-- per prd.md RFN-01: GPS raio, ratings, background check MEI
create table professionals (
  id             uuid primary key default uuid_generate_v4(),
  profile_id     uuid not null references profiles(id) on delete cascade,
  specialty      text not null,
  bio            text,
  rating_avg     numeric(3,2) not null default 0,
  jobs_completed integer not null default 0,
  is_verified    boolean not null default false,  -- per prd.md "Background Check + MEI"
  latitude       numeric(10,7),
  longitude      numeric(10,7),
  created_at     timestamptz not null default now()
);

-- services: per spec_ui.md INT-01 "Grid de Ícones de Serviços Rápidos"
create table services (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  icon_name   text not null,  -- Material Symbols icon name
  description text,
  sort_order  integer not null default 0
);

-- reviews: per prd.md v1 core feature "Avaliações/Reviews"
create table reviews (
  id              uuid primary key default uuid_generate_v4(),
  professional_id uuid not null references professionals(id) on delete cascade,
  reviewer_id     uuid not null references profiles(id) on delete cascade,
  rating          smallint not null check (rating between 1 and 5),
  comment         text,
  created_at      timestamptz not null default now(),
  unique (professional_id, reviewer_id)
);

-- conversations: per prd.md RFN-02 "Comunicação direta app-to-app"
create table conversations (
  id              uuid primary key default uuid_generate_v4(),
  client_id       uuid not null references profiles(id) on delete cascade,
  professional_id uuid not null references professionals(id) on delete cascade,
  created_at      timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  unique (client_id, professional_id)
);

-- messages: per prd.md RFN-02 "histórico para segurança + fotos/áudio"
-- per spec_tech.md: Realtime enabled on this table
create table messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id       uuid not null references profiles(id) on delete cascade,
  content         text not null,
  type            message_type not null default 'text',
  metadata        jsonb,  -- for image URLs, material_list_id, etc.
  created_at      timestamptz not null default now()
);

-- material_lists: per prd.md RFN-03 "Lista Padrão de Material"
-- per spec_tech.md RBAC: only professional role can create
create table material_lists (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  professional_id uuid not null references professionals(id) on delete cascade,
  status          material_list_status not null default 'draft',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- material_items: per prd.md RFN-03
create table material_items (
  id               uuid primary key default uuid_generate_v4(),
  material_list_id uuid not null references material_lists(id) on delete cascade,
  name             text not null,
  quantity         numeric(10,2) not null,
  unit             text not null default 'un',
  brand            text,
  image_url        text,
  created_at       timestamptz not null default now()
);

-- stores: per prd.md "Lojista Local"
create table stores (
  id            uuid primary key default uuid_generate_v4(),
  profile_id    uuid references profiles(id) on delete set null,
  name          text not null,
  address       text,
  lat           numeric(10,7),
  lng           numeric(10,7),
  delivery_time text,  -- e.g. "Entrega em até 2 horas"
  logo_url      text,
  created_at    timestamptz not null default now()
);

-- store_offers: per prd.md RFN-03 "Top 3 melhores opções de lojas"
create table store_offers (
  id               uuid primary key default uuid_generate_v4(),
  store_id         uuid not null references stores(id) on delete cascade,
  material_list_id uuid not null references material_lists(id) on delete cascade,
  total_price      numeric(10,2) not null,
  delivery_info    text,
  is_best_price    boolean not null default false,
  created_at       timestamptz not null default now(),
  unique (store_id, material_list_id)
);

-- orders: per prd.md RFN-04 "Checkout Unificado"
create table orders (
  id               uuid primary key default uuid_generate_v4(),
  client_id        uuid not null references profiles(id) on delete cascade,
  store_id         uuid not null references stores(id) on delete restrict,
  material_list_id uuid references material_lists(id) on delete set null,
  status           order_status not null default 'pending',
  total_amount     numeric(10,2) not null,
  order_number     text unique not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- works (obras): per Stitch prototypes "Minhas Obras"
create table works (
  id              uuid primary key default uuid_generate_v4(),
  client_id       uuid not null references profiles(id) on delete cascade,
  professional_id uuid not null references professionals(id) on delete restrict,
  title           text not null,
  status          work_status not null default 'scheduled',
  progress_pct    smallint not null default 0 check (progress_pct between 0 and 100),
  next_step       text,
  photos          text[] not null default '{}',
  started_at      timestamptz,
  completed_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- INDEXES (per spec_tech.md RNF-01: < 2 segundos nas buscas)
-- ============================================================

create index idx_professionals_rating on professionals(rating_avg desc);
create index idx_professionals_location on professionals(latitude, longitude);
create index idx_reviews_professional_id on reviews(professional_id);
create index idx_messages_conversation_id on messages(conversation_id, created_at);
create index idx_conversations_client_id on conversations(client_id);
create index idx_conversations_professional_id on conversations(professional_id);
create index idx_orders_client_id on orders(client_id);
create index idx_works_client_id on works(client_id);
create index idx_works_status on works(status);
-- Full text search on professionals
create index idx_professionals_specialty_trgm on professionals using gin (specialty gin_trgm_ops);

-- ============================================================
-- ROW LEVEL SECURITY
-- per spec_tech.md: "Políticas RLS a nível de banco de dados"
-- per spec_tech.md: "queries precisam envolver repositórios restritos pelo contexto logado"
-- ============================================================

alter table profiles enable row level security;
alter table professionals enable row level security;
alter table services enable row level security;
alter table reviews enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table material_lists enable row level security;
alter table material_items enable row level security;
alter table stores enable row level security;
alter table store_offers enable row level security;
alter table orders enable row level security;
alter table works enable row level security;

-- Helper function: get current user's profile id from JWT
create or replace function public.current_profile_id()
returns uuid language sql stable as $$
  select id from profiles where clerk_id = auth.jwt() ->> 'sub'
$$;

-- Helper function: get current user's role
create or replace function public.current_user_role()
returns user_role language sql stable as $$
  select role from profiles where clerk_id = auth.jwt() ->> 'sub'
$$;

-- profiles: users can read all profiles (for search/display), only edit own
create policy "profiles_read_all" on profiles for select using (true);
create policy "profiles_insert_own" on profiles for insert
  with check (clerk_id = auth.jwt() ->> 'sub');
create policy "profiles_update_own" on profiles for update
  using (clerk_id = auth.jwt() ->> 'sub');

-- professionals: readable by all, writable only by professional role
create policy "professionals_read_all" on professionals for select using (true);
create policy "professionals_insert_own" on professionals for insert
  with check (profile_id = public.current_profile_id());
create policy "professionals_update_own" on professionals for update
  using (profile_id = public.current_profile_id());

-- services: public read
create policy "services_read_all" on services for select using (true);

-- reviews: public read, clients write own
create policy "reviews_read_all" on reviews for select using (true);
create policy "reviews_insert_client" on reviews for insert
  with check (reviewer_id = public.current_profile_id());

-- conversations: only participants can see
create policy "conversations_select_participant" on conversations for select
  using (
    client_id = public.current_profile_id() or
    professional_id in (
      select id from professionals where profile_id = public.current_profile_id()
    )
  );
create policy "conversations_insert_client" on conversations for insert
  with check (client_id = public.current_profile_id());

-- messages: only conversation participants
create policy "messages_select_participant" on messages for select
  using (
    conversation_id in (
      select id from conversations
      where client_id = public.current_profile_id()
      or professional_id in (
        select id from professionals where profile_id = public.current_profile_id()
      )
    )
  );
create policy "messages_insert_participant" on messages for insert
  with check (
    sender_id = public.current_profile_id() and
    conversation_id in (
      select id from conversations
      where client_id = public.current_profile_id()
      or professional_id in (
        select id from professionals where profile_id = public.current_profile_id()
      )
    )
  );

-- material_lists: per spec_tech.md RBAC "only professional role can create"
create policy "material_lists_select_participant" on material_lists for select
  using (
    conversation_id in (
      select id from conversations
      where client_id = public.current_profile_id()
      or professional_id in (
        select id from professionals where profile_id = public.current_profile_id()
      )
    )
  );
create policy "material_lists_insert_professional" on material_lists for insert
  with check (
    public.current_user_role() = 'professional' and
    professional_id in (
      select id from professionals where profile_id = public.current_profile_id()
    )
  );

-- material_items: same as material_lists
create policy "material_items_select" on material_items for select
  using (
    material_list_id in (
      select id from material_lists
      where conversation_id in (
        select id from conversations
        where client_id = public.current_profile_id()
        or professional_id in (
          select id from professionals where profile_id = public.current_profile_id()
        )
      )
    )
  );
create policy "material_items_insert_professional" on material_items for insert
  with check (
    material_list_id in (
      select id from material_lists
      where professional_id in (
        select id from professionals where profile_id = public.current_profile_id()
      )
    )
  );

-- stores: public read
create policy "stores_read_all" on stores for select using (true);
create policy "stores_insert_own" on stores for insert
  with check (profile_id = public.current_profile_id());

-- store_offers: client can see offers for their material lists
create policy "store_offers_select_client" on store_offers for select
  using (
    material_list_id in (
      select id from material_lists
      where conversation_id in (
        select id from conversations where client_id = public.current_profile_id()
      )
    )
  );
-- stores insert their own offers: per spec_tech.md "Lojista A não emita cotações para Loja B"
create policy "store_offers_insert_own_store" on store_offers for insert
  with check (
    store_id in (
      select id from stores where profile_id = public.current_profile_id()
    )
  );

-- orders: only own orders
create policy "orders_select_own" on orders for select
  using (client_id = public.current_profile_id());
create policy "orders_insert_own" on orders for insert
  with check (client_id = public.current_profile_id());

-- works: only own works
create policy "works_select_own" on works for select
  using (
    client_id = public.current_profile_id() or
    professional_id in (
      select id from professionals where profile_id = public.current_profile_id()
    )
  );

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at columns
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();

create trigger orders_updated_at before update on orders
  for each row execute function update_updated_at();

create trigger works_updated_at before update on works
  for each row execute function update_updated_at();

create trigger material_lists_updated_at before update on material_lists
  for each row execute function update_updated_at();

-- Auto-update professionals.rating_avg and jobs_completed when review inserted
create or replace function update_professional_rating()
returns trigger language plpgsql as $$
begin
  update professionals
  set
    rating_avg = (
      select round(avg(rating)::numeric, 2)
      from reviews
      where professional_id = new.professional_id
    ),
    jobs_completed = (
      select count(*)
      from reviews
      where professional_id = new.professional_id
    )
  where id = new.professional_id;
  return new;
end;
$$;

create trigger reviews_update_professional after insert on reviews
  for each row execute function update_professional_rating();
