create extension if not exists pgcrypto;

-- Customers: maps Paddle customer_id to user email
create table if not exists public.customers (
  customer_id text not null,
  email text not null,
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customers_pkey primary key (customer_id)
);

alter table public.customers enable row level security;

create policy "Users can read own customer record"
  on public.customers as permissive for select to authenticated
  using (email = auth.jwt() ->> 'email' or user_id = auth.uid());

-- Subscriptions: stores webhook events from Paddle
create table if not exists public.subscriptions (
  subscription_id text not null,
  subscription_status text not null,
  price_id text,
  product_id text,
  scheduled_change text,
  customer_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_pkey primary key (subscription_id),
  constraint subscriptions_customer_id_fkey foreign key (customer_id) references public.customers (customer_id)
);

alter table public.subscriptions enable row level security;

create policy "Users can read own subscriptions"
  on public.subscriptions as permissive for select to authenticated
  using (
    customer_id in (
      select customer_id from public.customers
      where email = auth.jwt() ->> 'email'
    )
  );

create index if not exists idx_customers_email on public.customers (email);
create index if not exists idx_customers_user_id on public.customers (user_id);
create index if not exists idx_subscriptions_customer_id on public.subscriptions (customer_id);

-- Credit accounts: stores per-user ACTIS balance
create table if not exists public.credit_accounts (
  user_id uuid not null references auth.users (id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  lifetime_credited integer not null default 0,
  lifetime_spent integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint credit_accounts_pkey primary key (user_id)
);

alter table public.credit_accounts enable row level security;

create policy "Users can read own credit account"
  on public.credit_accounts as permissive for select to authenticated
  using (user_id = auth.uid());

create table if not exists public.credit_transactions (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount integer not null,
  balance_after integer not null check (balance_after >= 0),
  kind text not null,
  description text,
  reference text,
  created_at timestamptz not null default now(),
  constraint credit_transactions_pkey primary key (id)
);

alter table public.credit_transactions enable row level security;

create policy "Users can read own credit transactions"
  on public.credit_transactions as permissive for select to authenticated
  using (user_id = auth.uid());

create index if not exists idx_credit_transactions_user_id on public.credit_transactions (user_id);
create unique index if not exists idx_credit_transactions_user_reference
  on public.credit_transactions (user_id, kind, reference)
  where reference is not null;

create or replace function public.apply_credit_delta(
  p_user_id uuid,
  p_delta integer,
  p_kind text,
  p_description text default null,
  p_reference text default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
begin
  insert into public.credit_accounts (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  update public.credit_accounts
  set
    balance = balance + p_delta,
    lifetime_credited = lifetime_credited + greatest(p_delta, 0),
    lifetime_spent = lifetime_spent + greatest(-p_delta, 0),
    updated_at = now()
  where user_id = p_user_id
    and (p_delta >= 0 or balance >= abs(p_delta))
  returning balance into v_balance;

  if v_balance is null then
    raise exception 'INSUFFICIENT_CREDITS';
  end if;

  insert into public.credit_transactions (user_id, amount, balance_after, kind, description, reference)
  values (p_user_id, p_delta, v_balance, p_kind, p_description, p_reference);

  return v_balance;
end;
$$;
