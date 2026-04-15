# MeshViz MVP Plan

## 1. Product Restatement

MeshViz is a browser-only composition-and-export tool. It takes an uploaded 3D mesh (STL first), lets the user frame a view with standard orbit/pan/zoom controls, then generates a stylized technical line drawing from that locked view and exports it as a PNG.

It is not a modeler, not a CAD viewer, not a scene editor. The entire value proposition is: consistent, high-aesthetic technical diagrams from arbitrary meshes, with zero backend and zero accounts. Think of it as a one-shot rendering darkroom — mesh goes in, diagram comes out.

The target output aesthetic is brutalist technical illustration: black or charcoal edges on a white/near-white ground, no gradients, no glossy materials, no paper textures. The UI itself matches — sparse, pale, no ornament.

## 2. Leanest Realistic MVP

Workflow:

Upload → Preview → Frame → Lock → Render edges → Export PNG

### What ships

- STL file upload (binary and ASCII) via drag-and-drop or file picker
- Immediate Three.js preview of the mesh as a flat-shaded or unlit solid
- Orbit, pan, zoom controls
- Camera mode toggle: perspective, orthographic, and one isometric preset
- Lock View button that freezes the camera and disables orbit controls
- Edge rendering pass with:
  - Silhouette edges
  - Feature edges from dihedral-angle threshold
- Single slider for feature-edge threshold
- Line-weight control
- White background, black linework
- PNG export at current viewport resolution
- Edge geometry computed as actual line segments, not screen-space post-process

### What does not ship

- SKP / Fusion / STEP / Blender import
- backend
- auth
- cloud save
- annotations
- labels
- hidden-line removal
- CAD editing
- OBJ support
- SVG export
- multiple meshes

## 3. Technical Risks

### Risk 1: Edge extraction performance on large meshes
Use an edge-map / adjacency structure rather than naive pairwise comparisons.

### Risk 2: STL vertex welding
STL duplicates triangle vertices, so coincident vertices must be welded before adjacency-based edge detection works.

### Risk 3: Silhouette edge quality depends on mesh density
Low-poly meshes produce jagged silhouettes; dense organic meshes can produce noisy contours.

### Risk 4: PNG export resolution
MVP can ship at 1x viewport resolution first.

### Risk 5: Three.js line width limitations
Prefer wide-line rendering that works reliably across browsers.

## 4. Recommended Stack

- React 18 + TypeScript
- Three.js
- Vite
- OrbitControls
- wide-line rendering support
- plain CSS or CSS Modules
- React local state only

Avoid:
- react-three-fiber unless clearly justified
- CSS frameworks
- backend work

## 5. Milestones

### M1: STL Upload and Preview
- File picker + drag-and-drop for `.stl`
- Parse binary and ASCII STL
- Render the mesh in Three.js
- OrbitControls
- Light neutral-gray background

Done when:
- user can drop an STL, see it, and rotate it

### M2: Camera Modes and View Lock
- Perspective / orthographic / isometric
- Lock / unlock view

### M3: Edge Extraction Engine
- vertex welding
- adjacency map
- silhouette classification
- feature-edge classification
- explicit 3D line segment output

### M4: Line Rendering Pass
- render extracted edges
- threshold slider
- line-weight slider

### M5: PNG Export
- export current locked-view render to PNG

### M6: UI Polish and Aesthetic Pass
- minimal layout
- quiet controls
- strong empty and error states

### M7: Verification and Edge Cases
- test on simple, dense, and malformed meshes
- document known failure modes

## 6. Explicit Boundary Between MVP and v2

### MVP
- STL input only
- PNG export only
- single mesh
- silhouette + feature edges
- black lines on white

### v2
- SVG export
- more formats
- higher export resolutions
- multiple meshes
- hidden-line removal
- configurable palette
- labels / annotations
- saveable presets

## 7. Best First Milestone to Build

M1: STL Upload and Preview

Why:
- validates file pipeline end-to-end
- gives immediate visual feedback
- surfaces core Three.js setup choices early
- is easy to test in isolation

## 8. Open Implementation Questions and Assumptions

- Build adjacency during parsing or in a separate pass
- Choose sensible vertex-welding epsilon
- Compute silhouette edges only when view is locked
- Hide solid mesh by default once line render is active
- Graceful behavior on non-manifold meshes
- Keep line rendering cross-browser reliable
- Threshold slider should feel near-real-time on normal meshes
- Default export name can be simple in MVP