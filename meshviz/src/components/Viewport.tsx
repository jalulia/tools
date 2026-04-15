import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { useStore } from '@/lib/store';
import type { Edge } from '@/lib/types';

export interface ViewportDebugInfo {
  meshLoaded: boolean;
  triangleCount: number;
  bboxSize: string;
  cameraDistance: number;
  meshOpacity: number;
  meshVisible: boolean;
  meshColor: string;
}

export interface ViewportHandle {
  getCamera: () => THREE.Camera | null;
  getMesh: () => THREE.Mesh | null;
  getMeshMatrix: () => THREE.Matrix4;
  getGeometry: () => THREE.BufferGeometry | null;
  resetCamera: () => void;
  frameMesh: () => void;
  triggerExtract: () => void;
  getDebugInfo: () => ViewportDebugInfo;
  updateEdgeLines: (edges: Edge[], debugMode: boolean) => void;
  clearEdgeLines: () => void;
}

interface ViewportProps {
  onExtractRequest?: () => void;
  onDebugInfo?: (info: ViewportDebugInfo) => void;
}

const CAMERA_PRESETS: Record<string, { position: [number, number, number]; target: [number, number, number] }> = {
  isometric: {
    position: [1.5, 1.5, 1.5],
    target: [0, 0, 0],
  },
  front: { position: [0, 0, 3], target: [0, 0, 0] },
  side: { position: [3, 0, 0], target: [0, 0, 0] },
  top: { position: [0, 3, 0], target: [0, 0, 0] },
};

