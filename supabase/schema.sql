-- ════════════════════════════════════════════════════════════════════
--  Puerto Viejo Properties — Supabase schema
--  Prefix: sc_   (so it never collides with your other "multiwebs" sites)
--
--  HOW TO USE:
--  1) Open your Supabase project → SQL Editor → New query
--  2) Paste this whole file and click "Run"
--  3) Create the Storage bucket "sc-media" (see bottom of this file)
--  4) Create your admin user in Authentication → Users → Add user
-- ════════════════════════════════════════════════════════════════════

-- ───────────── Properties ─────────────
create table if not exists public.sc_properties (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_es text not null default '',
  title_en text not null default '',
  description_es text not null default '',
  description_en text not null default '',
  type text not null default 'house',          -- house | villa | apartment | lot | commercial
  status text not null default 'available',     -- available | reserved | sold
  price numeric not null default 0,
  zone text not null default '',
  has_dwelling boolean not null default true,
  land_size numeric not null default 0,
  construction_size numeric not null default 0,
  bedrooms int not null default 0,
  bathrooms int not null default 0,
  amenities text[] not null default '{}',
  images text[] not null default '{}',
  video_url text,
  lat double precision,
  lng double precision,
  featured boolean not null default false,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- For existing installs: add the manual-order column if it isn't there yet.
alter table public.sc_properties add column if not exists position int not null default 0;
-- Which agent sells the property (Agent.id from settings)
alter table public.sc_properties add column if not exists agent_id text;

-- ───────────── Admin-only property notes (private, never public) ─────────────
create table if not exists public.sc_property_notes (
  property_id uuid primary key references public.sc_properties(id) on delete cascade,
  notes jsonb not null default '[]',
  updated_at timestamptz not null default now()
);
alter table public.sc_property_notes enable row level security;
drop policy if exists "sc_property_notes admin all" on public.sc_property_notes;
create policy "sc_property_notes admin all"
  on public.sc_property_notes for all to authenticated
  using (true) with check (true);
-- (No anon policy on purpose: the public/anon key cannot read these notes.)

-- ───────────── Change history / activity log (admin only) ─────────────
create table if not exists public.sc_activity_log (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity_title text,
  detail text,
  actor_email text,
  created_at timestamptz not null default now()
);
create index if not exists sc_activity_created_idx on public.sc_activity_log (created_at desc);
alter table public.sc_activity_log enable row level security;
drop policy if exists "sc_activity admin read" on public.sc_activity_log;
create policy "sc_activity admin read"
  on public.sc_activity_log for select to authenticated using (true);
drop policy if exists "sc_activity admin insert" on public.sc_activity_log;
create policy "sc_activity admin insert"
  on public.sc_activity_log for insert to authenticated with check (true);

create index if not exists sc_properties_created_idx on public.sc_properties (created_at desc);
create index if not exists sc_properties_slug_idx on public.sc_properties (slug);

-- ───────────── Leads (contact messages) ─────────────
create table if not exists public.sc_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  property_id uuid,
  property_title text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists sc_leads_created_idx on public.sc_leads (created_at desc);

-- ───────────── Site settings (editable from the admin) ─────────────
create table if not exists public.sc_settings (
  id text primary key default 'main',
  data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════════
--  Row Level Security
-- ════════════════════════════════════════════════════════════════════
alter table public.sc_properties enable row level security;
alter table public.sc_leads enable row level security;
alter table public.sc_settings enable row level security;

drop policy if exists "sc_settings public read" on public.sc_settings;
create policy "sc_settings public read"
  on public.sc_settings for select using (true);

drop policy if exists "sc_settings admin write" on public.sc_settings;
create policy "sc_settings admin write"
  on public.sc_settings for all to authenticated
  using (true) with check (true);

-- Properties: anyone can READ; only logged-in admin can write.
drop policy if exists "sc_properties public read" on public.sc_properties;
create policy "sc_properties public read"
  on public.sc_properties for select
  using (true);

drop policy if exists "sc_properties admin write" on public.sc_properties;
create policy "sc_properties admin write"
  on public.sc_properties for all
  to authenticated
  using (true)
  with check (true);

-- Leads: anyone can INSERT (contact form); only admin can read/update/delete.
drop policy if exists "sc_leads public insert" on public.sc_leads;
create policy "sc_leads public insert"
  on public.sc_leads for insert
  with check (true);

drop policy if exists "sc_leads admin read" on public.sc_leads;
create policy "sc_leads admin read"
  on public.sc_leads for select
  to authenticated
  using (true);

drop policy if exists "sc_leads admin update" on public.sc_leads;
create policy "sc_leads admin update"
  on public.sc_leads for update
  to authenticated
  using (true) with check (true);

drop policy if exists "sc_leads admin delete" on public.sc_leads;
create policy "sc_leads admin delete"
  on public.sc_leads for delete
  to authenticated
  using (true);

-- ════════════════════════════════════════════════════════════════════
--  STORAGE  (run AFTER creating the bucket, or use the dashboard)
--  Create a PUBLIC bucket named:  sc-media
--  Storage → New bucket → name "sc-media" → toggle "Public bucket" ON
--  Then run the policies below so the admin can upload:
-- ════════════════════════════════════════════════════════════════════
-- Public read of files:
drop policy if exists "sc-media public read" on storage.objects;
create policy "sc-media public read"
  on storage.objects for select
  using (bucket_id = 'sc-media');

-- Authenticated admin can upload / update / delete files:
drop policy if exists "sc-media admin write" on storage.objects;
create policy "sc-media admin write"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'sc-media')
  with check (bucket_id = 'sc-media');

-- ────────────────────────────────────────────────────────────────────
--  PRIVATE bucket for admin files (plans, PDFs). NOT public.
-- ────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('sc-private', 'sc-private', false)
on conflict (id) do nothing;

-- Only authenticated admins can read/write private files (via signed URLs):
drop policy if exists "sc-private admin all" on storage.objects;
create policy "sc-private admin all"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'sc-private')
  with check (bucket_id = 'sc-private');
