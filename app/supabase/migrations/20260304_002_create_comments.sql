create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('essay','project','ideaOutline','gallery')),
  content_slug text not null,
  name text,
  email citext not null,
  body text not null,
  status text not null check (status in ('pending','approved','rejected')) default 'pending',
  moderation_source text not null check (moderation_source in ('rules','ai','manual')) default 'rules',
  moderation_reason text,
  created_at timestamptz not null default now(),
  moderated_at timestamptz
);

create index if not exists comments_content_idx on public.comments(content_type, content_slug);
create index if not exists comments_status_idx on public.comments(status);
