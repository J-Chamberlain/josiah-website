import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { geoAlbersUsa, geoContains, geoPath } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import { fromArrayBuffer } from 'geotiff';
import usAtlas from 'us-atlas/states-10m.json' with { type: 'json' };

const WORLDPOP_SERVICE_URL = 'https://worldpop.arcgis.com/arcgis/rest/services/WorldPop_Population_Density_1km/ImageServer';
const WORLDPOP_CITATION_URL = `${WORLDPOP_SERVICE_URL}?f=pjson`;
const WORLDPOP_EXPORT_BBOX = {
  xmin: -179,
  ymin: 15,
  xmax: -65,
  ymax: 73,
};
const WORLDPOP_EXPORT_SIZE = {
  width: 1536,
  height: 768,
};
const WORLDPOP_TIME = '1577836800000,1577836800000';

const WORLD_WIDTH = 1000;
const WORLD_HEIGHT = 620;
const FIELD_WIDTH = 180;
const FIELD_HEIGHT = 112;
const CELL_AGGREGATION_STEPS = 2;

const METRO_CHECKS = [
  { id: 'nyc', label: 'New York City', latitude: 40.7128, longitude: -74.006 },
  { id: 'los-angeles', label: 'Los Angeles', latitude: 34.0522, longitude: -118.2437 },
  { id: 'chicago', label: 'Chicago', latitude: 41.8781, longitude: -87.6298 },
  { id: 'houston', label: 'Houston', latitude: 29.7604, longitude: -95.3698 },
  { id: 'dallas', label: 'Dallas', latitude: 32.7767, longitude: -96.797 },
  { id: 'miami', label: 'Miami', latitude: 25.7617, longitude: -80.1918 },
  { id: 'atlanta', label: 'Atlanta', latitude: 33.749, longitude: -84.388 },
  { id: 'phoenix', label: 'Phoenix', latitude: 33.4484, longitude: -112.074 },
  { id: 'seattle', label: 'Seattle', latitude: 47.6062, longitude: -122.3321 },
  { id: 'bay-area', label: 'Bay Area', latitude: 37.7749, longitude: -122.4194 },
  { id: 'washington-dc', label: 'Washington, DC', latitude: 38.9072, longitude: -77.0369 },
];

const REGION_CHECKS = [
  { id: 'northeast-corridor', label: 'Northeast corridor', west: -78.5, south: 38, east: -70.2, north: 42.9 },
  { id: 'southern-california', label: 'Southern California', west: -119.8, south: 32.2, east: -116.4, north: 35.2 },
  { id: 'great-lakes', label: 'Great Lakes / Chicago', west: -93.5, south: 40.5, east: -81.5, north: 46.8 },
  { id: 'texas-triangle', label: 'Texas triangle', west: -99.6, south: 28.2, east: -94.2, north: 33.6 },
  { id: 'florida-peninsula', label: 'Florida peninsula', west: -83.8, south: 24.4, east: -80, north: 30.9 },
];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, '../../public/data/population-relief');
const outputPath = path.join(outputDir, 'human-us-phase1.json');

const atlas = usAtlas;
const nationFeature = feature(atlas, atlas.objects.nation);
const stateMesh = mesh(atlas, atlas.objects.states, (left, right) => left !== right);
const projection = geoAlbersUsa().fitSize([WORLD_WIDTH, WORLD_HEIGHT], nationFeature);
const pathBuilder = geoPath(projection);

