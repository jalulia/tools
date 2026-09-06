# Encyclopedia refactor — implementation plan for Claude Code

**Repo:** `jalulia/tools` · local: `~/Documents/Claude/Projects/Tools/tools/`
**Owner:** Julia Compton · **Author of this plan:** Claude (Cowork session 2026-09-06)
**Purpose:** hand this to Claude Code (CLI) so it can execute E10 → E15 without further briefing.

## 0. How Claude Code gets these files — READ FIRST

The three canonical inputs (this plan, the sound audit, and the plate-proof HTML) were authored in a Cowork session and delivered onto Julia's Mac at `~/Documents/Claude/Projects/Tools/tools/`. They are on-disk but **not yet pushed to `jalulia/tools` main branch**. Before starting work Claude Code either:

- **Option A (recommended):** Julia commits and pushes them to a working branch. From `~/Documents/Claude/Projects/Tools/tools/`:
  ```bash
  git checkout -b e10-plate-view
  git add encyclopedia/content/birefringent-ray-bench/plate-proof.html \
          claude/15-encyclopedia-refactor-plan.md \
          claude/16-sound-audit.md
  git commit -m "E10 · plate-proof + plan + sound audit"
  git push -u origin e10-plate-view
  ```
  Then Claude Code checks out that branch and reads normally.

- **Option B:** Claude Code reads these three files from the local checkout on Julia's Mac. She'll say "the files are at `~/Documents/Claude/Projects/Tools/tools/{encyclopedia/content/birefringent-ray-bench/plate-proof.html, claude/15-encyclopedia-refactor-plan.md, claude/16-sound-audit.md}`." Read them there before touching main.

If neither option is available yet, Claude Code STOPS and asks Julia to place the files, rather than guessing at the plate-proof's layout and interaction rules.

`manifest.schema.json` does not yet exist in the repo — it is a **CREATE** at E10, not an edit. See §4c.

---

## 1. Repo file map — where things actually live

Confirmed against the repo tree, corrected from earlier draft:

```
jalulia/tools/
├── BUILD-NOTES-ENCYC.md              ← the ck-e0..e9 plan (E10-E15 continue this numbering)
├── claude/                           ← plans and audits (CREATE on E10; see §0)
│   ├── 15-encyclopedia-refactor-plan.md  ← this file
│   └── 16-sound-audit.md             ← sound-lane refactor
├── encyclopedia/
│   ├── index.html                    ← the archive's entry point
│   ├── manifest.js                   ← the entry manifest (inline entries + registered ones)
│   ├── manifest.schema.json          ← CREATE at E10; validated by verifyManifests
│   ├── swatches.js
│   ├── tool.json
│   ├── CHECKPOINT-E1.md .. CHECKPOINT-E9.md
│   └── content/
│       ├── <slug>/entry.js           ← 178 entries, each a folder
│       ├── <slug>/fragment.html
│       ├── <slug>/thumb.png
│       ├── _engines/                 ← shared canvas/audio helpers
│       ├── _index/                   ← CREATE at E13; techniques.json, atoms.json
│       └── _archive/                 ← CREATE at E14; quarantined entries
├── learn/                            ← THE SHELL. AT REPO ROOT, NOT inside encyclopedia/
│   ├── shell.js
│   ├── views.js                      ← current entry renderer; E10 patches this
│   ├── views/                        ← CREATE at E10; entry-plate.js lands here
│   ├── plot.js
│   ├── shell.css
│   ├── tokens.css
│   ├── fonts/
│   └── adapters/                     ← glsl.js, canvas2d.js, fragment.js, audio.js
├── scripts/
│   ├── build-site.mjs
│   ├── build-crossover.mjs           ← CREATE at E13
│   ├── coverage-report.mjs           ← CREATE at E15
│   └── lib/
│       └── manifests.mjs             ← extend at E10 with checkCoverage
├── components/, book-of-shaders/, garden/, gallery/, technique-studies/, tools like meshviz, keyline-and-ink, register/ …
└── _site/                            ← build output; do not hand-edit
```

