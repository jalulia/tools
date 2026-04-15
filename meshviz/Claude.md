# Project Context

This project is MeshViz: a browser-only composition-and-export tool for turning uploaded 3D meshes into stylized technical wireframe diagrams.

It is not a CAD app, not a modeling tool, and not a general 3D viewer.
It is a focused rendering and export tool.

## Core Workflow

1. Upload mesh
2. Preview mesh
3. Adjust framing and camera
4. Lock view
5. Generate stylized edge rendering
6. Export result

## Source of Truth

Use `MESHVIZ_MVP_PLAN.md` as the implementation source of truth.

Do not silently redesign the product.
If you think a change is necessary, explain:
- what conflicts with the plan
- why the change is necessary
- whether it affects MVP scope or only implementation details

## MVP Scope

Prioritize:
- STL input first
- immediate preview
- orbit / pan / zoom
- perspective / orthographic / isometric camera modes
- lock current view
- silhouette edges
- feature edges based on face-angle threshold
- PNG export first
- architecture that can support SVG export next

Do not build in MVP:
- native SKP support
- native Fusion support
- STEP support
- Blender native file support
- backend
- auth
- cloud save
- annotations
- labels
- hidden-line removal unless trivial
- CAD editing
- multiple meshes in scene
- OBJ support unless explicitly requested later

## Architectural Direction

Prefer explicit 3D edge geometry over screen-space post-processing.

Reason:
- supports future SVG export naturally
- supports future hidden-line removal without rewriting pipeline
- supports per-edge styling later

Important implementation assumptions:
- build vertex welding and adjacency map close to parsing
- silhouette edges should be computed when the view is locked, not continuously during orbit
- use wide-line rendering that works cross-browser

## Aesthetic Direction

Output should feel like brutalist technical illustration:
- white or very light neutral-gray background
- black or charcoal linework
- no gradients
- no glossy shading
- no photoreal rendering
- no paper texture
- sparse, exact, diagram-first composition

UI should be:
- minimal
- quiet
- pale
- flat
- no heavy shadows
- no ornamental SaaS styling

## Technical Preferences

Preferred stack:
- React
- TypeScript
- Three.js
- Vite
- browser-only architecture
- minimal dependencies

Prefer direct Three.js over higher-level abstraction unless there is a strong practical reason.

## Working Style

When working on a task:
1. inspect current codebase first
2. explain the implementation plan briefly
3. implement one milestone only
4. verify against functional and aesthetic requirements
5. summarize:
   - what works
   - what is incomplete
   - recommended next step

Do not silently expand scope.
Do not add speculative features.
When blocked, propose the smallest practical fallback.

## Coding Preferences

- Use TypeScript
- Keep components small and focused
- Prefer readable utilities over clever abstractions
- Add explicit types for function params and returns
- Separate rendering pipeline logic from UI controls
- Avoid unnecessary dependencies
- Avoid inline styles where practical

## Verification Expectations

Before concluding a milestone:
- verify the feature works
- verify no unnecessary scope was introduced
- verify the UI still matches the intended aesthetic
- call out any unverified assumptions explicitly