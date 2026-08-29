# tools
Personal monorepo for small browser-based tools.

## Projects
- [meshviz](./meshviz) — browser-only mesh-to-diagram converter
- [signature-builder](./signature-builder) — node-wired email signature builder for Impossible Outcomes; edit, preview, copy into Gmail

### learn
- [book-of-shaders](./book-of-shaders) — *The Book of Shaders* adapted onto the shared `learn/` shell: the book's chapters as a live GLSL bench, plus Fractals, Image operations, Kernel convolutions and Filters written here, where the book leaves stubs. One folder and one self-registering script per chapter; no build, no fetch, opens by double-click.

## Conventions
Each top-level folder is a tool. Two kinds are supported:
- **built** — has `package.json` + `npm run build` → `dist/` (e.g. meshviz, via Vite)
- **static** — has `index.html` and no build step; copied as-is (e.g. book-of-shaders)

Optional `tool.json` per tool: `{ title, description, status, hidden, section }`.
Tools with a `section` are grouped under that label on the landing page.
