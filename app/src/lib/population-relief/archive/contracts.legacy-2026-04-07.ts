export interface PopulationLayerSource {
  readonly label: string;
  readonly url: string;
}

export interface PopulationLayerAnnotation {
  readonly id: string;
  readonly label: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly projectedX: number;
  readonly projectedY: number;
}

export interface PopulationFieldPeak {
  readonly x: number;
  readonly y: number;
  readonly value: number;
}

export interface PopulationFieldGrid {
  readonly width: number;
  readonly height: number;
  readonly values: readonly number[];
}

export interface PopulationLayerRenderGeometry {
  readonly worldWidth: number;
  readonly worldHeight: number;
  readonly nationPath: string;
  readonly stateBorderPath: string;
}

export interface PopulationLayerStats {
  readonly gridCellCount: number;
  readonly validCellCount: number;
  readonly maxDensity: number;
  readonly meanDensity: number;
  readonly generatedAt: string;
}

export interface PopulationLayerHighlight {
  readonly id: string;
  readonly label: string;
}

export interface PopulationLayerDataset {
  readonly id: string;
  readonly version: string;
  readonly label: string;
  readonly geography: 'usa';
  readonly subject: string;
  readonly year: number;
  readonly units: string;
  readonly description: string;
  readonly renderGeometry: PopulationLayerRenderGeometry;
  readonly sources: readonly PopulationLayerSource[];
  readonly stats: PopulationLayerStats;
  readonly field: PopulationFieldGrid;
  readonly peaks: readonly PopulationFieldPeak[];
  readonly annotations: readonly PopulationLayerAnnotation[];
  readonly highlights: readonly PopulationLayerHighlight[];
}
