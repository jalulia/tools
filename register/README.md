# Register

An authoring tool for normalised geometry over an image: hand-set structure, regions, and
numbered points, in 0–1 coordinates, with the real h-figures pipeline as a live preview.

Built because correcting 31 hand-authored primitives against a 304 px reference by editing
JSON is the wrong instrument for the job.

- `index.html` — shell and styles
- `core.js` — the document, the profiles, the geometry, export/import, the diff
- `view.js` — viewport, rendering, hit-testing, drawing tools
- `ui.js` — chrome, rails, inspector, review, keyboard
- `sync.js` — Supabase over plain fetch (project `register`, RLS gated on a workspace key)
- `preview.js` — drives the worker and the plates
- `pipeline.worker.js`, `plates.js` — **copied verbatim** from the h-figures build by
  `extract-pipeline.py`; never hand-edit them, or the preview stops being the instrument
- `CLAUDE.md` — the protocol a Claude session follows on a document

`?d=<id>` opens a document · `?k=<key>` carries the workspace key · `?local=1` skips the
backend entirely and works out of localStorage.
