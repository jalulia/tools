# Rules for every Claude session working in jalulia/tools

Agreed with Julia on 2026-11-13 (library CMS brief: https://claude.ai/artifact/WX1DFZC7dcjEKdwYVUZKui).

## Publishing
- Publish only with `node scripts/publish.mjs -m "message"`. Never `git push` by hand, never commit with a merge in
  progress, never push conflict markers.
- `publish.mjs` rebases on main, rebuilds the generated files in order, runs the guard, updates the census and pushes.
  If it stops, read what it printed and fix the cause; do not work around it.
- GitHub rebuilds the generated files on every deploy (`scripts/build-data.mjs` in `.github/workflows/deploy.yml`).
  Do not hand-edit them: `library/catalog.*`, `fixity.json`, `llms.txt`, `library/index.html`, `census.json`,
  `registry.json`, `techniques.json`, `atoms.json`, `_shared/reg-index.js`, `_shared/vocab.js`, `gallery/index.html`,
  and the `index.html` of every T&T technique, plate, application and template page.
- The build order is fixed in `scripts/build-data.mjs`. Never run the steps in another order.

## The guard (`scripts/guard.mjs`, run on every deploy)
- A page listed in `library/census.json` may only disappear if a `.quarantine/<date>/MANIFEST.md` names its folder,
  or the CMS archived or removed it.
- Nothing new goes on tools without parameters: a new page needs at least one working control (editing text counts).
- A page's dials may not drop below its census count.
- Complete means at least 4 dials that change the technique, plus Reset. Layout-only dials (row height, gutter,
  margin) do not count.

## Removing things
- Quarantine only: move files to `.quarantine/<YYYY-MM-DD>/` and add a manifest row. Never delete. Julia does the
  final pass.
- Once the CMS ships, Archive and Remove are hers, in the CMS. Its edits file (`library/_build/edits.json`) is applied
  last by every build; never edit it by hand.

## Sources
- Study engine sources live in `sources/technique-studies/` (reference images stay private, outside the repo).
- US English only. No cream or warm off-white grounds. Never oxblood.
