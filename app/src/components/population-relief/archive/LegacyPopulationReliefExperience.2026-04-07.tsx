import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from 'react';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import './population-relief.css';
import { HUMAN_POPULATION_LAYER_MANIFEST } from '../../data/population-relief/manifest';
import type { PopulationLayerDataset } from '../../lib/population-relief/contracts';
import { loadHumanPopulationLayer } from '../../lib/population-relief/load-layer';

interface ViewState {
  zoom: number;
  panX: number;
  panY: number;
}

interface CanvasSize {
  width: number;
  height: number;
}

type RenderMode = 'relief' | 'grid' | 'heatmap';

interface SceneBundle {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  baseLand: THREE.Group;
  reliefObject: THREE.Object3D;
  reliefMode: RenderMode;
  stateBorders: THREE.Group;
  nationOutline: THREE.Group;
  peaks: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial>;
}

const INITIAL_VIEW: ViewState = {
  zoom: 1,
  panX: 0,
  panY: 0,
};

const BASE_LAND_DROP = 10;
const RELIEF_LAYER_OFFSET = 18;
const MAX_RELIEF_HEIGHT = 72;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  if (inMax === inMin) return outMin;
  const progress = clamp((value - inMin) / (inMax - inMin), 0, 1);
  return outMin + (outMax - outMin) * progress;
}

function formatInteger(value: number) {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

function scenePointFromWorld(layer: PopulationLayerDataset, x: number, y: number, z = 0) {
  return new THREE.Vector3(
    x - layer.renderGeometry.worldWidth / 2,
    layer.renderGeometry.worldHeight / 2 - y,
    z,
  );
}

function sampleFieldValue(layer: PopulationLayerDataset, x: number, y: number) {
  return sampleGridValue(
    layer.field.values,
    layer.field.width,
    layer.field.height,
    layer.renderGeometry.worldWidth,
    layer.renderGeometry.worldHeight,
    x,
    y,
  );
}

function sampleNearestGridValue(
  values: ArrayLike<number>,
  fieldWidth: number,
  fieldHeight: number,
  worldWidth: number,
  worldHeight: number,
  x: number,
  y: number,
) {
  const clampedX = clamp(x, 0, worldWidth);
  const clampedY = clamp(y, 0, worldHeight);
  const gridX = Math.round((clampedX / worldWidth) * (fieldWidth - 1));
  const gridY = Math.round((clampedY / worldHeight) * (fieldHeight - 1));
  return values[gridY * fieldWidth + gridX] ?? 0;
}

function sampleGridValue(
  values: ArrayLike<number>,
  fieldWidth: number,
  fieldHeight: number,
  worldWidth: number,
  worldHeight: number,
  x: number,
  y: number,
) {
  const clampedX = clamp(x, 0, worldWidth);
  const clampedY = clamp(y, 0, worldHeight);
  const gridX = (clampedX / worldWidth) * (fieldWidth - 1);
  const gridY = (clampedY / worldHeight) * (fieldHeight - 1);
  const x0 = Math.floor(gridX);
  const y0 = Math.floor(gridY);
  const x1 = Math.min(fieldWidth - 1, x0 + 1);
  const y1 = Math.min(fieldHeight - 1, y0 + 1);
  const tx = gridX - x0;
  const ty = gridY - y0;
  const sample = (sampleX: number, sampleY: number) => values[sampleY * fieldWidth + sampleX] ?? 0;
  const top = sample(x0, y0) * (1 - tx) + sample(x1, y0) * tx;
  const bottom = sample(x0, y1) * (1 - tx) + sample(x1, y1) * tx;
  return top * (1 - ty) + bottom * ty;
}

function heightFromFieldValue(value: number) {
  const baseLift = Math.pow(value, 0.8) * 20;
  const midRise = Math.pow(value, 1.18) * 26;
  const peakLift = Math.pow(value, 2.1) * 18;
  return Math.min(MAX_RELIEF_HEIGHT, baseLift + midRise + peakLift);
}

function baseHeightFromFieldValue(value: number) {
  return 1.5 + Math.pow(value, 0.72) * 7;
}

function blurField(values: ArrayLike<number>, width: number, height: number, radius: number) {
  if (radius <= 0) return Float32Array.from(values);

  const horizontal = new Float32Array(width * height);
  const blurred = new Float32Array(width * height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let total = 0;
      let count = 0;
      for (let offset = -radius; offset <= radius; offset += 1) {
        const sampleX = clamp(x + offset, 0, width - 1);
        total += values[y * width + sampleX] ?? 0;
        count += 1;
      }
      horizontal[y * width + x] = total / count;
    }
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let total = 0;
      let count = 0;
      for (let offset = -radius; offset <= radius; offset += 1) {
        const sampleY = clamp(y + offset, 0, height - 1);
        total += horizontal[sampleY * width + x] ?? 0;
        count += 1;
      }
      blurred[y * width + x] = total / count;
    }
  }

  return blurred;
}

