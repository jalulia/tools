import { useStore } from '@/lib/store';
import PanelSection from './PanelSection';
import type { AspectRatio, ProjectionMode, CameraPresetName } from '@/lib/types';

export default function CompositionPanel() {
  const { composition, setComposition, toggleLock } = useStore();

  const ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
    { value: '1:1', label: '1:1' },
    { value: '4:3', label: '4:3' },
    { value: '3:2', label: '3:2' },
    { value: '16:9', label: '16:9' },
    { value: 'custom', label: 'Custom' },
  ];

  const CAMERA_PRESETS: { value: CameraPresetName; label: string }[] = [
    { value: 'isometric', label: 'Isometric' },
    { value: 'front', label: 'Front' },
    { value: 'side', label: 'Side' },
    { value: 'top', label: 'Top' },
    { value: 'custom', label: 'Custom (Orbit)' },
  ];

  return (
    <>
      <PanelSection title="Camera">
        <div className="space-y-2">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">Camera Type</span>
            <div className="flex gap-1">
              {(['perspective', 'orthographic'] as ProjectionMode[]).map((p) => (
                <button
                  key={p}
                  className={`flex-1 text-[10px] py-1 border uppercase transition-colors ${
                    composition.projection === p
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border hover:border-foreground/50'
                  }`}
                  onClick={() => setComposition({ projection: p })}
                >
                  {p === 'perspective' ? 'Persp' : 'Ortho'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">Angle</span>
            <div className="space-y-1">
              {CAMERA_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  className={`w-full text-left text-[10px] px-2 py-1 border transition-colors ${
                    composition.cameraPreset === preset.value
                      ? 'border-foreground bg-accent'
                      : 'border-transparent hover:border-border'
                  }`}
                  onClick={() => setComposition({ cameraPreset: preset.value })}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <button
            className={`w-full text-[10px] py-1.5 border transition-colors uppercase tracking-widest ${
              composition.locked
                ? 'border-foreground bg-foreground text-background'
                : 'border-border hover:border-foreground'
            }`}
            onClick={toggleLock}
          >
            {composition.locked ? '⬛ Composition Locked' : '☐ Lock Composition'}
          </button>
        </div>
      </PanelSection>

      <PanelSection title="Canvas">
        <div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">Aspect Ratio</span>
          <div className="grid grid-cols-3 gap-1">
            {ASPECT_RATIOS.map((ar) => (
              <button
                key={ar.value}
                className={`text-[10px] py-1 border transition-colors ${
                  composition.aspectRatio === ar.value
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border hover:border-foreground/50'
                }`}
                onClick={() => setComposition({ aspectRatio: ar.value })}
              >
                {ar.label}
              </button>
            ))}
          </div>

          {composition.aspectRatio === 'custom' && (
            <div className="flex gap-2 mt-2">
              <div className="flex-1 space-y-0.5">
                <span className="text-[9px] text-muted-foreground">W</span>
                <input
                  type="number"
                  value={composition.customWidth}
                  onChange={(e) => setComposition({ customWidth: Number(e.target.value) })}
                  className="w-full bg-card border border-border text-[10px] px-2 py-1 outline-none"
                />
              </div>
              <div className="flex-1 space-y-0.5">
                <span className="text-[9px] text-muted-foreground">H</span>
                <input
                  type="number"
                  value={composition.customHeight}
                  onChange={(e) => setComposition({ customHeight: Number(e.target.value) })}
                  className="w-full bg-card border border-border text-[10px] px-2 py-1 outline-none"
                />
              </div>
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 cursor-pointer mt-1">
          <input
            type="checkbox"
            checked={composition.showGrid}
            onChange={(e) => setComposition({ showGrid: e.target.checked })}
            className="w-3 h-3"
          />
          <span className="text-[10px] uppercase tracking-wide">Show Floor Grid</span>
        </label>
      </PanelSection>
    </>
  );
}
