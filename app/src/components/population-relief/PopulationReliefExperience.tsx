import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from 'react';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import './population-relief.css';
import { HUMAN_POPULATION_LAYER_MANIFEST } from '../../data/population-relief/manifest';
import type { PopulationLayerDataset } from '../../lib/population-relief/contracts';
import { loadHumanPopulationLayer } from '../../lib/population-relief/load-layer';

interface CanvasSize {
  width: number;
  height: number;
}

interface ViewState {
  zoom: number;
  panX: number;
  panY: number;
}

interface SceneBundle {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  baseTiles: THREE.InstancedMesh;
  fieldMesh: THREE.InstancedMesh;
  topCapMesh: THREE.InstancedMesh;
  groundPlane: THREE.Mesh;
  nationOutline: THREE.Group;
  stateBorders: THREE.Group;
}

interface PopulationReliefExperienceProps {
  initialLayer?: PopulationLayerDataset | null;
}

const INITIAL_VIEW: ViewState = {
  zoom: 1.28,
  panX: 0,
  panY: 0,
};

const MIN_VISIBLE_NORMALIZED = 0.085;
const MIN_VISIBLE_HEIGHT = 0.015;
const MIN_TILE_NORMALIZED = 0.01;
const GROUND_Z = -0.12;
const OUTLINE_Z = 0.12;
const STATE_BORDER_Z = 0.1;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatInteger(value: number) {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

function formatDecimal(value: number, digits = 2) {
  return value.toFixed(digits);
}

function heatmapColor(value: number) {
  const displayValue = Math.pow(clamp(value, 0, 1), 0.62);
  const stops = [
    { t: 0, color: [70, 86, 130] },
    { t: 0.18, color: [86, 116, 176] },
    { t: 0.38, color: [92, 150, 210] },
    { t: 0.56, color: [86, 184, 176] },
    { t: 0.74, color: [172, 211, 115] },
    { t: 0.88, color: [248, 219, 115] },
    { t: 1, color: [236, 119, 74] },
  ] as const;

  for (let index = 1; index < stops.length; index += 1) {
    const previous = stops[index - 1];
    const next = stops[index];
    if (displayValue <= next.t) {
      const progress = clamp((displayValue - previous.t) / (next.t - previous.t), 0, 1);
      return new THREE.Color(
        (previous.color[0] + (next.color[0] - previous.color[0]) * progress) / 255,
        (previous.color[1] + (next.color[1] - previous.color[1]) * progress) / 255,
        (previous.color[2] + (next.color[2] - previous.color[2]) * progress) / 255,
      );
    }
  }

  return new THREE.Color(236 / 255, 119 / 255, 74 / 255);
}

function scenePointFromWorld(layer: PopulationLayerDataset, x: number, y: number, z = 0) {
  return new THREE.Vector3(
    x - layer.renderGeometry.worldWidth / 2,
    layer.renderGeometry.worldHeight / 2 - y,
    z,
  );
}

function heightFromNormalizedDensity(normalized: number, heightGain: number) {
  if (normalized <= MIN_VISIBLE_NORMALIZED) return 0;

  const adjusted = (normalized - MIN_VISIBLE_NORMALIZED) / (1 - MIN_VISIBLE_NORMALIZED);
  return MIN_VISIBLE_HEIGHT + Math.pow(adjusted, 2.8) * heightGain;
}

function buildFieldMesh(layer: PopulationLayerDataset, heightGain: number) {
  let cellCount = 0;
  for (const value of layer.field.normalizedDensity) {
    if (value > MIN_VISIBLE_NORMALIZED) cellCount += 1;
  }

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({
    color: '#1a2233',
    toneMapped: false,
  });
  const mesh = new THREE.InstancedMesh(geometry, material, Math.max(cellCount, 1));
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  updateFieldMesh(mesh, layer, heightGain);
  return mesh;
}

function buildTopCapMesh(layer: PopulationLayerDataset, heightGain: number) {
  let cellCount = 0;
  for (const value of layer.field.normalizedDensity) {
    if (value > MIN_VISIBLE_NORMALIZED) cellCount += 1;
  }

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({
    vertexColors: true,
    toneMapped: false,
  });
  const mesh = new THREE.InstancedMesh(geometry, material, Math.max(cellCount, 1));
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  updateTopCapMesh(mesh, layer, heightGain);
  return mesh;
}

function buildBaseTileMesh(layer: PopulationLayerDataset) {
  let cellCount = 0;
  for (const value of layer.field.normalizedDensity) {
    if (value > MIN_TILE_NORMALIZED) cellCount += 1;
  }

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({
    vertexColors: true,
    toneMapped: false,
  });
  const mesh = new THREE.InstancedMesh(geometry, material, Math.max(cellCount, 1));
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  const position = new THREE.Vector3();
  const scale = new THREE.Vector3();
  let instanceIndex = 0;

  for (let row = 0; row < layer.field.height; row += 1) {
    for (let column = 0; column < layer.field.width; column += 1) {
      const index = row * layer.field.width + column;
      const normalized = layer.field.normalizedDensity[index] ?? 0;
      if (normalized <= MIN_TILE_NORMALIZED) continue;

      const worldX = (column + 0.5) * layer.field.cellWorldWidth;
      const worldY = (row + 0.5) * layer.field.cellWorldHeight;
      const point = scenePointFromWorld(layer, worldX, worldY, 0.008);

      position.set(point.x, point.y, point.z);
      scale.set(layer.field.cellWorldWidth * 0.98, layer.field.cellWorldHeight * 0.98, 0.016);
      matrix.compose(position, quaternion, scale);
      mesh.setMatrixAt(instanceIndex, matrix);
      mesh.setColorAt(instanceIndex, heatmapColor(normalized));
      instanceIndex += 1;
    }
  }

  mesh.count = instanceIndex;
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.computeBoundingBox();
  mesh.computeBoundingSphere();
  return mesh;
}

function updateFieldMesh(mesh: THREE.InstancedMesh, layer: PopulationLayerDataset, heightGain: number) {
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  const position = new THREE.Vector3();
  const scale = new THREE.Vector3();
  let instanceIndex = 0;

  for (let row = 0; row < layer.field.height; row += 1) {
    for (let column = 0; column < layer.field.width; column += 1) {
      const index = row * layer.field.width + column;
      const normalized = layer.field.normalizedDensity[index] ?? 0;
      if (normalized <= MIN_VISIBLE_NORMALIZED) continue;

      const height = heightFromNormalizedDensity(normalized, heightGain);
      const worldX = (column + 0.5) * layer.field.cellWorldWidth;
      const worldY = (row + 0.5) * layer.field.cellWorldHeight;
      const point = scenePointFromWorld(layer, worldX, worldY, height / 2);

      position.set(point.x, point.y, point.z);
      scale.set(layer.field.cellWorldWidth * 0.24, layer.field.cellWorldHeight * 0.24, height);
      matrix.compose(position, quaternion, scale);
      mesh.setMatrixAt(instanceIndex, matrix);
      instanceIndex += 1;
    }
  }

  mesh.count = instanceIndex;
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.computeBoundingBox();
  mesh.computeBoundingSphere();
}

function updateTopCapMesh(mesh: THREE.InstancedMesh, layer: PopulationLayerDataset, heightGain: number) {
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  const position = new THREE.Vector3();
  const scale = new THREE.Vector3();
  let instanceIndex = 0;

  for (let row = 0; row < layer.field.height; row += 1) {
    for (let column = 0; column < layer.field.width; column += 1) {
      const index = row * layer.field.width + column;
      const normalized = layer.field.normalizedDensity[index] ?? 0;
      if (normalized <= MIN_VISIBLE_NORMALIZED) continue;

      const height = heightFromNormalizedDensity(normalized, heightGain);
      const worldX = (column + 0.5) * layer.field.cellWorldWidth;
      const worldY = (row + 0.5) * layer.field.cellWorldHeight;
      const point = scenePointFromWorld(layer, worldX, worldY, height + 0.03);

      position.set(point.x, point.y, point.z);
      scale.set(layer.field.cellWorldWidth * 0.52, layer.field.cellWorldHeight * 0.52, 0.06);
      matrix.compose(position, quaternion, scale);
      mesh.setMatrixAt(instanceIndex, matrix);
      mesh.setColorAt(instanceIndex, heatmapColor(normalized));
      instanceIndex += 1;
    }
  }

  mesh.count = instanceIndex;
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.computeBoundingBox();
  mesh.computeBoundingSphere();
}

function buildGroundPlane(layer: PopulationLayerDataset) {
  const geometry = new THREE.PlaneGeometry(
    layer.renderGeometry.worldWidth * 1.02,
    layer.renderGeometry.worldHeight * 1.02,
  );
  const material = new THREE.MeshBasicMaterial({
    color: '#1f2940',
    transparent: true,
    opacity: 0.96,
    toneMapped: false,
  });
  const plane = new THREE.Mesh(geometry, material);
  plane.position.set(0, 0, GROUND_Z);
  return plane;
}

function buildPathGroup(
  pathData: string,
  layer: PopulationLayerDataset,
  color: string,
  opacity: number,
  zLift: number,
  depthTest = true,
) {
  const group = new THREE.Group();
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthTest,
    depthWrite: false,
  });
  const loader = new SVGLoader();
  const parsed = loader.parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${pathData}" /></svg>`);

  for (const path of parsed.paths) {
    for (const subPath of path.subPaths) {
      const points = subPath.getPoints();
      if (points.length < 2) continue;

      const positions: number[] = [];
      for (const point of points) {
        const scenePoint = scenePointFromWorld(layer, point.x, point.y, zLift);
        positions.push(scenePoint.x, scenePoint.y, scenePoint.z);
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      group.add(new THREE.Line(geometry, material));
    }
  }

  return group;
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

function configureCamera(bundle: SceneBundle, layer: PopulationLayerDataset, canvasSize: CanvasSize, view: ViewState) {
  const { camera } = bundle;
  camera.aspect = canvasSize.width / canvasSize.height;
  camera.fov = 30;
  camera.near = 1;
  camera.far = 5000;
  camera.updateProjectionMatrix();
  camera.up.set(0, 0, 1);

  const target = new THREE.Vector3(view.panX, -view.panY, 4);
  const yDistance = 60 / view.zoom;
  const zDistance = 1800 / view.zoom;
  camera.position.set(target.x, target.y - yDistance, target.z + zDistance);
  camera.lookAt(target);
}

export default function PopulationReliefExperience({ initialLayer = null }: PopulationReliefExperienceProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const sceneHostRef = useRef<HTMLDivElement | null>(null);
  const sceneBundleRef = useRef<SceneBundle | null>(null);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 1200, height: 760 });
  const [layer, setLayer] = useState<PopulationLayerDataset | null>(initialLayer);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showBorders, setShowBorders] = useState(true);
  const [heightGain, setHeightGain] = useState(14);
  const [view, setView] = useState<ViewState>(INITIAL_VIEW);

  const topCells = useMemo(() => layer?.debugSummary.topCells.slice(0, 8) ?? [], [layer]);
  const metroChecks = useMemo(() => layer?.debugSummary.metroChecks.slice(0, 8) ?? [], [layer]);
  const regionChecks = useMemo(() => layer?.debugSummary.regionChecks ?? [], [layer]);

  useEffect(() => {
    if (initialLayer) return;

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
  }, [initialLayer]);

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
    setLoadError(null);

    let renderer: THREE.WebGLRenderer | null = null;
    let baseTiles: THREE.InstancedMesh | null = null;
    let fieldMesh: THREE.InstancedMesh | null = null;
    let topCapMesh: THREE.InstancedMesh | null = null;
    let groundPlane: THREE.Mesh | null = null;
    let nationOutline: THREE.Group | null = null;
    let stateBorders: THREE.Group | null = null;

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setClearColor('#1a2436', 1);
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, 1, 5000);
      scene.background = new THREE.Color('#1a2436');

      scene.add(new THREE.AmbientLight('#f0e4c8', 0.32));
      const keyLight = new THREE.DirectionalLight('#fff2d1', 0.28);
      keyLight.position.set(-420, -960, 760);
      scene.add(keyLight);
      const fillLight = new THREE.DirectionalLight('#6d8aa5', 0.12);
      fillLight.position.set(560, 220, 360);
      scene.add(fillLight);

      groundPlane = buildGroundPlane(layer);
      scene.add(groundPlane);

      baseTiles = buildBaseTileMesh(layer);
      scene.add(baseTiles);

      fieldMesh = buildFieldMesh(layer, heightGain);
      scene.add(fieldMesh);
      topCapMesh = buildTopCapMesh(layer, heightGain);
      scene.add(topCapMesh);

      nationOutline = new THREE.Group();
      stateBorders = new THREE.Group();
      scene.add(nationOutline);
      scene.add(stateBorders);

      sceneBundleRef.current = { renderer, scene, camera, baseTiles, fieldMesh, topCapMesh, groundPlane, nationOutline, stateBorders };

      try {
        const nextNationOutline = buildPathGroup(layer.renderGeometry.nationPath, layer, '#f6efe0', 0.82, OUTLINE_Z, true);
        scene.remove(nationOutline);
        nationOutline = nextNationOutline;
        scene.add(nationOutline);

        const nextStateBorders = buildPathGroup(layer.renderGeometry.stateBorderPath, layer, '#d6c4a1', 0.26, STATE_BORDER_Z, true);
        scene.remove(stateBorders);
        stateBorders = nextStateBorders;
        scene.add(stateBorders);

        sceneBundleRef.current = { renderer, scene, camera, baseTiles, fieldMesh, topCapMesh, groundPlane, nationOutline, stateBorders };
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Failed to build border overlays.');
      }
    } catch (error) {
      sceneBundleRef.current = null;
      setLoadError(error instanceof Error ? error.message : 'Failed to initialize 3D scene.');
    }

    return () => {
      sceneBundleRef.current = null;
      renderer?.dispose();
      if (baseTiles) {
        baseTiles.geometry.dispose();
        if (Array.isArray(baseTiles.material)) {
          baseTiles.material.forEach((material) => material.dispose());
        } else {
          baseTiles.material.dispose();
        }
      }
      if (fieldMesh) {
        fieldMesh.geometry.dispose();
        if (Array.isArray(fieldMesh.material)) {
          fieldMesh.material.forEach((material) => material.dispose());
        } else {
          fieldMesh.material.dispose();
        }
      }
      if (topCapMesh) {
        topCapMesh.geometry.dispose();
        if (Array.isArray(topCapMesh.material)) {
          topCapMesh.material.forEach((material) => material.dispose());
        } else {
          topCapMesh.material.dispose();
        }
      }
      if (groundPlane) {
        groundPlane.geometry.dispose();
        if (Array.isArray(groundPlane.material)) {
          groundPlane.material.forEach((material) => material.dispose());
        } else {
          groundPlane.material.dispose();
        }
      }
      if (nationOutline) disposeGroup(nationOutline);
      if (stateBorders) disposeGroup(stateBorders);
      while (host.firstChild) host.removeChild(host.firstChild);
    };
  }, [heightGain, layer]);

  useEffect(() => {
    const bundle = sceneBundleRef.current;
    if (!bundle || !layer) return;

    bundle.renderer.setSize(canvasSize.width, canvasSize.height, false);
    bundle.stateBorders.visible = showBorders;
    updateFieldMesh(bundle.fieldMesh, layer, heightGain);
    updateTopCapMesh(bundle.topCapMesh, layer, heightGain);
    configureCamera(bundle, layer, canvasSize, view);
    bundle.renderer.render(bundle.scene, bundle.camera);
  }, [canvasSize, heightGain, layer, showBorders, view]);

  function updateZoom(nextZoom: number) {
    setView((current) => ({
      ...current,
      zoom: clamp(nextZoom, 0.9, 3.2),
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
          <p className="population-relief__eyebrow">Phase 3 Prototype</p>
          <h1>3D Density Blocks</h1>
        </div>
        <p className="population-relief__intro">
          This pass keeps the same display grid and the same color scale, but turns each nonzero display cell into a literal 3D block with height proportional to its normalized density.
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
          <span>Display Grid</span>
          <strong>{layer ? `${layer.field.width} × ${layer.field.height}` : 'Loading…'}</strong>
        </div>
      </div>

      <div className="population-relief__layout">
        <div className="population-relief__stage-card">
          <div className="population-relief__stage-head">
            <div>
              <p className="population-relief__stage-kicker">Phase 3</p>
              <h2>Same cells, now stepped into 3D</h2>
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
            {!layer && <div className="population-relief__status">Loading validation dataset…</div>}
            {loadError && <div className="population-relief__status population-relief__status--error">{loadError}</div>}
          </div>

          <div className="population-relief__legend">
            <span>Color Scale</span>
            <div className="population-relief__gradient" />
            <p>Colors are unchanged from the 2D view: `log1p(density)` normalized to the display grid.</p>
            <p>Height is currently proportional to the same normalized field. We can tune the height-gain ratio from here.</p>
          </div>
        </div>

        <aside className="population-relief__sidebar">
          <section className="population-relief__panel">
            <p className="population-relief__panel-kicker">Controls</p>
            <label>
              <span>Height gain</span>
              <input
                type="range"
                min="6"
                max="40"
                step="1"
                value={heightGain}
                onChange={(event) => setHeightGain(Number(event.target.value))}
              />
            </label>
            <label className="population-relief__toggle">
              <input type="checkbox" checked={showBorders} onChange={(event) => setShowBorders(event.target.checked)} />
              <span>State borders</span>
            </label>
            <p>Drag to pan the view. Use the wheel or buttons to zoom.</p>
          </section>

          <section className="population-relief__panel">
            <p className="population-relief__panel-kicker">Prototype Notes</p>
            <p>
              This is intentionally literal: one projected display cell equals one 3D box. No smoothing or extra relief shaping has been added on top yet.
            </p>
            <p>
              The current goal is just to tune the height-to-density ratio until the block field reads clearly.
            </p>
          </section>

          <section className="population-relief__panel">
            <p className="population-relief__panel-kicker">Top Metro Samples</p>
            <ul>
              {metroChecks.map((metro) => (
                <li key={metro.id}>
                  <strong>{metro.label}</strong>
                  <span>{formatInteger(metro.rawDensity)} /km²</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="population-relief__panel">
            <p className="population-relief__panel-kicker">Top Display Cells</p>
            <ul>
              {topCells.map((cell) => (
                <li key={`${cell.row}-${cell.column}`}>
                  <strong>#{cell.rank}</strong>
                  <span>{formatInteger(cell.rawDensity)} /km² at {formatDecimal(cell.latitude, 2)}°, {formatDecimal(cell.longitude, 2)}°</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="population-relief__panel">
            <p className="population-relief__panel-kicker">Regional Checks</p>
            <ul>
              {regionChecks.map((region) => (
                <li key={region.id}>
                  <strong>{region.label}</strong>
                  <span>mean {formatInteger(region.meanDensity)} /km², p90 {formatInteger(region.p90Density)} /km²</span>
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
                Raw density range: median {formatInteger(layer.stats.p50Density)} /km², p90 {formatInteger(layer.stats.p90Density)} /km², max {formatInteger(layer.stats.maxDensity)} /km²
              </p>
            )}
          </section>
        </aside>
      </div>
    </section>
  );
}
