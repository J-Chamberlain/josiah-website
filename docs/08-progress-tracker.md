# 08 Progress Tracker

Use this file as the live implementation checklist.

## Scope Reset (2026-03-06)
- [x] v1 aligned to minimal publishing studio goal
- [x] Comments set to manual moderation only
- [x] Optional discovery features deferred from v1

## Stage 1 Foundation
- [x] Initialize Astro app scaffold
- [x] Configure static-first output + Vercel adapter + sitemap
- [x] Create base routes (`/`, `/essays-projects`, `/about`, `/subscribe`, `/privacy`, `/404`)
- [x] Add shared layout + header/footer + design tokens

## Stage 2 Content Architecture
- [x] Define content model types (essay/project/ideaOutline/gallery/tag/siteSettings)
- [x] Build local fallback content source
- [x] Implement unified content source (Sanity-first, local fallback)
- [x] Wire list/detail/tag pages to unified content source
- [x] Exclude unlisted content from public queries + feeds

## Stage 3 CMS And Publishing
- [x] Add Sanity Studio config + schemas
- [x] Add typed Sanity client helpers
- [x] Add `siteSettings` retrieval with fallback
- [x] Make homepage/settings copy CMS-driven

## Stage 4 Interaction Systems
- [x] Subscribe endpoint + double opt-in confirm endpoint
- [x] Unsubscribe endpoint with signed URL verification
- [x] Email templates (confirmation + new post + moderation digest)
- [x] Comment create endpoint + moderation endpoint
- [x] Moderation queue route with signed access
- [x] Subscribe status messages render at request time (SSR where needed)
- [x] Remove non-v1 moderation integrations from implementation
- [x] Remove non-v1 discovery routes and UI from implementation

## Stage 5 Hardening
- [x] Add SQL migrations for subscribers/comments
- [x] Add `.env.example` baseline
- [x] Add webhook auth check + unlisted skip behavior
- [x] Add email batch resilience (`Promise.allSettled`)
- [ ] Run integration tests with real Sanity/Supabase/Resend keys
  - Validation path A: local run with populated env vars (`npm run verify:integrations`).
  - Validation path B: Vercel preview deployment with env vars configured in Vercel project settings.
- [ ] Configure sender DNS (SPF/DKIM/DMARC) and validate deliverability
- [ ] Final Lighthouse + accessibility verification on deployed preview
- [ ] Validate local POST API runtime via `vercel dev` (not only `npm run dev`)

## Stage 6 Acceptance Closure
- [ ] Run full pass against updated `docs/07-acceptance-tests.md`
- [ ] Mark each acceptance test as pass/fail with evidence links
- [ ] Close remaining gaps and re-run

## Deferred Backlog
- [ ] v1.1 optional richer discovery UX

## Current Snapshot
- Stage completion: `1-3 complete`, `4-6 in progress`.
- Build status: app builds locally.
- Runtime baseline: use Node `24` via `nvm use` in `app/` (`.nvmrc` = `24`) for local/Vercel parity.
