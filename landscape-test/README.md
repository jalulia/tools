# Landscape index test

A separate `/tools/landscape-test/` page. The existing index changes only by adding a “Try landscape index” link in its header. Its layout, tool metadata, ordering and destinations are preserved.

The test combines the Canvas2D terrain from `jalulia/Ki-Landscapes/sonic.html` with seeded cloud geometry, tone fields and stipple from `TS-16: Stipple bank and dot burst`. The protected organization copy of Sonic was not available for an exact comparison. No Takanaka recording is included.

The test page has its own styles and controls. It runs at a capped 30 frames per second, caches sky and scratch canvases, suspends drawing in hidden tabs, and respects reduced-motion preferences. Motion pause is independent of audio playback. Local audio uses an object URL and Web Audio, with no file upload.

`scripts/build-site.mjs` fills the test page's `TOOL_ROWS_START` / `TOOL_ROWS_END` region from the same generated rows as the root index, correcting links for the subdirectory. The checked-in rows are an offline fallback. `tool.json` keeps the experiment out of automatically generated tool lists; the root header supplies the explicit entry point.

## Verification

- JavaScript syntax checks pass.
- Isolated index-build tests pass: root output preservation, synchronized rows, escaping, relative URLs, ordering, hidden-tool exclusion and missing-marker failure.
- Renderer and state checks pass with a simulated Canvas/DOM at 1000×900 and 390×490: finite draw coordinates, no per-frame canvas allocation, pause, reduced motion, settings, reset, visibility recovery and audio selection without autoplay.
- CSS review finds normal text contrast above 4.5:1; panel focus and action-button semantics were corrected.
- Browser visual QA and the full repository build/guard remain unverified: this execution environment cannot bind a local HTTP server or access GitHub over shell networking, and browser file URLs are blocked.

## Publication

Run the repository's canonical `node scripts/publish.mjs -m "Add separate landscape index test"` from a current full checkout with working GitHub access after browser QA. Do not replace the root index with this test page. The GitHub Pages workflow rebuilds the site and checks the repository guard.
