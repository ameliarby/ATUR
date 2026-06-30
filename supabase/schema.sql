-- ============================================================================
-- ATUR — Skema Database Supabase (final, disesuaikan dengan struktur data app)
-- ----------------------------------------------------------------------------
-- Cara pakai:
--   1. Buka Supabase  →  SQL Editor  →  New query
--   2. Tempel SELURUH isi file ini  →  klik "Run"
--   3. Skema, indeks, RLS, dan trigger akan terpasang sekaligus.
--
-- Catatan keamanan (PENTING):
--   * Semua tabel pakai Row Level Security (RLS) berbasis "household".
--   * User HANYA bisa melihat/ubah data milik household yang dia ikuti.
--   * Mode 'sendiri' (s) bersifat privat per-user; mode 'berdua' (b) dibagikan
--     antar anggota household.
--   * JANGAN pernah pakai service_role key di browser. Browser hanya boleh
--     memakai anon public key.
-- ============================================================================

-- Bersih-bersih (aman dijalankan ulang saat masih tahap setup) -------------
drop table if exists public.invites          cascade;
drop table if exists public.assets           cascade;
drop table if exists public.transactions     cascade;
drop table if exists public.household_members cascade;
drop table if exists public.households       cascade;

-- ============================================================================
-- 1) HOUSEHOLDS  —  satu "rumah tangga" / pasangan ATUR Berdua
-- ============================================================================
create table public.households (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null default 'Rumah Tangga',
  owner_id    uuid        not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- ============================================================================
-- 2) HOUSEHOLD_MEMBERS  —  anggota di tiap household (maks 2 untuk "Berdua")
-- ============================================================================
create table public.household_members (
  id            uuid        primary key default gen_random_uuid(),
  household_id  uuid        not null references public.households(id) on delete cascade,
  user_id       uuid        not null references auth.users(id) on delete cascade,
  display_name  text        not null default '',
  role          text        not null default 'member' check (role in ('owner','member')),
  joined_at     timestamptz not null default now(),
  unique (household_id, user_id)
);

-- ============================================================================
-- 3) TRANSACTIONS  —  transaksi (Sendiri & Berdua dalam satu tabel)
--    Memetakan field app: dir(out/in/transfer), cat, sub, amount, date/time,
--    sender(deskripsi), note, currency, mode(s/b), is_shared.
-- ============================================================================
create table public.transactions (
  id            uuid        primary key default gen_random_uuid(),
  household_id  uuid        not null references public.households(id) on delete cascade,
  member_id     uuid        not null references auth.users(id) on delete cascade, -- pemilik/pencatat
  mode          text        not null default 's' check (mode in ('s','b')),       -- 's'=Sendiri, 'b'=Berdua
  is_shared     boolean     not null default false,                                -- transaksi "bersama" di mode Berdua
  dir           text        not null default 'out' check (dir in ('out','in','transfer')),
  cat           text        not null default 'Lainnya',                            -- key kategori (taxonomy)
  sub           text        not null default '',                                   -- key sub-kategori
  amount        numeric(18,2) not null default 0,
  currency      text        not null default 'IDR',
  txn_date      date,                                                              -- tanggal transaksi
  txn_time      text,                                                              -- waktu (string "HH:MM", opsional)
  sender        text        not null default '',                                   -- deskripsi / penerima
  note          text        not null default '',
  source        text        not null default '',                                   -- bank / sumber dana
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================================
-- 4) ASSETS  —  Sumber Kekayaan (terpisah per mode: s vs b)
-- ============================================================================
create table public.assets (
  id            uuid        primary key default gen_random_uuid(),
  household_id  uuid        not null references public.households(id) on delete cascade,
  member_id     uuid        not null references auth.users(id) on delete cascade,
  mode          text        not null default 's' check (mode in ('s','b')),
  name          text        not null default '',
  amount        numeric(18,2) not null default 0,   -- nilai saat ini
  rate          numeric(7,3)  not null default 0,    -- proyeksi pertumbuhan (%/thn)
  color         text        not null default '#64748B',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================================
-- 5) INVITES  —  undangan gabung household via tautan/kode (dibagikan bebas,
--    mis. lewat WhatsApp biasa / share sheet). Tanpa Meta/WhatsApp Business.
-- ============================================================================
create table public.invites (
  id            uuid        primary key default gen_random_uuid(),
  household_id  uuid        not null references public.households(id) on delete cascade,
  code          text        not null unique,                 -- mis. 'ATUR-7K9P-LINK'
  created_by    uuid        not null references auth.users(id) on delete cascade,
  status        text        not null default 'pending' check (status in ('pending','accepted','revoked','expired')),
  accepted_by   uuid        references auth.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  expires_at    timestamptz not null default (now() + interval '7 days')
);

-- ============================================================================
-- INDEKS  —  mempercepat query yang sering dipakai app
-- ============================================================================
create index idx_members_user        on public.household_members (user_id);
create index idx_members_household    on public.household_members (household_id);
create index idx_txn_household_mode   on public.transactions (household_id, mode);
create index idx_txn_member           on public.transactions (member_id);
create index idx_txn_date             on public.transactions (txn_date);
create index idx_assets_hh_mode       on public.assets (household_id, mode);
create index idx_invites_code         on public.invites (code);

