-- Unsubscribe links now use signed subscriber IDs (HMAC), so stored unsubscribe token hashes are obsolete.
drop index if exists subscribers_unsubscribe_token_idx;
alter table if exists public.subscribers
  drop column if exists unsubscribe_token_hash;
