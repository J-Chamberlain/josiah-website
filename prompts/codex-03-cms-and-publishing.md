# Codex Prompt 03 - CMS And Publishing

Integrate Sanity CMS and connect content rendering.

## Build
- Add Sanity studio setup and schemas:
  - essay, project, ideaOutline, gallery, tag, siteSettings
- Add Astro data client and GROQ queries
- Render content detail pages by type using slugs
- Add `visibility` model with `public|unlisted`
- Implement a typed `siteSettings` schema with nav/footer/OG defaults

## Modeling Clarifications
- `essay`: polished long-form publication
- `ideaOutline`: exploratory, shorter draft-like structure with `stage` + `openQuestions`
- `gallery` doc: standalone gallery page only
- project gallery sections: embedded media blocks internal to a project page

## Rules
- Unlisted content excluded from listing pages/search/feed/sitemap
- Unlisted pages render `noindex,nofollow`
- Keep schema and query code simple and typed where possible

## Deliverables
- Schema files
- Data query utilities
- Dynamic page routes wired to CMS content
- Env vars required for local/dev/prod
