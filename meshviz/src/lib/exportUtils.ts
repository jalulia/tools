import * as THREE from 'three';
import { extractEdges, projectEdge } from './edgeExtraction';
import type { StyleSettings, ExportSettings, Edge } from './types';

export function getCanvasDimensions(
  aspectRatio: string,
  customWidth: number,
  customHeight: number,
  baseSize = 800
): { width: number; height: number } {
  switch (aspectRatio) {
    case '1:1': return { width: baseSize, height: baseSize };
    case '4:3': return { width: baseSize, height: Math.round(baseSize * 3 / 4) };
    case '3:2': return { width: baseSize, height: Math.round(baseSize * 2 / 3) };
    case '16:9': return { width: baseSize, height: Math.round(baseSize * 9 / 16) };
    case 'custom': return { width: customWidth, height: customHeight };
    default: return { width: baseSize, height: baseSize };
  }
}

export async function exportToPng(
  geometry: THREE.BufferGeometry,
  camera: THREE.Camera,
  meshMatrix: THREE.Matrix4,
  style: StyleSettings,
  exportSettings: ExportSettings,
  aspectRatio: string,
  customWidth: number,
  customHeight: number
): Promise<void> {
  const base = getCanvasDimensions(aspectRatio, customWidth, customHeight, 800);
  const scale = exportSettings.resolution;
  const w = base.width * scale;
  const h = base.height * scale;
  const margin = exportSettings.margin * scale;

  const svgStr = buildSVG(geometry, camera, meshMatrix, style, w, h, margin, exportSettings.transparentBackground);
  const svgBlob = new Blob([svgStr], { type: 'image/svg+xml' });
  const svgUrl = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.src = svgUrl;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
  });

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  if (!exportSettings.transparentBackground) {
    ctx.fillStyle = style.background;
    ctx.fillRect(0, 0, w, h);
  }

  ctx.drawImage(img, 0, 0, w, h);
  URL.revokeObjectURL(svgUrl);

  const link = document.createElement('a');
  link.download = `wireframe-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function projectVertexToSVG(
  position: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
  index: number,
  meshMatrix: THREE.Matrix4,
  camera: THREE.Camera,
  contentW: number,
  contentH: number,
  margin: number
): { x: number; y: number } {
  const v = new THREE.Vector4(
    position.getX(index),
    position.getY(index),
    position.getZ(index),
    1
  );
  v.applyMatrix4(meshMatrix);
  v.applyMatrix4(camera.matrixWorldInverse);
  v.applyMatrix4(
    (camera as THREE.PerspectiveCamera | THREE.OrthographicCamera).projectionMatrix
  );
  return {
    x: ((v.x / v.w + 1) / 2) * contentW + margin,
    y: ((-v.y / v.w + 1) / 2) * contentH + margin,
  };
}

export function buildSVG(
  geometry: THREE.BufferGeometry,
  camera: THREE.Camera,
  meshMatrix: THREE.Matrix4,
  style: StyleSettings,
  width: number,
  height: number,
  margin: number,
  transparent: boolean
): string {
  const contentW = width - margin * 2;
  const contentH = height - margin * 2;

  const edges = extractEdges(geometry, camera, style.smoothAngleThreshold, meshMatrix);

  // Scale line widths proportionally
  const baseScale = width / 800;
  const silhouetteW = style.silhouetteWeight * baseScale;
  const featureW = style.featureWeight * baseScale;

  const bgRect = transparent
    ? ''
    : `<rect width="${width}" height="${height}" fill="${style.background}"/>`;

  // Face fill: project actual triangles, not a rectangle
  let fillGroup = '';
  if (style.faceFill === 'solid') {
    const position = geometry.getAttribute('position');
    const faceCount = position.count / 3;
    const polygons: string[] = [];

    for (let f = 0; f < faceCount; f++) {
      const a = projectVertexToSVG(position, f * 3,     meshMatrix, camera, contentW, contentH, margin);
      const b = projectVertexToSVG(position, f * 3 + 1, meshMatrix, camera, contentW, contentH, margin);
      const c = projectVertexToSVG(position, f * 3 + 2, meshMatrix, camera, contentW, contentH, margin);

      // Backface cull
      const cross = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
      if (cross >= 0) continue;

      polygons.push(
        `<polygon points="${a.x.toFixed(2)},${a.y.toFixed(2)} ${b.x.toFixed(2)},${b.y.toFixed(2)} ${c.x.toFixed(2)},${c.y.toFixed(2)}" fill="${style.fillColor}"/>`
      );
    }

    fillGroup = `<g id="fill">\n    ${polygons.join('\n    ')}\n  </g>`;
  }

  // Feature edges (rendered first — underneath silhouette)
  const featureLines = style.showFeatureEdges
    ? edges
        .filter((e) => e.type === 'feature')
        .map((e) => {
          const p = projectEdge(e, camera, meshMatrix, contentW, contentH);
          return `<line x1="${(p.x1 + margin).toFixed(2)}" y1="${(p.y1 + margin).toFixed(2)}" x2="${(p.x2 + margin).toFixed(2)}" y2="${(p.y2 + margin).toFixed(2)}"/>`;
        })
        .join('\n    ')
    : '';

  // Silhouette edges on top
  const silhouetteLines = style.showSilhouetteEdges
    ? edges
        .filter((e) => e.type === 'silhouette')
        .map((e) => {
          const p = projectEdge(e, camera, meshMatrix, contentW, contentH);
          return `<line x1="${(p.x1 + margin).toFixed(2)}" y1="${(p.y1 + margin).toFixed(2)}" x2="${(p.x2 + margin).toFixed(2)}" y2="${(p.y2 + margin).toFixed(2)}"/>`;
        })
        .join('\n    ')
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${bgRect}
  ${fillGroup}
  <g id="feature" stroke="${style.strokeColor}" stroke-width="${featureW.toFixed(2)}" stroke-linecap="round" fill="none">
    ${featureLines}
  </g>
  <g id="silhouette" stroke="${style.strokeColor}" stroke-width="${silhouetteW.toFixed(2)}" stroke-linecap="round" fill="none">
    ${silhouetteLines}
  </g>
</svg>`;
}

export function exportToSVG(
  geometry: THREE.BufferGeometry,
  camera: THREE.Camera,
  meshMatrix: THREE.Matrix4,
  style: StyleSettings,
  exportSettings: ExportSettings,
  aspectRatio: string,
  customWidth: number,
  customHeight: number
): void {
  const { width, height } = getCanvasDimensions(aspectRatio, customWidth, customHeight, 800);
  const margin = exportSettings.margin;
  const svgStr = buildSVG(geometry, camera, meshMatrix, style, width, height, margin, exportSettings.transparentBackground);

  const blob = new Blob([svgStr], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `wireframe-${Date.now()}.svg`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

export function copySVGToClipboard(
  geometry: THREE.BufferGeometry,
  camera: THREE.Camera,
  meshMatrix: THREE.Matrix4,
  style: StyleSettings,
  exportSettings: ExportSettings,
  aspectRatio: string,
  customWidth: number,
  customHeight: number
): Promise<void> {
  const { width, height } = getCanvasDimensions(aspectRatio, customWidth, customHeight, 800);
  const margin = exportSettings.margin;
  const svgStr = buildSVG(geometry, camera, meshMatrix, style, width, height, margin, exportSettings.transparentBackground);
  return navigator.clipboard.writeText(svgStr);
}
