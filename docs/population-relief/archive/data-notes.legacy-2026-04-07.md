# Population Relief Data Notes

## Source data

### Population density field
- Source: WorldPop Population Density 1 km ArcGIS ImageServer
- Service URL: `https://worldpop.arcgis.com/arcgis/rest/services/WorldPop_Population_Density_1km/ImageServer?f=pjson`
- Year used: 2020
- Runtime export used by preprocessing: ArcGIS `exportImage` request against the same service

## Preprocessing flow

1. Request a moderate-resolution TIFF export from the WorldPop density service for a U.S.-covering bounding box.
2. Read the numeric TIFF values at build time.
3. Reproject the source raster into the page’s U.S. Albers world space by sampling a fixed render grid.
4. Apply `log1p` compression and normalize to `[0, 1]`.
5. Derive local maxima from the same cached field.
6. Precompute:
   - U.S. nation SVG path
   - state-border mesh SVG path
7. Emit a single JSON field asset.

## Output contract

The phase-1 asset is shaped by [`app/src/lib/population-relief/contracts.ts`](/Users/josiahchamberlain/Projects/website/app/src/lib/population-relief/contracts.ts).

Top-level fields include:
- `id`, `label`, `subject`, `year`
- `renderGeometry`
- `sources`
- `stats`
- `field`
- `peaks`
- `annotations`
- `highlights`

The field includes:
- projected grid `width`
- projected grid `height`
- normalized field `values`

## Build command

Run:

```bash
cd app
npm run population-relief:build-data
```

This regenerates:

- [`app/public/data/population-relief/human-us-phase1.json`](/Users/josiahchamberlain/Projects/website/app/public/data/population-relief/human-us-phase1.json)

## Why this raster-style field

- The field carries the structure directly instead of relying on synthetic point expansion in the browser.
- Build-time reprojection keeps runtime light.
- Log compression preserves low-density texture without letting the largest metros flatten the rest of the map.

## Known data caveats

- This is still a moderate-resolution website field, not a full scientific raster viewer.
- The export is sampled into a projected web grid, so fine local variation is intentionally smoothed.
- Alaska and Hawaii are repositioned through the U.S. Albers projection used by the page.
