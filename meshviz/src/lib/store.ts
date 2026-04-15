import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  StyleSettings,
  CompositionSettings,
  ExportSettings,
  StylePreset,
  SavedCameraPreset,
  AspectRatio,
  CameraPresetName,
  ProjectionMode,
  FaceFill,
} from './types';

const DEFAULT_STYLE: StyleSettings = {
  silhouetteWeight: 4.0,      // heavy — anchors the image as the dominant contour
  featureWeight: 0.6,         // thin — structural detail, not competing with contour
  strokeColor: '#111111',     // near-black for contrast
  faceFill: 'none',           // diagram-first: no fill by default
  fillColor: '#efefef',
  background: '#ffffff',
  smoothAngleThreshold: 45,   // raised — suppresses triangulation noise on curved surfaces
  showFeatureEdges: true,
  showSilhouetteEdges: true,
};

const DEFAULT_COMPOSITION: CompositionSettings = {
  aspectRatio: '1:1',
  customWidth: 800,
  customHeight: 800,
  projection: 'perspective',
  cameraPreset: 'isometric',
  locked: false,
  showGrid: true,
  objectAlignment: 'center',
};

const DEFAULT_EXPORT: ExportSettings = {
  resolution: 2,
  transparentBackground: false,
  margin: 40,
};

const BUILT_IN_PRESETS: StylePreset[] = [
  {
    id: 'hero-iso',
    name: 'Hero Iso',
    builtIn: true,
    style: {
      // Strong silhouette, visible feature edges, no fill — publication-ready default
      silhouetteWeight: 4.0,
      featureWeight: 0.6,
      strokeColor: '#111111',
      faceFill: 'none',
      fillColor: '#efefef',
      background: '#ffffff',
      smoothAngleThreshold: 45,
      showFeatureEdges: true,
      showSilhouetteEdges: true,
    },
  },
  {
    id: 'flat-elevation',
    name: 'Flat Elevation',
    builtIn: true,
    style: {
      // Orthographic diagram style: light fill, thin features, heavy contour
      silhouetteWeight: 3.5,
      featureWeight: 0.5,
      strokeColor: '#111111',
      faceFill: 'solid',
      fillColor: '#f0f0f0',
      background: '#f7f7f7',
      smoothAngleThreshold: 40,
      showFeatureEdges: true,
      showSilhouetteEdges: true,
    },
  },
  {
    id: 'dense-wireframe',
    name: 'Dense Wireframe',
    builtIn: true,
    style: {
      // Low threshold — shows all structural edges, thin + uniform weight
      silhouetteWeight: 1.5,
      featureWeight: 0.4,
      strokeColor: '#111111',
      faceFill: 'none',
      fillColor: '#f0f0f0',
      background: '#ffffff',
      smoothAngleThreshold: 10,
      showFeatureEdges: true,
      showSilhouetteEdges: true,
    },
  },
  {
    id: 'sparse-feature',
    name: 'Sparse Feature',
    builtIn: true,
    style: {
      // High threshold — only major creases + outline, heavy linework
      silhouetteWeight: 5.0,
      featureWeight: 1.2,
      strokeColor: '#0d0d0d',
      faceFill: 'none',
      fillColor: '#f0f0f0',
      background: '#ffffff',
      smoothAngleThreshold: 60,
      showFeatureEdges: true,
      showSilhouetteEdges: true,
    },
  },
  {
    id: 'filled-diagram',
    name: 'Filled Diagram',
    builtIn: true,
    style: {
      // Bold contour-only, heavy white fill, no features — silhouette poster style
      silhouetteWeight: 5.0,
      featureWeight: 0.5,
      strokeColor: '#000000',
      faceFill: 'solid',
      fillColor: '#ffffff',
      background: '#ffffff',
      smoothAngleThreshold: 50,
      showFeatureEdges: false,
      showSilhouetteEdges: true,
    },
  },
  {
    id: 'gray-ground',
    name: 'Gray Ground',
    builtIn: true,
    style: {
      // Dark ground, lighter stroke, filled shape — inverted tonal feel
      silhouetteWeight: 3.5,
      featureWeight: 0.5,
      strokeColor: '#2a2a2a',
      faceFill: 'solid',
      fillColor: '#c8c8c8',
      background: '#e0e0e0',
      smoothAngleThreshold: 45,
      showFeatureEdges: true,
      showSilhouetteEdges: true,
    },
  },
];

