create extension if not exists pgcrypto;

-- Customers: maps Paddle customer_id to user email
create table if not exists public.customers (
  customer_id text not null,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customers_pkey primary key (customer_id)
);

alter table public.customers enable row level security;

create policy "Users can read own customer record"
  on public.customers as permissive for select to authenticated
  using (email = auth.jwt() ->> 'email');

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
create index if not exists idx_subscriptions_customer_id on public.subscriptions (customer_id);
