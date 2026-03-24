# 07 Acceptance Tests

## A. Navigation And IA
- [ ] Header nav shows only: Home, Essays & Projects, About, Subscribe
- [ ] Homepage clearly states studio purpose in first viewport
- [ ] Essays & Projects page includes: Featured Projects, Essays, Idea Outlines, Archive

## B. Content Types
- [ ] CMS supports: essay, project, idea outline, gallery, tag, site settings
- [ ] Project pages support text, images, YouTube, and Spotify embeds
- [ ] Idea outlines include `stage` and `openQuestions` fields distinct from essays

## C. Unlisted Content
- [ ] Any content can be marked `unlisted`
- [ ] Unlisted items do not appear in nav, archive, feeds, tag lists
- [ ] Unlisted pages include `noindex,nofollow`
- [ ] Unlisted posts are excluded from publish-notification emails

## D. Photography
- [ ] Images support inline placement in prose
- [ ] Images support full-width display
- [ ] Gallery pages include accessible lightbox (keyboard arrows + esc + backdrop close)
- [ ] Alt text is present for all content images

## E. Media Embeds
- [ ] YouTube embeds render responsively
- [ ] Spotify embeds render responsively
- [ ] Embeds do not inject heavy unrelated scripts

## F. Subscribe And Email
- [ ] Subscribe page includes a simple email capture form
- [ ] Double opt-in confirmation flow is implemented
- [ ] Valid confirmed emails are stored as `active` subscribers
- [ ] Every outbound email includes a working unsubscribe link
- [ ] `/api/unsubscribe` marks `unsubscribed_at` and suppresses future sends
- [ ] No popup subscribe prompts or dark patterns

## G. Comments And Moderation
- [ ] Comment form requires email but does not display email publicly
- [ ] Comment model is flat (no threads)
- [ ] No likes/upvotes exist in UI or data model
- [ ] Deterministic validation/anti-abuse checks run before moderation decision
- [ ] Author can approve/reject via signed moderation links or moderation queue route

## H. SEO And Feeds
- [ ] Canonical URL and OG metadata present on content pages
- [ ] Default OG image fallback comes from `siteSettings`
- [ ] RSS feed validates and excludes unlisted content

## I. Accessibility
- [ ] Semantic landmarks and heading hierarchy are valid
- [ ] Full keyboard navigation works across nav/forms/lightbox
- [ ] Color contrast passes WCAG AA for body text and controls
- [ ] Focus states are visible and consistent

## J. Performance And Operations
- [ ] Core pages ship minimal JS in static-first architecture
- [ ] Lighthouse Performance, Accessibility, Best Practices, SEO >= 90 (desktop)
- [ ] 404 page exists and matches design system
- [ ] Hosting/deployment configured on static-optimized platform
- [ ] Estimated monthly operating cost stays below `$25`