function buildFieldTexture(layer: PopulationLayerDataset, fieldValues: ArrayLike<number>, peakGain: number) {
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = layer.field.width;
  colorCanvas.height = layer.field.height;
  const colorContext = colorCanvas.getContext('2d');
  if (!colorContext) {
    throw new Error('Failed to create field texture context');
  }

  const image = colorContext.createImageData(layer.field.width, layer.field.height);
  const peakBanding = mapRange(peakGain, 0.4, 1.05, 0, 12);
  for (let index = 0; index < fieldValues.length; index += 1) {
    const value = fieldValues[index];
    const base = Math.pow(value, 0.78);
    const band = Math.floor(clamp(value * 4.6, 0, 4));
    const bandOffset = [0, 8, 18, 30, 44][band] + Math.pow(clamp((value - 0.58) / 0.42, 0, 1), 1.45) * peakBanding;
    const pixel = index * 4;
    image.data[pixel] = Math.round(22 + base * 68 + bandOffset);
    image.data[pixel + 1] = Math.round(25 + base * 58 + bandOffset * 0.72);
    image.data[pixel + 2] = Math.round(31 + base * 38 + bandOffset * 0.4);
    image.data[pixel + 3] = 255;
  }
  colorContext.putImageData(image, 0, 0);

  const colorTexture = new THREE.CanvasTexture(colorCanvas);
  colorTexture.colorSpace = THREE.SRGBColorSpace;
  colorTexture.minFilter = THREE.LinearFilter;
  colorTexture.magFilter = THREE.LinearFilter;
  colorTexture.generateMipmaps = false;

  return colorTexture;
}

function buildFieldMaskTexture(layer: PopulationLayerDataset) {
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = 1024;
  maskCanvas.height = 640;
  const maskContext = maskCanvas.getContext('2d');
  if (!maskContext) {
    throw new Error('Failed to create mask texture context');
  }

  maskContext.fillStyle = '#000';
  maskContext.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
  maskContext.save();
  maskContext.scale(
    maskCanvas.width / layer.renderGeometry.worldWidth,
    maskCanvas.height / layer.renderGeometry.worldHeight,
  );
  maskContext.fillStyle = '#fff';
  maskContext.fill(new Path2D(layer.renderGeometry.nationPath));
  maskContext.restore();

  const alphaTexture = new THREE.CanvasTexture(maskCanvas);
  alphaTexture.minFilter = THREE.LinearFilter;
  alphaTexture.magFilter = THREE.LinearFilter;
  alphaTexture.generateMipmaps = false;

  return alphaTexture;
}

function heatmapColorFromValue(value: number) {
  const stops = [
    { t: 0, color: [22, 25, 38] },
    { t: 0.16, color: [32, 55, 94] },
    { t: 0.34, color: [42, 104, 140] },
    { t: 0.52, color: [55, 158, 142] },
    { t: 0.7, color: [145, 191, 92] },
    { t: 0.84, color: [244, 208, 92] },
    { t: 1, color: [227, 96, 62] },
  ] as const;

  for (let index = 1; index < stops.length; index += 1) {
    const previous = stops[index - 1];
    const next = stops[index];
    if (value <= next.t) {
      const local = clamp((value - previous.t) / (next.t - previous.t), 0, 1);
      return new THREE.Color(
        (previous.color[0] + (next.color[0] - previous.color[0]) * local) / 255,
        (previous.color[1] + (next.color[1] - previous.color[1]) * local) / 255,
        (previous.color[2] + (next.color[2] - previous.color[2]) * local) / 255,
      );
    }
  }

  return new THREE.Color(227 / 255, 96 / 255, 62 / 255);
}

