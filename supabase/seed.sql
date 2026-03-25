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

-- Create history: private storage-backed ACTIS generations
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'create-generations',
  'create-generations',
  false,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.create_generations (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source_file_name text not null,
  source_storage_path text not null,
  source_mime_type text,
  source_size_bytes integer not null check (source_size_bytes >= 0),
  result_storage_path text not null,
  result_mime_type text,
  result_size_bytes integer not null check (result_size_bytes >= 0),
  target_ratio text not null,
  provider text not null default 'actis-create',
  status text not null default 'ready' check (status in ('ready', 'unavailable')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unavailable_at timestamptz,
  constraint create_generations_pkey primary key (id)
);

alter table public.create_generations enable row level security;

drop policy if exists "Users can read own create generations" on public.create_generations;
create policy "Users can read own create generations"
  on public.create_generations as permissive for select to authenticated
  using (user_id = auth.uid());

create index if not exists idx_create_generations_user_id on public.create_generations (user_id);
create index if not exists idx_create_generations_user_created_at
  on public.create_generations (user_id, created_at desc);
create index if not exists idx_create_generations_status on public.create_generations (status);

create or replace function public.record_create_generation(
  p_generation_id uuid,
  p_user_id uuid,
  p_source_file_name text,
  p_source_storage_path text,
  p_source_mime_type text,
  p_source_size_bytes integer,
  p_result_storage_path text,
  p_result_mime_type text,
  p_result_size_bytes integer,
  p_target_ratio text,
  p_generation_credit_cost integer,
  p_provider text default 'actis-create'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.apply_credit_delta(
    p_user_id,
    -abs(p_generation_credit_cost),
    'generation_debit',
    'ACTIS Create generation',
    'generation:' || p_generation_id::text
  );

  insert into public.create_generations (
    id,
    user_id,
    source_file_name,
    source_storage_path,
    source_mime_type,
    source_size_bytes,
    result_storage_path,
    result_mime_type,
    result_size_bytes,
    target_ratio,
    provider,
    status
  )
  values (
    p_generation_id,
    p_user_id,
    p_source_file_name,
    p_source_storage_path,
    p_source_mime_type,
    p_source_size_bytes,
    p_result_storage_path,
    p_result_mime_type,
    p_result_size_bytes,
    p_target_ratio,
    p_provider,
    'ready'
  );

  return p_generation_id;
end;
$$;