**Rules:**
- `learn/` is at **repo root**. The shell surrounds the encyclopedia; do not move it under `encyclopedia/`.
- `encyclopedia/content/<slug>/` is where every entry lives, always. When this doc says "content/foo" it means `encyclopedia/content/foo`. This is now explicit throughout §6, §7, §8.
- `encyclopedia/manifest.js` — the manifest. Both inline entries and `content/<slug>/entry.js` registrations are listed there.

---

## 2. What to read, in order

1. `encyclopedia/content/birefringent-ray-bench/plate-proof.html` — the working proof, ~1400 lines, self-contained. **Open in a browser. Interact with it.** Every ruling in §3 came from Julia's review of this file.
2. `claude/15-encyclopedia-refactor-plan.md` — this file.
3. `claude/16-sound-audit.md` — the sound-lane refactor.
4. `BUILD-NOTES-ENCYC.md` at repo root — the ck-e0..e9 plan already in force; E10-E15 continue it.
5. `learn/shell.js`, `learn/views.js`, `learn/plot.js`, `learn/adapters/*.js` — the existing shell. The plate view plugs into this; do not rewrite the shell.
6. `encyclopedia/manifest.js` — the manifest.

---

## 3. The plate view — reference implementation

`plate-proof.html` IS the reference. Summary follows; when in doubt, read the file.

### 3a. Layout

```
┌── NAV ────────────────────────────────────────────────────────────────────┐
│ ENCYCLOPEDIA  Explorations / Optics / A5 · Birefringent ray-bench         │
│                                        ✓ COVERAGE 7/7  ← A4 · INDEX · A6→ │
├── NOTES (440 px) ──┬── FIGURE ────────────────────────────────────────────┤
│                    │                                       ┌── LOG ─────┐ │
│  <body p>          │                                       │ ● READ     │ │
│                    │                                       │ ↻ REPLAY   │ │
│  SOURCE            │                                       │ SPEC ⇥     │ │
│  <source line>     │                                       │ TRACK LOG  │ │
│                    │          DRAWING                      │ 01 · GRND  │ │
│  TECHNIQUES READ   │       (canvas or SVG)                 │ 02 · FORM  │ │
│  [chip] [chip]…    │                                       │ …          │ │
│                    │                                       │ 10 · TYPE  │ │
│  ─── CROSSOVER     │                                       │ READ       │ │
│  Also uses …       │                                       │ <current>  │ │
│  Shares atom …     │                                       └────────────┘ │
│                    │                                                       │
│                    │                              ┌──── RELATED (5) ────┐ │
│                    │                              │ crx01 …  variant-of │ │
│                    │                              │ c5 …     technique- │ │
│                    │                              │ three-rays… shares… │ │
│                    │                              │ …                   │ │
│                    │                              └─────────────────────┘ │
└────────────────────┴───────────────────────────────────────────────────────┘

SPEC PANEL — slides in from right on click of a chip / point / Spec button.
Starts BELOW the nav (top:74px) so the nav stays visible whether spec is open or closed.
```

### 3b. Interactions (Julia's rulings, this session)

- **Global nav.** Breadcrumb + coverage badge + pager. Persists across all entries. When spec panel opens, nav STAYS VISIBLE — spec panel starts at `top: 74px`.
- **Read toggle (r).** ON: point markers on plate, log rail visible. OFF: point markers hidden, log body hidden, log-ctl row (Read/Replay/Spec buttons) stays visible so the user can toggle back on. Default: ON. Toggling ON re-runs the sweep.
- **Replay (space).** Re-runs the read-head sweep. Only fires when Read is ON.
- **Spec panel (s).** Slides in from right, 60vw wide. Contains the full JSON of `spec`, colourised, with the highlighted technique block's rows tinted red-pink. Copy button copies the JSON. Close button (×) or `Escape` closes.
- **Techniques Read chips.** **Hover** → highlight the corresponding SVG elements (accent stroke). **Click** → lock the chip (dark background), open the spec panel with that technique block highlighted. **Click again on same chip** → unlock, close spec. `lockedTid` prevents hover from fighting a locked selection. `Escape` clears everything.
- **Log rows.** Each row: `[num] [u] [v] [discipline] [truncated label]`. Hover a row → same highlight behaviour as hovering a chip that matches that point's technique. Click a row → select the point (marker turns accent, spec opens to that technique).
- **Point markers on the SVG.** Numbered boxes with leader lines. Blank (hidden) until the read-head sweep reveals each in u/v order. Click a marker → same as clicking a row.
- **Coverage badge in the nav.** Green `✓ COVERAGE · N/N techniques pointed` when coverage holds; red `✗ COVERAGE FAIL · uncovered <id>, orphan-point <id>` when it doesn't. Same logic as verifyManifests (§5).
- **RELATED block, bottom-right.** Replaces the old title block. Rows = related entries (from `related[]` + `crossover.also_uses[]`), each linking to `#/entry/<id>` with the relation type on the right. Header shows total count. Empty state: block hides entirely.

