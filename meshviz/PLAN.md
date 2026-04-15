# MeshViz MVP Plan

---

## 1. Product Restatement

MeshViz is a browser-only composition-and-export tool. It takes an uploaded 3D mesh (STL first), lets the user frame a view with standard orbit/pan/zoom controls, then generates a stylized technical line drawing from that locked view and exports it as a PNG.

It is not a modeler, not a CAD viewer, not a scene editor. The entire value proposition is: consistent, high-aesthetic technical diagrams from arbitrary meshes, with zero backend and zero accounts. Think of it as a one-shot rendering darkroom — mesh goes in, diagram comes out.

The target output aesthetic is brutalist technical illustration: black or charcoal edges on a white/near-white ground, no gradients, no glossy materials, no paper textures. The UI itself matches — sparse, pale, no ornament.

---

## 2. Leanest Realistic MVP

The MVP delivers exactly one workflow with no branching:

**Upload** → **Preview** → **Frame** → **Lock** → **Render edges** → **Export PNG**

### What ships

- STL file upload (binary and ASCII) via drag-and-drop or file picker.
- Immediate Three.js preview of the mesh as a flat-shaded or unlit solid so the user can confirm it loaded correctly.
- Orbit, pan, zoom controls (Three.js OrbitControls).
- Camera mode toggle: perspective, orthographic, and one isometric preset (true isometric: equal rotation on two axes, orthographic projection).
- "Lock View" button that freezes the camera and disables orbit controls.
- Edge rendering pass that draws two kinds of edges:
  - **Silhouette edges**: edges where one adjacent face is front-facing and the other is back-facing relative to the camera.
  - **Feature edges**: edges where the dihedral angle between adjacent face normals exceeds a user-adjustable threshold (default ~30 degrees).
- A single slider to control the feature-edge angle threshold.
- Line-weight control (1-3 px range).
- White background, black linework. No fill on faces in the final render — lines only.
- PNG export at the current viewport resolution, triggered by a button.
- The rendering pipeline is structured so that edge geometry is computed as actual line segments (not a post-process image filter), making SVG export a natural next step without rearchitecting.

### What does not ship

Everything listed in the scope exclusions: no SKP/Fusion/STEP/Blender import, no backend, no auth, no cloud save, no annotations, no labels, no hidden-line removal, no CAD editing, no OBJ support (v2 candidate), no SVG export (v2), no multiple meshes in scene.

---

## 3. Technical Risks

### Risk 1: Edge extraction performance on large meshes

Building an edge adjacency map from an STL mesh requires iterating all triangle pairs that share an edge. For a mesh with N triangles, the naive approach is O(N^2). A hash-map approach (hashing sorted vertex-pair keys) brings this to ~O(N) but still must run on the main thread or be offloaded to a Web Worker.

**Mitigation**: Use a half-edge or edge-map data structure built at load time. If meshes above ~500K triangles cause visible stalls, offload edge computation to a Web Worker. Set a soft triangle-count warning at upload time.

### Risk 2: STL vertex welding

STL files store each triangle independently — vertices are duplicated, not shared. Before edge detection can work, coincident vertices must be welded (merged within an epsilon tolerance). Floating-point precision issues can cause missed welds or false merges.

**Mitigation**: Use a spatial hash or quantized-coordinate approach for welding. Default epsilon of ~1e-5 relative to bounding-box diagonal. Expose an advanced toggle if needed later.

### Risk 3: Silhouette edge quality depends on mesh density

On very low-poly meshes, silhouette edges will be coarse and jagged. On very high-poly meshes (smooth organic forms), nearly every edge may qualify as a silhouette edge, producing visual noise rather than clean contours.

**Mitigation**: The feature-edge threshold slider already provides some control. For v1, accept that output quality depends partly on input mesh quality — this is a known limitation, not a bug. Document it. Future work could include edge simplification or mesh decimation.

### Risk 4: PNG export at sufficient resolution

`renderer.domElement.toDataURL()` captures at screen resolution. For portfolio use, users may want 2x or 4x. Rendering to an offscreen canvas at a higher resolution and then exporting is straightforward in Three.js but adds a rendering path that needs testing.

**Mitigation**: MVP ships at 1x viewport resolution. Add a resolution multiplier dropdown (1x, 2x, 4x) as a fast follow if the base export works. The architecture supports this trivially.

### Risk 5: Three.js LineSegments rendering limitations

Three.js `LineSegments` with `LineBasicMaterial` does not support line widths greater than 1px on many WebGL implementations (notably Chrome/Windows). `Line2` from Three.js examples (`LineGeometry` / `LineMaterial`) supports arbitrary widths via geometry-based line expansion.

