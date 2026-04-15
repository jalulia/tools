/**
 * STL Parser
 *
 * Parses both binary and ASCII STL files into a flat typed-array format
 * suitable for building a Three.js BufferGeometry.
 *
 * Returns per-triangle data: 3 vertices + 1 face normal per triangle.
 * Vertices are NOT welded here — that is a separate concern for the
 * edge-extraction milestone (M3). For M1 preview, raw triangles are fine.
 */

export interface ParsedSTL {
  /** Float32Array of vertex positions: [x0,y0,z0, x1,y1,z1, ...] — 9 floats per triangle */
  positions: Float32Array;
  /** Float32Array of face normals: [nx,ny,nz, ...] — 3 floats per triangle, repeated per vertex */
  normals: Float32Array;
  /** Number of triangles */
  triangleCount: number;
}

/**
 * Detect whether an ArrayBuffer contains a binary or ASCII STL,
 * then parse accordingly.
 */
export function parseSTL(buffer: ArrayBuffer): ParsedSTL {
  if (isBinarySTL(buffer)) {
    return parseBinarySTL(buffer);
  }
  return parseASCIISTL(buffer);
}

/**
 * Heuristic: binary STL has an 80-byte header, then a uint32 triangle count,
 * then exactly (count * 50) bytes of triangle data. ASCII STL starts with "solid".
 * However, some binary files also start with "solid", so we check the byte-count first.
 */
function isBinarySTL(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 84) {
    // Too small for binary header + count; try ASCII
    return false;
  }

  const view = new DataView(buffer);
  const triangleCount = view.getUint32(80, true);
  const expectedSize = 84 + triangleCount * 50;

  // Binary STL should match expected size exactly (or within padding tolerance)
  if (buffer.byteLength === expectedSize) {
    return true;
  }

  // Fallback: check if it starts with "solid" and contains "facet"
  const header = new Uint8Array(buffer, 0, Math.min(80, buffer.byteLength));
  const headerStr = new TextDecoder('ascii').decode(header).trim();
  if (headerStr.startsWith('solid')) {
    // Likely ASCII — but confirm there's at least one "facet" keyword
    const fullText = new TextDecoder('ascii').decode(new Uint8Array(buffer, 0, Math.min(1024, buffer.byteLength)));
    if (fullText.includes('facet')) {
      return false;
    }
  }

  // Default to binary
  return true;
}

function parseBinarySTL(buffer: ArrayBuffer): ParsedSTL {
  const view = new DataView(buffer);
  const triangleCount = view.getUint32(80, true);

  const positions = new Float32Array(triangleCount * 9);
  const normals = new Float32Array(triangleCount * 9);

  let offset = 84;

  for (let i = 0; i < triangleCount; i++) {
    // Face normal
    const nx = view.getFloat32(offset, true);
    const ny = view.getFloat32(offset + 4, true);
    const nz = view.getFloat32(offset + 8, true);
    offset += 12;

    // Three vertices
    for (let v = 0; v < 3; v++) {
      const basePos = i * 9 + v * 3;
      positions[basePos] = view.getFloat32(offset, true);
      positions[basePos + 1] = view.getFloat32(offset + 4, true);
      positions[basePos + 2] = view.getFloat32(offset + 8, true);
      offset += 12;

      // Repeat face normal for each vertex
      normals[basePos] = nx;
      normals[basePos + 1] = ny;
      normals[basePos + 2] = nz;
    }

    // Skip attribute byte count
    offset += 2;
  }

  return { positions, normals, triangleCount };
}

function parseASCIISTL(buffer: ArrayBuffer): ParsedSTL {
  const text = new TextDecoder('ascii').decode(new Uint8Array(buffer));

  // Collect all triangles
  const triangles: { normal: [number, number, number]; vertices: [number, number, number][] }[] = [];

  const facetRegex = /facet\s+normal\s+([\d.eE+\-]+)\s+([\d.eE+\-]+)\s+([\d.eE+\-]+)\s+outer\s+loop\s+([\s\S]*?)endloop/g;
  const vertexRegex = /vertex\s+([\d.eE+\-]+)\s+([\d.eE+\-]+)\s+([\d.eE+\-]+)/g;

  let facetMatch: RegExpExecArray | null;
  while ((facetMatch = facetRegex.exec(text)) !== null) {
    const nx = parseFloat(facetMatch[1]);
    const ny = parseFloat(facetMatch[2]);
    const nz = parseFloat(facetMatch[3]);

    const loopText = facetMatch[4];
    const vertices: [number, number, number][] = [];
    let vertexMatch: RegExpExecArray | null;
    vertexRegex.lastIndex = 0;
    while ((vertexMatch = vertexRegex.exec(loopText)) !== null) {
      vertices.push([
        parseFloat(vertexMatch[1]),
        parseFloat(vertexMatch[2]),
        parseFloat(vertexMatch[3]),
      ]);
    }

    if (vertices.length === 3) {
      triangles.push({ normal: [nx, ny, nz], vertices });
    }
  }

  const triangleCount = triangles.length;
  const positions = new Float32Array(triangleCount * 9);
  const normals = new Float32Array(triangleCount * 9);

  for (let i = 0; i < triangleCount; i++) {
    const tri = triangles[i];
    for (let v = 0; v < 3; v++) {
      const base = i * 9 + v * 3;
      positions[base] = tri.vertices[v][0];
      positions[base + 1] = tri.vertices[v][1];
      positions[base + 2] = tri.vertices[v][2];
      normals[base] = tri.normal[0];
      normals[base + 1] = tri.normal[1];
      normals[base + 2] = tri.normal[2];
    }
  }

  return { positions, normals, triangleCount };
}
