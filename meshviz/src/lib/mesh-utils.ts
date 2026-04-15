import * as THREE from 'three';
import type { ParsedSTL } from './stl-parser';

/**
 * Convert parsed STL data into a Three.js BufferGeometry.
 */
export function stlToBufferGeometry(parsed: ParsedSTL): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(parsed.positions, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(parsed.normals, 3));
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

/**
 * Center a geometry at the origin and return the bounding box size
 * so the camera can be framed appropriately.
 */
export function centerGeometry(geometry: THREE.BufferGeometry): {
  size: THREE.Vector3;
  center: THREE.Vector3;
} {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const center = new THREE.Vector3();
  box.getCenter(center);
  geometry.translate(-center.x, -center.y, -center.z);

  const size = new THREE.Vector3();
  box.getSize(size);

  return { size, center };
}

/**
 * Compute a good default camera distance for a mesh of a given bounding size.
 * Uses the bounding sphere radius with some padding.
 */
export function computeCameraDistance(size: THREE.Vector3): number {
  const maxDim = Math.max(size.x, size.y, size.z);
  // Place camera far enough to see the whole object with some breathing room
  return maxDim * 1.8;
}
