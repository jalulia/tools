import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { extractEdges, projectEdge } from '@/lib/edgeExtraction';
import type { Edge } from '@/lib/types';
import { useStore } from '@/lib/store';
import { getCanvasDimensions } from '@/lib/exportUtils';

interface PreviewCanvasProps {
  geometry: THREE.BufferGeometry | null;
  camera: THREE.Camera | null;
  meshMatrix: THREE.Matrix4;
  onEdgesExtracted?: (edges: Edge[]) => void;
  debugMode?: boolean;
  layerMode?: 'composite' | 'mesh-only' | 'silhouette-only' | 'feature-only';
}

function projectVertex(
  px: number, py: number, pz: number,
  meshMatrix: THREE.Matrix4,
  camera: THREE.Camera,
  width: number,
  height: number
): { x: number; y: number } {
  const v = new THREE.Vector4(px, py, pz, 1);
  v.applyMatrix4(meshMatrix);
  v.applyMatrix4(camera.matrixWorldInverse);
  v.applyMatrix4(
    (camera as THREE.PerspectiveCamera | THREE.OrthographicCamera).projectionMatrix
  );
  return {
    x: ((v.x / v.w + 1) / 2) * width,
    y: ((-v.y / v.w + 1) / 2) * height,
  };
}

export default function PreviewCanvas({
  geometry, camera, meshMatrix, onEdgesExtracted, debugMode = false, layerMode = 'composite'
}: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { style, composition } = useStore();

  // ── EXPENSIVE: edge extraction ──────────────────────────────────────────────
  // Only recompute when geometry, camera, meshMatrix, or threshold changes.
  // NOT on every style change (weights, colors, fill mode, etc.)
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    if (!geometry || !camera) {
      setEdges([]);
      return;
    }
    const extracted = extractEdges(geometry, camera, style.smoothAngleThreshold, meshMatrix);
    setEdges(extracted);
    onEdgesExtracted?.(extracted);
    const sil = extracted.filter(e => e.type === 'silhouette').length;
    const feat = extracted.filter(e => e.type === 'feature').length;
    console.log('[PreviewCanvas] Edges extracted:', { silhouette: sil, feature: feat, threshold: style.smoothAngleThreshold });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geometry, camera, meshMatrix, style.smoothAngleThreshold]);

  // ── CHEAP: redraw canvas ─────────────────────────────────────────────────────
  // Uses cached edges. Runs on style changes (weights, colors) without re-extracting.
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !camera) return;

    const { width, height } = getCanvasDimensions(
      composition.aspectRatio,
      composition.customWidth,
      composition.customHeight,
      canvas.offsetWidth || 600
    );

    const dpr = window.devicePixelRatio;
    const displayW = canvas.offsetWidth;
    const displayH = canvas.offsetHeight;

    canvas.width = displayW * dpr;
    canvas.height = displayH * dpr;
    canvas.style.width = `${displayW}px`;
    canvas.style.height = `${displayH}px`;

    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    // In debug mode: white background always so edges read clearly
    ctx.fillStyle = debugMode ? '#ffffff' : style.background;
    ctx.fillRect(0, 0, displayW, displayH);

    const fitScale = Math.min(displayW / width, displayH / height);
    const offsetX = (displayW - width * fitScale) / 2;
    const offsetY = (displayH - height * fitScale) / 2;

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(fitScale, fitScale);

    // Determine what to draw based on layerMode
    const drawMesh    = layerMode === 'composite' || layerMode === 'mesh-only';
    const drawFeature = (layerMode === 'composite' || layerMode === 'feature-only') && !debugMode
                        || (debugMode && layerMode !== 'silhouette-only');
    const drawSil     = (layerMode === 'composite' || layerMode === 'silhouette-only') && !debugMode
                        || (debugMode && layerMode !== 'feature-only');

    // Debug: label the mode
    if (debugMode) {
      ctx.restore();
      ctx.save();
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#ff0000';
      ctx.fillText(`[DEBUG] ${layerMode.toUpperCase()} | SIL:${edges.filter(e=>e.type==='silhouette').length} FEAT:${edges.filter(e=>e.type==='feature').length}`, 4, 12);
      ctx.restore();
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(fitScale, fitScale);
    }

    // ── Pass 1: Face fill ──────────────────────────────────────────────────
    if (drawMesh && style.faceFill === 'solid' && geometry) {
      const position = geometry.getAttribute('position');
      const faceCount = position.count / 3;
      const step = faceCount > 20000 ? Math.ceil(faceCount / 20000) : 1;

      ctx.fillStyle = style.fillColor;
      ctx.beginPath();

      for (let f = 0; f < faceCount; f += step) {
        const ax = position.getX(f * 3),     ay = position.getY(f * 3),     az = position.getZ(f * 3);
        const bx = position.getX(f * 3 + 1), by = position.getY(f * 3 + 1), bz = position.getZ(f * 3 + 1);
        const cx = position.getX(f * 3 + 2), cy = position.getY(f * 3 + 2), cz = position.getZ(f * 3 + 2);

        const a = projectVertex(ax, ay, az, meshMatrix, camera, width, height);
        const b = projectVertex(bx, by, bz, meshMatrix, camera, width, height);
        const c = projectVertex(cx, cy, cz, meshMatrix, camera, width, height);

        const cross = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
        if (cross >= 0) continue;

        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(c.x, c.y);
        ctx.closePath();
      }
      ctx.fill('nonzero');
    }

    // ── Pass 2: Feature edges ─────────────────────────────────────────────
    const showFeat = debugMode ? true : style.showFeatureEdges;
    if (drawFeature && showFeat && edges.length > 0) {
      ctx.strokeStyle = debugMode ? '#2255ff' : style.strokeColor;
      ctx.lineWidth   = debugMode ? 3 : style.featureWeight;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (const edge of edges) {
        if (edge.type !== 'feature') continue;
        const p = projectEdge(edge, camera, meshMatrix, width, height);
        ctx.moveTo(p.x1, p.y1);
        ctx.lineTo(p.x2, p.y2);
      }
      ctx.stroke();
    }

    // ── Pass 3: Silhouette edges ─────────────────────────────────────────
    const showSil = debugMode ? true : style.showSilhouetteEdges;
    if (drawSil && showSil && edges.length > 0) {
      ctx.strokeStyle = debugMode ? '#ff2222' : style.strokeColor;
      ctx.lineWidth   = debugMode ? 6 : style.silhouetteWeight;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (const edge of edges) {
        if (edge.type !== 'silhouette') continue;
        const p = projectEdge(edge, camera, meshMatrix, width, height);
        ctx.moveTo(p.x1, p.y1);
        ctx.lineTo(p.x2, p.y2);
      }
      ctx.stroke();
    }

    ctx.restore();

    // Diagram frame
    ctx.strokeStyle = debugMode ? '#ff000044' : 'rgba(0,0,0,0.06)';
    ctx.lineWidth = debugMode ? 2 : 1;
    ctx.strokeRect(offsetX + 0.5, offsetY + 0.5, width * fitScale - 1, height * fitScale - 1);

  }, [edges, camera, meshMatrix, style, composition, geometry, debugMode, layerMode]);

  useEffect(() => {
    draw();
  }, [draw]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}
