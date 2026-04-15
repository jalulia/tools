export type ProjectionMode = 'perspective' | 'orthographic';

export type AspectRatio = '1:1' | '4:3' | '3:2' | '16:9' | 'custom';

export type FaceFill = 'none' | 'solid';

export type CameraPresetName = 'isometric' | 'front' | 'side' | 'top' | 'custom';

export interface CameraPreset {
  name: string;
  presetName: CameraPresetName;
  position: [number, number, number];
  target: [number, number, number];
  projection: ProjectionMode;
}

export interface StyleSettings {
  silhouetteWeight: number;
  featureWeight: number;
  strokeColor: string;
  faceFill: FaceFill;
  fillColor: string;
  background: string;
  smoothAngleThreshold: number;
  showFeatureEdges: boolean;
  showSilhouetteEdges: boolean;
}

export interface CompositionSettings {
  aspectRatio: AspectRatio;
  customWidth: number;
  customHeight: number;
  projection: ProjectionMode;
  cameraPreset: CameraPresetName;
  locked: boolean;
  showGrid: boolean;
  objectAlignment: 'center' | 'top' | 'left';
}

export interface ExportSettings {
  resolution: 1 | 2 | 4;
  transparentBackground: boolean;
  margin: number;
}

export interface StylePreset {
  id: string;
  name: string;
  style: StyleSettings;
  builtIn?: boolean;
}

export interface SavedCameraPreset {
  id: string;
  name: string;
  position: [number, number, number];
  target: [number, number, number];
  projection: ProjectionMode;
  aspectRatio: AspectRatio;
}

export interface Edge {
  start: [number, number, number];
  end: [number, number, number];
  type: 'silhouette' | 'feature';
}

export interface ProjectedEdge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: 'silhouette' | 'feature';
}
