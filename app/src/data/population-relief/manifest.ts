export const HUMAN_POPULATION_LAYER_URL = '/data/population-relief/human-us-phase1.json';

export const HUMAN_POPULATION_LAYER_MANIFEST = {
  id: 'human-us-phase1-validation',
  label: 'United States Population Density Validation Map',
  year: 2020,
  url: HUMAN_POPULATION_LAYER_URL,
  phase: 'phase1-2',
} as const;
