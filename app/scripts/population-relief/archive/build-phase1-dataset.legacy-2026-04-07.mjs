import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { geoAlbersUsa, geoPath } from 'd3-geo';
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

const MANUAL_ANNOTATIONS = [
  { id: 'nyc', label: 'New York City', latitude: 40.7128, longitude: -74.006 },
  { id: 'los-angeles', label: 'Los Angeles', latitude: 34.0522, longitude: -118.2437 },
  { id: 'chicago', label: 'Chicago', latitude: 41.8781, longitude: -87.6298 },
  { id: 'houston', label: 'Houston', latitude: 29.7604, longitude: -95.3698 },
  { id: 'dallas', label: 'Dallas', latitude: 32.7767, longitude: -96.797 },
  { id: 'miami', label: 'Miami', latitude: 25.7617, longitude: -80.1918 },
  { id: 'atlanta', label: 'Atlanta', latitude: 33.749, longitude: -84.388 },
  { id: 'phoenix', label: 'Phoenix', latitude: 33.4484, longitude: -112.074 },
  { id: 'seattle', label: 'Seattle', latitude: 47.6062, longitude: -122.3321 },
  { id: 'bay-area', label: 'Bay Area', latitude: 37.3382, longitude: -121.8863 },
  { id: 'washington-dc', label: 'Washington, DC', latitude: 38.9072, longitude: -77.0369 },
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
    time: WORLDPOP_TIME,
    f: 'pjson',
  });

  return `${WORLDPOP_SERVICE_URL}/exportImage?${params.toString()}`;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function fetchWorldPopRaster() {
  const exportMeta = await fetchJson(buildExportUrl());
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
  };
}

function bilinearSample(rasterInfo, longitude, latitude) {
  const { raster, width, height, extent } = rasterInfo;
  const x = ((longitude - extent.xmin) / (extent.xmax - extent.xmin)) * (width - 1);
  const y = ((extent.ymax - latitude) / (extent.ymax - extent.ymin)) * (height - 1);

  if (x < 0 || y < 0 || x > width - 1 || y > height - 1) {
    return 0;
  }

  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.min(width - 1, x0 + 1);
  const y1 = Math.min(height - 1, y0 + 1);
  const tx = x - x0;
  const ty = y - y0;

  const sample = (sampleX, sampleY) => {
    const value = raster[sampleY * width + sampleX];
    return Number.isFinite(value) && value < 1e20 ? value : 0;
  };

  const top = sample(x0, y0) * (1 - tx) + sample(x1, y0) * tx;
  const bottom = sample(x0, y1) * (1 - tx) + sample(x1, y1) * tx;
  return top * (1 - ty) + bottom * ty;
}

function blurHorizontal(values, width, height, radius) {
  const output = new Float32Array(values.length);

  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
      let sum = 0;
      let weightSum = 0;

      for (let offset = -radius; offset <= radius; offset += 1) {
        const sampleColumn = column + offset;
        if (sampleColumn < 0 || sampleColumn >= width) continue;

        const weight = radius + 1 - Math.abs(offset);
        sum += values[row * width + sampleColumn] * weight;
        weightSum += weight;
      }

      output[row * width + column] = weightSum > 0 ? sum / weightSum : 0;
    }
  }

  return output;
}

function blurVertical(values, width, height, radius) {
  const output = new Float32Array(values.length);

  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
      let sum = 0;
      let weightSum = 0;

      for (let offset = -radius; offset <= radius; offset += 1) {
        const sampleRow = row + offset;
        if (sampleRow < 0 || sampleRow >= height) continue;

        const weight = radius + 1 - Math.abs(offset);
        sum += values[sampleRow * width + column] * weight;
        weightSum += weight;
      }

      output[row * width + column] = weightSum > 0 ? sum / weightSum : 0;
    }
  }

  return output;
}

function blurField(values, width, height, radius) {
  return blurVertical(blurHorizontal(values, width, height, radius), width, height, radius);
}

function buildField(rasterInfo) {
  const rawValues = [];

  for (let row = 0; row < FIELD_HEIGHT; row += 1) {
    for (let column = 0; column < FIELD_WIDTH; column += 1) {
      const x = (column / (FIELD_WIDTH - 1)) * WORLD_WIDTH;
      const y = (row / (FIELD_HEIGHT - 1)) * WORLD_HEIGHT;
      const geographic = projection.invert([x, y]);

      if (!geographic) {
        rawValues.push(0);
        continue;
      }

      const [longitude, latitude] = geographic;
      rawValues.push(bilinearSample(rasterInfo, longitude, latitude));
    }
  }

  const maxDensity = rawValues.reduce((max, value) => Math.max(max, value), 0);
  const compressed = Float32Array.from(rawValues.map((value) => Math.log1p(value)));
  const fineField = blurField(compressed, FIELD_WIDTH, FIELD_HEIGHT, 1);
  const mediumField = blurField(compressed, FIELD_WIDTH, FIELD_HEIGHT, 3);
  const regionalField = blurField(compressed, FIELD_WIDTH, FIELD_HEIGHT, 7);
  const blended = new Float32Array(compressed.length);
  let maxBlended = 0;

  for (let index = 0; index < blended.length; index += 1) {
    const value =
      fineField[index] * 0.22 +
      mediumField[index] * 0.46 +
      regionalField[index] * 0.32;
    blended[index] = value;
    if (value > maxBlended) maxBlended = value;
  }

  const normalizedValues = Array.from(blended, (value) => {
    const normalized = maxBlended > 0 ? value / maxBlended : 0;
    return Number(Math.pow(normalized, 0.9).toFixed(6));
  });

  return {
    rawValues,
    normalizedValues,
    maxDensity,
  };
}

