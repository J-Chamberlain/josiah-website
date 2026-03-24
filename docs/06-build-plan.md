# 06 Build Plan

## Scope Baseline
- v1 goal: minimal publishing studio
- Keep: Astro + Sanity + Supabase + Resend + Vercel

## Stage 1 Bootstrap
- Initialize Astro app and base routes
- Configure static-first output + Vercel adapter + sitemap
- Add shared layout, typography, color tokens, and footer/privacy links

## Stage 2 Content And CMS
- Implement Sanity schemas: essay, project, ideaOutline, gallery, tag, siteSettings
- Implement Sanity-first data loading with local fallback
- Build index and detail pages for all public content types
- Enforce unlisted handling (`visibility`, noindex, exclusion from lists/feeds)

## Stage 3 Subscribe And Publishing
- Implement subscribe form and Supabase subscriber storage
- Implement double opt-in confirmation route
- Implement unsubscribe route with signed links
- Build Resend templates (confirmation + new post) with multipart and unsubscribe headers
- Implement publish webhook to notify only active subscribers

## Stage 4 Comments (Manual Moderation)
- Implement comment submission endpoint with deterministic validation checks
- Persist comments in Supabase with `pending/approved/rejected`
- Implement signed approve/reject moderation endpoint
- Send moderation digest emails to author on pending submissions
- Build optional signed moderation queue page

## Stage 5 Hardening And QA
- Finalize SQL migrations and `.env.example`
- Verify webhook auth, signed links, and unlisted exclusion behavior
- Run build checks and integration checks for configured services
- Run accessibility and performance pass on preview deployment

## Stage 6 v1 Launch
- Validate all v1 acceptance tests
- Publish production deployment
- Document runbook for publishing and moderation workflow

## Deferred Backlog
- v1.1: richer taxonomy/tag filtering UX