-- ============================================================================
-- FUNGSI BANTUAN  —  cek keanggotaan household (dipakai oleh policy RLS)
-- SECURITY DEFINER agar tidak rekursi saat policy memanggilnya.
-- ============================================================================
create or replace function public.is_household_member(hh uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.household_members m
    where m.household_id = hh and m.user_id = auth.uid()
  );
$$;

-- trigger: auto-update kolom updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger trg_txn_touch    before update on public.transactions
  for each row execute function public.touch_updated_at();
create trigger trg_assets_touch before update on public.assets
  for each row execute function public.touch_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.households        enable row level security;
alter table public.household_members enable row level security;
alter table public.transactions      enable row level security;
alter table public.assets            enable row level security;
alter table public.invites           enable row level security;

-- ---- HOUSEHOLDS -----------------------------------------------------------
-- Lihat: hanya household yang user-nya jadi anggota (atau pemilik).
create policy hh_select on public.households for select
  using (owner_id = auth.uid() or public.is_household_member(id));
-- Buat: user membuat household baru sebagai owner-nya sendiri.
create policy hh_insert on public.households for insert
  with check (owner_id = auth.uid());
-- Ubah/Hapus: hanya owner.
create policy hh_update on public.households for update
  using (owner_id = auth.uid());
create policy hh_delete on public.households for delete
  using (owner_id = auth.uid());

-- ---- HOUSEHOLD_MEMBERS ----------------------------------------------------
-- Lihat anggota dari household yang sama.
create policy mem_select on public.household_members for select
  using (public.is_household_member(household_id));
-- User menambahkan dirinya sendiri ke household (mis. saat menerima undangan),
-- atau owner menambahkan dirinya saat membuat household.
create policy mem_insert on public.household_members for insert
  with check (user_id = auth.uid());
-- Hapus: user boleh keluar (hapus baris dirinya sendiri).
create policy mem_delete on public.household_members for delete
  using (user_id = auth.uid());

-- ---- TRANSACTIONS ---------------------------------------------------------
-- Mode Sendiri (s): hanya pencatatnya yang lihat. (privat)
-- Mode Berdua (b): semua anggota household lihat (data bersama).
create policy txn_select on public.transactions for select
  using (
    public.is_household_member(household_id)
    and (mode = 'b' or member_id = auth.uid())
  );
create policy txn_insert on public.transactions for insert
  with check (
    member_id = auth.uid() and public.is_household_member(household_id)
  );
-- Ubah/Hapus: pencatat selalu boleh; di mode Berdua anggota lain boleh
-- mengubah transaksi bertanda bersama (is_shared).
create policy txn_update on public.transactions for update
  using (
    public.is_household_member(household_id)
    and (member_id = auth.uid() or (mode = 'b' and is_shared))
  );
create policy txn_delete on public.transactions for delete
  using (
    public.is_household_member(household_id)
    and (member_id = auth.uid() or (mode = 'b' and is_shared))
  );

-- ---- ASSETS ---------------------------------------------------------------
-- Aset Sendiri privat; aset Berdua terlihat seluruh anggota household.
create policy ast_select on public.assets for select
  using (
    public.is_household_member(household_id)
    and (mode = 'b' or member_id = auth.uid())
  );
create policy ast_insert on public.assets for insert
  with check (member_id = auth.uid() and public.is_household_member(household_id));
create policy ast_update on public.assets for update
  using (
    public.is_household_member(household_id)
    and (member_id = auth.uid() or mode = 'b')
  );
create policy ast_delete on public.assets for delete
  using (
    public.is_household_member(household_id)
    and (member_id = auth.uid() or mode = 'b')
  );

-- ---- INVITES --------------------------------------------------------------
-- Anggota household boleh lihat undangan miliknya.
create policy inv_select on public.invites for select
  using (public.is_household_member(household_id) or created_by = auth.uid());
-- Buat undangan: anggota household.
create policy inv_insert on public.invites for insert
  with check (created_by = auth.uid() and public.is_household_member(household_id));
-- Update (mis. tandai accepted / revoked): pembuat atau penerima.
create policy inv_update on public.invites for update
  using (created_by = auth.uid() or accepted_by = auth.uid());

-- ============================================================================
-- REALTIME  —  agar perubahan transaksi/aset langsung ter-sync ke pasangan
-- ============================================================================
-- (Aktifkan juga di Dashboard → Database → Replication bila perlu)
alter publication supabase_realtime add table public.transactions;
alter publication supabase_realtime add table public.assets;
alter publication supabase_realtime add table public.household_members;

-- ============================================================================
-- SELESAI. Setelah ini, ambil:
--   Project URL  →  Settings → API → Project URL
--   anon key     →  Settings → API → Project API keys → anon public
-- dan sambungkan dari app via @supabase/supabase-js (createClient).
-- ============================================================================