const Viewport = forwardRef<ViewportHandle, ViewportProps>(({ onExtractRequest, onDebugInfo }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const perspCamRef = useRef<THREE.PerspectiveCamera | null>(null);
  const orthoCamRef = useRef<THREE.OrthographicCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const gridRef = useRef<THREE.GridHelper | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  const edgeLinesGroupRef = useRef<THREE.Group | null>(null);

  const { composition, style } = useStore();

  const getActiveCamera = useCallback((): THREE.Camera => {
    return composition.projection === 'perspective'
      ? perspCamRef.current!
      : orthoCamRef.current!;
  }, [composition.projection]);

  const clearEdgeLinesImpl = useCallback(() => {
    if (!sceneRef.current) return;
    if (edgeLinesGroupRef.current) {
      sceneRef.current.remove(edgeLinesGroupRef.current);
      edgeLinesGroupRef.current.traverse((obj) => {
        if (obj instanceof LineSegments2) {
          obj.geometry.dispose();
          (obj.material as LineMaterial).dispose();
        }
      });
      edgeLinesGroupRef.current = null;
    }
  }, []);

  const updateEdgeLinesImpl = useCallback((edges: Edge[], debugMode: boolean) => {
    if (!sceneRef.current || !containerRef.current) return;
    clearEdgeLinesImpl();

    const currentStyle = useStore.getState().style;
    const group = new THREE.Group();

    const silEdges = edges.filter(e => e.type === 'silhouette');
    const featEdges = edges.filter(e => e.type === 'feature');

    // Viewport resolution for LineMaterial (fat lines need this for pixel-accurate widths)
    const vw = containerRef.current.clientWidth || 800;
    const vh = containerRef.current.clientHeight || 800;

    // Silhouette lines — fat lines with pixel-accurate width
    if (silEdges.length > 0) {
      const pts: number[] = [];
      for (const e of silEdges) { pts.push(...e.start, ...e.end); }
      const geo = new LineSegmentsGeometry();
      geo.setPositions(pts);
      const mat = new LineMaterial({
        color: new THREE.Color(debugMode ? '#ff2222' : currentStyle.strokeColor).getHex(),
        linewidth: currentStyle.silhouetteWeight,
        resolution: new THREE.Vector2(vw, vh),
      });
      const lines = new LineSegments2(geo, mat);
      lines.name = 'silhouette';
      lines.visible = currentStyle.showSilhouetteEdges;
      group.add(lines);
    }

    // Feature lines — fat lines with pixel-accurate width
    if (featEdges.length > 0) {
      const pts: number[] = [];
      for (const e of featEdges) { pts.push(...e.start, ...e.end); }
      const geo = new LineSegmentsGeometry();
      geo.setPositions(pts);
      const mat = new LineMaterial({
        color: new THREE.Color(debugMode ? '#2255ff' : currentStyle.strokeColor).getHex(),
        linewidth: currentStyle.featureWeight,
        resolution: new THREE.Vector2(vw, vh),
      });
      const lines = new LineSegments2(geo, mat);
      lines.name = 'feature';
      lines.visible = currentStyle.showFeatureEdges;
      group.add(lines);
    }

    sceneRef.current.add(group);
    edgeLinesGroupRef.current = group;

    console.log('[Viewport] Fat edge lines updated:', {
      silhouette: silEdges.length,
      feature: featEdges.length,
      silhouetteWidth: currentStyle.silhouetteWeight,
      featureWidth: currentStyle.featureWeight,
      resolution: `${vw}×${vh}`,
    });
  }, [clearEdgeLinesImpl]);

  const frameMeshImpl = useCallback(() => {
    if (!perspCamRef.current || !orthoCamRef.current || !controlsRef.current) return;
    const preset = CAMERA_PRESETS[composition.cameraPreset] ?? CAMERA_PRESETS.isometric;
    perspCamRef.current.position.set(...preset.position);
    orthoCamRef.current.position.set(...preset.position);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  }, [composition.cameraPreset]);

  const getDebugInfoImpl = useCallback((): ViewportDebugInfo => {
    const geo = geometryRef.current;
    const mesh = meshRef.current;
    const cam = perspCamRef.current;
    const mat = mesh?.material as THREE.MeshBasicMaterial | undefined;
    return {
      meshLoaded: !!mesh,
      triangleCount: geo ? geo.getAttribute('position').count / 3 : 0,
      bboxSize: geo?.boundingBox
        ? `${geo.boundingBox.max.x.toFixed(2)}×${geo.boundingBox.max.y.toFixed(2)}×${geo.boundingBox.max.z.toFixed(2)}`
        : 'none',
      cameraDistance: cam ? cam.position.length() : 0,
      meshOpacity: mat?.opacity ?? 0,
      meshVisible: mesh?.visible ?? false,
      meshColor: `#${mat?.color.getHexString() ?? '000000'}`,
    };
  }, []);

  useImperativeHandle(ref, () => ({
    getCamera: () => getActiveCamera(),
    getMesh: () => meshRef.current,
    getMeshMatrix: () => meshRef.current?.matrixWorld ?? new THREE.Matrix4(),
    getGeometry: () => geometryRef.current,
    resetCamera: frameMeshImpl,
    frameMesh: frameMeshImpl,
    triggerExtract: () => onExtractRequest?.(),
    getDebugInfo: getDebugInfoImpl,
    updateEdgeLines: updateEdgeLinesImpl,
    clearEdgeLines: clearEdgeLinesImpl,
  }), [frameMeshImpl, getDebugInfoImpl, getActiveCamera, onExtractRequest, updateEdgeLinesImpl, clearEdgeLinesImpl]);

  // Setup scene once
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const w = canvas.clientWidth || 800;
    const h = canvas.clientHeight || 800;

    // Check WebGL availability before creating renderer
    const testCanvas = document.createElement('canvas');
    const testCtx = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
    if (!testCtx) {
      return; // WebGL not available (headless environment)
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h, false);
    // Fixed viewport background — neutral gray, NOT the diagram output color.
    // The diagram background (style.background) is for the 2D canvas export only.
    renderer.setClearColor(0xeeeeee, 1);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Perspective camera
    const persp = new THREE.PerspectiveCamera(45, w / h, 0.01, 1000);
    persp.position.set(1.5, 1.5, 1.5);
    perspCamRef.current = persp;

    // Orthographic camera
    const ortho = new THREE.OrthographicCamera(-2, 2, 2, -2, 0.01, 1000);
    ortho.position.set(1.5, 1.5, 1.5);
    orthoCamRef.current = ortho;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(5, 8, 5);
    scene.add(dir);

    // Grid
    const grid = new THREE.GridHelper(4, 20, 0xcccccc, 0xe0e0e0);
    grid.position.y = -0.5;
    scene.add(grid);
    gridRef.current = grid;

    // Controls
    const controls = new OrbitControls(persp, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.addEventListener('change', () => {
      // Sync ortho cam position to persp cam for switching
      ortho.position.copy(persp.position);
      ortho.quaternion.copy(persp.quaternion);
    });
    controlsRef.current = controls;

    // Animate
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      controls.update();
      const cam = composition.projection === 'perspective' ? persp : ortho;
      renderer.render(scene, cam);
    };
    animate();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      controls.dispose();
      renderer.dispose();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle projection change
  useEffect(() => {
    if (!controlsRef.current || !perspCamRef.current || !orthoCamRef.current || !rendererRef.current) return;
    const persp = perspCamRef.current;
    const ortho = orthoCamRef.current;

    if (composition.projection === 'orthographic') {
      ortho.position.copy(persp.position);
      ortho.quaternion.copy(persp.quaternion);
      controlsRef.current.object = ortho;
    } else {
      persp.position.copy(ortho.position);
      persp.quaternion.copy(ortho.quaternion);
      controlsRef.current.object = persp;
    }
    controlsRef.current.update();
  }, [composition.projection]);

  // Handle camera preset change
  useEffect(() => {
    if (composition.locked) return;
    if (!perspCamRef.current || !orthoCamRef.current || !controlsRef.current) return;
    const preset = CAMERA_PRESETS[composition.cameraPreset];
    if (!preset) return;

    const persp = perspCamRef.current;
    const ortho = orthoCamRef.current;
    const controls = controlsRef.current;

    persp.position.set(...preset.position);
    ortho.position.set(...preset.position);
    controls.target.set(...preset.target);
    controls.update();

    // Re-enable controls if preset is custom
    controls.enabled = composition.cameraPreset === 'custom' || !composition.locked;
  }, [composition.cameraPreset, composition.locked]);

  // Lock/unlock controls
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = !composition.locked;
    }
  }, [composition.locked]);

  // Show/hide grid
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.visible = composition.showGrid;
    }
  }, [composition.showGrid]);

  // The 3D viewport has its own fixed neutral background — NOT the diagram output background.
  // style.background is for the 2D diagram export only; tying the viewport to it makes
  // the mesh invisible when the diagram background is white (mesh at 22% opacity = invisible).
  // The viewport background is always a neutral gray so the mesh reads clearly at any fill setting.
  // (No useEffect needed — clear color is set once at renderer init below.)

  // Handle resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      const renderer = rendererRef.current;
      if (!renderer || !perspCamRef.current || !orthoCamRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h, false);
      perspCamRef.current.aspect = w / h;
      perspCamRef.current.updateProjectionMatrix();

      const aspect = w / h;
      const s = 2;
      orthoCamRef.current.left = -s * aspect;
      orthoCamRef.current.right = s * aspect;
      orthoCamRef.current.top = s;
      orthoCamRef.current.bottom = -s;
      orthoCamRef.current.updateProjectionMatrix();

      // Update LineMaterial resolution so fat line widths stay pixel-accurate after resize
      if (edgeLinesGroupRef.current) {
        edgeLinesGroupRef.current.traverse((obj) => {
          if (obj instanceof LineSegments2) {
            (obj.material as LineMaterial).resolution.set(w, h);
          }
        });
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // ── Triangle budget ─────────────────────────────────────────────────────────
  // Edge extraction is O(n) but with heavy per-edge string hashing and Map ops.
  // Above ~200K triangles it blocks the main thread for multiple seconds.
  // We decimate the edge-extraction geometry (not the display mesh) by striding.
  const EDGE_BUDGET = 200_000;   // max triangles sent to edge extractor
  const AUTO_EXTRACT_LIMIT = 150_000; // auto-extract only below this; above = manual

  // ── Shared post-parse pipeline ──────────────────────────────────────────────
  // Takes a raw BufferGeometry (from any loader) and wires it into the scene.
  const finalizeMesh = useCallback((geometry: THREE.BufferGeometry, name: string) => {
    const scene = sceneRef.current!;

    // Center and normalize to unit cube
    geometry.computeBoundingBox();
    const bbox = geometry.boundingBox!;
    const center = new THREE.Vector3();
    bbox.getCenter(center);
    geometry.translate(-center.x, -center.y, -center.z);

    const size = new THREE.Vector3();
    bbox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) geometry.scale(1 / maxDim, 1 / maxDim, 1 / maxDim);

    // Non-indexed geometry for consistent edge extraction
    if (geometry.index) {
      geometry = geometry.toNonIndexed();
    }
    geometry.computeVertexNormals();

    const rawTriCount = geometry.getAttribute('position').count / 3;

    // ── Decimate for edge extraction if over budget ────────────────────────
    // Create a separate lighter geometry for edge extraction only.
    // The display mesh keeps full resolution for the 3D preview.
    let edgeGeometry = geometry;
    if (rawTriCount > EDGE_BUDGET) {
      const stride = Math.ceil(rawTriCount / EDGE_BUDGET);
      const oldPos = geometry.getAttribute('position');
      const keptTriangles = Math.floor(rawTriCount / stride);
      const newPos = new Float32Array(keptTriangles * 9); // 3 verts × 3 coords
      for (let i = 0; i < keptTriangles; i++) {
        const srcFace = i * stride;
        for (let v = 0; v < 3; v++) {
          const srcIdx = srcFace * 3 + v;
          const dstIdx = i * 3 + v;
          newPos[dstIdx * 3]     = oldPos.getX(srcIdx);
          newPos[dstIdx * 3 + 1] = oldPos.getY(srcIdx);
          newPos[dstIdx * 3 + 2] = oldPos.getZ(srcIdx);
        }
      }
      edgeGeometry = new THREE.BufferGeometry();
      edgeGeometry.setAttribute('position', new THREE.BufferAttribute(newPos, 3));
      edgeGeometry.computeVertexNormals();
      console.log(`[Viewport] Decimated for edge extraction: ${rawTriCount} → ${keptTriangles} triangles (stride ${stride})`);
    }

    const currentStyle = useStore.getState().style;
    const isSolid = currentStyle.faceFill === 'solid';
    const material = new THREE.MeshBasicMaterial({
      color: isSolid ? currentStyle.fillColor : '#777777',
      side: THREE.FrontSide,
      transparent: true,
      opacity: isSolid ? 0.85 : 0.35,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.matrixAutoUpdate = true;
    scene.add(mesh);
    meshRef.current = mesh;
    // Store the edge-extraction geometry (may be decimated) for PreviewCanvas
    geometryRef.current = edgeGeometry;

    // Auto-frame camera
    if (perspCamRef.current && orthoCamRef.current && controlsRef.current) {
      const preset = CAMERA_PRESETS[useStore.getState().composition.cameraPreset] ?? CAMERA_PRESETS.isometric;
      perspCamRef.current.position.set(...preset.position);
      orthoCamRef.current.position.set(...preset.position);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }

    // Debug log
    console.log('[Viewport] Mesh loaded:', {
      name,
      displayTriangles: rawTriCount,
      edgeTriangles: edgeGeometry.getAttribute('position').count / 3,
      autoExtract: rawTriCount <= AUTO_EXTRACT_LIMIT,
    });

    useStore.getState().setMeshLoaded(true, name);

    // Only auto-extract edges for meshes under the safe threshold.
    // Large meshes show the 3D preview immediately; user clicks Refresh to extract.
    if (rawTriCount <= AUTO_EXTRACT_LIMIT) {
      onExtractRequest?.();
    } else {
      console.log(`[Viewport] Large mesh (${rawTriCount} tris) — skipping auto-extract. Click Refresh to render edges.`);
    }
  }, [onExtractRequest]);

  // ── Extract all mesh geometries from a GLTF scene, baking world transforms ─
  const extractGLTFGeometry = useCallback((scene: THREE.Group): THREE.BufferGeometry => {
    const geometries: THREE.BufferGeometry[] = [];

    scene.updateMatrixWorld(true);
    scene.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      let geo = obj.geometry.clone();

      // Bake the node's world transform into the geometry so all meshes
      // end up in the same coordinate space before merging.
      geo.applyMatrix4(obj.matrixWorld);

      // Ensure non-indexed so mergeGeometries gets uniform attribute layout
      if (geo.index) {
        geo = geo.toNonIndexed();
      }

      // Strip all attributes except position and normal — edge extraction
      // only needs those, and mismatched attributes block mergeGeometries.
      const pos = geo.getAttribute('position');
      const stripped = new THREE.BufferGeometry();
      stripped.setAttribute('position', pos);
      stripped.computeVertexNormals();

      geometries.push(stripped);
    });

    if (geometries.length === 0) {
      throw new Error('No mesh geometry found in GLTF file');
    }
    if (geometries.length === 1) {
      return geometries[0];
    }
    const merged = mergeGeometries(geometries);
    if (!merged) {
      throw new Error('Failed to merge GLTF geometries');
    }
    return merged;
  }, []);

  // ── Main entry point: detect format, parse, finalize ──────────────────────
  const loadMesh = useCallback((buffer: ArrayBuffer, name: string) => {
    const scene = sceneRef.current!;

    // Remove existing mesh
    if (meshRef.current) {
      scene.remove(meshRef.current);
      meshRef.current.geometry.dispose();
      meshRef.current = null;
    }

    const ext = name.toLowerCase().split('.').pop();

    if (ext === 'glb' || ext === 'gltf') {
      // ── GLTF / GLB ─────────────────────────────────────────────────────
      const loader = new GLTFLoader();
      loader.parse(buffer, '', (gltf) => {
        try {
          const geometry = extractGLTFGeometry(gltf.scene);
          finalizeMesh(geometry, name);
          console.log('[Viewport] GLTF loaded — meshes merged from scene graph');
        } catch (err) {
          console.error('[Viewport] GLTF load failed:', err);
        }
      }, (err) => {
        console.error('[Viewport] GLTF parse error:', err);
      });
    } else {
      // ── STL (default) ──────────────────────────────────────────────────
      const loader = new STLLoader();
      const geometry = loader.parse(buffer);
      finalizeMesh(geometry, name);
    }
  }, [finalizeMesh, extractGLTFGeometry]);

  // Expose loadMesh globally
  useEffect(() => {
    (window as unknown as { __loadMesh?: typeof loadMesh }).__loadMesh = loadMesh;
    return () => { delete (window as unknown as { __loadMesh?: typeof loadMesh }).__loadMesh; };
  }, [loadMesh]);

  // Update mesh material when fill style changes.
  // When fill='none', use contrasting mid-gray (#777777 at 35%) — NOT near-white which is invisible.
  useEffect(() => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    if (style.faceFill === 'solid') {
      mat.color.set(style.fillColor);
      mat.opacity = 0.85;
    } else {
      mat.color.set('#777777');
      mat.opacity = 0.35;
    }
    mat.needsUpdate = true;
    console.log('[Viewport] Material updated:', { faceFill: style.faceFill, opacity: mat.opacity, color: mat.color.getHexString() });
  }, [style.faceFill, style.fillColor]);

  // Reactively update edge line color, width, and visibility when style changes.
  // Edge lines are created once during extraction — this keeps them in sync with the UI
  // without re-extracting (which is expensive).
  useEffect(() => {
    if (!edgeLinesGroupRef.current) return;
    edgeLinesGroupRef.current.traverse((obj) => {
      if (obj instanceof LineSegments2) {
        const mat = obj.material as LineMaterial;
        mat.color.set(style.strokeColor);
        if (obj.name === 'silhouette') {
          mat.linewidth = style.silhouetteWeight;
          obj.visible = style.showSilhouetteEdges;
        } else if (obj.name === 'feature') {
          mat.linewidth = style.featureWeight;
          obj.visible = style.showFeatureEdges;
        }
        mat.needsUpdate = true;
      }
    });
  }, [style.strokeColor, style.silhouetteWeight, style.featureWeight, style.showSilhouetteEdges, style.showFeatureEdges]);

  // Report debug info periodically via callback
  useEffect(() => {
    if (!onDebugInfo) return;
    const interval = setInterval(() => {
      onDebugInfo(getDebugInfoImpl());
    }, 500);
    return () => clearInterval(interval);
  }, [onDebugInfo, getDebugInfoImpl]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
});

Viewport.displayName = 'Viewport';
export default Viewport;
