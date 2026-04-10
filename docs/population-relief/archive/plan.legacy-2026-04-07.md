# Population Relief Phase 1 Plan

## Objective
Ship a self-contained Astro feature page that renders an interactive United States human-population visualization with a hybrid visual language:

- soft relief-style density surface
- sharper spike accents for major urban concentrations
- restrained explanatory UI
- architecture that can accept future non-human layers without a rewrite

## Ownership Split

### 1. Lead / architecture
- Define the layer contract in [`app/src/lib/population-relief/contracts.ts`](/Users/josiahchamberlain/Projects/website/app/src/lib/population-relief/contracts.ts).
- Keep the feature isolated under `population-relief/`.
- Decide the runtime boundary between preprocess, data asset, and client renderer.

### 2. Data pipeline
- Fetch a practical gridded U.S. population-density source.
- Resample it into the page’s projected U.S. world space at build time.
- Apply log-style compression before normalization.
- Emit a static field asset for browser consumption.

### 3. Visualization
- Render the U.S. silhouette on canvas.
- Render the cached field as the primary structure.
- Add restrained local-maxima accents derived from the same field.
- Support wheel zoom, drag pan, and reset.

### 4. Website integration
- Add [`app/src/pages/population-relief.astro`](/Users/josiahchamberlain/Projects/website/app/src/pages/population-relief.astro).
- Keep styling local to the feature component.
- Avoid unrelated nav, CMS, or global design refactors.

## Phase 1 Decisions

### Chosen data model
- Unit of analysis: projected density grid
- Coverage: 50 states plus DC
- Vintage: 2020 WorldPop density field
- Delivery format: static JSON at `/data/population-relief/human-us-phase1.json`

### Chosen rendering model
- 2D canvas, not WebGL
- Precomputed projected field texture plus subtle maxima
- Editorial approximation, not scientific raster cartography

## Why this shape
- A field-first asset carries broad settlement structure more clearly than county centroids.
- Preprocessed geometry and field values keep the client bundle small and runtime stable.
- The layer contract is generic enough for future species layers that can be expressed as projected fields.

## Known limitations
- The website field is still a resampled approximation of the source raster.
- Metro labels are intentionally sparse and editorial.
