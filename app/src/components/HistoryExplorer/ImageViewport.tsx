import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { SelectionOverlay } from './SelectionOverlay';
import type { NarrativeMode, SelectionRect } from './selectionClassifier';
import { clamp, getModeLabel } from './selectionClassifier';

type ToolMode = 'pan' | 'select';

const MIN_ZOOM = 1;
const MAX_ZOOM = 6;
const BUTTON_ZOOM_STEP = 0.25;
const WHEEL_DELTA_LIMIT = 32;
const TRACKPAD_WHEEL_THRESHOLD = 12;
const ZOOM_DAMPING = 0.18;

interface ImageViewportProps {
  imageSrc: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  toolMode: ToolMode;
  selection: SelectionRect | null;
  detectedMode: NarrativeMode | null;
  fullscreen: boolean;
  analyzing: boolean;
  canAnalyze: boolean;
  initialZoom?: number;
  onSelectionChange: (selection: SelectionRect | null) => void;
  onEnterFullscreen: () => void;
  onExitFullscreen: () => void;
  onAnalyze: () => void;
  onSetToolMode: (mode: ToolMode) => void;
}

type DragState =
  | { kind: 'pan'; pointerId: number; startX: number; startY: number; originX: number; originY: number }
  | { kind: 'select'; pointerId: number; startX: number; startY: number };

