# tools

Personal monorepo for small browser-based tools. Everything here opens by double-click from
`~/Downloads/tools` with no server and no build step, and the same files are what GitHub Pages serves.

## Projects

- [meshviz](./meshviz) — browser-only mesh-to-diagram converter *(built: Vite → `dist/`)*
- [signature-builder](./signature-builder) — node-wired email signature builder for Impossible Outcomes; edit, preview, copy into Gmail
- [ki-landscapes](./ki-landscapes) — Ki · Landscape Atelier: a field guide to the generative landscape system

### encyclopedia — one archive

- [encyclopedia](./encyclopedia) — one archive of the practice. **File by atom, read by technique.** Techniques (the spine, the front door at `#/techniques`), Atoms (the material shelves at `#/atoms`, banded by *kind* — substrate, process, texture, colour, engine, field, mark, voice, space, bus), Styles (the six declarations from the lens library at `#/styles`), the Sound lane (audio-adapter-backed entries at `#/sound`), Symptoms (anti-patterns and their known failures at `#/symptoms`), the Unfiled queue (`#/unfiled` — imports awaiting a ruling), and the Skills index (`#/skills` — 22 skills across two shelves, only competency rungs get pages). 168 entries in one manifest; the Book of Shaders and the Components lens library folded in as sources at ck-e1. Old routes `tools/book-of-shaders` and `tools/components` redirect to their encyclopedia entries via the shell-level `redirects` map and a soft-redirect page at the folder root.
- [learn/](./learn) — the shared shell itself. Not a tool: `tool.json` marks it `hidden`, so it never
  appears on the landing page. It holds the tokens, the stylesheet, the router, the four stage adapters
  (glsl, canvas2d, fragment, audio), the fragment contract and the manifest schema. Open `learn/index.html`
  for the colophon.
- [book-of-shaders](./book-of-shaders) — `hidden: true` in `tool.json` after ck-e1; the redirect script
  resolves every old chapter URL to its encyclopedia technique page.
- [components](./components) — `hidden: true` after ck-e1; the redirect script maps every old lens URL to
  its encyclopedia entry.

## Conventions

Each top-level folder is a tool. Two kinds are supported:

- **built** — has `package.json` + `npm run build` → `dist/` (meshviz, via Vite)
- **static** — has `index.html` and no build step; copied as-is (everything else)

Optional `tool.json` per tool: `{ title, description, status, hidden, section }`. Tools with a `section` are
grouped under that label on the landing page; `hidden: true` keeps a folder out of it entirely.
`tool.json` is **not deployed**, so a tool cannot read its own metadata at runtime.

### The data-driven layout (`learn/`)

A chapter, a lens, an example and a style are each **a folder plus one self-registering classic script**.
There is no build step and no `fetch`: under `file://` a classic `<script src>` is the only mechanism that
loads external data, so that is the only one used.

```
book-of-shaders/
  index.html                 the chrome; loads the shell, then manifest.js
  manifest.js                Shell.registerManifest({ id, mode, sections, entries: [ids…] })
  content/13-…/entry.js      Shell.registerEntry({ id, title, text, examples, critique, … })
  content/13-…/main.frag     the file of record for examples[0].code
components/
  manifest.js                …plus styles[]: palette, three type roles, texture vocabulary, engines, rules
  content/_styles/<id>.css   one file per style. Every fragment in that style links exactly one of these.
  content/_engines/*.js      shared, vendored raster/rng/field/halftone/paper/scene code
  content/b1-…/fragment.html a complete standalone document that also opens on its own
learn/
  shell.js views.js shell.css tokens.css
  adapters/{glsl,canvas2d,fragment}.js     one ~60-line seam per lane
  fragment-boot.js                          the only contract a fragment must honour
  manifest.schema.json                      additionalProperties:false, everywhere
```

**Adding a piece** (`encyclopedia`):

```
cp -r content/_template content/<id>                       # or _template-lens for a fragment-adapter piece
$EDITOR content/<id>/entry.js                              # id, entity, section, uses[], instance_of[], governed_by[]
# add '<id>' to entries[] in encyclopedia/manifest.js
node scripts/build-site.mjs                                # verifyManifests fails the deploy on any drift
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node scripts/index-tools.mjs --tool encyclopedia --shots
```

`entity` chooses the page template: `technique`, `atom`, `exploration`, or `coupling` (an exploration
with `driver` + `consequences[]`). `uses[]` cites atoms; `instance_of[]` cites a technique; `governed_by[]`
cites skills (all resolve at deploy time). See `encyclopedia/CHECKPOINT-E*.md` for the ck-by-ck decisions.

**Adding a style**: add an entry to `manifest.styles[]` — `id`, `summary`, `palette`, `type` (display /
text / mono / script), `texture` vocabulary, `engines` (in dependency order, derived from what the fragments
actually `<script src>`), `rules` — and create `content/_styles/<id>.css`. The style file owns the type: it
defines `--f-display` / `--f-text` / `--f-mono` and any `@font-face`, declares `color-scheme: light`, and is
linked by every fragment in the style. A fragment never expects the host to define a face for it.

