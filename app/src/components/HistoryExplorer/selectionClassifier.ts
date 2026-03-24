export type NarrativeMode =
  | 'GLOBAL_MOMENT'
  | 'CIVILIZATION_TRAJECTORY'
  | 'REGIONAL_HISTORY';

export interface SelectionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TimeRangeEstimate {
  startYear: number;
  endYear: number;
  startLabel: string;
  endLabel: string;
  label: string;
}

export interface RegionBand {
  id: string;
  label: string;
  start: number;
  end: number;
}

export interface RegionEstimate {
  intersectedBands: string[];
  dominantBand: string | null;
}

export const CLASSIFIER_THRESHOLDS = {
  globalMomentRatio: 3,
  civilizationTrajectoryRatio: 0.4,
} as const;

export const HISTORY_YEAR_RANGE = {
  top: -3300,
  bottom: 2000,
} as const;

export const REGION_BANDS: RegionBand[] = [
  { id: 'americas', label: 'Americas / Mesoamerica', start: 0, end: 0.14 },
  { id: 'africa', label: 'Africa', start: 0.14, end: 0.27 },
  { id: 'near-east', label: 'Ancient Near East', start: 0.27, end: 0.4 },
  { id: 'mediterranean', label: 'Mediterranean / Europe', start: 0.4, end: 0.56 },
  { id: 'islamic-central-asia', label: 'Islamic World / Central Asia', start: 0.56, end: 0.69 },
  { id: 'south-asia', label: 'South Asia', start: 0.69, end: 0.82 },
  { id: 'east-asia', label: 'East Asia', start: 0.82, end: 1 },
];

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function clampSelection(rect: SelectionRect): SelectionRect {
  const x = clamp(rect.x, 0, 1);
  const y = clamp(rect.y, 0, 1);
  const maxWidth = 1 - x;
  const maxHeight = 1 - y;

  return {
    x,
    y,
    width: clamp(rect.width, 0, maxWidth),
    height: clamp(rect.height, 0, maxHeight),
  };
}

export function classifySelection(rect: SelectionRect): NarrativeMode {
  const safeHeight = Math.max(rect.height, 0.0001);
  const ratio = rect.width / safeHeight;

  if (ratio > CLASSIFIER_THRESHOLDS.globalMomentRatio) return 'GLOBAL_MOMENT';
  if (ratio < CLASSIFIER_THRESHOLDS.civilizationTrajectoryRatio) return 'CIVILIZATION_TRAJECTORY';
  return 'REGIONAL_HISTORY';
}

export function yearFromVerticalPosition(position: number): number {
  const clamped = clamp(position, 0, 1);
  const span = HISTORY_YEAR_RANGE.bottom - HISTORY_YEAR_RANGE.top;
  return Math.round(HISTORY_YEAR_RANGE.top + span * clamped);
}

export function formatHistoricalYear(year: number): string {
  if (year < 0) return `${Math.abs(year)} BCE`;
  if (year === 0) return '0';
  return `${year} CE`;
}

export function estimateTimeRange(rect: SelectionRect): TimeRangeEstimate {
  const topYear = yearFromVerticalPosition(rect.y);
  const bottomYear = yearFromVerticalPosition(rect.y + rect.height);
  const startYear = Math.min(topYear, bottomYear);
  const endYear = Math.max(topYear, bottomYear);

  return {
    startYear,
    endYear,
    startLabel: formatHistoricalYear(startYear),
    endLabel: formatHistoricalYear(endYear),
    label: `${formatHistoricalYear(startYear)} to ${formatHistoricalYear(endYear)}`,
  };
}

export function estimateRegionBands(rect: SelectionRect): RegionEstimate {
  const left = rect.x;
  const right = rect.x + rect.width;
  const intersected = REGION_BANDS.filter((band) => band.end > left && band.start < right);

  let dominantBand: string | null = null;
  let dominantOverlap = 0;

  for (const band of intersected) {
    const overlap = Math.min(right, band.end) - Math.max(left, band.start);
    if (overlap > dominantOverlap) {
      dominantOverlap = overlap;
      dominantBand = band.label;
    }
  }

  return {
    intersectedBands: intersected.map((band) => band.label),
    dominantBand,
  };
}

export function getModeLabel(mode: NarrativeMode): string {
  switch (mode) {
    case 'GLOBAL_MOMENT':
      return 'Global Snapshot Detected';
    case 'CIVILIZATION_TRAJECTORY':
      return 'Civilization Timeline Detected';
    case 'REGIONAL_HISTORY':
    default:
      return 'Regional History Detected';
  }
}
