import { useMemo, useState, startTransition } from 'react';
import { ImageViewport } from './ImageViewport';
import { NarrativePanel, type HistoryNarrative } from './NarrativePanel';
import './history-explorer.css';
import {
  classifySelection,
  clampSelection,
  estimateRegionBands,
  estimateTimeRange,
  type NarrativeMode,
  type SelectionRect,
} from './selectionClassifier';

interface ExplorerProps {
  imageSrc: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
}

interface ApiResponse {
  mode: NarrativeMode;
  timeRange: {
    label: string;
  };
  regionEstimate: {
    intersectedBands: string[];
    dominantBand: string | null;
  };
  narrative: HistoryNarrative;
}

export default function Explorer({
  imageSrc,
  imageAlt = 'Timeline of world history chart',
  imageWidth = 1200,
  imageHeight = 1800,
}: ExplorerProps) {
  const [toolMode, setToolMode] = useState<'pan' | 'select'>('select');
  const [selection, setSelection] = useState<SelectionRect | null>(null);
  const [panelState, setPanelState] = useState<'closed' | 'compact' | 'expanded'>('closed');
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [narrative, setNarrative] = useState<HistoryNarrative | null>(null);
  const [resultMode, setResultMode] = useState<NarrativeMode | null>(null);
  const [timeLabel, setTimeLabel] = useState<string | null>(null);
  const [intersectedBands, setIntersectedBands] = useState<string[]>([]);
  const [dominantBand, setDominantBand] = useState<string | null>(null);

  const normalizedSelection = useMemo(() => {
    if (!selection || selection.width < 6 || selection.height < 6) return null;

    return clampSelection({
      x: selection.x / imageWidth,
      y: selection.y / imageHeight,
      width: selection.width / imageWidth,
      height: selection.height / imageHeight,
    });
  }, [imageHeight, imageWidth, selection]);

  const previewMode = normalizedSelection ? classifySelection(normalizedSelection) : null;
  const previewTime = normalizedSelection ? estimateTimeRange(normalizedSelection) : null;
  const previewRegions = normalizedSelection ? estimateRegionBands(normalizedSelection) : null;

  async function handleAnalyze() {
    if (!normalizedSelection) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selection: normalizedSelection,
          image: {
            width: imageWidth,
            height: imageHeight,
            src: imageSrc,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate history narrative.');
      }

      startTransition(() => {
        const parsed = data as ApiResponse;
        setNarrative(parsed.narrative);
        setResultMode(parsed.mode);
        setTimeLabel(parsed.timeRange.label);
        setIntersectedBands(parsed.regionEstimate.intersectedBands);
        setDominantBand(parsed.regionEstimate.dominantBand);
        setPanelState((s) => s === 'closed' ? 'compact' : s);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate history narrative.');
    } finally {
      setLoading(false);
      setFullscreen(false);
    }
  }

  return (
    <section className="history-explorer">
      <div
        className={`history-explorer__workspace is-panel-${panelState}`}
      >
        <div className="history-explorer__stage">
          <div className="history-explorer__heading">
            <div>
              <p className="history-explorer__eyebrow">Interactive Prototype</p>
              <h1>History Explorer</h1>
            </div>
            <p>
              Pan or zoom through the chart, drag a rectangular selection, and generate a structured historical reading of the chosen slice.
            </p>
          </div>

          <div className="history-explorer__toolbar">
            <div className="history-explorer__tool-toggle" role="tablist" aria-label="Explorer mode">
              <button
                type="button"
                className={toolMode === 'select' ? 'is-active' : ''}
                onClick={() => setToolMode('select')}
              >
                Select
              </button>
              <button
                type="button"
                className={toolMode === 'pan' ? 'is-active' : ''}
                onClick={() => setToolMode('pan')}
              >
                Pan
              </button>
            </div>

            <div className="history-explorer__selection-meta">
              {previewMode && previewTime ? (
                <>
                  <strong>{previewMode.replaceAll('_', ' ')}</strong>
                  <span>{previewTime.label}</span>
                  {previewRegions?.dominantBand ? <span>{previewRegions.dominantBand}</span> : null}
                </>
              ) : (
                <span>Make a visible selection to classify the narrative mode.</span>
              )}
            </div>

            <button type="button" className="history-explorer__analyze" onClick={handleAnalyze} disabled={!normalizedSelection || loading}>
              {loading ? 'Analyzing…' : 'Analyze Selection'}
            </button>
          </div>

          <ImageViewport
            imageSrc={imageSrc}
            imageAlt={imageAlt}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
            toolMode={toolMode}
            selection={selection}
            detectedMode={previewMode}
            fullscreen={fullscreen}
            analyzing={loading}
            canAnalyze={!!normalizedSelection && !loading}
            onSelectionChange={(nextSelection) => {
              setSelection(nextSelection);
              if (error) setError(null);
            }}
            onEnterFullscreen={() => setFullscreen(true)}
            onExitFullscreen={() => setFullscreen(false)}
            onAnalyze={handleAnalyze}
            onSetToolMode={setToolMode}
          />
        </div>

        <NarrativePanel
          panelState={panelState}
          onSetPanelState={setPanelState}
          loading={loading}
          error={error}
          mode={resultMode ?? previewMode}
          timeLabel={timeLabel ?? previewTime?.label ?? null}
          intersectedBands={intersectedBands.length > 0 ? intersectedBands : previewRegions?.intersectedBands ?? []}
          dominantBand={dominantBand ?? previewRegions?.dominantBand ?? null}
          narrative={narrative}
        />
      </div>
    </section>
  );
}
