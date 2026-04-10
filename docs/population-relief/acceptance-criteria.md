# Population Relief Reset Acceptance Criteria

Date: April 7, 2026

## Current acceptance target

The reset is considered successful when phases 1 and 2 are complete and phases 3 and 4 are explicitly left pending.

### Phase 1 acceptance

1. The source is documented as a raster dataset, not counties or points.
2. The source metadata records what each cell/value represents.
3. The preprocessing step emits a debug summary with:
   - top projected display cells
   - metro source samples
   - regional checks
4. Known assumptions and uncertainties are written down.

### Phase 2 acceptance

1. `/population-relief` renders a plain 2D density map.
2. The map uses the validated field directly, without 3D relief.
3. The displayed grid resolution is inspectable.
4. The page exposes enough debug context to judge whether the data looks plausible.

## Explicit non-goals for the reset

- no final relief styling yet
- no peak accents
- no oblique camera
- no mesh displacement
- no smoothing-first aesthetic work

## Evidence

- Active dataset: `app/public/data/population-relief/human-us-phase1.json`
- Active page: `app/src/pages/population-relief.astro`
- Active renderer: `app/src/components/population-relief/PopulationReliefExperience.tsx`
- Archived legacy implementation: `docs/population-relief/archive/`