**Mitigation**: Use `Line2` / `LineMaterial` from `three/examples/jsm/lines/` from the start. This avoids a rewrite when users inevitably want thicker lines. Small dependency cost, large UX payoff.

---

## 4. Recommended Stack and Why

| Layer | Choice | Reason |
|---|---|---|
| Framework | React 18 + TypeScript | Matches your preference. Component model is right for the sparse UI. |
| 3D engine | Three.js (r168+) | Direct WebGL control, no abstraction tax. Edge extraction needs access to raw geometry buffers — React-three-fiber would add indirection without benefit here. |
| Mesh parsing | Custom STL parser (< 200 LOC) | STL binary/ASCII parsing is simple enough that pulling in a library adds more weight than writing it. Three.js's built-in `STLLoader` is also an option but gives you a `BufferGeometry` without the adjacency data we need — we'd still need to post-process. A custom parser lets us build the edge map in the same pass. |
| Orbit controls | Three.js OrbitControls | Battle-tested. Handles perspective and orthographic cameras. Lockable via `enabled = false`. |
| Fat lines | `Line2` / `LineMaterial` from three/examples | Reliable cross-browser wide lines. No extra dependency beyond Three.js. |
| Build tool | Vite | Fast HMR, native TS support, minimal config. |
| Styling | CSS Modules or plain CSS | The UI is so sparse that a CSS framework would be overhead. A few dozen rules cover it. |
| State management | React useState / useReducer | The app state is small: one mesh, one camera state, a few render settings. No need for Zustand/Redux. |

**What I'm explicitly not recommending**: React-three-fiber (adds declarative overhead we don't need for a single non-interactive scene), any CSS framework (the aesthetic demands against it), any backend or serverless function.

---

## 5. Milestones

### M1: STL Upload and Preview
- File picker + drag-and-drop for `.stl` files.
- Parse binary and ASCII STL into a Three.js `BufferGeometry`.
- Render the mesh as a flat white solid with faint directional light (just enough to confirm faces).
- OrbitControls: orbit, pan, zoom.
- Light neutral-gray background.
- **Done when**: User can drop an STL, see it, and rotate it.

### M2: Camera Modes and View Lock
- Toggle between perspective, orthographic, and isometric-preset cameras.
- Isometric preset: snap to a true isometric angle with orthographic projection.
- "Lock View" button: freezes OrbitControls, shows a visual indicator that the view is locked.
- "Unlock" to resume orbiting.
- **Done when**: User can switch between camera modes and lock/unlock the view.

### M3: Edge Extraction Engine
- Build an edge adjacency map from the parsed STL geometry (with vertex welding).
- Classify each edge: silhouette, feature (above dihedral-angle threshold), or neither.
- Silhouette detection: for a given camera position, check whether the two adjacent face normals point toward/away from the camera (dot product sign flip).
- Feature edge detection: compute dihedral angle between adjacent face normals, compare to threshold.
- Output: an array of line segments in 3D space.
- **Done when**: Edge extraction runs correctly on a test cube and a test curved mesh. No visual output yet — just data validation via console or debug overlay.

### M4: Line Rendering Pass
- Render extracted edges using `Line2` / `LineMaterial` (charcoal/black on white).
- Hide the solid mesh preview, show only lines (or toggle between preview and line render).
- Angle-threshold slider updates edge classification in near-real-time.
- Line-weight slider (affects `LineMaterial` linewidth).
- **Done when**: User sees clean black lines on white. Adjusting the threshold visibly adds/removes feature edges. Line weight is adjustable.

### M5: PNG Export
- "Export PNG" button captures the current Three.js canvas to a PNG file and triggers download.
- Ensure the export background is pure white (not transparent).
- Ensure line anti-aliasing is acceptable in the export.
- **Done when**: Exported PNG looks identical to the on-screen render and is suitable for portfolio use at 1x resolution.

### M6: UI Polish and Aesthetic Pass
- Finalize the layout: file drop zone, viewport, minimal sidebar with controls.
- Typography: monospace or a clean sans-serif. Small, understated labels.
- Control styling: no heavy shadows, no rounded cards, no gradients. Flat, sparse, diagram-first.
- Empty state: clear instruction text when no mesh is loaded.
- Error state: brief inline message for unparseable files.
- Responsive: works at common desktop widths (1280+). No mobile target for MVP.
- **Done when**: The tool looks intentional and cohesive. It matches the brutalist aesthetic, not a SaaS template.

