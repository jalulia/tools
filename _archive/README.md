# _archive/

Tools that have been quarantined out of the active tree. `scripts/build-site.mjs` does not build folders under `_archive/`, so nothing here ships. Contents are kept for the record; Julia decides when to delete outright.

## 2026-09-07 · nav review §5a + §7.3 rulings

- `book-of-shaders/` — its 22 chapters live inside `encyclopedia/manifest.js` as course-mode techniques. The standalone tool was a redirect stub that landed a reader on the encyclopedia's Techniques front door; the sibling switcher lied about the click.
- `components/` — its 30 lens studies live inside `encyclopedia/` as fragment-lane entries. Same redirect-stub pattern as book-of-shaders.

Both folders keep their own `manifest.js`, `content/`, `tool.json`, and `README.md` verbatim; the only change is the path. Restoring either is a `git mv _archive/<name> .` followed by re-adding it to the mast tool-switcher and to `scripts/build-site.mjs discoverTools()` (which already ignores `_archive/`).
