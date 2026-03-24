# Personal Studio Website

Canonical home for essays, mixed-media projects, idea outlines, photography, and embeds.

## Goals
- Fast, minimal, editorial reading experience
- Low operating cost (`< $25/month`)
- Static-first architecture with CMS publishing workflow
- Canonical publishing source, with optional distribution to other platforms

## Recommended Stack
- Framework: `Astro` (static-first, minimal JS)
- Styling: plain CSS + CSS variables (no UI framework)
- Content: Markdown/MDX + `Sanity` (headless CMS with admin dashboard)
- Database (email + comments): `Supabase Postgres`
- Transactional email: `Resend`
- Hosting: `Vercel` (Hobby) or `Netlify` (Free)
- Analytics (optional): `Plausible` or self-hosted `Umami`

## Cost Target (Typical v1)
- Vercel/Netlify free tier: `$0`
- Sanity free plan: `$0`
- Supabase free tier: `$0`
- Resend free tier (low volume): `$0`
- Domain: `~$1-2/month` equivalent when annualized
- Total: usually `$0-10/month` early stage

## Repo Layout (Target)
```txt
website/
  README.md
  docs/
  prompts/
  app/
    src/
      pages/
      components/
      layouts/
      styles/
      content/
      lib/
      api/
    public/
    package.json
```

## Next Actions
1. Read docs in order `00 -> 08`.
2. Run prompt sequence from `prompts/codex-01-bootstrap.md` to `prompts/codex-06-search-and-tags.md`.
3. Keep v1 minimal; defer advanced features.

## Progress Tracking
- Live implementation tracker: `docs/08-progress-tracker.md`