### 3c. Kicker + lede — removed from the plate

The entry identity lives in the top nav's breadcrumb only. There is NO `kicker` red-mono line in the notes column. There is NO expository `lede` display sentence. The notes column starts with `body[]`.

### 3d. Meta grid in the notes column — Source only

The "Entry" section of the old meta grid (title + code + sheet) is redundant with the breadcrumb. The meta grid now contains only `SOURCE`, spanning both columns. Below meta: `TECHNIQUES READ` chips, then `CROSSOVER` block.

### 3e. Method line — auto, override allowed

`method` = `spec.techniques.map(t => t.name).join(' · ')` unless the entry declares a hand-authored `method` string. Not displayed on the plate directly (the chips carry it); available in the spec panel as `spec.method`.

### 3f. Coverage badge behaviour

The badge is always rendered. Green when `points[]` is absent (scan not enabled) OR when every `spec.techniques[].id` has at least one `points[].t` citing it. Red when a technique is uncovered or a point cites a non-existent technique. Text on the badge names the failure(s).

---

## 4. Schema — the extension per entry

### 4a. Full shape

```js
Shell.registerEntry({
  // ── kept from current schema ─────────────────────────────────────────
  entity:      'exploration' | 'technique' | 'atom' | 'style' | 'coupling' | 'mechanism',
  id:          'kebab-case-slug',
  index:       'A5' | 'ST-01' | 'KI-02' | …,        // display code
  order:       166,                                   // sort position within section
  title:       'Birefringent ray-bench',
  section:     'techniques' | 'sound' | 'unfiled' | 'studies' | …,
  style:       'technical-doc' | 'plate' | 'chart' | …,
  status:      'canonical' | 'exploration' | 'proposed' | 'unsorted' | 'historical' | 'known_failure' | 'stub',
  lane:        'canvas2d' | 'audio' | 'fragment' | 'glsl' | …,
  tags:        ['string', …],
  governed_by: ['skill-id', …],
  instance_of: ['parent-technique-id', …],
  produces:    ['atom-id', …],
  uses:        ['atom-id', …],
  source: { kind, title, date, author, note },
  frame:  { designWidth, aspect, previewHeight },
  thumb:  'thumb.png',
  ruling: { text, by, date },
  related: [{ entry, title?, relation }, …],

  // ── NEW: the plate + spec ────────────────────────────────────────────
  body:   ['<p>paragraph one</p>', '<p>paragraph two</p>'],   // required; replaces `text`
  plate:  {
    fig:    '2.5',                                             // FIG. n
    series: 'EXPLORATIONS · OPTICS',                           // series line (informational)
    sheet:  5,
    of:     173
  },
  method: null | 'hand-authored technique chain string',       // null → auto from spec.techniques

  spec: {
    id:      'entry-id',
    palette: { name: '#hex', … },
    ground:  { colour, tooth, area_ref },
    units:   'design units, 1000 = plate width' | 'SVG viewBox units, 0 205 1040 315' | …,
    techniques: [
      {
        id:             'kebab-technique-id',                  // unique per entry
        short:          'GRND' | 'FORM' | 'MARK' | 'TONE' | 'KEY' | 'TEX' | 'FILL' | 'COL' | 'TYPE' | 'FLD' | 'BUS',
        name:           'Human-readable',
        layer:          'SOURCE' | 'STRUCTURE' | 'MATERIAL RESPONSE' | 'IMAGE FORMATION' | 'SCREEN-SPACE' | 'GRAPHIC COMPOSITION' | 'OUTPUT',
        pass:           1,                                     // 1-indexed order in pass_order
        params:         { … numbers, hexes, ranges, curves },
        implementation: 'One-sentence algorithm description.',
        atoms:          ['atom-id', …],                        // authored, feeds atoms.json
        produces:       ['plain-english effect', …]            // optional
      },
      …
    ],
    pass_order: ['string', …],
    notes:      ['string', …]
  },

  // ── OPTIONAL: the scan mechanic ──────────────────────────────────────
  points: [                                                    // opt-in; coverage rule enforces §5
    { u: 0.029, v: 0.302, d: 'GRND', label: '…', t: 'technique-id', dir: [1, -1] },
    …
  ],
  compare: {                                                   // opt-in; requires points[]
    reference: 'ref/ref-01.png',
    readout:   { palette: true, tone: true, edge: true, grain: true, chroma: true }
  }
})
```

