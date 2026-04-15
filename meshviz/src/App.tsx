import { useRef, useState, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import Viewport, { type ViewportHandle, type ViewportDebugInfo } from '@/components/Viewport';
import DropZone from '@/components/DropZone';
import StylePanel from '@/components/StylePanel';
import CompositionPanel from '@/components/CompositionPanel';
import ExportPanel from '@/components/ExportPanel';
import PreviewCanvas from '@/components/PreviewCanvas';
import { useStore } from '@/lib/store';
import type { Edge } from '@/lib/types';

type Tab = 'style' | 'composition' | 'export';
type LayerMode = 'composite' | 'mesh-only' | 'silhouette-only' | 'feature-only';

export default function App() {
  const viewportRef = useRef<ViewportHandle>(null);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [camera, setCamera] = useState<THREE.Camera | null>(null);
  const [meshMatrix, setMeshMatrix] = useState<THREE.Matrix4>(new THREE.Matrix4());
  const [tab, setTab] = useState<Tab>('style');
  const [renderKey, setRenderKey] = useState(0);
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<ViewportDebugInfo | null>(null);
  const [edgeCounts, setEdgeCounts] = useState({ silhouette: 0, feature: 0, lastRedraw: '' });
  const [debugEdgeMode, setDebugEdgeMode] = useState(false);
  const [layerMode, setLayerMode] = useState<LayerMode>('composite');

  const { meshLoaded, meshName, focusMode, setFocusMode, composition, toggleLock, setLastEdgeCounts, exportSettings } = useStore();

  const handleExtract = useCallback(() => {
    if (!viewportRef.current) return;
    const g = viewportRef.current.getGeometry();
    const c = viewportRef.current.getCamera();
    const m = viewportRef.current.getMeshMatrix();
    setGeometry(g);
    setCamera(c);
    setMeshMatrix(m);
    setRenderKey((k) => k + 1);
  }, []);

  const handleFile = useCallback((buffer: ArrayBuffer, name: string) => {
    if (!buffer.byteLength) return;
    const loadMesh = (window as unknown as { __loadMesh?: (b: ArrayBuffer, n: string) => void }).__loadMesh;
    if (loadMesh) {
      loadMesh(buffer, name);
    }
  }, []);

  const handleEdgesExtracted = useCallback((edges: Edge[]) => {
    const sil = edges.filter(e => e.type === 'silhouette');
    const feat = edges.filter(e => e.type === 'feature');
    setEdgeCounts({
      silhouette: sil.length,
      feature: feat.length,
      lastRedraw: new Date().toLocaleTimeString(),
    });
    setLastEdgeCounts({ silhouette: sil.length, feature: feat.length });
    // Push edges into the 3D viewport as LineSegments so they're visible in-scene
    viewportRef.current?.updateEdgeLines(edges, debugEdgeMode);
  }, [debugEdgeMode]);

  // Re-extract when camera or composition changes
  useEffect(() => {
    if (meshLoaded) {
      const id = setTimeout(handleExtract, 100);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [meshLoaded, handleExtract, composition.projection, composition.cameraPreset]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'style', label: 'Style' },
    { id: 'composition', label: 'Camera' },
    { id: 'export', label: 'Export' },
  ];

  const layerButtons: { id: LayerMode; label: string }[] = [
    { id: 'composite', label: 'ALL' },
    { id: 'mesh-only', label: 'MESH' },
    { id: 'silhouette-only', label: 'SIL' },
    { id: 'feature-only', label: 'FEAT' },
  ];

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      {!focusMode && (
        <header className="flex-none flex items-center justify-between px-4 py-2 border-b border-border bg-card h-10">
          <div className="flex items-center gap-3">
            <span className="uppercase tracking-widest text-[10px] font-bold">Diagram Camera</span>
            {meshLoaded && (
              <span className="text-muted-foreground text-[10px] truncate max-w-48">{meshName}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {meshLoaded && (
              <>
                <button
                  className="text-[9px] uppercase tracking-widest px-2 py-0.5 border border-muted-foreground/40 text-muted-foreground hover:border-foreground hover:text-foreground"
                  onClick={() => viewportRef.current?.frameMesh()}
                >
                  Frame
                </button>
                <button
                  className={`text-[9px] uppercase tracking-widest px-2 py-0.5 border transition-colors ${
                    showDebug
                      ? 'border-foreground text-foreground bg-foreground/10'
                      : 'border-muted-foreground/40 text-muted-foreground hover:border-foreground hover:text-foreground'
                  }`}
                  onClick={() => setShowDebug(d => !d)}
                >
                  Debug
                </button>
                <button
                  className={`text-[9px] uppercase tracking-widest px-2 py-0.5 border font-bold transition-colors ${
                    composition.locked
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-muted-foreground/40 text-muted-foreground hover:border-foreground hover:text-foreground'
                  }`}
                  onClick={toggleLock}
                >
                  {composition.locked ? 'LOCKED' : 'COMPOSE'}
                </button>
              </>
            )}
            <button
              className="text-[10px] text-muted-foreground hover:text-foreground uppercase tracking-wide"
              onClick={() => setFocusMode(true)}
            >
              Focus
            </button>
          </div>
        </header>
      )}

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {!focusMode && (
          <aside className="w-56 flex-none flex flex-col border-r border-border bg-card overflow-hidden">
            <div className="flex border-b border-border">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  className={`flex-1 text-[10px] uppercase tracking-widest py-2 transition-colors ${
                    tab === t.id
                      ? 'bg-background text-foreground border-b-2 border-foreground -mb-px'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              {tab === 'style' && <StylePanel />}
              {tab === 'composition' && <CompositionPanel />}
              {tab === 'export' && (
                <ExportPanel
                  geometry={geometry}
                  camera={camera}
                  meshMatrix={meshMatrix}
                />
              )}
            </div>
          </aside>
        )}

        {/* Center */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className={`flex flex-1 overflow-hidden ${meshLoaded ? 'flex-col' : ''}`}>
            {/* 3D Viewport */}
            <div
              className="relative"
              style={{ flex: meshLoaded ? '0 0 50%' : '1 1 100%', background: '#eeeeee' }}
            >
              <Viewport
                ref={viewportRef}
                onExtractRequest={handleExtract}
                onDebugInfo={showDebug ? setDebugInfo : undefined}
              />
              {!meshLoaded && (
                <DropZone onFile={handleFile} />
              )}
              <div className="absolute bottom-2 left-3 text-[9px] text-black/30 uppercase tracking-widest pointer-events-none">
                3D Viewport — edges render as LineSegments here
              </div>
              {meshLoaded && (
                <div className="absolute top-2 right-3">
                  <label className="text-[9px] text-black/30 cursor-pointer hover:text-black/60 uppercase tracking-wide">
                    <input
                      type="file"
                      accept=".stl,.glb,.gltf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const r = new FileReader();
                          r.onload = (ev) => {
                            const loadFn = (window as unknown as { __loadMesh?: (b: ArrayBuffer, n: string) => void }).__loadMesh;
                            if (loadFn) loadFn(ev.target!.result as ArrayBuffer, file.name);
                          };
                          r.readAsArrayBuffer(file);
                        }
                        e.target.value = '';
                      }}
                    />
                    Change File
                  </label>
                </div>
              )}
            </div>

            {/* 2D Preview canvas — THIS IS THE DIAGRAM OUTPUT */}
            {meshLoaded && (
              <div className="flex-1 relative border-t border-border bg-[#f8f8f8]">
                <PreviewCanvas
                  key={renderKey}
                  geometry={geometry}
                  camera={camera}
                  meshMatrix={meshMatrix}
                  onEdgesExtracted={handleEdgesExtracted}
                  debugMode={debugEdgeMode}
                  layerMode={layerMode}
                />
                <div className="absolute bottom-2 left-3 text-[9px] text-muted-foreground/60 uppercase tracking-widest pointer-events-none font-mono leading-relaxed">
                  <div>Diagram Preview — actual output</div>
                  <div>{exportSettings.margin}px margin · {exportSettings.resolution}× export</div>
                </div>
                {!geometry ? (
                  /* Large mesh: extraction was deferred — show prominent render button */
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      className="text-[11px] uppercase tracking-widest px-5 py-3 border-2 border-foreground bg-card text-foreground hover:bg-foreground hover:text-background transition-colors"
                      onClick={handleExtract}
                    >
                      Extract Edges
                    </button>
                    <div className="absolute bottom-8 text-[9px] text-muted-foreground/60 uppercase tracking-widest">
                      Large mesh — edges not auto-extracted
                    </div>
                  </div>
                ) : (
                  <button
                    className="absolute top-2 right-3 text-[9px] text-muted-foreground/60 hover:text-muted-foreground uppercase tracking-wide"
                    onClick={handleExtract}
                  >
                    Refresh
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Debug panel */}
      {showDebug && (
        <div className="fixed bottom-0 left-56 right-0 z-40 border-t border-border bg-card font-mono text-[9px]">
          <div className="flex items-center gap-3 px-3 py-2 overflow-x-auto whitespace-nowrap">
            <span className="text-muted-foreground uppercase tracking-widest font-bold">DBG</span>
            <span>
              mesh: <span className={debugInfo?.meshLoaded ? 'text-green-600' : 'text-red-600'}>
                {debugInfo?.meshLoaded ? 'YES' : 'NO'}
              </span>
            </span>
            <span>tris: <span className="text-foreground">{debugInfo?.triangleCount.toLocaleString() ?? '—'}</span></span>
            <span>bbox: <span className="text-foreground">{debugInfo?.bboxSize ?? '—'}</span></span>
            <span>camDist: <span className="text-foreground">{debugInfo?.cameraDistance.toFixed(2) ?? '—'}</span></span>
            <span>visible: <span className={debugInfo?.meshVisible ? 'text-green-600' : 'text-red-600'}>{debugInfo?.meshVisible ? 'YES' : 'NO'}</span></span>

            <span className="text-muted-foreground/40">|</span>

            <span>
              sil: <span className={edgeCounts.silhouette > 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{edgeCounts.silhouette}</span>
            </span>
            <span>
              feat: <span className={edgeCounts.feature > 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{edgeCounts.feature}</span>
            </span>
            <span>t: <span className="text-foreground">{edgeCounts.lastRedraw || '—'}</span></span>

            <span className="text-muted-foreground/40">|</span>

            {/* Layer isolation */}
            {layerButtons.map(b => (
              <button
                key={b.id}
                className={`px-2 py-0.5 border uppercase text-[9px] ${
                  layerMode === b.id
                    ? 'border-foreground text-foreground bg-foreground/10'
                    : 'border-muted-foreground/30 text-muted-foreground hover:border-foreground'
                }`}
                onClick={() => {
                  setLayerMode(b.id);
                  setRenderKey(k => k + 1);
                }}
              >
                {b.label}
              </button>
            ))}

            <span className="text-muted-foreground/40">|</span>

            {/* Extreme debug styling */}
            <button
              className={`px-2 py-0.5 border uppercase text-[9px] ${
                debugEdgeMode
                  ? 'border-red-500 text-red-500 bg-red-500/10'
                  : 'border-muted-foreground/30 text-muted-foreground hover:border-red-400'
              }`}
              onClick={() => {
                const next = !debugEdgeMode;
                setDebugEdgeMode(next);
                setRenderKey(k => k + 1);
                // Refresh lines in viewport with new debug mode
                const cam = viewportRef.current?.getCamera();
                const geo = viewportRef.current?.getGeometry();
                if (cam && geo) handleExtract();
              }}
            >
              {debugEdgeMode ? 'RED/BLUE ON' : 'RED/BLUE'}
            </button>

            <span className="text-muted-foreground/40">|</span>

            <button
              className="px-2 py-0.5 border border-muted-foreground/30 text-muted-foreground hover:border-foreground uppercase"
              onClick={() => { viewportRef.current?.frameMesh(); handleExtract(); }}
            >
              Frame+Refresh
            </button>
            <button
              className="px-2 py-0.5 border border-muted-foreground/30 text-muted-foreground hover:border-foreground uppercase"
              onClick={() => { viewportRef.current?.resetCamera(); handleExtract(); }}
            >
              Reset Camera
            </button>
          </div>
        </div>
      )}

      {/* Focus mode overlay */}
      {focusMode && (
        <div className="fixed inset-0 bg-background z-50 flex flex-col">
          <div className="flex-1 relative" style={{ background: '#eeeeee' }}>
            <Viewport
              ref={viewportRef}
              onExtractRequest={handleExtract}
            />
            {!meshLoaded && <DropZone onFile={handleFile} />}
          </div>
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              className="text-[10px] px-3 py-2 border border-border bg-card uppercase tracking-widest hover:border-foreground"
              onClick={handleExtract}
            >
              Render
            </button>
            <button
              className="text-[10px] px-3 py-2 border border-foreground bg-foreground text-background uppercase tracking-widest"
              onClick={() => setFocusMode(false)}
            >
              Exit Focus
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
