# Site Issues — Review Log

Tested: 2026-04-05
Environment: Local dev (http://127.0.0.1:4321)

---

## 🔴 Functional / Visual Bugs

### 1. Raw ISO date on essay pages
**File:** `src/components/ReadingMeta.astro`
The `publishedAt` field is output directly — displays as "2026-02-18" instead of a formatted date like "February 18, 2026". Needs `toLocaleDateString()` or equivalent.

### 2. Drop cap fires on wrong pages (About, Subscribe, Privacy)
**File:** `src/styles/prose.css`
The amber drop cap rule (`.prose > p:first-of-type:not(:only-child)::first-letter`) applies to all pages using `ProseLayout`, not just essays. Creates an awkward decorative initial on utility/placeholder pages.

### 3. Blank space below footer on short pages
**File:** `src/styles/base.css`
On 404, About, and Subscribe pages, a beige gap appears below the dark footer. `.site-canvas` uses `min-height: 100dvh` but the layout doesn't use `display: flex; flex-direction: column` + `flex: 1` on `<main>` to push the footer to the bottom.

### 4. COBDR card missing image on Projects page
**File:** `src/lib/editorial.ts`
The COBDR item in `PROJECT_ITEMS` has no `imageSrc`. History Explorer and Exploring Kashmir both have images — COBDR renders as text-only in the grid, looking incomplete.

### 5. Essays page shows wrong title: "Conjuring Olmsted" vs "Digital Pastoralism"
**File:** `src/lib/editorial.ts`
The editorial manifest hardcodes `title: 'Conjuring Olmsted'` for the featured essay, but the Sanity CMS entry is titled "Digital Pastoralism". The Essays page shows the wrong title; clicking through leads to the correct one.

---

## 🟡 Layout / Visual Issues

### 6. Dead space on right side of Kashmir and COBDR pages
The map + sidebar don't fill the full shell width at wider viewports, leaving a visible beige gap on the far right.

### 7. Excessive vertical whitespace in home page hero transition
**File:** `src/pages/index.astro`
`.home-hero` has `padding-bottom: 48px` and `.featured-essay` has `padding-top: 64px`, creating ~112px of combined whitespace between the hero text and the first essay card. Feels empty when scrolling.

### 8. `home-intro__body` CSS class is undefined
**File:** `src/pages/index.astro` (line 136)
The subscribe section intro paragraph uses `class="home-intro__body"` but this class is never defined anywhere in the CSS. Dead/orphaned markup.

---

## 🟠 Content / Placeholder Issues

### 9. Site title still includes "(Preview)"
**File:** `src/lib/site.ts`
`siteTitle: 'Personal Studio (Preview)'` — visible in browser tab, header brand, and OG tags sitewide.

### 10. Footer shows placeholder text
**File:** `src/lib/site.ts`
`footerBlurb: 'Preview content in progress.'` — shows in the footer copyright line.

### 11. About page shows placeholder text
**File:** `src/lib/site.ts`
`aboutIntro` and `aboutCanonicalNote` both contain placeholder strings. Page has no real content.

### 12. Subscribe page intro shows placeholder text
**File:** `src/lib/site.ts`
`subscribeIntro: 'This subscription section is under development for preview.'`
