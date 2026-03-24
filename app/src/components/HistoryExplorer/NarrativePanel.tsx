import type { NarrativeMode } from './selectionClassifier';

export interface HistoryNarrative {
  summary: string;
  cultures: {
    dominant: string | null;
    included: string[];
    note: string;
  };
  historicalContext: string;
  keyFigures: string[];
  majorDevelopments: {
    political: string[];
    technological: string[];
    cultural: string[];
    economic: string[];
  };
  whyItMatters: string;
}

interface NarrativePanelProps {
  panelState: 'closed' | 'compact' | 'expanded';
  loading: boolean;
  error: string | null;
  mode: NarrativeMode | null;
  timeLabel: string | null;
  intersectedBands: string[];
  dominantBand: string | null;
  narrative: HistoryNarrative | null;
  onSetPanelState: (state: 'closed' | 'compact' | 'expanded') => void;
}

function renderList(items: string[]) {
  if (items.length === 0) return <p className="history-panel__empty">No strong candidates surfaced for this section.</p>;
  return (
    <ul className="history-panel__list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function NarrativePanel({
  panelState,
  loading,
  error,
  mode,
  timeLabel,
  intersectedBands,
  dominantBand,
  narrative,
  onSetPanelState,
}: NarrativePanelProps) {
  const expanded = panelState === 'expanded';
  const showLongform = expanded && narrative;

  if (panelState === 'closed') {
    return (
      <aside className="history-panel history-panel--inspector is-closed">
        <button
          type="button"
          className="history-panel__drawer-tab"
          onClick={() => onSetPanelState('compact')}
          aria-label="Open analysis panel"
          title="Open analysis panel"
        >
          <span aria-hidden="true" className="history-panel__drawer-chevron">»</span>
          <span className="history-panel__drawer-label">Selection Analysis</span>
        </button>
      </aside>
    );
  }

  return (
    <aside className={`history-panel history-panel--inspector ${expanded ? 'is-expanded' : 'is-compact'}`}>
      <div className="history-panel__header">
        <h2 className="history-panel__title">Selection Analysis</h2>
        <div className="history-panel__actions">
          <button
            type="button"
            className="history-panel__toggle"
            onClick={() => onSetPanelState(expanded ? 'compact' : 'expanded')}
            aria-pressed={expanded}
            aria-label={expanded ? 'Collapse analysis rail' : 'Expand analysis rail'}
            title={expanded ? 'Collapse analysis rail' : 'Expand analysis rail'}
          >
            <span aria-hidden="true">{expanded ? '«' : '»'}</span>
          </button>
          <button
            type="button"
            className="history-panel__toggle"
            onClick={() => onSetPanelState('closed')}
            aria-label="Close analysis panel"
            title="Close analysis panel"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      </div>

      <div className="history-panel__body">
        {mode || timeLabel || intersectedBands.length > 0 ? (
          <div className="history-panel__meta">
            {mode ? <p><strong>Mode:</strong> {mode.replaceAll('_', ' ')}</p> : null}
            {timeLabel ? <p><strong>Time span:</strong> {timeLabel}</p> : null}
            {dominantBand ? <p><strong>Dominant band:</strong> {dominantBand}</p> : null}
            {intersectedBands.length > 0 ? <p><strong>Bands in view:</strong> {intersectedBands.join(', ')}</p> : null}
          </div>
        ) : null}

        {loading ? <p className="history-panel__status">Generating a layered interpretation of the selected area.</p> : null}
        {error ? <p className="history-panel__error">{error}</p> : null}

        {!loading && !error && !narrative ? (
          <div className="history-panel__placeholder">
            <p className="history-panel__instruction">Select an area on the chart, then analyze it here.</p>
          </div>
        ) : null}

        {narrative ? (
          <div className={`history-panel__content ${showLongform ? 'is-longform' : 'is-summary'}`}>
            <section>
              <h3>Summary</h3>
              <p>{narrative.summary}</p>
            </section>

            <section>
              <h3>Cultures / Civilizations in View</h3>
              <p>
                <strong>Dominant:</strong> {narrative.cultures.dominant ?? 'No single dominant culture inferred'}
              </p>
              {renderList(showLongform ? narrative.cultures.included : narrative.cultures.included.slice(0, 4))}
              <p className="history-panel__note">{narrative.cultures.note}</p>
            </section>

            {showLongform ? (
              <>
                <section>
                  <h3>Historical Context</h3>
                  <p>{narrative.historicalContext}</p>
                </section>

                <section>
                  <h3>Key Figures</h3>
                  {renderList(narrative.keyFigures)}
                </section>

                <section>
                  <h3>Major Developments</h3>
                  <p><strong>Political</strong></p>
                  {renderList(narrative.majorDevelopments.political)}
                  <p><strong>Technological</strong></p>
                  {renderList(narrative.majorDevelopments.technological)}
                  <p><strong>Cultural</strong></p>
                  {renderList(narrative.majorDevelopments.cultural)}
                  <p><strong>Economic / Trade</strong></p>
                  {renderList(narrative.majorDevelopments.economic)}
                </section>

                <section>
                  <h3>Why This Period Matters</h3>
                  <p>{narrative.whyItMatters}</p>
                </section>
              </>
            ) : (
              <section>
                <h3>Rail View</h3>
                <p>Use the chevron to widen this inspector and read the full context without leaving the chart workspace.</p>
              </section>
            )}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