function buildHeatmapTexture(layer: PopulationLayerDataset, fieldValues: ArrayLike<number>) {
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = layer.field.width;
  colorCanvas.height = layer.field.height;
  const colorContext = colorCanvas.getContext('2d');
  if (!colorContext) {
    throw new Error('Failed to create heatmap texture context');
  }

  const image = colorContext.createImageData(layer.field.width, layer.field.height);
  for (let index = 0; index < fieldValues.length; index += 1) {
    const value = clamp(fieldValues[index], 0, 1);
    const color = heatmapColorFromValue(value);
    const pixel = index * 4;
    image.data[pixel] = Math.round(color.r * 255);
    image.data[pixel + 1] = Math.round(color.g * 255);
    image.data[pixel + 2] = Math.round(color.b * 255);
    image.data[pixel + 3] = 255;
  }
  colorContext.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(colorCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  return texture;
}

function buildHeightMesh(layer: PopulationLayerDataset, fieldValues: ArrayLike<number>, peakGain: number) {
  const geometry = new THREE.PlaneGeometry(
    layer.renderGeometry.worldWidth,
    layer.renderGeometry.worldHeight,
    layer.field.width - 1,
    layer.field.height - 1,
  );

  const positions = geometry.attributes.position as THREE.BufferAttribute;
  for (let index = 0; index < fieldValues.length; index += 1) {
    positions.setZ(index, heightFromFieldValue(fieldValues[index]));
  }
  geometry.computeVertexNormals();

  const colorTexture = buildFieldTexture(layer, fieldValues, peakGain);
  const alphaTexture = buildFieldMaskTexture(layer);
  const material = new THREE.MeshStandardMaterial({
    map: colorTexture,
    alphaMap: alphaTexture,
    transparent: true,
    roughness: 0.92,
    metalness: 0,
    side: THREE.FrontSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = RELIEF_LAYER_OFFSET;
  return mesh;
}

function buildFlatHeatmap(layer: PopulationLayerDataset, fieldValues: ArrayLike<number>) {
  const geometry = new THREE.PlaneGeometry(layer.renderGeometry.worldWidth, layer.renderGeometry.worldHeight, 1, 1);
  const material = new THREE.MeshStandardMaterial({
    map: buildHeatmapTexture(layer, fieldValues),
    alphaMap: buildFieldMaskTexture(layer),
    transparent: true,
    roughness: 0.96,
    metalness: 0,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = RELIEF_LAYER_OFFSET + 2;
  return mesh;
}

function fieldColorFromValue(value: number, peakGain: number) {
  const peakBanding = mapRange(peakGain, 0.4, 1.05, 0, 12);
  const base = Math.pow(value, 0.78);
  const band = Math.floor(clamp(value * 4.6, 0, 4));
  const bandOffset = [0, 8, 18, 30, 44][band] + Math.pow(clamp((value - 0.58) / 0.42, 0, 1), 1.45) * peakBanding;
  return new THREE.Color(
    (22 + base * 68 + bandOffset) / 255,
    (25 + base * 58 + bandOffset * 0.72) / 255,
    (31 + base * 38 + bandOffset * 0.4) / 255,
  );
}

function buildDebugReliefBlocks(layer: PopulationLayerDataset, fieldValues: ArrayLike<number>, peakGain: number, surfaceGain: number) {
  const cellWidth = layer.renderGeometry.worldWidth / layer.field.width;
  const cellHeight = layer.renderGeometry.worldHeight / layer.field.height;
  let cellCount = 0;

  for (let index = 0; index < fieldValues.length; index += 1) {
    if (fieldValues[index] > 0.0001) cellCount += 1;
  }

  const geometry = new THREE.BoxGeometry(cellWidth * 0.98, cellHeight * 0.98, 1);
  const material = new THREE.MeshStandardMaterial({
    color: '#9b8d72',
    roughness: 0.9,
    metalness: 0,
  });
  const mesh = new THREE.InstancedMesh(geometry, material, Math.max(cellCount, 1));
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  updateDebugReliefBlocks(mesh, layer, fieldValues, peakGain, surfaceGain);
  return mesh;
}

function updateDebugReliefBlocks(
  mesh: THREE.InstancedMesh,
  layer: PopulationLayerDataset,
  fieldValues: ArrayLike<number>,
  peakGain: number,
  surfaceGain: number,
) {
  const cellWidth = layer.renderGeometry.worldWidth / layer.field.width;
  const cellHeight = layer.renderGeometry.worldHeight / layer.field.height;
  const reliefScale = mapRange(surfaceGain, 0.7, 1.2, 0.35, 1.85);
  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const scale = new THREE.Vector3(cellWidth * 0.98, cellHeight * 0.98, 1);
  const quaternion = new THREE.Quaternion();
  let instanceIndex = 0;

  for (let row = 0; row < layer.field.height; row += 1) {
    for (let col = 0; col < layer.field.width; col += 1) {
      const value = fieldValues[row * layer.field.width + col] ?? 0;
      if (value <= 0.0001) continue;

      const blockHeight = Math.max(0.8, heightFromFieldValue(value) * reliefScale);
      const worldX = (col + 0.5) * cellWidth;
      const worldY = (row + 0.5) * cellHeight;
      const scenePoint = scenePointFromWorld(layer, worldX, worldY, RELIEF_LAYER_OFFSET + blockHeight / 2);

      position.set(scenePoint.x, scenePoint.y, scenePoint.z);
      scale.set(cellWidth * 0.98, cellHeight * 0.98, blockHeight);
      matrix.compose(position, quaternion, scale);
      mesh.setMatrixAt(instanceIndex, matrix);
      mesh.setColorAt(instanceIndex, fieldColorFromValue(value, peakGain));
      instanceIndex += 1;
    }
  }

  mesh.count = instanceIndex;
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
}

function buildBaseLandBody(layer: PopulationLayerDataset) {
  const loader = new SVGLoader();
  const parsed = loader.parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${layer.renderGeometry.nationPath}" /></svg>`);
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: '#26292d',
    roughness: 1,
    metalness: 0,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
  });

  for (const path of parsed.paths) {
    const shapes = SVGLoader.createShapes(path);

    for (const shape of shapes) {
      const geometry = new THREE.ShapeGeometry(shape, 5);
      geometry.scale(1, -1, 1);
      geometry.translate(-layer.renderGeometry.worldWidth / 2, layer.renderGeometry.worldHeight / 2, 0);

      const positions = geometry.attributes.position as THREE.BufferAttribute;
      for (let index = 0; index < positions.count; index += 1) {
        const worldX = positions.getX(index) + layer.renderGeometry.worldWidth / 2;
        const worldY = layer.renderGeometry.worldHeight / 2 - positions.getY(index);
        const fieldValue = sampleFieldValue(layer, worldX, worldY);
        positions.setZ(index, baseHeightFromFieldValue(fieldValue));
      }

      geometry.computeVertexNormals();
      group.add(new THREE.Mesh(geometry, material));
    }
  }

  group.position.z = RELIEF_LAYER_OFFSET - BASE_LAND_DROP;
  return group;
}

function buildPathGroup(
  pathData: string,
  layer: PopulationLayerDataset,
  fieldValues: ArrayLike<number>,
  color: string,
  opacity: number,
  lift: number,
  mode: RenderMode,
) {
  const group = new THREE.Group();
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
  });
  const loader = new SVGLoader();
  const parsed = loader.parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${pathData}" /></svg>`);

  for (const path of parsed.paths) {
    for (const subPath of path.subPaths) {
      const points = subPath.getPoints();
      if (points.length < 2) continue;

      const positions: number[] = [];
      for (const point of points) {
        const fieldValue = mode === 'grid'
          ? sampleNearestGridValue(
              fieldValues,
              layer.field.width,
              layer.field.height,
              layer.renderGeometry.worldWidth,
              layer.renderGeometry.worldHeight,
              point.x,
              point.y,
            )
          : sampleGridValue(
              fieldValues,
              layer.field.width,
              layer.field.height,
              layer.renderGeometry.worldWidth,
              layer.renderGeometry.worldHeight,
              point.x,
              point.y,
            );
        const fieldHeight = mode === 'heatmap'
          ? RELIEF_LAYER_OFFSET + 2
          : RELIEF_LAYER_OFFSET + heightFromFieldValue(fieldValue);
        const scenePoint = scenePointFromWorld(layer, point.x, point.y, fieldHeight + lift);
        positions.push(scenePoint.x, scenePoint.y, scenePoint.z);
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      group.add(new THREE.Line(geometry, material));
    }
  }

  return group;
}

function buildPeakGeometry(layer: PopulationLayerDataset, fieldValues: ArrayLike<number>, spikeGain: number) {
  const positions: number[] = [];

  const minimumPeakValue = mapRange(spikeGain, 0.4, 1.05, 0.76, 0.52);
  for (const peak of layer.peaks) {
    const peakValue = sampleGridValue(
      fieldValues,
      layer.field.width,
      layer.field.height,
      layer.renderGeometry.worldWidth,
      layer.renderGeometry.worldHeight,
      peak.x,
      peak.y,
    );
    if (peakValue < minimumPeakValue) continue;

    const baseHeight = RELIEF_LAYER_OFFSET + heightFromFieldValue(peakValue);
    const accentHeight = mapRange(spikeGain, 0.4, 1.05, 2.5, 15.5) * Math.pow(clamp(peakValue, 0, 1), 1.2);
    const start = scenePointFromWorld(layer, peak.x, peak.y, baseHeight + 2);
    const end = scenePointFromWorld(layer, peak.x, peak.y, baseHeight + accentHeight);
    positions.push(start.x, start.y, start.z, end.x, end.y, end.z);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

function disposeGroup(group: THREE.Group) {
  group.traverse((child) => {
    if (child instanceof THREE.Line) {
      child.geometry.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach((material) => material.dispose());
      } else {
        child.material.dispose();
      }
    }
  });
}

function disposeObject3D(object: THREE.Object3D) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh || child instanceof THREE.InstancedMesh) {
      child.geometry.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach((material) => material.dispose());
      } else {
        if ('map' in child.material && child.material.map) child.material.map.dispose();
        if ('alphaMap' in child.material && child.material.alphaMap) child.material.alphaMap.dispose();
        child.material.dispose();
      }
    }
  });
}

