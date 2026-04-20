-- ============================================================
-- CashFlow — Replace Accounts with Fund Types
-- Menghapus system accounts dan mengganti dengan fund_type
-- ============================================================

-- Drop trigger dan function account balance (if exists)
drop trigger if exists update_account_balance_on_transaction on public.transactions;
drop function if exists public.update_account_balance();

-- Drop account_id column dari transactions (if exists)
alter table public.transactions
drop column if exists account_id cascade;

-- Drop index (if exists)
drop index if exists transactions_account_id_idx;

-- Add fund_type column ke transactions (if not exists)
alter table public.transactions
add column if not exists fund_type text default 'cash' check (fund_type in ('bank', 'ewallet', 'cash'));

-- Drop accounts table (if exists)
drop table if exists public.accounts cascade;

-- Ensure fund_type is not null
update public.transactions set fund_type = 'cash' where fund_type is null;
alter table public.transactions alter column fund_type set not null;

