import * as THREE from 'three';
import type { Edge } from './types';

interface FaceData {
  normal: THREE.Vector3;
  indices: [number, number, number];
  area: number;
}

function buildEdgeMap(geometry: THREE.BufferGeometry): Map<string, number[]> {
  const edgeMap = new Map<string, number[]>();
  const position = geometry.getAttribute('position');
  const index = geometry.index;

  const getEdgeKey = (a: number, b: number) => {
    const pa = new THREE.Vector3().fromBufferAttribute(position, a);
    const pb = new THREE.Vector3().fromBufferAttribute(position, b);
    const keyA = `${pa.x.toFixed(5)},${pa.y.toFixed(5)},${pa.z.toFixed(5)}`;
    const keyB = `${pb.x.toFixed(5)},${pb.y.toFixed(5)},${pb.z.toFixed(5)}`;
    return keyA < keyB ? `${keyA}|${keyB}` : `${keyB}|${keyA}`;
  };

  const faceCount = index ? index.count / 3 : position.count / 3;

  for (let f = 0; f < faceCount; f++) {
    let a: number, b: number, c: number;
    if (index) {
      a = index.getX(f * 3);
      b = index.getX(f * 3 + 1);
      c = index.getX(f * 3 + 2);
    } else {
      a = f * 3;
      b = f * 3 + 1;
      c = f * 3 + 2;
    }

    const edges = [[a, b], [b, c], [c, a]];
    for (const [i, j] of edges) {
      const key = getEdgeKey(i, j);
      const faces = edgeMap.get(key) ?? [];
      faces.push(f);
      edgeMap.set(key, faces);
    }
  }

  return edgeMap;
}

function computeFaceNormals(geometry: THREE.BufferGeometry): FaceData[] {
  const position = geometry.getAttribute('position');
  const index = geometry.index;
  const faceCount = index ? index.count / 3 : position.count / 3;
  const faces: FaceData[] = [];

  for (let f = 0; f < faceCount; f++) {
    let a: number, b: number, c: number;
    if (index) {
      a = index.getX(f * 3);
      b = index.getX(f * 3 + 1);
      c = index.getX(f * 3 + 2);
    } else {
      a = f * 3;
      b = f * 3 + 1;
      c = f * 3 + 2;
    }

    const pA = new THREE.Vector3().fromBufferAttribute(position, a);
    const pB = new THREE.Vector3().fromBufferAttribute(position, b);
    const pC = new THREE.Vector3().fromBufferAttribute(position, c);

    const cross = new THREE.Vector3()
      .crossVectors(
        new THREE.Vector3().subVectors(pB, pA),
        new THREE.Vector3().subVectors(pC, pA)
      );
    const area = cross.length() * 0.5;
    const normal = cross.normalize();

    faces.push({ normal, indices: [a, b, c], area });
  }

  return faces;
}

function getVertexPosition(geometry: THREE.BufferGeometry, idx: number): THREE.Vector3 {
  const position = geometry.getAttribute('position');
  return new THREE.Vector3().fromBufferAttribute(position, idx);
}

function getEdgeVertices(geometry: THREE.BufferGeometry, key: string): [THREE.Vector3, THREE.Vector3] {
  const parts = key.split('|');
  const parseV = (s: string) => {
    const [x, y, z] = s.split(',').map(Number);
    return new THREE.Vector3(x, y, z);
  };
  return [parseV(parts[0]), parseV(parts[1])];
}

