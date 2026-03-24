# 02 Architecture And Content Model

## Recommended Architecture
Static-first frontend + headless CMS + serverless APIs.

- Frontend: `Astro` with static prerender for core public pages
- Runtime: Astro `output: "static"` + `@astrojs/vercel` adapter serverless functions for SSR routes and API endpoints
- Adapter: `@astrojs/vercel` for serverless deployment on Vercel
- CMS: `Sanity` (editorial dashboard + structured content + webhooks)
- Data services:
  - `Supabase` for subscribers/comments
  - `Resend` for outbound notifications
- Deploy: `Vercel` (or Netlify equivalent)

## Why This Stack
- Minimal runtime overhead (fast)
- Strong editorial UX with admin dashboard
- Cheap/free tiers for early scale
- Clear extension path (API routes, webhooks, moderation)

## Proposed Repository Structure
```txt
app/
  src/
    pages/
      index.astro
      essays-projects.astro
      about.astro
      subscribe.astro
      privacy.astro
      404.astro
      tags/[tag].astro
      moderation.astro
      projects/[slug].astro
      essays/[slug].astro
      ideas/[slug].astro
      galleries/[slug].astro
      api/
        subscribe.ts
        unsubscribe.ts
        comments/create.ts
        comments/moderate.ts
        webhooks/sanity-publish.ts
    components/
      Header.astro
      Footer.astro
      RichTextRenderer.astro
      MediaEmbed.astro
      ImageFigure.astro
      Lightbox.astro
      SubscribeForm.astro
      CommentForm.astro
      CommentList.astro
      TagChip.astro
    layouts/
      BaseLayout.astro
      ProseLayout.astro
    lib/
      sanity.ts
      supabase.ts
      seo.ts
      tags.ts
      feeds.ts
      email.ts
      moderation.ts
      signed-links.ts
    styles/
      tokens.css
      base.css
      prose.css
  sanity/
    schemas/
      documents/
      objects/
    sanity.config.ts
  public/
  .env.example
```

## Content Model (Sanity)

### Document: `essay`
- `title` (string, required)
- `slug` (slug, required, unique)
- `excerpt` (text)
- `publishedAt` (datetime)
- `status` (`draft|published`)
- `visibility` (`public|unlisted`)
- `tags` (array of refs to `tag`)
- `coverImage` (image)
- `body` (portable text + embeds)

### Document: `project`
- `title`, `slug`, `excerpt`, `publishedAt`, `status`, `visibility`, `tags`
- `featured` (boolean)
- `overview` (portable text)
- `sections` (array of blocks: text/gallery/embed/note)
- `updates` (array of dated notes)

### Document: `ideaOutline`
- `title`, `slug`, `excerpt`, `publishedAt`, `status`, `visibility`, `tags`
- `stage` (`seed|exploring|on-hold|shipping`)
- `openQuestions` (array of strings)
- `body` (short-form exploratory prose)

### Document: `gallery`
- `title`, `slug`, `description`
- `images` (array with alt + caption + focal metadata)
- `publishedAt`, `visibility`
- Use this only for standalone gallery pages, not in-project sections

### Document: `tag`
- `name`
- `slug`
- `description`

### Document: `siteSettings`
- `siteTitle`
- `siteDescription`
- `homepageStatement`
- `subscribeCta`
- `defaultOgImage`
- `footerBlurb`
- `contactEmail`
- `socialLinks` (array)
- `mainNav` (default locked to v1 nav)

## Relational Data (Supabase)

### Table: `subscribers`
- `id` (uuid, pk)
- `email` (citext unique)
- `status` (`pending|active|unsubscribed`)
- `confirm_token_hash` (text)
- `confirm_token_expires_at` (timestamptz)
- `confirmed_at` (timestamptz)
- `unsubscribed_at` (timestamptz)
- `created_at` (timestamptz default now)

### Table: `comments`
- `id` (uuid, pk)
- `content_type` (`essay|project|ideaOutline|gallery`)
- `content_slug` (text)
- `name` (text nullable)
- `email` (citext required, private)
- `body` (text)
- `status` (`pending|approved|rejected`)
- `moderation_source` (`rules|manual`)
- `moderation_reason` (text)
- `created_at` (timestamptz)
- `moderated_at` (timestamptz nullable)

## Moderation Architecture
- Rule pass first: link burst, repeated text, blocked terms, rate limit
- Manual review via signed approve/reject links and optional moderation queue route

## Image Optimization Strategy
- Source images from Sanity image CDN
- Render responsive sizes via `@sanity/image-url` with explicit width breakpoints
- Prefer modern formats (`webp`/`avif` where available) and lazy loading below the fold
- Keep original assets for lightbox high-resolution view only

## Unlisted Handling
- Query filters exclude `visibility == "unlisted"` unless explicit preview mode
- Output `<meta name="robots" content="noindex,nofollow">` for unlisted pages
- Exclude from sitemap, RSS, and publish notification webhook
