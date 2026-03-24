# 04 Feature Specs

## F1 Home
- Purpose statement above the fold
- Featured items block (essay/project/idea)
- Recent posts list
- Embedded subscribe section

## F2 Essays And Projects Index
- Sections for Featured Projects, Essays, Idea Outlines, Archive
- Sort newest first by `publishedAt`
- Tag chips shown on cards

## F3 Content Detail Pages
- Types: essay/project/idea/gallery
- Shared prose layout
- Supports rich text and media blocks
- Optional related items by shared tags

## F4 Media Embeds
- YouTube embed component
- Spotify embed component
- Lazy-load where possible
- Privacy-enhanced embed URLs when supported

## F5 Photography
- Inline image with caption and alt
- Full-width image option
- Gallery grid and lightbox modal
- Lightbox supports keyboard navigation, esc close, backdrop close
- Image optimization uses Sanity CDN transforms with responsive widths and lazy loading

## F6 Subscribe System
- `/subscribe` page with plain email form
- API route validates + stores email in Supabase
- Required double opt-in confirmation route
- Required unsubscribe route and token handling
- On publish webhook, send new-post email via Resend to `active` subscribers only
- Outbound email includes unsubscribe URL and `List-Unsubscribe` headers
- New-post email format: HTML with plain-text fallback
- Email includes: post title, excerpt (if set), "Read now" link to post, unsubscribe link
- Visual style: minimal single-column, no heavy branding, consistent with site tone

## F7 Comments With Manual Moderation
- Flat comment list only
- Available on all public content types: essay, project, ideaOutline, gallery
- Form fields: name (optional), email (required), comment
- Deterministic validation and anti-abuse checks only
- States: `pending`, `approved`, `rejected`
- Author moderation workflow:
  - email digest with signed approve/reject links
  - optional hidden moderation queue route

## F8 Unlisted Content
- `visibility` field in CMS
- Excluded from public lists/sitemap
- Excluded from RSS + publish notification emails
- Individual page served with `noindex,nofollow`

## F9 Analytics (Optional)
- Privacy-first analytics only
- No cross-site ad tracking pixels

## F10 SEO And Sharing Metadata
- Per-page canonical URL
- Open Graph title/description/image
- Twitter card metadata
- Fallback OG image from `siteSettings`

## F11 Trust And Policy Pages
- `Privacy` page linked in footer
- Describes subscriber emails, comment data handling, and unsubscribe process