export function extractEdges(
  geometry: THREE.BufferGeometry,
  camera: THREE.Camera,
  smoothAngleThreshold: number,
  meshMatrix: THREE.Matrix4
): Edge[] {
  const edges: Edge[] = [];
  const thresholdRad = (smoothAngleThreshold * Math.PI) / 180;

  // Ensure non-indexed for uniform processing
  const geo = geometry;

  const faces = computeFaceNormals(geo);
  const edgeMap = buildEdgeMap(geo);

  // ── Feature edge noise suppression ─────────────────────────────────────────
  // STL meshes tessellate curved surfaces into many small triangles. The dihedral
  // angle between adjacent triangulation faces often exceeds the user's threshold,
  // producing dense internal edges that read as mesh noise rather than illustration.
  //
  // Two complementary filters:
  //
  // 1. Minimum edge length — edges shorter than 3% of the bounding diagonal are
  //    almost always triangulation seams, not real creases.
  //
  // 2. Small-face filter — if BOTH faces adjacent to a feature edge are below the
  //    median face area, the edge is likely tessellation detail. Real feature creases
  //    (hard corners, holes, chamfers) typically have at least one substantial face.
  //
  // These only apply to feature edges. Silhouette edges are always kept.
  geo.computeBoundingBox();
  const bboxSize = new THREE.Vector3();
  geo.boundingBox!.getSize(bboxSize);
  const meshDiagonal = bboxSize.length();
  const minEdgeLengthSq = (meshDiagonal * 0.03) ** 2;

  // Compute median face area for the small-face filter
  const sortedAreas = faces.map(f => f.area).sort((a, b) => a - b);
  const medianArea = sortedAreas[Math.floor(sortedAreas.length * 0.5)];

  // Camera direction in world space
  const cameraPos = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);

  // Transform camera to model space
  const invMatrix = new THREE.Matrix4().copy(meshMatrix).invert();
  const cameraPosModel = cameraPos.clone().applyMatrix4(invMatrix);

  const position = geo.getAttribute('position');

  for (const [key, faceIndices] of edgeMap.entries()) {
    const [vA, vB] = getEdgeVertices(geo, key);

    if (faceIndices.length === 1) {
      // Boundary edge — always silhouette
      const pA = vA.toArray() as [number, number, number];
      const pB = vB.toArray() as [number, number, number];
      edges.push({ start: pA, end: pB, type: 'silhouette' });
    } else if (faceIndices.length === 2) {
      const n0 = faces[faceIndices[0]].normal;
      const n1 = faces[faceIndices[1]].normal;

      // Dihedral angle between faces
      const dot = Math.max(-1, Math.min(1, n0.dot(n1)));
      const angle = Math.acos(dot);

      // Silhouette test: faces on opposite sides of camera
      const centroid0 = new THREE.Vector3();
      const idx0 = faces[faceIndices[0]].indices;
      const p0a = new THREE.Vector3().fromBufferAttribute(position, idx0[0]);
      const p0b = new THREE.Vector3().fromBufferAttribute(position, idx0[1]);
      const p0c = new THREE.Vector3().fromBufferAttribute(position, idx0[2]);
      centroid0.add(p0a).add(p0b).add(p0c).divideScalar(3);

      const centroid1 = new THREE.Vector3();
      const idx1 = faces[faceIndices[1]].indices;
      const p1a = new THREE.Vector3().fromBufferAttribute(position, idx1[0]);
      const p1b = new THREE.Vector3().fromBufferAttribute(position, idx1[1]);
      const p1c = new THREE.Vector3().fromBufferAttribute(position, idx1[2]);
      centroid1.add(p1a).add(p1b).add(p1c).divideScalar(3);

      const dir0 = new THREE.Vector3().subVectors(cameraPosModel, centroid0).normalize();
      const dir1 = new THREE.Vector3().subVectors(cameraPosModel, centroid1).normalize();

      const dot0 = n0.dot(dir0);
      const dot1 = n1.dot(dir1);

      const isSilhouette = (dot0 >= 0 && dot1 <= 0) || (dot0 <= 0 && dot1 >= 0);

      const pA = vA.toArray() as [number, number, number];
      const pB = vB.toArray() as [number, number, number];

      if (isSilhouette) {
        edges.push({ start: pA, end: pB, type: 'silhouette' });
      } else if (angle > thresholdRad) {
        // Feature edge noise filters (silhouette edges skip these entirely):
        //
        // 1. Edge length: skip edges shorter than 3% of mesh diagonal
        const edgeLenSq = vA.distanceToSquared(vB);
        if (edgeLenSq < minEdgeLengthSq) continue;

        // 2. Small-face: skip if both adjacent faces are below median area.
        //    Real creases have at least one substantial face on one side.
        const area0 = faces[faceIndices[0]].area;
        const area1 = faces[faceIndices[1]].area;
        if (area0 < medianArea && area1 < medianArea) continue;

        edges.push({ start: pA, end: pB, type: 'feature' });
      }
    }
  }

  return edges;
}

export function projectEdge(
  edge: Edge,
  camera: THREE.Camera,
  meshMatrix: THREE.Matrix4,
  width: number,
  height: number
): { x1: number; y1: number; x2: number; y2: number } {
  const project = (point: [number, number, number]) => {
    const v = new THREE.Vector4(point[0], point[1], point[2], 1);
    v.applyMatrix4(meshMatrix);
    v.applyMatrix4(camera.matrixWorldInverse);
    v.applyMatrix4((camera as THREE.PerspectiveCamera | THREE.OrthographicCamera).projectionMatrix);
    const ndcX = v.x / v.w;
    const ndcY = v.y / v.w;
    const x = ((ndcX + 1) / 2) * width;
    const y = ((-ndcY + 1) / 2) * height;
    return { x, y };
  };

  const a = project(edge.start);
  const b = project(edge.end);
  return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
}