function buildExportUrl() {
  const params = new URLSearchParams({
    bbox: `${WORLDPOP_EXPORT_BBOX.xmin},${WORLDPOP_EXPORT_BBOX.ymin},${WORLDPOP_EXPORT_BBOX.xmax},${WORLDPOP_EXPORT_BBOX.ymax}`,
    bboxSR: '4326',
    imageSR: '4326',
    size: `${WORLDPOP_EXPORT_SIZE.width},${WORLDPOP_EXPORT_SIZE.height}`,
    format: 'tiff',
    pixelType: 'F32',
    interpolation: 'RSP_NearestNeighbor',
    time: WORLDPOP_TIME,
    f: 'pjson',
  });

  return `${WORLDPOP_SERVICE_URL}/exportImage?${params.toString()}`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function percentile(values, percentileValue) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const index = (sorted.length - 1) * percentileValue;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

function round(value, digits = 6) {
  return Number(value.toFixed(digits));
}

function stripHtml(value) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function fetchWorldPopRaster() {
  const [serviceMeta, exportMeta] = await Promise.all([
    fetchJson(WORLDPOP_CITATION_URL),
    fetchJson(buildExportUrl()),
  ]);

  const rasterResponse = await fetch(exportMeta.href);
  if (!rasterResponse.ok) {
    throw new Error(`Failed to fetch raster ${exportMeta.href}: ${rasterResponse.status} ${rasterResponse.statusText}`);
  }

  const arrayBuffer = await rasterResponse.arrayBuffer();
  const tiff = await fromArrayBuffer(arrayBuffer);
  const image = await tiff.getImage();
  const raster = await image.readRasters({ interleave: true });

  return {
    raster,
    width: image.getWidth(),
    height: image.getHeight(),
    extent: exportMeta.extent,
    exportHref: exportMeta.href,
    exportExtent: exportMeta.extent,
    serviceMeta,
  };
}

function nearestSample(rasterInfo, longitude, latitude) {
  const { raster, width, height, extent } = rasterInfo;
  const x = Math.round(((longitude - extent.xmin) / (extent.xmax - extent.xmin)) * (width - 1));
  const y = Math.round(((extent.ymax - latitude) / (extent.ymax - extent.ymin)) * (height - 1));

  if (x < 0 || y < 0 || x >= width || y >= height) {
    return 0;
  }

  const value = raster[y * width + x];
  return Number.isFinite(value) && value < 1e20 ? value : 0;
}

function aggregateDisplayCell(rasterInfo, column, row) {
  const centerX = ((column + 0.5) / FIELD_WIDTH) * WORLD_WIDTH;
  const centerY = ((row + 0.5) / FIELD_HEIGHT) * WORLD_HEIGHT;
  const centerGeographic = projection.invert([centerX, centerY]);

  if (!centerGeographic || !geoContains(nationFeature, centerGeographic)) {
    return {
      density: 0,
      geographic: null,
    };
  }

  const samples = [];
  const representativeGeographic = centerGeographic;

  samples.push(nearestSample(rasterInfo, centerGeographic[0], centerGeographic[1]));

  for (let sampleRow = 0; sampleRow < CELL_AGGREGATION_STEPS; sampleRow += 1) {
    for (let sampleColumn = 0; sampleColumn < CELL_AGGREGATION_STEPS; sampleColumn += 1) {
      const x = ((column + (sampleColumn + 0.5) / CELL_AGGREGATION_STEPS) / FIELD_WIDTH) * WORLD_WIDTH;
      const y = ((row + (sampleRow + 0.5) / CELL_AGGREGATION_STEPS) / FIELD_HEIGHT) * WORLD_HEIGHT;
      const geographic = projection.invert([x, y]);
      if (!geographic || !geoContains(nationFeature, geographic)) continue;

      samples.push(nearestSample(rasterInfo, geographic[0], geographic[1]));
    }
  }

  if (samples.length === 0) {
    return {
      density: 0,
      geographic: null,
    };
  }

  const sorted = samples.sort((left, right) => left - right);
  const max = sorted[sorted.length - 1];

  return {
    density: max,
    geographic: representativeGeographic,
  };
}

function buildProjectedField(rasterInfo) {
  const rawDensity = [];
  const logDensity = [];
  const cellCenters = [];

  for (let row = 0; row < FIELD_HEIGHT; row += 1) {
    for (let column = 0; column < FIELD_WIDTH; column += 1) {
      const aggregate = aggregateDisplayCell(rasterInfo, column, row);

      if (!aggregate.geographic) {
        cellCenters.push(null);
        rawDensity.push(0);
        logDensity.push(0);
        continue;
      }

      const [longitude, latitude] = aggregate.geographic;
      cellCenters.push([longitude, latitude]);
      const density = aggregate.density;
      rawDensity.push(density);
      logDensity.push(Math.log1p(density));
    }
  }

  const maxLogDensity = logDensity.reduce((max, value) => Math.max(max, value), 0);
  const normalizedDensity = logDensity.map((value) => (maxLogDensity > 0 ? round(value / maxLogDensity) : 0));

  return {
    cellCenters,
    rawDensity,
    logDensity: logDensity.map((value) => round(value)),
    normalizedDensity,
  };
}

function getCellCenter(column, row) {
  const x = ((column + 0.5) / FIELD_WIDTH) * WORLD_WIDTH;
  const y = ((row + 0.5) / FIELD_HEIGHT) * WORLD_HEIGHT;
  return { x, y };
}

function summarizeTopCells(field) {
  const cells = [];

  for (let row = 0; row < FIELD_HEIGHT; row += 1) {
    for (let column = 0; column < FIELD_WIDTH; column += 1) {
      const index = row * FIELD_WIDTH + column;
      const rawDensity = field.rawDensity[index];
      if (rawDensity <= 0) continue;

      const geographic = field.cellCenters[index];
      if (!geographic) continue;

      cells.push({
        row,
        column,
        longitude: round(geographic[0], 4),
        latitude: round(geographic[1], 4),
        rawDensity: round(rawDensity, 3),
        logDensity: field.logDensity[index],
        normalizedDensity: field.normalizedDensity[index],
      });
    }
  }

  return cells
    .sort((left, right) => right.rawDensity - left.rawDensity)
    .slice(0, 12)
    .map((cell, index) => ({
      rank: index + 1,
      ...cell,
    }));
}

function sampleProjectedFieldAt(fieldValues, x, y) {
  const column = clamp(Math.floor((x / WORLD_WIDTH) * FIELD_WIDTH), 0, FIELD_WIDTH - 1);
  const row = clamp(Math.floor((y / WORLD_HEIGHT) * FIELD_HEIGHT), 0, FIELD_HEIGHT - 1);
  return { row, column, value: fieldValues[row * FIELD_WIDTH + column] ?? 0 };
}

function buildMetroChecks(field, rasterInfo) {
  const maxLogDensity = Math.max(...field.logDensity);

  return METRO_CHECKS.map((metro) => {
    const raw = nearestSample(rasterInfo, metro.longitude, metro.latitude);
    const log = Math.log1p(raw);
    const normalized = maxLogDensity > 0 ? Math.min(1, log / maxLogDensity) : 0;

    return {
      id: metro.id,
      label: metro.label,
      longitude: metro.longitude,
      latitude: metro.latitude,
      rawDensity: round(raw, 3),
      logDensity: round(log),
      normalizedDensity: round(normalized),
    };
  }).sort((left, right) => right.rawDensity - left.rawDensity);
}

function buildRegionChecks(field) {
  return REGION_CHECKS.map((region) => {
    const densities = [];

    for (let row = 0; row < FIELD_HEIGHT; row += 1) {
      for (let column = 0; column < FIELD_WIDTH; column += 1) {
        const geographic = field.cellCenters[row * FIELD_WIDTH + column];
        if (!geographic) continue;

        const [longitude, latitude] = geographic;
        if (
          longitude < region.west ||
          longitude > region.east ||
          latitude < region.south ||
          latitude > region.north
        ) {
          continue;
        }

        densities.push(field.rawDensity[row * FIELD_WIDTH + column] ?? 0);
      }
    }

    const positiveDensities = densities.filter((value) => value > 0);
    return {
      id: region.id,
      label: region.label,
      bbox: {
        west: region.west,
        south: region.south,
        east: region.east,
        north: region.north,
      },
      sampleCount: densities.length,
      meanDensity: round(
        positiveDensities.length > 0
          ? positiveDensities.reduce((sum, value) => sum + value, 0) / positiveDensities.length
          : 0,
        3,
      ),
      p90Density: round(percentile(positiveDensities, 0.9), 3),
      maxDensity: round(positiveDensities.reduce((max, value) => Math.max(max, value), 0), 3),
    };
  });
}

function buildValidationNotes(metroChecks, regionChecks, topCells) {
  const topMetros = metroChecks.slice(0, 4).map((metro) => `${metro.label} (${round(metro.rawDensity, 0)} /km²)`);
  const northeast = regionChecks.find((region) => region.id === 'northeast-corridor');
  const southernCalifornia = regionChecks.find((region) => region.id === 'southern-california');
  const greatLakes = regionChecks.find((region) => region.id === 'great-lakes');
  const texas = regionChecks.find((region) => region.id === 'texas-triangle');
  const florida = regionChecks.find((region) => region.id === 'florida-peninsula');

  return [
    `Top sampled metro source values are ${topMetros.join(', ')}.`,
    northeast && southernCalifornia
      ? northeast.meanDensity >= southernCalifornia.meanDensity
          ? `The Northeast corridor region average density (${round(northeast.meanDensity, 0)} /km²) is above Southern California (${round(southernCalifornia.meanDensity, 0)} /km²).`
          : `Southern California's regional average density (${round(southernCalifornia.meanDensity, 0)} /km²) is above the Northeast corridor (${round(northeast.meanDensity, 0)} /km²), so that contrast should be reviewed visually in phase 2.`
      : 'Regional comparison unavailable.',
    greatLakes && texas && florida
      ? `Great Lakes / Chicago, Texas triangle, and Florida peninsula all register strong regional signals with mean densities of ${round(greatLakes.meanDensity, 0)}, ${round(texas.meanDensity, 0)}, and ${round(florida.meanDensity, 0)} /km² respectively.`
      : 'Regional mean checks unavailable.',
    topCells.length > 0
      ? `The single highest projected display cell is centered near ${topCells[0].latitude}°, ${topCells[0].longitude}° with raw density ${round(topCells[0].rawDensity, 0)} /km².`
      : 'Top-cell check unavailable.',
  ];
}

async function main() {
  const rasterInfo = await fetchWorldPopRaster();
  const field = buildProjectedField(rasterInfo);
  const validDensityValues = field.rawDensity.filter((value) => value > 0);
  const topCells = summarizeTopCells(field);
  const metroChecks = buildMetroChecks(field, rasterInfo);
  const regionChecks = buildRegionChecks(field);

  const dataset = {
    id: 'human-us-phase1-validation',
    version: 'worldpop-density-validation-v2',
    phase: 'phase1-2',
    label: 'United States Population Density Validation Map',
    geography: 'usa',
    subject: 'Human population density',
    year: 2020,
    units: 'Raw density in persons per square kilometer, plus log1p and normalized debug fields',
    description: 'Validation-first U.S. population density dataset built from the WorldPop 2020 1 km density image service, resampled into a projected display grid without smoothing.',
    renderGeometry: {
      worldWidth: WORLD_WIDTH,
      worldHeight: WORLD_HEIGHT,
      nationPath: pathBuilder(nationFeature),
      stateBorderPath: pathBuilder(stateMesh),
    },
    sourceMetadata: {
      serviceName: rasterInfo.serviceMeta.name,
      serviceDataType: rasterInfo.serviceMeta.serviceDataType,
      pixelType: rasterInfo.serviceMeta.pixelType,
      bandCount: rasterInfo.serviceMeta.bandCount,
      nativePixelSizeDegrees: {
        x: round(rasterInfo.serviceMeta.pixelSizeX, 10),
        y: round(rasterInfo.serviceMeta.pixelSizeY, 10),
      },
      nominalResolutionLabel: '30 arc-second geographic raster marketed as 1 km population density',
      valueMeaning: 'Each source pixel is a single-band floating-point population density estimate in persons per square kilometer.',
      extent: {
        xmin: round(rasterInfo.serviceMeta.extent.xmin, 6),
        ymin: round(rasterInfo.serviceMeta.extent.ymin, 6),
        xmax: round(rasterInfo.serviceMeta.extent.xmax, 6),
        ymax: round(rasterInfo.serviceMeta.extent.ymax, 6),
        wkid: rasterInfo.serviceMeta.extent.spatialReference.wkid,
      },
      timeExtent: {
        start: new Date(rasterInfo.serviceMeta.timeInfo.timeExtent[0]).toISOString(),
        end: new Date(rasterInfo.serviceMeta.timeInfo.timeExtent[1]).toISOString(),
      },
      exportWindow: {
        ...WORLDPOP_EXPORT_BBOX,
        ...WORLDPOP_EXPORT_SIZE,
      },
      serviceDescription: stripHtml(rasterInfo.serviceMeta.description ?? ''),
    },
    sources: [
      {
        label: 'WorldPop Population Density 1 km ImageServer metadata',
        url: WORLDPOP_CITATION_URL,
      },
      {
        label: 'WorldPop export window used for preprocessing',
        url: rasterInfo.exportHref,
      },
    ],
    stats: {
      gridCellCount: FIELD_WIDTH * FIELD_HEIGHT,
      validCellCount: validDensityValues.length,
      maxDensity: round(Math.max(...validDensityValues), 3),
      meanDensity: round(validDensityValues.reduce((sum, value) => sum + value, 0) / validDensityValues.length, 3),
      p50Density: round(percentile(validDensityValues, 0.5), 3),
      p90Density: round(percentile(validDensityValues, 0.9), 3),
      p99Density: round(percentile(validDensityValues, 0.99), 3),
      generatedAt: new Date().toISOString(),
    },
    field: {
      width: FIELD_WIDTH,
      height: FIELD_HEIGHT,
      cellWorldWidth: round(WORLD_WIDTH / FIELD_WIDTH, 6),
      cellWorldHeight: round(WORLD_HEIGHT / FIELD_HEIGHT, 6),
      rawDensity: field.rawDensity.map((value) => round(value, 3)),
      logDensity: field.logDensity,
      normalizedDensity: field.normalizedDensity,
    },
    debugSummary: {
      topCells,
      metroChecks,
      regionChecks,
      validationNotes: buildValidationNotes(metroChecks, regionChecks, topCells),
    },
  };

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(dataset, null, 2)}\n`);
  console.log(`Wrote validation-first dataset to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