function configureCamera(bundle: SceneBundle, layer: PopulationLayerDataset, canvasSize: CanvasSize, view: ViewState) {
  const { camera } = bundle;
  camera.aspect = canvasSize.width / canvasSize.height;
  camera.fov = 36;
  camera.near = 1;
  camera.far = 4000;
  camera.updateProjectionMatrix();
  camera.up.set(0, 0, 1);

  const target = new THREE.Vector3(view.panX, -view.panY, 28);
  const distance = 920 / view.zoom;
  camera.position.set(target.x, target.y - distance, 340 + 260 / view.zoom);
  camera.lookAt(target);
}

export default function PopulationReliefExperience() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const sceneHostRef = useRef<HTMLDivElement | null>(null);
  const sceneBundleRef = useRef<SceneBundle | null>(null);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 1200, height: 760 });
  const [layer, setLayer] = useState<PopulationLayerDataset | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [view, setView] = useState<ViewState>(INITIAL_VIEW);
  const [surfaceGain, setSurfaceGain] = useState(0.94);
  const [spikeGain, setSpikeGain] = useState(0.82);
  const [softness, setSoftness] = useState(0.74);
  const [renderMode, setRenderMode] = useState<RenderMode>('relief');
  const [showBorders, setShowBorders] = useState(true);

  const topHighlights = useMemo(() => layer?.highlights ?? [], [layer]);
  const fieldVariants = useMemo(() => {
    if (!layer) return null;
    const original = Float32Array.from(layer.field.values);
    const medium = blurField(original, layer.field.width, layer.field.height, 2);
    const broad = blurField(original, layer.field.width, layer.field.height, 5);
    return { original, medium, broad };
  }, [layer]);

  const activeFieldValues = useMemo(() => {
    if (!layer || !fieldVariants) return null;
    if (renderMode !== 'relief') return fieldVariants.original;

    const softnessMix = clamp((softness - 0.55) / 0.5, 0, 1);
    const crispWeight = 0.82 - softnessMix * 0.58;
    const mediumWeight = 0.14 + softnessMix * 0.16;
    const broadWeight = 0.04 + softnessMix * 0.42;
    const weightSum = crispWeight + mediumWeight + broadWeight;
    const peakTerrainBoost = mapRange(spikeGain, 0.4, 1.05, 0, 0.16);
    const values = new Float32Array(fieldVariants.original.length);

    for (let index = 0; index < values.length; index += 1) {
      const blended = (
        fieldVariants.original[index] * crispWeight
        + fieldVariants.medium[index] * mediumWeight
        + fieldVariants.broad[index] * broadWeight
      ) / weightSum;
      const upperTail = Math.pow(clamp((blended - 0.54) / 0.46, 0, 1), 1.55) * peakTerrainBoost;
      values[index] = clamp(blended + upperTail, 0, 1);
    }

    return values;
  }, [fieldVariants, layer, renderMode, softness, spikeGain]);

  useEffect(() => {
    let cancelled = false;

    loadHumanPopulationLayer()
      .then((nextLayer) => {
        if (!cancelled) setLayer(nextLayer);
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : 'Failed to load data.');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const width = Math.max(320, Math.floor(entry.contentRect.width));
      const height = width < 760 ? Math.floor(width * 0.82) : Math.floor(width * 0.6);
      setCanvasSize({ width, height });
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const host = sceneHostRef.current;
    if (!host || !layer) return;

    while (host.firstChild) host.removeChild(host.firstChild);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 1, 4000);

    scene.add(new THREE.AmbientLight('#d0c4ae', 0.85));
    const directionalLight = new THREE.DirectionalLight('#fff0cf', 1.35);
    directionalLight.position.set(-420, -780, 620);
    scene.add(directionalLight);
    const rimLight = new THREE.DirectionalLight('#6f7b89', 0.4);
    rimLight.position.set(540, 260, 420);
    scene.add(rimLight);

    const baseLand = buildBaseLandBody(layer);
    scene.add(baseLand);

    const initialField = activeFieldValues ?? layer.field.values;
    const reliefMode = renderMode;
    const reliefObject = reliefMode === 'grid'
      ? buildDebugReliefBlocks(layer, initialField, spikeGain, surfaceGain)
      : reliefMode === 'heatmap'
          ? buildFlatHeatmap(layer, initialField)
          : buildHeightMesh(layer, initialField, spikeGain);
    scene.add(reliefObject);

    const nationOutline = buildPathGroup(layer.renderGeometry.nationPath, layer, initialField, '#f5efe6', 0.5, 3, reliefMode);
    scene.add(nationOutline);

    const stateBorders = buildPathGroup(layer.renderGeometry.stateBorderPath, layer, initialField, '#d8c6a4', 0.16, 2.5, reliefMode);
    scene.add(stateBorders);

    const peaks = new THREE.LineSegments(
      buildPeakGeometry(layer, initialField, spikeGain),
      new THREE.LineBasicMaterial({
        color: '#f3dfb4',
        transparent: true,
        opacity: 0.22,
      }),
    );
    scene.add(peaks);

    sceneBundleRef.current = { renderer, scene, camera, baseLand, reliefObject, reliefMode, stateBorders, nationOutline, peaks };

    return () => {
      sceneBundleRef.current = null;
      renderer.dispose();
      disposeGroup(nationOutline);
      disposeGroup(stateBorders);
      baseLand.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      disposeObject3D(reliefObject);
      peaks.geometry.dispose();
      peaks.material.dispose();
      while (host.firstChild) host.removeChild(host.firstChild);
    };
  }, [activeFieldValues, layer, renderMode, spikeGain, surfaceGain]);

  useEffect(() => {
    const bundle = sceneBundleRef.current;
    if (!bundle || !layer || !activeFieldValues) return;

    bundle.renderer.setSize(canvasSize.width, canvasSize.height, false);
    bundle.stateBorders.visible = showBorders;
    if (bundle.reliefMode === 'grid' && bundle.reliefObject instanceof THREE.InstancedMesh) {
      updateDebugReliefBlocks(bundle.reliefObject, layer, activeFieldValues, spikeGain, surfaceGain);
      if (!Array.isArray(bundle.reliefObject.material)) {
        bundle.reliefObject.material.roughness = 0.9;
        bundle.reliefObject.material.needsUpdate = true;
      }
    } else if (bundle.reliefMode === 'heatmap' && bundle.reliefObject instanceof THREE.Mesh) {
      bundle.reliefObject.material.map?.dispose();
      bundle.reliefObject.material.map = buildHeatmapTexture(layer, activeFieldValues);
      bundle.reliefObject.material.needsUpdate = true;
    } else if (bundle.reliefObject instanceof THREE.Mesh) {
      bundle.reliefObject.material.roughness = mapRange(softness, 0.55, 1.05, 0.78, 0.95);
      bundle.reliefObject.material.map?.dispose();
      bundle.reliefObject.material.map = buildFieldTexture(layer, activeFieldValues, spikeGain);
      bundle.reliefObject.material.needsUpdate = true;
      const reliefScale = mapRange(surfaceGain, 0.7, 1.2, 0.45, 1.55);
      const reliefPositions = bundle.reliefObject.geometry.attributes.position as THREE.BufferAttribute;
      for (let index = 0; index < activeFieldValues.length; index += 1) {
        reliefPositions.setZ(index, heightFromFieldValue(activeFieldValues[index]) * reliefScale);
      }
      reliefPositions.needsUpdate = true;
      bundle.reliefObject.geometry.computeVertexNormals();
    }
    bundle.baseLand.visible = bundle.reliefMode !== 'heatmap';
    bundle.baseLand.scale.z = 1;
    bundle.peaks.material.opacity = mapRange(spikeGain, 0.4, 1.05, 0.05, 0.32);
    bundle.peaks.visible = bundle.reliefMode === 'relief' && spikeGain > 0.02;
    bundle.peaks.geometry.dispose();
    bundle.peaks.geometry = buildPeakGeometry(layer, activeFieldValues, spikeGain);

    bundle.scene.remove(bundle.nationOutline);
    disposeGroup(bundle.nationOutline);
    bundle.nationOutline = buildPathGroup(layer.renderGeometry.nationPath, layer, activeFieldValues, '#f5efe6', 0.5, 3, bundle.reliefMode);
    bundle.scene.add(bundle.nationOutline);

    bundle.scene.remove(bundle.stateBorders);
    disposeGroup(bundle.stateBorders);
    bundle.stateBorders = buildPathGroup(layer.renderGeometry.stateBorderPath, layer, activeFieldValues, '#d8c6a4', 0.16, 2.5, bundle.reliefMode);
    bundle.stateBorders.visible = showBorders;
    bundle.scene.add(bundle.stateBorders);

    configureCamera(bundle, layer, canvasSize, view);
    bundle.renderer.render(bundle.scene, bundle.camera);
  }, [activeFieldValues, canvasSize, layer, renderMode, showBorders, softness, spikeGain, surfaceGain, view]);

  function updateZoom(nextZoom: number) {
    setView((current) => ({
      ...current,
      zoom: clamp(nextZoom, 0.85, 3.2),
    }));
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    const startX = event.clientX;
    const startY = event.clientY;
    const startView = view;

    const handleMove = (moveEvent: PointerEvent) => {
      const panScaleX = layer ? layer.renderGeometry.worldWidth / Math.max(canvasSize.width, 1) / view.zoom : 1;
      const panScaleY = layer ? layer.renderGeometry.worldHeight / Math.max(canvasSize.height, 1) / view.zoom : 1;
      setView({
        ...startView,
        panX: startView.panX - (moveEvent.clientX - startX) * panScaleX,
        panY: startView.panY - (moveEvent.clientY - startY) * panScaleY,
      });
    };

    const handleUp = () => {
      target.removeEventListener('pointermove', handleMove);
      target.removeEventListener('pointerup', handleUp);
      target.removeEventListener('pointercancel', handleUp);
    };

    target.addEventListener('pointermove', handleMove);
    target.addEventListener('pointerup', handleUp);
    target.addEventListener('pointercancel', handleUp);
  }

  function handleWheel(event: ReactWheelEvent<HTMLDivElement>) {
    event.preventDefault();
    updateZoom(view.zoom * (event.deltaY < 0 ? 1.1 : 0.92));
  }

  return (
    <section className="population-relief">
      <div className="population-relief__hero">
        <div>
          <p className="population-relief__eyebrow">Interactive Population Study</p>
          <h1>Population Relief</h1>
        </div>
        <p className="population-relief__intro">
          A phase-1 U.S. population relief rendered from a precomputed gridded density field as a true oblique height surface, with restrained lighting and subtle maxima derived from the same field.
        </p>
      </div>

      <div className="population-relief__meta">
        <div>
          <span>Geography</span>
          <strong>United States</strong>
        </div>
        <div>
          <span>Subject</span>
          <strong>Population density</strong>
        </div>
        <div>
          <span>Vintage</span>
          <strong>{HUMAN_POPULATION_LAYER_MANIFEST.year}</strong>
        </div>
        <div>
          <span>Field</span>
          <strong>{layer ? `${layer.field.width} × ${layer.field.height}` : 'Loading…'}</strong>
        </div>
      </div>

      <div className="population-relief__layout">
        <div className="population-relief__stage-card">
          <div className="population-relief__stage-head">
            <div>
              <p className="population-relief__stage-kicker">Relief Surface</p>
              <h2>Explore the national pattern</h2>
            </div>
            <div className="population-relief__stage-actions">
              <button type="button" onClick={() => setView(INITIAL_VIEW)}>Reset view</button>
              <button type="button" onClick={() => updateZoom(view.zoom * 1.12)}>Zoom in</button>
              <button type="button" onClick={() => updateZoom(view.zoom * 0.9)}>Zoom out</button>
            </div>
          </div>

          <div className="population-relief__canvas-shell" ref={wrapperRef}>
            <div
              ref={sceneHostRef}
              className="population-relief__scene"
              onPointerDown={handlePointerDown}
              onWheel={handleWheel}
            />
            {!layer && <div className="population-relief__status">Loading phase-1 population field…</div>}
            {loadError && <div className="population-relief__status population-relief__status--error">{loadError}</div>}
          </div>

          <div className="population-relief__legend">
            <span>Relief</span>
            <p>Field-displaced surface with oblique lighting</p>
            <span>Accents</span>
            <p>Subtle maxima from the same density field</p>
          </div>
        </div>

        <aside className="population-relief__sidebar">
          <section className="population-relief__panel">
            <p className="population-relief__panel-kicker">Controls</p>
            <label>
              <span>Relief gain</span>
              <input type="range" min="0.7" max="1.2" step="0.01" value={surfaceGain} onChange={(event) => setSurfaceGain(Number(event.target.value))} />
            </label>
            <label>
              <span>Peak emphasis</span>
              <input type="range" min="0.4" max="1.05" step="0.01" value={spikeGain} onChange={(event) => setSpikeGain(Number(event.target.value))} />
            </label>
            <label>
              <span>Surface softness</span>
              <input type="range" min="0.55" max="1.05" step="0.01" value={softness} onChange={(event) => setSoftness(Number(event.target.value))} disabled={renderMode !== 'relief'} />
            </label>
            <label className="population-relief__toggle">
              <input type="checkbox" checked={renderMode === 'grid'} onChange={(event) => setRenderMode(event.target.checked ? 'grid' : 'relief')} />
              <span>Grid step debug</span>
            </label>
            <label className="population-relief__toggle">
              <input type="checkbox" checked={renderMode === 'heatmap'} onChange={(event) => setRenderMode(event.target.checked ? 'heatmap' : 'relief')} />
              <span>Heatmap debug</span>
            </label>
            <label className="population-relief__toggle">
              <input type="checkbox" checked={showBorders} onChange={(event) => setShowBorders(event.target.checked)} />
              <span>State borders</span>
            </label>
          </section>

          <section className="population-relief__panel">
            <p className="population-relief__panel-kicker">Reading Notes</p>
            <p>
              The raster field now drives an actual height surface. Broad structure should read through shape, viewpoint, and lighting before any maxima accents are noticed.
            </p>
            <p>
              Peak accents remain secondary and are sampled from the same field rather than imposed as separate dominant markers.
            </p>
            {renderMode === 'grid' && (
              <p>
                Grid step debug bypasses smoothing and renders each projected raster cell as a discrete height block.
              </p>
            )}
            {renderMode === 'heatmap' && (
              <p>
                Heatmap debug shows the projected raster directly as a flat nearest-neighbor color field so the working grid resolution is visible.
              </p>
            )}
          </section>

          <section className="population-relief__panel">
            <p className="population-relief__panel-kicker">Reference Cities</p>
            <ul>
              {topHighlights.map((highlight) => (
                <li key={highlight.id}>
                  <span>{highlight.label}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="population-relief__panel population-relief__panel--compact">
            <p className="population-relief__panel-kicker">Sources</p>
            <ul>
              {layer?.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noreferrer">{source.label}</a>
                </li>
              ))}
            </ul>
            {layer && (
              <p className="population-relief__statline">
                Max source density: {formatInteger(layer.stats.maxDensity)} per km²
              </p>
            )}
          </section>
        </aside>
      </div>
    </section>
  );
}
