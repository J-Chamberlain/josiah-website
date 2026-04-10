import type { PopulationLayerDataset } from './contracts';
import { HUMAN_POPULATION_LAYER_URL } from '../../data/population-relief/manifest';

export async function loadHumanPopulationLayer(): Promise<PopulationLayerDataset> {
  const response = await fetch(HUMAN_POPULATION_LAYER_URL);
  if (!response.ok) {
    throw new Error(`Failed to load population dataset: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<PopulationLayerDataset>;
}
