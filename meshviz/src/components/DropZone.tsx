import { useRef, useState, useCallback } from 'react';

interface DropZoneProps {
  onFile: (buffer: ArrayBuffer, name: string) => void;
}

export default function DropZone({ onFile }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      onFile(buffer, file.name);
    };
    reader.readAsArrayBuffer(file);
  }, [onFile]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    const ext = file?.name.toLowerCase().split('.').pop();
    if (file && (ext === 'stl' || ext === 'glb' || ext === 'gltf')) {
      handleFile(file);
    }
  }, [handleFile]);

  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center transition-colors ${
        dragging ? 'bg-black/5' : ''
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <div
        className={`border border-dashed p-12 text-center cursor-pointer transition-colors ${
          dragging
            ? 'border-foreground bg-background/80'
            : 'border-muted-foreground/40 hover:border-muted-foreground/70'
        }`}
        onClick={() => inputRef.current?.click()}
      >
        <div className="text-muted-foreground uppercase tracking-widest text-xs mb-3">
          DROP MESH FILE HERE
        </div>
        <div className="text-foreground/60 text-xs">or click to browse</div>
        <div className="text-muted-foreground/50 text-xs mt-4">STL, GLB, GLTF — up to ~500K triangles</div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".stl,.glb,.gltf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