### 4b. Rules

- `body[]` replaces the old `text` HTML blob. Keep `text` as a fallback for un-migrated entries; the view template reads `body || [text]` at render time. During E14 backlog retrofit, all entries convert `text` → `body[]`.
- `plate{}` defaults: `series = section.title`, `sheet = order`, `of = total entries`, `fig = order/10`. Explicit override wins.
- `spec.techniques[].id` is the join key for crossover. Must be kebab-case, unique within the entry.
- `atoms[]` on each technique block is what feeds `atoms.json`. Authored, not derived.
- `points[]` + `compare{}` are the scan mechanic, opt-in and independent per §5.

### 4c. `encyclopedia/manifest.schema.json` — CREATE at E10

The file does not exist yet. Create it at `encyclopedia/manifest.schema.json` with JSON-schema definitions for every field in §4a. The existing schema's rules (from `scripts/lib/manifests.mjs` and the inline validation in `manifest.js`) provide the starting shape — extract those into JSON-schema, then add the new fields. `verifyManifests` loads and applies the schema at boot.

---

## 5. Coverage rule — the repeatability contract

### 5a. What it enforces

An entry that declares `points[]` is claiming: another builder can read `spec` and regenerate the picture, and every technique named in `spec.techniques[]` has at least one point on the picture citing it. This is what makes scan-enabled entries repeatable.

**Two checks:**

1. **Coverage:** every `spec.techniques[].id` appears in `points[].t` at least once. Uncovered → fail.
2. **Orphan-point:** every `points[].t` value corresponds to a real `spec.techniques[].id`. Orphan → fail.

### 5b. Where it runs

Inside `scripts/lib/manifests.mjs verifyManifests`. An entry that ships `points[]` and fails either check does not register. The error names the offending id(s).

### 5c. Sketch

```js
// scripts/lib/manifests.mjs
export function checkCoverage(entry) {
  if (!Array.isArray(entry.points) || entry.points.length === 0) return { ok: true };
  const techniqueIds = new Set((entry.spec?.techniques || []).map(t => t.id));
  const pointIds     = new Set(entry.points.map(p => p.t));
  const uncovered = [...techniqueIds].filter(id => !pointIds.has(id));
  const orphan    = [...pointIds].filter(id => !techniqueIds.has(id));
  if (uncovered.length === 0 && orphan.length === 0) return { ok: true };
  return { ok: false, uncovered, orphan };
}
```

`verifyManifests` iterates every entry, calls this, and refuses to boot the shell (via a thrown error at manifest load time) if any entry with `points[]` fails. Same discipline as the current manifest hard-rule gates.

### 5d. Runtime badge

The plate view reproduces the same check client-side and paints the coverage badge in the nav. Duplication is fine — the runtime check is a courtesy for authoring; the build-time check is the contract.

---

## 6. Crossover — derived indices

### 6a. Two files

