export interface PopulationLayerSource {
  readonly label: string;
  readonly url: string;
}

export interface PopulationLayerRenderGeometry {
  readonly worldWidth: number;
  readonly worldHeight: number;
  readonly nationPath: string;
  readonly stateBorderPath: string;
}

export interface PopulationSourceMetadata {
  readonly serviceName: string;
  readonly serviceDataType: string;
  readonly pixelType: string;
  readonly bandCount: number;
  readonly nativePixelSizeDegrees: {
    readonly x: number;
    readonly y: number;
  };
  readonly nominalResolutionLabel: string;
  readonly valueMeaning: string;
  readonly extent: {
    readonly xmin: number;
    readonly ymin: number;
    readonly xmax: number;
    readonly ymax: number;
    readonly wkid: number;
  };
  readonly timeExtent: {
    readonly start: string;
    readonly end: string;
  };
  readonly exportWindow: {
    readonly xmin: number;
    readonly ymin: number;
    readonly xmax: number;
    readonly ymax: number;
    readonly width: number;
    readonly height: number;
  };
  readonly serviceDescription: string;
}

export interface PopulationFieldGrid {
  readonly width: number;
  readonly height: number;
  readonly cellWorldWidth: number;
  readonly cellWorldHeight: number;
  readonly rawDensity: readonly number[];
  readonly logDensity: readonly number[];
  readonly normalizedDensity: readonly number[];
}

export interface PopulationFieldCellSummary {
  readonly rank: number;
  readonly row: number;
  readonly column: number;
  readonly longitude: number;
  readonly latitude: number;
  readonly rawDensity: number;
  readonly logDensity: number;
  readonly normalizedDensity: number;
}

export interface PopulationMetroSummary {
  readonly id: string;
  readonly label: string;
  readonly longitude: number;
  readonly latitude: number;
  readonly rawDensity: number;
  readonly logDensity: number;
  readonly normalizedDensity: number;
}

export interface PopulationRegionSummary {
  readonly id: string;
  readonly label: string;
  readonly bbox: {
    readonly west: number;
    readonly south: number;
    readonly east: number;
    readonly north: number;
  };
  readonly sampleCount: number;
  readonly meanDensity: number;
  readonly p90Density: number;
  readonly maxDensity: number;
}

export interface PopulationDebugSummary {
  readonly topCells: readonly PopulationFieldCellSummary[];
  readonly metroChecks: readonly PopulationMetroSummary[];
  readonly regionChecks: readonly PopulationRegionSummary[];
  readonly validationNotes: readonly string[];
}

export interface PopulationLayerStats {
  readonly gridCellCount: number;
  readonly validCellCount: number;
  readonly maxDensity: number;
  readonly meanDensity: number;
  readonly p50Density: number;
  readonly p90Density: number;
  readonly p99Density: number;
  readonly generatedAt: string;
}

export interface PopulationLayerDataset {
  readonly id: string;
  readonly version: string;
  readonly phase: 'phase1-2';
  readonly label: string;
  readonly geography: 'usa';
  readonly subject: string;
  readonly year: number;
  readonly units: string;
  readonly description: string;
  readonly renderGeometry: PopulationLayerRenderGeometry;
  readonly sourceMetadata: PopulationSourceMetadata;
  readonly sources: readonly PopulationLayerSource[];
  readonly stats: PopulationLayerStats;
  readonly field: PopulationFieldGrid;
  readonly debugSummary: PopulationDebugSummary;
}
