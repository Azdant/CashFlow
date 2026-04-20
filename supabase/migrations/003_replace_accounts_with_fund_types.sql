-- ============================================================
-- CashFlow — Replace Accounts with Fund Types
-- Menghapus system accounts dan mengganti dengan fund_type
-- ============================================================

-- Drop trigger dan function account balance
drop trigger if exists update_account_balance_on_transaction on public.transactions;
drop function if exists public.update_account_balance();

-- Drop account_id column dari transactions
alter table public.transactions
drop column if exists account_id;

-- Drop index
drop index if exists transactions_account_id_idx;

-- Add fund_type column ke transactions
alter table public.transactions
add column fund_type text not null default 'cash' check (fund_type in ('bank', 'ewallet', 'cash'));

-- Drop accounts table
drop table if exists public.accounts;

-- Update fund_type dari existing transactions (set to 'cash' by default)
-- Already set to 'cash' in the ADD COLUMN statement above

commit;