- **`encyclopedia/content/_index/techniques.json`** — `{ [technique_id]: { name, layer, appears_in: [{entry_id, plate, params}] } }`
- **`encyclopedia/content/_index/atoms.json`** — `{ [atom_name]: { used_by: [{technique_id, entry_id, plate}] } }`

Create `encyclopedia/content/_index/` at E13.

### 6b. Build script

New file: `scripts/build-crossover.mjs`. Runs manually via `node scripts/build-crossover.mjs` and via CI on push. Walks:

```js
for (const entry of manifest.entries) {
  for (const tech of entry.spec?.techniques ?? []) {
    techniques[tech.id] ??= { name: tech.name, layer: tech.layer, appears_in: [] };
    techniques[tech.id].appears_in.push({
      entry_id: entry.id, plate: entry.index, params: tech.params
    });
    for (const atom of tech.atoms ?? []) {
      atoms[atom] ??= { used_by: [] };
      atoms[atom].used_by.push({
        technique_id: tech.id, entry_id: entry.id, plate: entry.index
      });
    }
  }
}
```

Writes both files. Client-side, `#/technique/<id>` and `#/atom/<slug>` fetch from these files. The plate's CROSSOVER block reads from the same indices at render time.

### 6c. `related[]` on the plate

The RELATED block in the plate reads `entry.related[]` (existing schema) FIRST, then augments from `crossover.also_uses[]` derived from `techniques.json`. Deduped by entry id. Cap 5 visible rows; count above the cap shown as `RELATED · N`.

---

## 7. Sound-lane migration

Per **`claude/16-sound-audit.md`** — the sound section files atomic decompositions of Julia's real sound systems as if they were separable atoms; refactor to project-mechanism entries. Runs at E14 (backlog retrofit), NOT E10.

### 7a. Actions

