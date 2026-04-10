# Population Relief Integration Notes

## Runtime structure

- Astro route shell: [`app/src/pages/population-relief.astro`](/Users/josiahchamberlain/Projects/website/app/src/pages/population-relief.astro)
- Client component: [`app/src/components/population-relief/PopulationReliefExperience.tsx`](/Users/josiahchamberlain/Projects/website/app/src/components/population-relief/PopulationReliefExperience.tsx)
- Loader: [`app/src/lib/population-relief/load-layer.ts`](/Users/josiahchamberlain/Projects/website/app/src/lib/population-relief/load-layer.ts)
- Manifest: [`app/src/data/population-relief/manifest.ts`](/Users/josiahchamberlain/Projects/website/app/src/data/population-relief/manifest.ts)

## Why the layer is fetched at runtime

The processed population field is intentionally served as a static JSON asset instead of being bundled into the page JavaScript. That keeps the page code light and ensures the browser only draws a cached field texture plus a small maxima list.

## Extension points

### Add another species layer

1. Produce another JSON asset that conforms to the same contract.
2. Add a manifest entry for the new layer.
3. Teach the loader or component to switch between manifests.

### Swap rendering style

- The current renderer is isolated to a single client component.
- A future WebGL renderer can reuse the same JSON asset and contract.

### Improve phase-1 fidelity

- Increase source export resolution before build-time reprojection.
- Replace the JSON field with an image texture plus metadata if asset size becomes a concern.
- Add label collision handling.

## Commands

```bash
cd app
npm run population-relief:build-data
npm run dev
```

Then open `/population-relief`.

## Notes on isolation

- No global layout or site-wide styling changes were required.
- No CMS schema changes were required.
- No unrelated routes were modified.