export function ImageViewport({
  imageSrc,
  imageAlt,
  imageWidth,
  imageHeight,
  toolMode,
  selection,
  detectedMode,
  fullscreen,
  analyzing,
  canAnalyze,
  onSelectionChange,
  onEnterFullscreen,
  onExitFullscreen,
  onAnalyze,
  onSetToolMode,
  initialZoom = 1,
}: ImageViewportProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const focusPointRef = useRef<{ clientX?: number; clientY?: number }>({});
  const zoomTargetRef = useRef(initialZoom);
  const zoomRef = useRef(initialZoom);
  const panRef = useRef({ x: 0, y: 0 });
  const initializedRef = useRef(false);
  const centerOnNextResizeRef = useRef(false);
  const prevContainerRef = useRef({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(initialZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragState, setDragState] = useState<DragState | null>(null);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  // Once the container is first measured, snap pan so the image's top-left
  // corner sits at the canvas top-left (only when initialZoom > 1).
  useEffect(() => {
    if (initializedRef.current || containerSize.width === 0 || containerSize.height === 0) return;
    if (initialZoom <= 1) return;
    initializedRef.current = true;
    const fs = Math.min(containerSize.width / imageWidth, containerSize.height / imageHeight);
    const by = (containerSize.height - imageHeight * fs) / 2;
    const newPan = {
      x: (imageWidth * fs / 2) * (1 - initialZoom),
      y: -by,
    };
    panRef.current = newPan;
    setPan(newPan);
  }, [containerSize, initialZoom, imageWidth, imageHeight]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = entry.contentRect.width;
      const h = entry.contentRect.height;
      setContainerSize({ width: w, height: h });

      if (centerOnNextResizeRef.current && w > 0 && h > 0) {
        centerOnNextResizeRef.current = false;
        const fs = Math.min(w / imageWidth, h / imageHeight);
        const newPan = {
          x: (imageWidth * fs / 2) * (1 - zoomRef.current),
          y: (imageHeight * fs / 2) * (1 - zoomRef.current),
        };
        panRef.current = newPan;
        setPan(newPan);
      } else if (initializedRef.current && prevContainerRef.current.width > 0 && w > 0 && h > 0) {
        const prevW = prevContainerRef.current.width;
        const prevH = prevContainerRef.current.height;
        const prevFitScale = Math.min(prevW / imageWidth, prevH / imageHeight);
        const newFitScale = Math.min(w / imageWidth, h / imageHeight);

        const prevBaseX = (prevW - imageWidth * prevFitScale) / 2;
        const prevBaseY = (prevH - imageHeight * prevFitScale) / 2;
        const prevScale = prevFitScale * zoomRef.current;
        const cur = panRef.current;
        const imgCx = (prevW / 2 - prevBaseX - cur.x) / prevScale;
        const imgCy = (prevH / 2 - prevBaseY - cur.y) / prevScale;

        const newBaseX = (w - imageWidth * newFitScale) / 2;
        const newBaseY = (h - imageHeight * newFitScale) / 2;
        const newScale = newFitScale * zoomRef.current;
        const newPan = {
          x: w / 2 - newBaseX - imgCx * newScale,
          y: h / 2 - newBaseY - imgCy * newScale,
        };
        panRef.current = newPan;
        setPan(newPan);
      }

      prevContainerRef.current = { width: w, height: h };
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [imageWidth, imageHeight]);

  const fitScale = containerSize.width > 0 && containerSize.height > 0
    ? Math.min(containerSize.width / imageWidth, containerSize.height / imageHeight)
    : 1;
  const scale = fitScale * zoom;
  const baseOffsetX = (containerSize.width - imageWidth * fitScale) / 2;
  const baseOffsetY = (containerSize.height - imageHeight * fitScale) / 2;
  const offsetX = baseOffsetX + pan.x;
  const offsetY = baseOffsetY + pan.y;

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!fullscreen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onExitFullscreen();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreen, onExitFullscreen]);

  // When entering fullscreen, signal the ResizeObserver to center once the
  // container has been remeasured at the new (viewport) dimensions.
  useEffect(() => {
    if (!fullscreen) return;
    centerOnNextResizeRef.current = true;
  }, [fullscreen]);

  function toImageCoordinates(clientX: number, clientY: number) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || scale <= 0) return null;

    return {
      x: clamp((clientX - rect.left - offsetX) / scale, 0, imageWidth),
      y: clamp((clientY - rect.top - offsetY) / scale, 0, imageHeight),
    };
  }

  function applyZoom(nextZoom: number, focusClientX?: number, focusClientY?: number, preserveTarget = false) {
    const clampedZoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);

    if (
      focusClientX === undefined ||
      focusClientY === undefined ||
      !containerRef.current ||
      scale <= 0
    ) {
      zoomRef.current = clampedZoom;
      if (!preserveTarget) zoomTargetRef.current = clampedZoom;
      setZoom(clampedZoom);
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const pointerX = focusClientX - rect.left;
    const pointerY = focusClientY - rect.top;
    const currentZoom = zoomRef.current;
    const currentPan = panRef.current;
    const currentScale = fitScale * currentZoom;
    const currentOffsetX = baseOffsetX + currentPan.x;
    const currentOffsetY = baseOffsetY + currentPan.y;
    const imageX = (pointerX - currentOffsetX) / currentScale;
    const imageY = (pointerY - currentOffsetY) / currentScale;
    const nextScale = fitScale * clampedZoom;
    const nextPanX = pointerX - baseOffsetX - imageX * nextScale;
    const nextPanY = pointerY - baseOffsetY - imageY * nextScale;

    zoomRef.current = clampedZoom;
    if (!preserveTarget) zoomTargetRef.current = clampedZoom;
    panRef.current = { x: nextPanX, y: nextPanY };
    setZoom(clampedZoom);
    setPan({ x: nextPanX, y: nextPanY });
  }

  function stepZoomAnimation() {
    const targetZoom = zoomTargetRef.current;
    const currentZoom = zoomRef.current;
    const distance = targetZoom - currentZoom;

    if (Math.abs(distance) < 0.0015) {
      applyZoom(targetZoom, focusPointRef.current.clientX, focusPointRef.current.clientY);
      animationFrameRef.current = null;
      return;
    }

    const nextZoom = currentZoom + distance * ZOOM_DAMPING;
    applyZoom(nextZoom, focusPointRef.current.clientX, focusPointRef.current.clientY, true);
    animationFrameRef.current = requestAnimationFrame(stepZoomAnimation);
  }

  function getCanvasCenter() {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { clientX: undefined, clientY: undefined };
    return { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 };
  }

  function scheduleZoom(nextZoom: number, focusClientX?: number, focusClientY?: number) {
    zoomTargetRef.current = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
    focusPointRef.current = focusClientX !== undefined && focusClientY !== undefined
      ? { clientX: focusClientX, clientY: focusClientY }
      : getCanvasCenter();

    if (animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(stepZoomAnimation);
    }
  }

  function normalizeWheelDelta(event: WheelEvent) {
    const dominantDelta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;

    if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
      return clamp(dominantDelta * 14, -WHEEL_DELTA_LIMIT, WHEEL_DELTA_LIMIT);
    }

    if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
      return clamp(dominantDelta * 28, -WHEEL_DELTA_LIMIT, WHEEL_DELTA_LIMIT);
    }

    return clamp(dominantDelta, -WHEEL_DELTA_LIMIT, WHEEL_DELTA_LIMIT);
  }

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    function handleWheel(event: WheelEvent) {
      const isPinchGesture = event.ctrlKey;
      const looksLikeMouseWheel = event.deltaMode !== WheelEvent.DOM_DELTA_PIXEL || Math.abs(event.deltaY) >= TRACKPAD_WHEEL_THRESHOLD;

      if (!isPinchGesture && !looksLikeMouseWheel) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const normalizedDelta = normalizeWheelDelta(event);
      const zoomDelta = clamp(normalizedDelta * 0.028, -0.09, 0.09);
      const nextZoom = zoomTargetRef.current * Math.exp(-zoomDelta);
      scheduleZoom(nextZoom, event.clientX, event.clientY);
    }

    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => element.removeEventListener('wheel', handleWheel);
  }, [fitScale, imageHeight, imageWidth, scale]);

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!containerRef.current) return;

    containerRef.current.setPointerCapture(event.pointerId);

    if (toolMode === 'pan') {
      setDragState({
        kind: 'pan',
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: panRef.current.x,
        originY: panRef.current.y,
      });
      return;
    }

    const point = toImageCoordinates(event.clientX, event.clientY);
    if (!point) return;

    onSelectionChange({
      x: point.x,
      y: point.y,
      width: 0,
      height: 0,
    });
    setDragState({
      kind: 'select',
      pointerId: event.pointerId,
      startX: point.x,
      startY: point.y,
    });
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragState) return;

    if (dragState.kind === 'pan') {
      const newPan = {
        x: dragState.originX + (event.clientX - dragState.startX),
        y: dragState.originY + (event.clientY - dragState.startY),
      };
      panRef.current = newPan;
      setPan(newPan);
      return;
    }

    const point = toImageCoordinates(event.clientX, event.clientY);
    if (!point) return;

    const x = Math.min(dragState.startX, point.x);
    const y = Math.min(dragState.startY, point.y);
    const width = Math.abs(point.x - dragState.startX);
    const height = Math.abs(point.y - dragState.startY);

    onSelectionChange({ x, y, width, height });
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragState && dragState.pointerId === event.pointerId) {
      setDragState(null);
    }
  }

  function snapZoom(z: number) {
    return Math.round(z / BUTTON_ZOOM_STEP) * BUTTON_ZOOM_STEP;
  }

  function resetView() {
    zoomTargetRef.current = initialZoom;
    focusPointRef.current = {};
    applyZoom(initialZoom);
    if (initialZoom > 1 && !fullscreen) {
      const fs = Math.min(containerSize.width / imageWidth, containerSize.height / imageHeight);
      const by = (containerSize.height - imageHeight * fs) / 2;
      const newPan = {
        x: (imageWidth * fs / 2) * (1 - initialZoom),
        y: -by,
      };
      panRef.current = newPan;
      setPan(newPan);
    } else {
      panRef.current = { x: 0, y: 0 };
      setPan({ x: 0, y: 0 });
    }
  }

  const canvas = (
    <div
      ref={containerRef}
      className="history-viewport__canvas"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <img
        src={imageSrc}
        alt={imageAlt}
        draggable={false}
        className="history-viewport__image"
        style={{
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
          transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
        }}
      />
      <SelectionOverlay selection={selection} scale={scale} offsetX={offsetX} offsetY={offsetY} />
    </div>
  );

  if (fullscreen) {
    return (
      <div className="history-viewport history-viewport--fullscreen">
        <div className="history-viewport__toolbar history-viewport__toolbar--fullscreen">
          <div className="history-viewport__controls">
            <button type="button" onClick={() => scheduleZoom(snapZoom(zoomTargetRef.current) - BUTTON_ZOOM_STEP)} aria-label="Zoom out">−</button>
            <input
              type="range"
              className="history-viewport__zoom-slider"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.01}
              value={zoom}
              aria-label="Zoom level"
              onChange={(e) => { const c = getCanvasCenter(); applyZoom(parseFloat(e.target.value), c.clientX, c.clientY); }}
            />
            <button type="button" onClick={() => scheduleZoom(snapZoom(zoomTargetRef.current) + BUTTON_ZOOM_STEP)} aria-label="Zoom in">+</button>
            <span className="history-viewport__zoom-label">{Math.round(zoom * 100)}%</span>
            <button type="button" onClick={resetView}>Reset View</button>
          </div>
          <div className="history-viewport__tool-toggle history-viewport__tool-toggle--fullscreen">
            <button
              type="button"
              className={toolMode === 'select' ? 'is-active' : ''}
              onClick={() => onSetToolMode('select')}
            >
              Select
            </button>
            <button
              type="button"
              className={toolMode === 'pan' ? 'is-active' : ''}
              onClick={() => onSetToolMode('pan')}
            >
              Pan
            </button>
          </div>
          <div className="history-viewport__fullscreen-actions">
            <button
              type="button"
              className={canAnalyze ? 'is-active' : ''}
              onClick={onAnalyze}
              disabled={!canAnalyze}
            >
              {analyzing ? 'Analyzing…' : 'Analyze Selection'}
            </button>
            <button type="button" onClick={onExitFullscreen} aria-label="Exit fullscreen" title="Exit fullscreen (Esc)">
              ✕
            </button>
          </div>
        </div>
        {canvas}
      </div>
    );
  }

  return (
    <div className="history-viewport">
      <div className="history-viewport__toolbar">
        <div className="history-viewport__controls">
          <button type="button" onClick={() => scheduleZoom(snapZoom(zoomTargetRef.current) - BUTTON_ZOOM_STEP)} aria-label="Zoom out">−</button>
          <input
            type="range"
            className="history-viewport__zoom-slider"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            aria-label="Zoom level"
            onChange={(e) => applyZoom(parseFloat(e.target.value))}
          />
          <button type="button" onClick={() => scheduleZoom(snapZoom(zoomTargetRef.current) + BUTTON_ZOOM_STEP)} aria-label="Zoom in">+</button>
          <span className="history-viewport__zoom-label">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={resetView}>Reset View</button>
        </div>
        <div className="history-viewport__mode">
          <span>{toolMode === 'pan' ? 'Pan Mode' : 'Selection Mode'}</span>
          <span>Pinch over chart or use +/- for precise zoom</span>
        </div>
        <button type="button" className="history-viewport__fullscreen-btn" onClick={onEnterFullscreen} aria-label="Enter fullscreen">
          ⛶ Fullscreen
        </button>
      </div>
      {canvas}
    </div>
  );
}
