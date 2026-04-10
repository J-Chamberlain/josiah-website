# Population Relief Data Notes

Date validated: April 7, 2026

## Source

- Source service: `https://worldpop.arcgis.com/arcgis/rest/services/WorldPop_Population_Density_1km/ImageServer?f=pjson`
- Service name: `WorldPop_Population_Density_1km`
- Service type: `esriImageServiceDataTypeScientific`
- Pixel type: `F32`
- Band count: `1`
- Native pixel size: `0.0083333333° x 0.0083333333°`
- Time extent exposed by the service: January 1, 2000 through January 1, 2020

## What each source value represents

The active working assumption, taken from the service name and description, is:

- each source pixel is a single floating-point population density estimate
- units are persons per square kilometer
- this is raster population density, not county counts or centroid values

## Website display grid

The website is not drawing one polygon per native source pixel across the full globe-facing service. Instead, preprocessing:

1. exports a U.S. window from the WorldPop service
2. samples that raster into a projected U.S. display grid
3. stores:
   - raw density
   - `log1p(raw density)`
   - normalized `log1p(raw density)`

Current display grid:

- width: `180`
- height: `112`
- total cells: `20,160`
- nonzero U.S. cells: `7,424`

## Current debug summary

### Distribution

- max projected display-cell density: `10,454.75 /km²`
- mean nonzero projected display-cell density: `60.078 /km²`
- p50: `1.568 /km²`
- p90: `55.875 /km²`
- p99: `1,488.476 /km²`

### Highest metro source samples

- New York City: `23,916.293 /km²`
- Miami: `9,916.455 /km²`
- Los Angeles: `5,905.765 /km²`
- Bay Area: `3,760.664 /km²`
- Chicago: `3,582.989 /km²`
- Houston: `2,539.259 /km²`

### Highest projected display cells

- rank 1: `42.3779°, -71.0228°` at `10,454.75 /km²`
- rank 2: `33.8053°, -118.2104°` at `6,821.558 /km²`
- rank 3: `34.0443°, -118.2802°` at `5,905.765 /km²`
- rank 4: `44.9803°, -93.2102°` at `5,190.879 /km²`

## Regional checks

These are bounding-box summaries over the projected display grid. They are useful debug signals, not authoritative regional statistics.

- Northeast corridor: mean `289.199 /km²`, p90 `820.396 /km²`, max `10,454.75 /km²`
- Southern California: mean `674.246 /km²`, p90 `1,604.356 /km²`, max `6,821.558 /km²`
- Great Lakes / Chicago: mean `82.13 /km²`, p90 `62.911 /km²`, max `5,190.879 /km²`
- Texas triangle: mean `91.34 /km²`, p90 `71.377 /km²`, max `4,163.574 /km²`
- Florida peninsula: mean `162.247 /km²`, p90 `475.462 /km²`, max `2,944.463 /km²`

## Important caution

The regional means are sensitive to the exact bounding boxes and to the fact that this is a projected display grid rather than a native raster summary. They are useful for plausibility checks, but the 2D map itself should be the primary validation tool before any 3D work resumes.
