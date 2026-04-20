-- ============================================================
-- CashFlow — Supabase Schema
-- Jalankan file ini di Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABEL: profiles
-- Dibuat otomatis setiap kali user baru mendaftar
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger: buat profil otomatis saat user register
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- TABEL: transactions
-- ============================================================
create table if not exists public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  type text not null check (type in ('income', 'expense')),
  amount bigint not null check (amount > 0),
  description text not null default '',
  category text not null,
  date date not null default current_date,
  created_at timestamptz default now()
);

alter table public.transactions enable row level security;

drop policy if exists "Users can CRUD own transactions" on public.transactions;
create policy "Users can CRUD own transactions"
  on public.transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop index if exists transactions_user_id_idx;
drop index if exists transactions_date_idx;
drop index if exists transactions_type_idx;
create index transactions_user_id_idx on public.transactions(user_id);
create index transactions_date_idx on public.transactions(date desc);
create index transactions_type_idx on public.transactions(type);

-- ============================================================
-- TABEL: goals
-- ============================================================
create table if not exists public.goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  target_amount bigint not null check (target_amount > 0),
  -- Kategori pemasukan yang dilacak untuk goal ini (array)
  tracked_categories text[] not null default '{}',
  created_at timestamptz default now()
);

alter table public.goals enable row level security;

drop policy if exists "Users can CRUD own goals" on public.goals;
create policy "Users can CRUD own goals"
  on public.goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- TABEL: settings
-- Satu baris per user
-- ============================================================
create table if not exists public.settings (
  user_id uuid references auth.users on delete cascade primary key,
  spend_limit bigint default 0,
  updated_at timestamptz default now()
);

alter table public.settings enable row level security;

drop policy if exists "Users can CRUD own settings" on public.settings;
create policy "Users can CRUD own settings"
  on public.settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- VIEW: monthly_summary
-- Ringkasan pemasukan & pengeluaran per bulan per user
-- ============================================================
create or replace view public.monthly_summary as
select
  user_id,
  date_trunc('month', date)::date as month,
  type,
  sum(amount) as total,
  count(*) as tx_count
from public.transactions
group by user_id, date_trunc('month', date), type;

-- ============================================================
-- VIEW: category_summary
-- Total pengeluaran per kategori per user per bulan
-- ============================================================
create or replace view public.category_summary as
select
  user_id,
  date_trunc('month', date)::date as month,
  category,
  type,
  sum(amount) as total
from public.transactions
group by user_id, date_trunc('month', date), category, type;
