# tools

Personal monorepo for small browser-based tools. Everything here opens by double-click from
`~/Downloads/tools` with no server and no build step, and the same files are what GitHub Pages serves.

## Projects

- [meshviz](./meshviz) — browser-only mesh-to-diagram converter *(built: Vite → `dist/`)*
- [signature-builder](./signature-builder) — node-wired email signature builder for Impossible Outcomes; edit, preview, copy into Gmail
- [ki-landscapes](./ki-landscapes) — Ki · Landscape Atelier: a field guide to the generative landscape system

### learn — two tools on one shell

- [book-of-shaders](./book-of-shaders) — *The Book of Shaders* adapted onto the shared `learn/` shell: the
  book's chapters as a live GLSL bench, plus **Fractals**, **Image operations**, **Kernel convolutions**,
  **Filters**, **Dithering and quantization** and **Domain warping** written here where the book leaves stubs
  or nothing at all, and four **worked examples** that carry the critique they had to survive. Every shader
  in it is written here; the book is credited for the argument, never for code.
- [components](./components) — the lens library: each lens a complete standalone plate with its reference
  decomposition, PASS 0 and faults on the page beside it, in six styles. Every texture is computed; nothing
  is a stock filter.
- [learn/](./learn) — the shared shell itself. Not a tool: `tool.json` marks it `hidden`, so it never
  appears on the landing page. It holds the tokens, the stylesheet, the router, the three stage adapters,
  the fragment contract and the manifest schema. Open `learn/index.html` for the colophon.

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

**Adding a chapter** (`book-of-shaders`):

```
cp -r content/_template content/22-my-chapter
$EDITOR content/22-my-chapter/entry.js      # id, index, order, section, title, text, examples[]
# add '22-my-chapter' to entries[] in manifest.js
node scripts/build-site.mjs                 # the guard verifies it before it can deploy
```

**Adding a lens** (`components`):

```
cp -r content/_template-lens content/e7-new-thing
$EDITOR content/e7-new-thing/fragment.html  # link ONE content/_styles/<style>.css
$EDITOR content/e7-new-thing/entry.js       # id, section, style, frame.designWidth, thumb.crop
# add 'e7-new-thing' to entries[] in manifest.js
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node scripts/index-tools.mjs --tool components --shots
```

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

The acceptance matrix, the static checks, the citation audit and the accessibility pass live in
`/home/claude/team/qa/`. See `team/qa/RESULTS.md` for the current table and `team/qa/PR-BODY.md` for the
branch description.

```
cd /home/claude/tools && (python3 -m http.server 8123 >/dev/null 2>&1 &)
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node /home/claude/team/qa/matrix.mjs   # all 14 criteria
node /home/claude/team/qa/static-checks.mjs                                      # the source rules
node /home/claude/team/qa/cite-audit.mjs                                         # every file:line citation
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node /home/claude/team/qa/axe.mjs      # axe-core, local copy only
```
