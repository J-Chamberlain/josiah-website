create extension if not exists citext;

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  status text not null check (status in ('pending','active','unsubscribed')) default 'pending',
  confirm_token_hash text,
  confirm_token_expires_at timestamptz,
  unsubscribe_token_hash text,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists subscribers_status_idx on public.subscribers(status);
create index if not exists subscribers_confirm_token_idx on public.subscribers(confirm_token_hash);
create index if not exists subscribers_unsubscribe_token_idx on public.subscribers(unsubscribe_token_hash);
