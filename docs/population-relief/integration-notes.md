# Population Relief Integration Notes

Date: April 7, 2026

## Active implementation

The active feature has been reset to phases 1 and 2 only:

- data validation
- plain 2D density rendering

There is no active 3D renderer in the current route.

## File ownership

- page entry: `app/src/pages/population-relief.astro`
- active client component: `app/src/components/population-relief/PopulationReliefExperience.tsx`
- active styling: `app/src/components/population-relief/population-relief.css`
- active data contract: `app/src/lib/population-relief/contracts.ts`
- active data loader: `app/src/lib/population-relief/load-layer.ts`
- active preprocessing script: `app/scripts/population-relief/build-phase1-dataset.mjs`

## Archived implementation

Legacy files were copied into archive folders on April 7, 2026 and should be treated as reference-only unless explicitly revived:

- `app/src/components/population-relief/archive/`
- `app/src/lib/population-relief/archive/`
- `app/scripts/population-relief/archive/`
- `docs/population-relief/archive/`

## Runtime behavior

The page currently:

- loads one static JSON dataset
- renders a flat color-coded density field on a canvas
- uses nearest-neighbor display of the projected grid
- optionally overlays the projected cell grid and state borders

The page intentionally does not:

- create 3D geometry
- smooth the field in the browser
- derive peaks or accents
- attempt final editorial styling

## Next gate

Before phase 3 starts, the 2D map should be reviewed for:

- plausible U.S. regional structure
- plausible metro concentration
- absence of obvious projection or clipping mistakes
- acceptable projected display resolution for debugging
