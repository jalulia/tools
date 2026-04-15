import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import PanelSection from './PanelSection';
import SliderRow from './SliderRow';

const DIAGRAM_MODE = {
  silhouetteWeight: 4.0,
  featureWeight: 0.6,
  strokeColor: '#111111',
  faceFill: 'none' as const,
  fillColor: '#efefef',
  background: '#ffffff',
  smoothAngleThreshold: 45,
  showFeatureEdges: true,
  showSilhouetteEdges: true,
};

export default function StylePanel() {
  const { style, setStyle, stylePresets, applyStylePreset, saveStylePreset, deleteStylePreset, meshLoaded, lastEdgeCounts } = useStore();
  const [newPresetName, setNewPresetName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [armedDeleteId, setArmedDeleteId] = useState<string | null>(null);
  const armedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (armedTimerRef.current) clearTimeout(armedTimerRef.current);
    };
  }, []);

  return (
    <>
      <PanelSection title="Diagram Mode">
        <button
          className="w-full text-[10px] font-bold px-2 py-1.5 bg-foreground text-background tracking-widest hover:opacity-80 transition-opacity"
          onClick={() => setStyle(DIAGRAM_MODE)}
        >
          APPLY DIAGRAM MODE
        </button>
        <p className="mt-1.5 text-[9px] text-muted-foreground leading-tight">
          Silhouette-first · no fill · threshold 40° · publication defaults
        </p>
      </PanelSection>

      <PanelSection title="Style Presets">
        <div className="space-y-1">
          {stylePresets.map((preset) => (
            <div key={preset.id} className="flex items-center gap-1">
              <button
                className="flex-1 text-left text-[10px] px-2 py-1 hover:bg-accent border border-transparent hover:border-border transition-colors truncate"
                onClick={() => applyStylePreset(preset)}
              >
                {preset.builtIn ? '' : '◆ '}{preset.name}
              </button>
              {!preset.builtIn && (
                <button
                  className={`text-[9px] px-1 ${
                    armedDeleteId === preset.id
                      ? 'text-red-500 font-bold'
                      : 'text-muted-foreground/50 hover:text-muted-foreground'
                  }`}
                  onClick={() => {
                    if (armedDeleteId === preset.id) {
                      if (armedTimerRef.current) clearTimeout(armedTimerRef.current);
                      setArmedDeleteId(null);
                      deleteStylePreset(preset.id);
                    } else {
                      setArmedDeleteId(preset.id);
                      if (armedTimerRef.current) clearTimeout(armedTimerRef.current);
                      armedTimerRef.current = setTimeout(() => setArmedDeleteId(null), 3000);
                    }
                  }}
                >
                  {armedDeleteId === preset.id ? '?' : '✕'}
                </button>
              )}
            </div>
          ))}
        </div>
        {showSaveInput ? (
          <div className="flex gap-1 mt-2">
            <input
              className="flex-1 bg-card border border-border text-[10px] px-2 py-1 outline-none"
              placeholder="Preset name..."
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newPresetName.trim()) {
                  saveStylePreset(newPresetName.trim());
                  setNewPresetName('');
                  setShowSaveInput(false);
                }
                if (e.key === 'Escape') setShowSaveInput(false);
              }}
              autoFocus
            />
            <button
              className="text-[10px] px-2 py-1 bg-foreground text-background"
              onClick={() => {
                if (newPresetName.trim()) {
                  saveStylePreset(newPresetName.trim());
                  setNewPresetName('');
                  setShowSaveInput(false);
                }
              }}
            >
              SAVE
            </button>
          </div>
        ) : (
          <button
            className="mt-2 w-full text-[10px] px-2 py-1 border border-dashed border-muted-foreground/40 hover:border-muted-foreground text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShowSaveInput(true)}
          >
            + SAVE CURRENT AS PRESET
          </button>
        )}
      </PanelSection>

      <PanelSection title="Line Weights">
        <SliderRow
          label="Silhouette"
          value={style.silhouetteWeight}
          min={0.25}
          max={6}
          step={0.25}
          onChange={(v) => setStyle({ silhouetteWeight: v })}
          unit="px"
        />
        <SliderRow
          label="Feature"
          value={style.featureWeight}
          min={0.25}
          max={4}
          step={0.25}
          onChange={(v) => setStyle({ featureWeight: v })}
          unit="px"
        />
      </PanelSection>

      <PanelSection title="Edge Types">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={style.showSilhouetteEdges}
            onChange={(e) => setStyle({ showSilhouetteEdges: e.target.checked })}
            className="w-3 h-3"
          />
          <span className="text-[10px] uppercase tracking-wide">Silhouette / Contour</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={style.showFeatureEdges}
            onChange={(e) => setStyle({ showFeatureEdges: e.target.checked })}
            className="w-3 h-3"
          />
          <span className="text-[10px] uppercase tracking-wide">Feature Edges</span>
        </label>
        <SliderRow
          label="Feature Threshold"
          value={style.smoothAngleThreshold}
          min={1}
          max={90}
          step={1}
          onChange={(v) => setStyle({ smoothAngleThreshold: v })}
          unit="°"
        />
        {meshLoaded && (
          <p className="text-[9px] font-mono text-muted-foreground/60 mt-1">
            {lastEdgeCounts.silhouette} silhouette · {lastEdgeCounts.feature} feature edges
          </p>
        )}
      </PanelSection>

      <PanelSection title="Color & Fill">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Stroke</span>
            <input
              type="color"
              value={style.strokeColor}
              onChange={(e) => setStyle({ strokeColor: e.target.value })}
              className="w-8 h-5"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Background</span>
            <div className="flex gap-1">
              {['#ffffff', '#f2f2f2'].map((bg) => (
                <button
                  key={bg}
                  className={`w-5 h-5 border transition-all ${style.background === bg ? 'border-foreground' : 'border-border'}`}
                  style={{ background: bg }}
                  onClick={() => setStyle({ background: bg })}
                />
              ))}
              <input
                type="color"
                value={style.background}
                onChange={(e) => setStyle({ background: e.target.value })}
                className="w-5 h-5"
                title="Custom background"
              />
            </div>
          </div>
          <p className="text-[9px] text-muted-foreground/60 leading-tight">
            Applies to diagram & export. 3D viewport stays neutral.
          </p>

          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Face Fill</span>
            <div className="flex gap-1">
              {(['none', 'solid'] as const).map((fill) => (
                <button
                  key={fill}
                  className={`flex-1 text-[10px] py-1 border transition-colors uppercase ${
                    style.faceFill === fill
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border hover:border-foreground/50'
                  }`}
                  onClick={() => setStyle({ faceFill: fill })}
                >
                  {fill}
                </button>
              ))}
            </div>
          </div>

          {style.faceFill === 'solid' && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Fill Color</span>
              <div className="flex items-center gap-1">
                {['#ffffff', '#e8e8e8', '#d0d0d0', '#b8b8b8'].map((c) => (
                  <button
                    key={c}
                    className={`w-5 h-5 border transition-all ${style.fillColor === c ? 'border-foreground' : 'border-border'}`}
                    style={{ background: c }}
                    onClick={() => setStyle({ fillColor: c })}
                  />
                ))}
                <input
                  type="color"
                  value={style.fillColor}
                  onChange={(e) => setStyle({ fillColor: e.target.value })}
                  className="w-5 h-5"
                />
              </div>
            </div>
          )}
        </div>
      </PanelSection>
    </>
  );
}
