# tools
Personal monorepo for small browser-based tools.

## Projects
- [meshviz](./meshviz) — browser-only mesh-to-diagram converter
- [signature-builder](./signature-builder) — node-wired email signature builder for Impossible Outcomes; edit, preview, copy into Gmail

### learn
- [book-of-shaders](./book-of-shaders) — interactive GLSL playground; edit and test every chapter of *The Book of Shaders* live (single self-contained file, no build)

## Conventions
Each top-level folder is a tool. Two kinds are supported:
- **built** — has `package.json` + `npm run build` → `dist/` (e.g. meshviz, via Vite)
- **static** — has `index.html` and no build step; copied as-is (e.g. book-of-shaders)

Optional `tool.json` per tool: `{ title, description, status, hidden, section }`.
Tools with a `section` are grouped under that label on the landing page.