function deriveFieldPeaks(fieldValues) {
  const peaks = [];

  for (let row = 1; row < FIELD_HEIGHT - 1; row += 1) {
    for (let column = 1; column < FIELD_WIDTH - 1; column += 1) {
      const index = row * FIELD_WIDTH + column;
      const value = fieldValues[index];
      if (value < 0.44) continue;

      let isPeak = true;
      for (let offsetY = -1; offsetY <= 1 && isPeak; offsetY += 1) {
        for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
          if (offsetX === 0 && offsetY === 0) continue;
          if (fieldValues[(row + offsetY) * FIELD_WIDTH + (column + offsetX)] > value) {
            isPeak = false;
            break;
          }
        }
      }

      if (isPeak) {
        peaks.push({
          x: Number(((column / (FIELD_WIDTH - 1)) * WORLD_WIDTH).toFixed(3)),
          y: Number(((row / (FIELD_HEIGHT - 1)) * WORLD_HEIGHT).toFixed(3)),
          value: Number(value.toFixed(6)),
        });
      }
    }
  }

  return peaks
    .sort((left, right) => right.value - left.value)
    .slice(0, 34);
}

function buildAnnotations(fieldValues) {
  return MANUAL_ANNOTATIONS.map((annotation) => {
    const projected = projection([annotation.longitude, annotation.latitude]);
    if (!projected) {
      throw new Error(`Annotation cannot be projected: ${annotation.id}`);
    }

    return {
      ...annotation,
      projectedX: Number(projected[0].toFixed(3)),
      projectedY: Number(projected[1].toFixed(3)),
    };
  });
}

function buildHighlights(annotations, fieldValues) {
  const nearestFieldValue = (projectedX, projectedY) => {
    const column = Math.round((projectedX / WORLD_WIDTH) * (FIELD_WIDTH - 1));
    const row = Math.round((projectedY / WORLD_HEIGHT) * (FIELD_HEIGHT - 1));
    return fieldValues[row * FIELD_WIDTH + column] ?? 0;
  };

  return annotations
    .map((annotation) => ({
      id: annotation.id,
      label: annotation.label,
      value: nearestFieldValue(annotation.projectedX, annotation.projectedY),
    }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 8)
    .map(({ id, label }) => ({ id, label }));
}

async function main() {
  const rasterInfo = await fetchWorldPopRaster();
  const field = buildField(rasterInfo);
  const annotations = buildAnnotations(field.normalizedValues);
  const dataset = {
    id: 'human-us-phase1',
    version: 'worldpop-density-grid-v1',
    label: 'United States Human Population',
    geography: 'usa',
    subject: 'Human population density',
    year: 2020,
    units: 'Log-normalized population density field',
    description: 'WorldPop 2020 1 km population density resampled at build time into a projected U.S. field for web rendering.',
    renderGeometry: {
      worldWidth: WORLD_WIDTH,
      worldHeight: WORLD_HEIGHT,
      nationPath: pathBuilder(nationFeature),
      stateBorderPath: pathBuilder(stateMesh),
    },
    sources: [
      {
        label: 'WorldPop Population Density 1 km ImageServer (2020)',
        url: WORLDPOP_CITATION_URL,
      },
      {
        label: 'WorldPop Population Density 1 km export used for preprocessing',
        url: buildExportUrl(),
      },
    ],
    stats: {
      gridCellCount: FIELD_WIDTH * FIELD_HEIGHT,
      validCellCount: field.rawValues.filter((value) => value > 0).length,
      maxDensity: Number(field.maxDensity.toFixed(3)),
      meanDensity: Number((field.rawValues.reduce((sum, value) => sum + value, 0) / (FIELD_WIDTH * FIELD_HEIGHT)).toFixed(3)),
      generatedAt: new Date().toISOString(),
    },
    field: {
      width: FIELD_WIDTH,
      height: FIELD_HEIGHT,
      values: field.normalizedValues,
    },
    peaks: deriveFieldPeaks(field.normalizedValues),
    annotations,
    highlights: buildHighlights(annotations, field.normalizedValues),
  };

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(dataset, null, 2)}\n`);
  console.log(`Wrote projected field asset to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
