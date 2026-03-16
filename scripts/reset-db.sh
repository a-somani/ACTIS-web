#!/usr/bin/env bash
set -euo pipefail

# Load env vars from .env.local
if [ -f .env.local ]; then
  set -a
  source .env.local
  set +a
fi

PROJECT_REF=$(echo "$NEXT_PUBLIC_SUPABASE_URL" | sed 's|https://||' | sed 's|\.supabase\.co.*||')

if [ -z "$PROJECT_REF" ] || [ -z "$SUPABASE_DATABASE_PASSWORD" ]; then
  echo "Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_DATABASE_PASSWORD in .env.local"
  exit 1
fi

# Resolve the DB hostname to an IP (handles IPv6-only hosts where psql can't resolve the name)
DB_HOST="db.${PROJECT_REF}.supabase.co"
RESOLVED_IP=$(host "$DB_HOST" 2>/dev/null | grep -oE '([0-9a-f:]+:[0-9a-f:]+)' | head -1)

if [ -n "$RESOLVED_IP" ]; then
  DB_URL="postgresql://postgres:${SUPABASE_DATABASE_PASSWORD}@[${RESOLVED_IP}]:5432/postgres?sslmode=require"
else
  DB_URL="postgresql://postgres:${SUPABASE_DATABASE_PASSWORD}@${DB_HOST}:5432/postgres?sslmode=require"
fi

echo "Dropping existing tables..."
psql "$DB_URL" <<'SQL'
drop policy if exists "Enable read access for authenticated users to customers" on public.customers;
drop policy if exists "Enable read access for authenticated users to subscriptions" on public.subscriptions;
drop policy if exists "Users can read own customer record" on public.customers;
drop policy if exists "Users can read own subscriptions" on public.subscriptions;
drop table if exists public.subscriptions cascade;
drop table if exists public.customers cascade;
SQL

echo "Running seed.sql..."
psql "$DB_URL" -f supabase/seed.sql

echo "Done. Database reset with new schema."