**Rulings and attribution.** `ruling: { text, by, date, source }` promotes a dated, attributed decision out
of a source comment into data. `by` names the person who actually made it, and the deploy guard requires a
`date` or a `source` (`file:line`) so the claim is checkable. A ruling written during a build that is not
yet a decision uses the reserved author **`proposed`**, which the shell renders in the same furniture under
"PROPOSED RULING — NOT YET JULIA'S". Do not sign a ruling with a name that does not trace to a line in the
corpus.

### Rules that are not negotiable

1. No `fetch`, no `import()`, no `type="module"`, no CDN `<script src="https://…">`. Classic scripts only.
2. Never name a content file `tool.json` or `package.json`, and never a folder `dist/` or `_site/` —
   `build-site.mjs` matches basenames at any depth and would silently drop it from the deploy.
3. Nothing touches `iframe.contentDocument` or `contentWindow.document`. Host and fragment talk by
   `postMessage` only.
4. Forced light: `<meta name="color-scheme" content="light">`, `color-scheme: light` on `:root`, and an
   explicit background on **html and body**. A fragment declares its own ground; it never inherits one.
5. Every `<iframe>` has a `title`, and `src=` — never `srcdoc`.
6. Every count on any page derives from `entries.length`. No string states a number that is not derived.

`node /home/claude/team/qa/static-checks.mjs` asserts 1–6 over the shipped tree.

### The build guard

`node scripts/build-site.mjs` verifies before it copies, and **fails the deploy** on: a schema error; a
missing entry folder or declared file; a content folder that is on disk but not in the manifest; an unknown
section or style; an unresolvable `related` link (including cross-tool); a duplicate or mismatched id; a
`thumb.crop` that cannot fill the card's 232:196; a canonical worked example whose `critique` block has no
`reads_as`, `coupling` or `pass_order`; a ruling attributed to a person with neither a date nor a source;
and any count on a page that `entries.length` cannot produce.

`node scripts/index-tools.mjs` is the non-destructive companion: `--tool <id>` narrows the check,
`--mirror` reconciles `code` literals against the `.frag`/`.js` files of record, `--write` applies only the
safe additions, `--shots` re-renders the contact-sheet thumbnails.

### Licence stance — The Book of Shaders

The `LICENSE` in the upstream book's repository is **not** CC BY-NC-SA: it is all-rights-reserved, permitting
linking and unmodified screenshots for educational material and forbidding hosting or redistribution. This
tool is shaped to that: the prose is **condensed, not reproduced**, every chapter links its source, and
**every shader on every page is written here** — no upstream `.frag` file is copied in. Chapters that adapt
the book's argument carry `source.kind: 'adapted'` with the author, the URL and a `license` string that
states the file's actual terms plus a `note` saying exactly what is ours and what is the book's. Chapters
the book never wrote (14, 16, 17, 18, 19, 20, 21) carry `source.kind: 'original'`. The four worked examples
are Julia's own repositories, cited to `file:line`.

**Open for Julia:** whether to keep `license: 'CC BY-NC-SA 4.0'` on the chapters that still carry it, or set
every one to the upstream file's actual terms. That is a lawyer's call, not a renderer's.

## QA

The acceptance matrix, static checks and axe pass live vendored in `scripts/qa/`. `scripts/qa/matrix.mjs`
now covers the encyclopedia's every route (~205 hashes: `#/techniques`, `#/atoms`, `#/styles`, `#/sound`,
`#/symptoms`, `#/unfiled`, `#/skills`, plus every `#/technique/<id>`, `#/atom/<id>`, `#/style/<id>`,
`#/skill/<id>`, `#/entry/<id>` and `#/coupling/<id>`) across the four `index × apparatus` states at 390
and 1440. Nineteen criteria — PLAN §7's fourteen plus ck-e9's five (governed_by resolves; uses[] resolves
to an atom; instance_of[] resolves to a technique; every coupling has driver + consequences[]; proposed
rulings render as PROPOSED; unsorted entries carry their proposed_grade; the audio adapter builds its
graph without a user gesture; the 74 unsorted show a thumb where one was declared; `#/symptoms` reaches
every anti-pattern in ≤2 clicks).

```
cd tools && (python3 -m http.server 8123 >/dev/null 2>&1 &)
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node scripts/qa/matrix.mjs           # every criterion, both protocols
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node scripts/qa/matrix.mjs --quick   # 390 + 1440, http only (~5 min)
node scripts/qa/static-checks.mjs                                              # the source rules
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node scripts/qa/axe.mjs              # axe-core, local copy only
```

Results land at `scripts/qa/out/RESULTS.md` and `results.json`.
