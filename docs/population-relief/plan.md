# Population Relief Reset Plan

Date: April 7, 2026

## Reset decision

The previous `population-relief` implementation has been archived and is no longer the active direction.

Archived copies were saved on April 7, 2026 under:

- `app/src/components/population-relief/archive/`
- `app/src/lib/population-relief/archive/`
- `app/scripts/population-relief/archive/`
- `docs/population-relief/archive/`

## New sequence

### Phase 1: data validation

Goal:

- verify the source is actually raster population density
- document what each value represents
- confirm whether broad U.S. patterns look plausible before styling

Status:

- implemented

Outputs:

- validation-first dataset at `app/public/data/population-relief/human-us-phase1.json`
- source metadata, top-cell summary, metro checks, and regional checks

### Phase 2: plain 2D map

Goal:

- render a minimal flat density map
- keep the map color-coded and easy to inspect
- avoid 3D, smoothing theatrics, glow, spikes, and relief effects

Status:

- implemented

Outputs:

- page route: `app/src/pages/population-relief.astro`
- client view: `app/src/components/population-relief/PopulationReliefExperience.tsx`

### Phase 3: stepped 3D debug mode

Goal:

- render discrete height blocks only after the 2D map is validated

Status:

- intentionally deferred

### Phase 4: final stylized relief

Goal:

- pursue stylized relief only after phases 1-3 are accepted

Status:

- intentionally deferred

## Working assumptions

- Source dataset: WorldPop Population Density 1 km ImageServer, 2020 slice.
- Native source unit: single-band floating-point raster cell, population density in persons per square kilometer.
- Display grid for the website is a projected validation grid, not one polygon per native 1 km source pixel.
- The current page is optimized for correctness inspection, not final presentation quality.

## Run commands

From `app/`:

```bash
npm run population-relief:build-data
npm run dev
```
