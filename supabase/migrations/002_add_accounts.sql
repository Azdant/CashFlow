-- ============================================================
-- CashFlow — Add Accounts Table Migration
-- ============================================================

-- TABEL: accounts (wallet/money source)
create table public.accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  type text not null check (type in ('bank', 'ewallet', 'cash', 'investment', 'savings', 'other')),
  balance bigint default 0,
  color text default '#10b981',
  icon text default 'Wallet',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.accounts enable row level security;

create policy "Users can CRUD own accounts"
  on public.accounts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index accounts_user_id_idx on public.accounts(user_id);

-- Add account_id to transactions
alter table public.transactions
add column account_id uuid references public.accounts on delete set null;

create index transactions_account_id_idx on public.transactions(account_id);

-- Function to update account balance when transaction is added/deleted
create or replace function public.update_account_balance()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    if new.account_id is not null then
      update public.accounts
      set balance = balance + case when new.type = 'income' then new.amount else -new.amount end
      where id = new.account_id;
    end if;
  elsif tg_op = 'DELETE' then
    if old.account_id is not null then
      update public.accounts
      set balance = balance - case when old.type = 'income' then old.amount else -old.amount end
      where id = old.account_id;
    end if;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger update_account_balance_on_transaction
  after insert or delete on public.transactions
  for each row execute procedure public.update_account_balance();
