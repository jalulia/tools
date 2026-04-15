import { useState } from 'react';
import { useStore } from '@/lib/store';
import PanelSection from './PanelSection';
import * as THREE from 'three';
import { exportToPng, exportToSVG, copySVGToClipboard, getCanvasDimensions } from '@/lib/exportUtils';

interface ExportPanelProps {
  geometry: THREE.BufferGeometry | null;
  camera: THREE.Camera | null;
  meshMatrix: THREE.Matrix4;
}

export default function ExportPanel({ geometry, camera, meshMatrix }: ExportPanelProps) {
  const { exportSettings, setExportSettings, style, composition } = useStore();
  const [copying, setCopying] = useState(false);
  const [exporting, setExporting] = useState(false);

  const canExport = !!geometry && !!camera;

  const handleExportPng = async () => {
    if (!canExport) return;
    setExporting(true);
    try {
      await exportToPng(
        geometry!,
        camera!,
        meshMatrix,
        style,
        exportSettings,
        composition.aspectRatio,
        composition.customWidth,
        composition.customHeight
      );
    } finally {
      setExporting(false);
    }
  };

  const handleExportSvg = () => {
    if (!canExport) return;
    exportToSVG(
      geometry!,
      camera!,
      meshMatrix,
      style,
      exportSettings,
      composition.aspectRatio,
      composition.customWidth,
      composition.customHeight
    );
  };

  const handleCopySvg = async () => {
    if (!canExport) return;
    setCopying(true);
    try {
      await copySVGToClipboard(
        geometry!,
        camera!,
        meshMatrix,
        style,
        exportSettings,
        composition.aspectRatio,
        composition.customWidth,
        composition.customHeight
      );
      setTimeout(() => setCopying(false), 1500);
    } catch {
      setCopying(false);
    }
  };

  const base = getCanvasDimensions(composition.aspectRatio, composition.customWidth, composition.customHeight, 800);
  const outW = base.width * exportSettings.resolution;
  const outH = base.height * exportSettings.resolution;

  return (
    <>
    <PanelSection title="Output Size">
      <p className="text-[9px] font-mono text-muted-foreground">
        {composition.aspectRatio} — {base.width} × {base.height} px @ {exportSettings.resolution}× = {outW} × {outH}
      </p>
      <p className="text-[9px] text-muted-foreground/60 mt-1">Set in Camera tab</p>
    </PanelSection>
    <PanelSection title="Export">
      <div className="space-y-2">
        <div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">PNG Resolution</span>
          <div className="flex gap-1">
            {([1, 2, 4] as const).map((r) => (
              <button
                key={r}
                className={`flex-1 text-[10px] py-1 border transition-colors ${
                  exportSettings.resolution === r
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border hover:border-foreground/50'
                }`}
                onClick={() => setExportSettings({ resolution: r })}
              >
                {r}×
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Margin</span>
          <span className="text-[10px] tabular-nums">{exportSettings.margin}px</span>
        </div>
        <input
          type="range"
          min={0}
          max={120}
          step={4}
          value={exportSettings.margin}
          onChange={(e) => setExportSettings({ margin: Number(e.target.value) })}
        />

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={exportSettings.transparentBackground}
            onChange={(e) => setExportSettings({ transparentBackground: e.target.checked })}
            className="w-3 h-3"
          />
          <span className="text-[10px] uppercase tracking-wide">Transparent Background</span>
        </label>

        <div className="space-y-1 pt-1">
          <button
            className={`w-full text-[10px] py-2 border uppercase tracking-widest transition-colors ${
              canExport
                ? 'border-foreground bg-foreground text-background hover:bg-foreground/90'
                : 'border-border text-muted-foreground cursor-not-allowed'
            }`}
            onClick={handleExportPng}
            disabled={!canExport || exporting}
          >
            {exporting ? 'Rendering...' : 'Export PNG'}
          </button>
          <button
            className={`w-full text-[10px] py-2 border uppercase tracking-widest transition-colors ${
              canExport
                ? 'border-border hover:border-foreground'
                : 'border-border text-muted-foreground cursor-not-allowed'
            }`}
            onClick={handleExportSvg}
            disabled={!canExport}
          >
            Export SVG
          </button>
          <button
            className={`w-full text-[10px] py-1.5 border border-dashed transition-colors ${
              canExport
                ? 'border-muted-foreground/50 hover:border-foreground text-muted-foreground hover:text-foreground'
                : 'border-border text-muted-foreground/40 cursor-not-allowed'
            }`}
            onClick={handleCopySvg}
            disabled={!canExport}
          >
            {copying ? 'Copied!' : 'Copy SVG'}
          </button>
        </div>
      </div>
    </PanelSection>
    </>
  );
}
