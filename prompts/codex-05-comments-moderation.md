# Codex Prompt 05: Comments + Manual Moderation

Implement comments for `essay`, `project`, `ideaOutline`, and `gallery` with manual moderation only.

## Requirements
- Flat comments only (no threading, no likes/upvotes)
- Fields: `name` optional, `email` required, `body` required
- Store comments in Supabase with status:
  - `pending`
  - `approved`
  - `rejected`
- Run deterministic validation/anti-abuse checks (length, links, blocked terms)
- No OpenAI or external AI moderation in v1
- Author moderation methods:
  - Signed approve/reject links
  - Optional signed `/moderation` queue route
- Public pages must render only approved comments

## Deliverables
1. Supabase comments table migration
2. `POST /api/comments/create`
3. `GET /api/comments/moderate` signed action handler
4. Author moderation digest email (pending comments)
5. Moderation queue page (signed token access)
6. Comment form and comment list components on content detail pages

## Constraints
- Keep implementation minimal and auditable
- Avoid adding new third-party services
- Preserve accessibility and keyboard navigation