### M7: Verification and Edge Cases
- Test with a variety of STL files: simple box, high-poly organic mesh, non-manifold mesh, mesh with degenerate triangles.
- Verify edge extraction handles edge cases (isolated triangles, T-junctions, coincident faces).
- Verify camera modes all produce correct edge renders.
- Verify PNG export at different viewport sizes.
- Performance check: note the triangle count at which edge extraction becomes noticeably slow.
- **Done when**: Known failure modes are documented. No silent crashes on reasonable inputs.

---

## 6. Explicit Boundary Between MVP and v2

| MVP (ships) | v2 (later) |
|---|---|
| STL input only | OBJ, glTF, PLY input |
| PNG export only | SVG export (line segments already exist as geometry — convert to SVG `<line>` elements) |
| 1x resolution export | 2x / 4x resolution multiplier |
| Single mesh in scene | Multiple meshes, layered composition |
| Silhouette + feature edges | Hidden-line removal (edges occluded by faces are not drawn) |
| Black lines on white | Configurable line color, background color, optional subtle face fill |
| Single dihedral-angle threshold | Per-region or adaptive thresholds |
| No annotations | Labels, dimension lines, callouts |
| No presets/save | Export/import of view + render settings as JSON |
| Browser-only | Optional backend for batch processing or higher-res server-side rendering |
| No undo | Undo/redo for setting changes |

The architectural decision that protects v2: edges are computed as explicit 3D line segments, not as a screen-space post-processing effect. This means SVG export, hidden-line removal, and per-edge styling are all additive — they don't require rethinking the core pipeline.

---

## 7. Best First Milestone to Build

**M1: STL Upload and Preview.**

This is the right starting point because:

1. It validates the entire file-handling pipeline end-to-end — the part with the most format-specific risk (binary vs. ASCII STL, vertex welding, degenerate triangles).
2. It gives you something visual immediately, which is essential for maintaining momentum and testing the aesthetic direction.
3. It surfaces Three.js setup decisions (renderer config, camera defaults, scene background) that every subsequent milestone depends on.
4. It's fully testable in isolation. If the mesh looks right in preview, the geometry is sound and M3 (edge extraction) can trust the data.
5. The vertex welding and adjacency-map construction that M1 needs is the same data M3 consumes — so doing it here avoids a rewrite.

Specifically, M1 should deliver: a single React component with a full-viewport Three.js canvas, a drag-and-drop overlay, an STL parser that handles both formats, automatic mesh centering and camera framing based on bounding box, and OrbitControls. Nothing more.

---

## 8. Open Implementation Questions and Assumptions

**Q1: Should the edge adjacency map be built during STL parsing or as a separate pass?**
Assumption: Build it during parsing. The welding step is needed anyway, and building adjacency at the same time avoids a second pass over the triangle data. If this turns out to be too coupled, it can be separated later.

**Q2: What vertex-welding epsilon is appropriate?**
Assumption: Default to 1e-5 relative to bounding-box diagonal. This handles most STL files from CAD exports. If users report missed edges on specific files, expose the epsilon as an advanced setting.

**Q3: Should silhouette edges be recomputed on every camera move, or only when the view is locked?**
Assumption: Only when locked. Recomputing silhouette edges at 60fps during orbit would be expensive for large meshes and isn't useful — the user is just framing, not evaluating the line output. Show the solid preview during orbit; show edges only after lock. This also creates a clear two-mode interaction (framing mode vs. diagram mode) that matches the product workflow.

**Q4: Should the solid mesh preview show during the edge render, or be hidden?**
Assumption: Hidden by default once edges are rendered. Optionally toggle-able if debugging is needed, but the clean output is lines-only on white. The preview is a loading/framing aid, not part of the output.

**Q5: What happens with non-manifold meshes?**
Assumption: Best-effort. Edges with only one adjacent face are treated as silhouette edges (they're always a boundary). Edges with more than two adjacent faces are treated as feature edges. No error is thrown — the tool degrades gracefully. Document this behavior.

**Q6: Line2 / LineMaterial — is the three/examples import stable enough?**
Assumption: Yes. `Line2` and related classes have been in three/examples for several years and are widely used. They are not in three core but are maintained alongside it. Pin the Three.js version to avoid surprise breakage.

**Q7: Should the threshold slider update edges in real-time or require a "re-render" click?**
Assumption: Near-real-time for meshes under ~100K triangles. The edge classification (feature vs. not) is a simple threshold comparison on precomputed dihedral angles — only the line geometry needs rebuilding, not the adjacency map. For larger meshes, debounce the slider by ~200ms.

**Q8: Export naming convention?**
Assumption: Default filename is `meshviz-export.png`. No configurability in MVP. v2 could use the original filename stem.