interface AppState {
  meshLoaded: boolean;
  meshName: string;
  style: StyleSettings;
  composition: CompositionSettings;
  exportSettings: ExportSettings;
  stylePresets: StylePreset[];
  savedCameraPresets: SavedCameraPreset[];
  focusMode: boolean;
  extractionPending: boolean;
  lastEdgeCounts: { silhouette: number; feature: number };

  setMeshLoaded: (loaded: boolean, name?: string) => void;
  setStyle: (updates: Partial<StyleSettings>) => void;
  setComposition: (updates: Partial<CompositionSettings>) => void;
  setExportSettings: (updates: Partial<ExportSettings>) => void;
  applyStylePreset: (preset: StylePreset) => void;
  saveStylePreset: (name: string) => void;
  deleteStylePreset: (id: string) => void;
  saveCameraPreset: (preset: Omit<SavedCameraPreset, 'id'>) => void;
  deleteCameraPreset: (id: string) => void;
  setFocusMode: (on: boolean) => void;
  setExtractionPending: (pending: boolean) => void;
  setLastEdgeCounts: (counts: { silhouette: number; feature: number }) => void;
  toggleLock: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      meshLoaded: false,
      meshName: '',
      style: { ...DEFAULT_STYLE },
      composition: { ...DEFAULT_COMPOSITION },
      exportSettings: { ...DEFAULT_EXPORT },
      stylePresets: [...BUILT_IN_PRESETS],
      savedCameraPresets: [],
      focusMode: false,
      extractionPending: false,
      lastEdgeCounts: { silhouette: 0, feature: 0 },

      setMeshLoaded: (loaded, name = '') => set({ meshLoaded: loaded, meshName: name }),

      setStyle: (updates) =>
        set((s) => ({ style: { ...s.style, ...updates } })),

      setComposition: (updates) =>
        set((s) => ({ composition: { ...s.composition, ...updates } })),

      setExportSettings: (updates) =>
        set((s) => ({ exportSettings: { ...s.exportSettings, ...updates } })),

      applyStylePreset: (preset) =>
        set({ style: { ...preset.style } }),

      saveStylePreset: (name) => {
        const state = get();
        const newPreset: StylePreset = {
          id: `user-${Date.now()}`,
          name,
          style: { ...state.style },
          builtIn: false,
        };
        set((s) => ({ stylePresets: [...s.stylePresets, newPreset] }));
      },

      deleteStylePreset: (id) =>
        set((s) => ({
          stylePresets: s.stylePresets.filter((p) => p.id !== id),
        })),

      saveCameraPreset: (preset) => {
        const newPreset: SavedCameraPreset = {
          id: `cam-${Date.now()}`,
          ...preset,
        };
        set((s) => ({ savedCameraPresets: [...s.savedCameraPresets, newPreset] }));
      },

      deleteCameraPreset: (id) =>
        set((s) => ({
          savedCameraPresets: s.savedCameraPresets.filter((p) => p.id !== id),
        })),

      setFocusMode: (on) => set({ focusMode: on }),

      setExtractionPending: (pending) => set({ extractionPending: pending }),

      setLastEdgeCounts: (counts) => set({ lastEdgeCounts: counts }),

      toggleLock: () =>
        set((s) => ({
          composition: { ...s.composition, locked: !s.composition.locked },
        })),
    }),
    {
      name: 'wireframe-tool-state',
      partialize: (state) => ({
        style: state.style,
        composition: state.composition,
        exportSettings: state.exportSettings,
        stylePresets: state.stylePresets.filter((p) => !p.builtIn),
        savedCameraPresets: state.savedCameraPresets,
      }),
      merge: (persisted: unknown, current) => {
        const p = persisted as Partial<AppState>;
        return {
          ...current,
          style: { ...DEFAULT_STYLE, ...(p.style || {}) },
          composition: { ...DEFAULT_COMPOSITION, ...(p.composition || {}) },
          exportSettings: { ...DEFAULT_EXPORT, ...(p.exportSettings || {}) },
          stylePresets: [
            ...BUILT_IN_PRESETS,
            ...((p.stylePresets as StylePreset[]) || []),
          ],
          savedCameraPresets: (p.savedCameraPresets as SavedCameraPreset[]) || [],
        };
      },
    }
  )
);
