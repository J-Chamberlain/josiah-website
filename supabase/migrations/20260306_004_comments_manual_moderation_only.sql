-- v1 scope: manual moderation only. Remove AI as an allowed moderation source.
alter table if exists public.comments
  drop constraint if exists comments_moderation_source_check;

alter table if exists public.comments
  add constraint comments_moderation_source_check
  check (moderation_source in ('rules', 'manual'));
