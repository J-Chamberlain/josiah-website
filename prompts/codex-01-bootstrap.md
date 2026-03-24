# Codex Prompt 01 - Bootstrap

You are a senior full-stack engineer. Bootstrap the v1 project in `app/` using Astro + TypeScript with minimal dependencies.

## Objectives
- Initialize Astro project with clean structure
- Configure Astro static output: `output: "static"` with Vercel adapter server functions
- Create base routes: `/`, `/essays-projects`, `/about`, `/subscribe`, `/privacy`, `404`
- Add shared `BaseLayout` + global header/footer
- Add CSS tokens and base typography (warm editorial style)
- Configure sitemap + RSS generation
- Add baseline SEO helper for canonical and OG metadata

## Constraints
- Keep JS minimal and pages static by default (`export const prerender = true` for public pages)
- No heavy UI frameworks
- Use semantic HTML and accessible nav/focus states

## Deliverables
1. File tree summary
2. Installed dependencies
3. Commands to run dev/build
4. Brief explanation of layout/styling architecture
