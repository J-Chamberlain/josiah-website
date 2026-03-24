import type { NarrativeMode, SelectionRect, TimeRangeEstimate } from './selectionClassifier';

interface PromptInput {
  mode: NarrativeMode;
  normalizedRect: SelectionRect;
  timeRange: TimeRangeEstimate;
  intersectedBands: string[];
  dominantBand: string | null;
  selectionWidth: number;
  selectionHeight: number;
}

function modeInstructions(mode: NarrativeMode) {
  switch (mode) {
    case 'GLOBAL_MOMENT':
      return 'Treat this as a wide cross-section of the world at roughly the same period. Emphasize simultaneity, connections across regions, trade, geopolitics, and broad historical patterns.';
    case 'CIVILIZATION_TRAJECTORY':
      return 'Treat this as a narrow, tall slice following one main region or civilization across a long span of time. Emphasize continuity, turning points, outside influence, and transformation across centuries.';
    case 'REGIONAL_HISTORY':
    default:
      return 'Treat this as a bounded region during a bounded period. Emphasize the dominant culture, neighboring cultures in view, important figures, and why this slice matters.';
  }
}

export function buildHistoryPrompt(input: PromptInput) {
  const systemPrompt = [
    'You are a careful historian interpreting an approximate user selection from a world-history timeline chart.',
    'The mapping from chart coordinates to exact cultures is approximate, so never claim false precision.',
    'Use calibrated language such as "appears to correspond to", "likely includes", and "seems to represent" when appropriate.',
    'Return valid JSON only.',
    'The JSON must match this shape exactly:',
    '{"summary":"string","cultures":{"dominant":"string | null","included":["string"],"note":"string"},"historicalContext":"string","keyFigures":["string"],"majorDevelopments":{"political":["string"],"technological":["string"],"cultural":["string"],"economic":["string"]},"whyItMatters":"string"}',
    'The summary should be 120 to 220 words.',
    'Keep lists concise and historically plausible. Avoid mentioning uncertainty in every sentence, but remain calibrated where mapping is approximate.',
  ].join(' ');

  const userPrompt = [
    `Narrative mode: ${input.mode}.`,
    modeInstructions(input.mode),
    `Approximate time span: ${input.timeRange.label}.`,
    `Normalized selection rectangle: x=${input.normalizedRect.x.toFixed(3)}, y=${input.normalizedRect.y.toFixed(3)}, width=${input.normalizedRect.width.toFixed(3)}, height=${input.normalizedRect.height.toFixed(3)}.`,
    `Selection shape: width=${input.selectionWidth.toFixed(3)}, height=${input.selectionHeight.toFixed(3)}.`,
    `Region bands intersected: ${input.intersectedBands.length > 0 ? input.intersectedBands.join(', ') : 'unknown'}.`,
    `Dominant region band: ${input.dominantBand ?? 'unclear'}.`,
    'Interpret the selection using these approximate coordinates. Focus on likely cultures, surrounding context, key figures, and the long-term significance of this slice of history.',
    'If the selection appears to span multiple civilizations, say so directly and explain the overlap rather than forcing a single-culture story.',
  ].join(' ');

  return { systemPrompt, userPrompt };
}
