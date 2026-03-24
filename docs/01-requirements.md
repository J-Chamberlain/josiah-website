# 01 Requirements

## Functional Requirements

### Navigation
- Global nav includes: `Home`, `Essays & Projects`, `About`, `Subscribe`
- Navigation remains minimal and unobtrusive

### Homepage
- Project statement explaining studio purpose
- Featured work section (essay/project/idea in development)
- Recent work feed
- Subtle subscribe section (no popups)

### Essays & Projects
- Contains sections: `Featured Projects`, `Essays`, `Idea Outlines`, `Archive`
- Tag chips visible on content cards and detail pages

### Projects
- Projects are mixed-media containers including any of:
  - Rich text
  - Photos and diagrams
  - YouTube embeds
  - Spotify embeds
  - Notes/iterations

### Photography
- Support photo essays (images inside writing)
- Support standalone galleries
- Support inline, full-width, and lightbox image presentation

### Subscribe And Email
- Email capture form
- Double opt-in confirmation flow (required in v1)
- Automated email on new public post publish
- Subscriber list owned by site data model
- Every outbound email includes unsubscribe link + `List-Unsubscribe` header
- Unsubscribe endpoint marks subscriber inactive without hard-deleting history

### Comments
- Email required, not displayed publicly
- Flat comments only (no threads)
- No likes/upvotes
- Manual moderation workflow required for author
- Deterministic anti-abuse rules allowed before queueing comments

### Comment Moderation Workflow
- New comments default to `pending` unless explicitly approved by author
- Author receives moderation queue email digest with signed approve/reject links
- Optional hidden `/moderation` route protected by signed token for manual review
- Public pages render approved comments only

### Unlisted Content
- Entries can be marked unlisted
- Unlisted content excluded from nav/archive/public indexes
- Unlisted content includes `noindex,nofollow` metadata
- Unlisted content excluded from RSS and publish-notification emails

### Legal/Privacy
- Publish `Privacy` page describing email capture, comment email handling, and analytics
- Publish `Contact` method for data deletion/unsubscribe requests

## Non-Functional Requirements
- Fast load and minimal client JavaScript
- Static-first Astro configuration with SSR only where required
- Accessible semantics and keyboard support
- Readable typography and contrast
- Clean embeds without heavy third-party script bundles
- No aggressive tracking

## Explicit Exclusions (v1)
- No reader accounts/login
- No paywalls
- No popup subscribe prompts
- No social feed embeds
- No gamification features
- No dark mode toggle
- No external AI-powered moderation