1. **Create** four mechanism entries: `pussyphus-crowd-and-foley`, `holy-ops-additive-relics-kit`, `ki-omnichord-in-key` (stub), `ki-circle-of-fifths` (stub). Each is a new folder at `encyclopedia/content/<mechanism-id>/entry.js`.
2. **Fold** the six audio atoms (`freeverb-comb`, `allpass-diffuser`, `master-limiter`, `sidechain-duck`, `banded-burst`, `buzz-envelope`) into their parent mechanisms' `spec.techniques[]` blocks. Every atom keeps its params + note; it just becomes a technique block inside the mechanism.
3. **Quarantine** the retired atom folders to `encyclopedia/content/_archive/sound-atoms-2026-09-06/` with a `manifest.txt` naming what moved and its new parent. Never delete outright (Julia's file-organization rule).
4. **Keep** `master-limiter-driver` and `banded-burst-driver` as cross-cutting technique abstractions. Mechanisms cite them via `instance_of[]`.
5. **Keep** `ki-soundscape-bands`. Promote from coupling framing to explicit mechanism.

### 7b. Ki source pointer

Julia ruled at plate-review: **Ki omnichord + circle-of-fifths source is the Impossible Outcomes GitHub repo and/or the Impossible Outcomes Claude Project**. Claude Code fetches source there; if the code doesn't exist yet, ship the two entries as `status: 'stub'` with the mechanism named but no working plate.

---

## 8. Stages E10 → E15

Continues the checkpoint numbering from `BUILD-NOTES-ENCYC.md` (E0-E9 already spec'd there).

### E10 — schema + plate view + one proof (COMPLETE in proof form)

**Goal:** the schema extension is authored, `verifyManifests` enforces coverage, one entry renders in the plate template.
**Delivered:** `encyclopedia/content/birefringent-ray-bench/plate-proof.html` as a standalone HTML the shell is a port of. Julia has reviewed and approved (v5).
**Claude Code work:** port `plate-proof.html` into the shell as `learn/views/entry-plate.js`. The port replaces the current `#/entry/<id>` renderer in `learn/views.js`. Preserve every interaction in §3b. Preserve the exact CSS variables and classes so the shell's forced-light contract still holds. Reads `entry.body`, `entry.plate`, `entry.spec`, `entry.points`, `entry.compare`, `entry.related`, `entry.crossover` from the manifest.
**Files touched:**
- `learn/views/` (NEW folder)
- `learn/views/entry-plate.js` (NEW) — the view template
- `learn/views.js` — swap `#/entry/<id>` to route to `entry-plate.js`
- `learn/shell.css` — add plate-specific styles (or import a new `learn/entry-plate.css`)
- `encyclopedia/manifest.schema.json` (NEW) — per §4c
- `scripts/lib/manifests.mjs` — add `checkCoverage`, call from `verifyManifests`
- `encyclopedia/content/birefringent-ray-bench/entry.js` — extend the existing entry with `body[]`, `plate{}`, `spec{}`, `points[]`, `related[]` per `plate-proof.html`

**Verify:**
- Coverage badge on `#/entry/birefringent-ray-bench` reads `✓ COVERAGE · 7/7`.
- Every chip hover highlights SVG elements; click locks + opens spec.
- Nav stays visible with spec open.
- Delete a point in devtools → badge goes red naming the uncovered technique.
- Run `verifyManifests` — passes for all existing entries (they don't declare `points[]` yet, so no coverage check applies).

**Commit:** `E10 · plate view + coverage rule + birefringent-ray-bench proof`

### E11 — default flip, delete old renderer

**Goal:** every `#/entry/<id>` renders through the plate view, not the old template.
**Claude Code work:** delete the old entry renderer from `learn/views.js`. There's no `?legacy=1` fallback. For every existing entry that doesn't yet declare `body[]`, fall back to `entry.text` → wrap in a single `<p>`. `spec` absent → plate renders with empty techniques chips and no crossover.
**Files touched:** `learn/views.js`, any adapters that referenced the old renderer.
**Verify:** every entry in the archive still renders (visually degraded for un-migrated entries is OK; broken is not). Six screenshots at 1440×900 across sections.
**Commit:** `E11 · plate view is default; retire legacy entry renderer`

### E12 — import 8 ST plates into `studies` section

**Goal:** the eight ST technique studies live as first-class encyclopedia entries.
**Claude Code work:**
1. Add `{ id: 'studies', title: 'Studies', order: <after existing sections> }` to `encyclopedia/manifest.js` sections array.
2. For each `st-NN` in the source folder `~/Documents/Claude/Projects/Compontents/Claude outputs/technique-studies/`:
   - Create `encyclopedia/content/st-NN-<slug>/entry.js` calling `Shell.registerEntry({...})`.
   - Set `section: 'studies'`, `style: 'technique-study'`, `status: 'canonical'`, `entity: 'exploration'`, `lane: 'canvas2d'`.
   - `body[]`, `plate{}`, `spec{}`, `points[]` lift verbatim from `src/art/st-NN.js` in the source folder.
   - `compare{}` — on for ST-04, ST-06, ST-07 (public-domain / own instrument); off for ST-01, ST-02, ST-03, ST-05, ST-08 (public-build rule from `technique-studies/PROCESS.md` §5.4).
3. The standalone `tools/technique-studies/` tool folder stays where it is — the encyclopedia carries the entries, not the standalone HTML plates.

**Verify:** `#/studies` lists 8 entries. Every ST plate passes coverage. Fidelity readout appears on the three that ship compare.
**Commit:** `E12 · import 8 technique studies as encyclopedia entries under section:studies`

### E13 — crossover build

**Goal:** the two derived indices exist and drive `#/technique/<id>`, `#/atom/<slug>`, and the plate RELATED block.
**Claude Code work:**
1. Write `scripts/build-crossover.mjs` per §6b. Runs manually via `node scripts/build-crossover.mjs` and via CI on push.
2. First run creates `encyclopedia/content/_index/techniques.json` and `encyclopedia/content/_index/atoms.json`.
3. Update `learn/views.js` for `#/technique/<id>` and `#/atom/<slug>` to read from these files instead of iterating manifest at render time.
4. Update `learn/views/entry-plate.js` to fetch these indices on load and populate the RELATED block per §6c.

**Verify:** `#/technique/hairline-construction` (or any technique-id present across ≥2 entries) shows the aggregated appearances. `#/atom/hairline` shows which techniques use it. Every plate's RELATED block populates from the indices.
**Commit:** `E13 · crossover build script + techniques.json + atoms.json`

### E14 — backlog retrofit + sound-lane migration

**Goal:** every existing entry has a `body[]` and (where measurable) a `spec.techniques[]`. Sound lane is refactored per `16-sound-audit.md`.

**Claude Code work — visual side:**
1. Every chapter in `encyclopedia/content/00-introduction` through `encyclopedia/content/21-domain-warping` — author `body[]` from `text`, then author `spec.techniques[]` derived from the chapter's build-up (each `stages[]` entry maps to a technique block).
2. Every exploration with measurable technique params (e.g. `keyline-coverage-chain`, `caustic-refraction-web`, `moire-aliasing`, `chladni-nodal-field`) — author `spec.techniques[]` from the existing `fragment.html` code.
3. Every atom / style doc / historical entry — set `spec.techniques: []`. Plate renders with empty chips, no method line, no crossover, no scan. Legal per §4.
4. `points[]` added per-entry where the coverage rule can be honestly met — never manufactured.

**Claude Code work — sound side (per `16-sound-audit.md`):**
1. Create the four mechanism entries at `encyclopedia/content/pussyphus-crowd-and-foley/entry.js`, `encyclopedia/content/holy-ops-additive-relics-kit/entry.js`, `encyclopedia/content/ki-omnichord-in-key/entry.js`, `encyclopedia/content/ki-circle-of-fifths/entry.js`. The Pussyphus and Holy Ops entries come from Julia's own repos (paths TBD by Julia). Ki mechanisms come from the Impossible Outcomes repo + Claude Project (§7b).
2. Fold the six atoms into their parent mechanisms' `spec.techniques[]`.
3. Quarantine to `encyclopedia/content/_archive/sound-atoms-2026-09-06/` with a `manifest.txt`.
4. Keep the two `-driver` techniques.

**Verify:** every entry in the archive has `body[]`. Coverage passes on every entry with `points[]`. Sound section lists 5 mechanism entries + 2 driver techniques; atoms are gone from the top level. `encyclopedia/content/_archive/` holds the quarantined atoms.

**Commit (split, multiple):**
- `E14a · body[] on every entry, spec.techniques[] on chapters`
- `E14b · spec.techniques[] on measurable explorations`
- `E14c · sound-lane migration to project-mechanism entries (see 16-sound-audit.md)`
- `E14d · quarantine six retired sound atoms`

### E15 — Julia's read-through + the 74 unsorted

**Goal:** Julia has audited the archive at plate resolution and ruled on every ambiguous entry. The 74 corpus unsorted rows are imported.
**Claude Code work:**
1. Print a coverage report: `node scripts/coverage-report.mjs` — lists every entry with `points[]` and its coverage state, every entry with an incomplete `spec.techniques[]`, every entry with a proposed status still awaiting Julia.
2. Import the 74 unsorted rows from `encyclopedia/content/inventory.csv` (or similar — location per `BUILD-NOTES-ENCYC.md` §Authority.1.b). Each lands as `status: 'unsorted'` with `proposed_grade` in metadata. Ship a thumbnail pass first (screenshot each) so the index has real thumbs.
3. Julia rules on what promotes, what retires. Claude Code executes the rulings.

---

## 9. Git + push path

- **Repo remote:** `git@github.com:jalulia/tools.git` (SSH). Julia's Mac has SSH auth.
- **Branch strategy:** every stage a topic branch (`e10-plate-view`, `e11-default-flip`, `e12-studies-section`, `e13-crossover`, `e14-backlog`, `e15-julia-pass`). PR into `main` when the stage's verify passes.
- **From Claude Code CLI on Julia's Mac:** normal `git push` works.
- **From a Cowork/cloud session:** the cloud proxy blocks push to `jalulia/tools`. Deliver work as a git bundle → `device_commit_files` into `~/Developer/tools` (HTTPS creds with stored token) → run push through Desktop Commander's native Mac shell.
- **CI:** `scripts/build-site.mjs` fails locally on meshviz (`tsc: command not found`) — pre-existing, CI builds fine. Do not attempt to fix during E10-E15.
- **Public build:** ST plates whose reference is third-party art strip the inlined reference on the public build (per `technique-studies/PROCESS.md` §5.4). E12 imports MUST honour this — the entry's `compare.reference` for those five studies is `null` on the public build.

---

## 10. Rulings on record (this session)

Every layout decision Julia ruled at plate-proof review. Claude Code must honour these; do not re-litigate.

| # | Ruling |
|---|---|
| 1 | Global nav is a breadcrumb: `ENCYCLOPEDIA   Explorations / Optics / A5 · Birefringent ray-bench`. Not a stacked kicker + title. |
| 2 | Coverage badge sits inline in the nav, right of the breadcrumb, left of the pager. |
| 3 | Pager: `← <prev> · INDEX · <next> →`. Always visible. |
| 4 | No kicker red-mono line in the notes column. No expository lede display sentence. Notes column starts with `body[]`. |
| 5 | Meta grid in notes = SOURCE only. Entry section (title / code / sheet) is redundant with the breadcrumb. |
| 6 | Track log stays on the RIGHT of the figure, contextually next to the drawing. Do not fold into the notes column. |
| 7 | Read / Replay / Spec buttons live in the log rail top-right, not in the notes column. |
| 8 | Read toggle = scan on/off. When OFF: point markers hidden, log body hidden, log-ctl (buttons) stays visible. |
| 9 | Spec panel starts BELOW the nav (`top: 74px`). Nav has `z-index: 100`, spec `z-index: 50`. |
| 10 | Techniques Read chips: hover → highlight SVG only. Click → lock + open spec. Second click → unlock + close. |
| 11 | RELATED block replaces the old title block at bottom-right. Rows read from `related[]` + `crossover.also_uses[]`. Cap 5 visible; count in header. Empty state hides the block. |
| 12 | Method line auto-composes from `spec.techniques[].name`; hand-authored `method` string overrides. |
| 13 | Scan mechanic is a two-part contract: `points[]` (indexing, coverage rule enforced) and `compare{}` (fidelity, requires points). Both opt-in per entry. |
| 14 | ST plates ship in a new `studies` section (E12). |
| 15 | No `?legacy=1` fallback. E11 flips the default and deletes the old renderer the same day. |
| 16 | Sound lane files by mechanism, not by material (per `16-sound-audit.md`). Runs at E14. |
| 17 | Ki mechanism source: Impossible Outcomes GitHub repo + Claude Project. Where the code doesn't exist, ship as `status: 'stub'`. |

---

## 11. Open questions — none blocking

1. **Ki soundscape-bands (§7a.5):** keep filed as a coupling, or promote to first-class mechanism entry? Recommend: promote at E14, add the coupling relation as `related[]` to the visual side. Julia to confirm during E15 read-through if not sooner.
2. **74 unsorted (E15):** what section they land in depends on the thumbnail pass and the proposed_grade values. Recommend a triage session before importing.

Neither of these blocks E10-E13. Claude Code proceeds; Julia rules during E14/E15.

---

## 12. Acceptance — the archive at the end of E14

- Every entry renders in the plate template.
- Every entry with `points[]` passes the coverage rule.
- `#/techniques` reads from `techniques.json`; `#/atoms` reads from `atoms.json`; both aggregate every entry's contributions.
- Every plate's RELATED block populates from the derived indices + entry.related.
- The sound lane holds mechanisms (Pussyphus, Holy Ops, Ki × 2, Ki soundscape-bands) + two driver techniques; the six atoms live in `encyclopedia/content/_archive/sound-atoms-2026-09-06/`.
- `verifyManifests` passes; `build-crossover.mjs` runs cleanly; CI builds green; `jalulia.github.io/tools/encyclopedia` deploys.

The archive is now a web of mechanisms + measurable techniques, indexed by atom, verifiable by the coverage rule. That is the encyclopedia Julia asked for.
