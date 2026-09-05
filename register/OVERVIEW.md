# Register + the Fig. 2 specimens — overview

_5 September 2026_

Two things were built this session. The second exists because the first was painful.

1. **h-specimens** — the Mode Mode lab page that runs three non-Mode-Mode references through the real
   h-figures instrument, with an authoring overlay for checking coordinates.
2. **Register** — a hosted tool for setting normalised geometry on an image, previewing the real
   plates, and handing the document to Claude to work on.

---

## Part one · Register

**<https://jalulia.github.io/tools/register/>**

### What it is

You put a picture on the screen and mark exact places on it. The marks are stored as fractions of the
picture — 0 to 1 across, 0 to 1 down — so they survive any size, any crop, any screen. Then you hand
the document to Claude and review what comes back, change by change.

The marks are not a separate annotation format. **The document _is_ an h-figures preset**: the same
`structure`, `trackers`, `mask.keep`, `noHatch`, `forceBand`, `darkKey` and `plate` arrays the
instrument consumes. What you drag is the array the pipeline reads, and Export writes that array out.
There is no conversion step to go stale.

### Using it

Press **?** inside the tool for this in full, laid out. The short version:

| | |
|---|---|
| **1 · Get a picture in** | Drag an image file onto the middle of the screen. Or **Image ▾** → choose a file. It uploads, names the document from the filename, and fits. |
| **2 · Pick a layer** | The list on the left. Click one — usually `structure` — and everything you draw goes there. |
| **3 · Draw** | Tools top left. **Pen** clicks out a line, one point per click; `Enter` finishes, `⇧Enter` closes it into a shape, `Esc` throws it away. **Rect**, **Circle**, **Ellipse** are drag-to-draw. **Point** drops a numbered point. |
| **4 · Fix it** | **Select**. Every white square is a handle — drag it. Arrow keys nudge one pixel of the original image; `⇧` makes it five. The right panel lists exact numbers — type into them. |
| **5 · Hand it over** | **Ask Claude** → say what you want → it copies one line. Paste that into a Claude chat. |

The strip along the bottom always shows the cursor position in both fractions and original pixels. The
small square that follows the cursor is a ×6 magnifier — that is how you land on a one-pixel edge.

**Preset** and **View** in the left rail are folded shut on a fresh document. Open them when you need
them; ignore them otherwise.

### The layers

Only the first two matter for most work. The rest are settings for the Mode Mode plate.

| layer | colour | what it is |
|---|---|---|
| `structure` | black | lines you draw by hand from the picture — the drawing |
| `trackers` | blue | the ten numbered points the reading fixes (10, 12 … 28) |
| `mask keep` | green | only what is inside this gets read at all |
| `mask drop` | red | cut this out — a watermark, a corner |
| `noHatch` | grey | no shading in here. Applied _after_ forceBand, so it wins |
| `forceBand` | amber | shade this region at a set weight regardless of the form gate |
| `darkKey` | violet | where the drawing's own ink is traced into line |
| `hatch plate` | grey | a region shaded at a fixed angle |
| `keyClip` / `keyDrop` | teal / plum | confine or exclude the pipeline's own chains |

### Preview

**Preview** runs the real Mode Mode pipeline on your picture and draws the actual plates over it — spot
under hatch under key, multiplied, with the 1.5 / 1.0 px off-register trap. `pipeline.worker.js` and
`plates.js` are **copied verbatim** out of the h-figures build by `extract-pipeline.py`, so this is the
same instrument, not an imitation. The picture fades so the plates read; press again to hide them; `d`
hides your marks so you can judge the plate alone.

It reports timings in the status bar, and warns when `scale` is being capped — `analyse()` limits the
analysis width to the source width below 600 px, so `scale: 1.5` on a 304 px reference does nothing.

### The Claude loop

1. You write an ask and press **Ask Claude**. The document is saved, marked `asked`, and one line is
   copied to your clipboard: `Register document r_xxxx — <your ask>`.
2. Paste that into a Claude chat.
3. Claude reads the document by id, measures off the source, edits the preset, writes a **revision**
   (author `claude`), and sets a one-line reply.
4. Reopen the document. You get a **review panel**: every change listed by layer and index, each one
   saying how far it moved in source pixels. Click any row to drop it. **Keep** saves what is left.

Revisions are append-only, so nothing is lost and any pass can be rolled back. A save that would
overwrite someone else's is refused rather than silently winning.

`register/CLAUDE.md` in the repo documents the protocol so any future Claude session follows it
without being told.

### Keys

| | | | |
|---|---|---|---|
| `v` select | `p` pen | `r` rectangle | `c` circle |
| `l` ellipse | `t` numbered point | `m` mirror across the axis | `d` hide your marks |
| `↑↓←→` nudge one source pixel | `⇧↑` nudge five | `⌥drag` move the whole shape | `i` hide the picture |
| `⌘Z` undo | `⌫` delete selection | `Tab` next layer | `[` `]` previous / next shape |
| `0` fit | `1` actual size | `space+drag` pan | `'` grid |
| `⌘S` save now | `?` help | `⌘-scroll` zoom | scroll pan |

### Export and import

**Export ▾** gives three things, each copyable or downloadable:

- **Preset** — a drop-in `'slug':{ … }` block in exactly the shape `specimen-presets.js` wants, one
  primitive per line.
- **Document JSON** — round-trips back into the tool.
- **SVG** — the geometry alone at the source's pixel size, for dropping into a drawing app.

The same box imports: paste a preset (bare object, `'chalice':{…}`, or strict JSON) and press
**Load what is in the box**.

### Behind it

| | |
|---|---|
| Repo | `github.com/jalulia/tools` → `register/` |
| Backend | Supabase project **register** (`ycolvxmvcmxfnuicgfay`, us-east-1) — **~$10/mo** |
| Tables | `register_docs` (the document, `rev`, `state`, `ask`, `reply`) · `register_revs` (append-only history) |
| Storage | public bucket `register-images` |
| Access | every policy is gated on an `X-Register-Key` header. The public page is inert without it. The key lives in the database policy and your browser — **never in git** |
| Offline | `?local=1` skips the backend entirely and works out of localStorage |
| URL params | `?d=<id>` opens a document · `?k=<key>` carries the key once |

**Files** — `index.html` (shell, styles, help) · `core.js` (document, profiles, geometry, export/import,
diff) · `view.js` (viewport, rendering, hit-testing, tools) · `ui.js` (chrome, rails, inspector, review,
keyboard) · `sync.js` (Supabase over plain fetch) · `preview.js` (worker driver) ·
`pipeline.worker.js` + `plates.js` (verbatim, never hand-edit) · `CLAUDE.md` · `README.md` ·
`extract-pipeline.py`.

### Built to extend

A **profile** is a data spec that maps layer ids to paths inside the preset. `h-figures` is the first;
`generic` (free shapes, regions, points) is the second. A new export target is a new profile entry, not
another code path.

---

## Part two · the Fig. 2 specimens

In `~/Downloads/about-lab/about-lab/`. Serve the folder — the page sets `crossOrigin` on its sources,
so `file://` fails CORS the same way the rest of the lab does.

```
cd ~/Downloads/about-lab && python3 -m http.server 8788
# → localhost:8788/about-lab/h-specimens.html
```

`?p=slug` pins one figure · `?debug=1` turns the authoring overlay on.

### What was built

`h-specimens.html` — the h-figures build with the brief's three diffs, plus the overlay:

- **A** · `scale` now reaches `analyse()` at all four call sites. **Inert on these sources**: the
  analysis width is capped at the source width below 600 px, and the chalice reference is 304 px.
- **B** · a roster entry may carry its own `spec:{core,nodes}` when the field CMS has no row. Verified:
  the log files CROWN / SPIRE / GABLE / MEDALLION / VESSEL / BASE and the plate line reads
  `S-01 · 226 · 112 · 92`.
- **C** · bundled roster only. `sources()` returns `null`, so nothing here can reach the CMS.

Plus `specimen-presets.js` (the three presets and roster entries), the three references in
`about-lab/fig/`, and a row in the lab index.

### Boot gate — passed

Four figures, MASSIVE unchanged, no console errors.

| fig | code | analysis | chains | hatch | spot | worker |
|---|---|---|---|---|---|---|
| 2.1 MASSIVE | P-02 | 392×530 | 172 | 27 | 5 | 1.42 s |
| 2.2 chalice | S-01 | 304×520 | 174 | 71 | 12 | 0.91 s |
| 2.3 small change | S-02 | 416×520 | 12 | 46 | 1 | 2.15 s |
| 2.4 spark | S-03 | 520×506 | 252 | 560 | 18 | 1.24 s |

All inside the 2.5 s budget. The cost outlier is small change's **ETF at 1.52 s**, 71 % of its total —
not hatch, which never exceeded 367 ms.

### The chalice, corrected

Re-measured off the source at 6×. The drawing's mirror axis is **u = 0.4985** (0.158 + 0.839 = 0.997
across matched pairs), so every left-hand primitive now has an exact mirror. Still 31 primitives.

| | was | now |
|---|---|---|
| gable | apex 0.135, base v 0.245 | apex **0.105**, base **v 0.300**, u 0.345 / 0.652 |
| central block | 0.34–0.66 × 0.245–0.44 | **0.345–0.652 × 0.300–0.448** |
| column L1 | u 0.115–0.155, v 0.17–0.44 | **u 0.148–0.198, v 0.215–0.437** |
| column L2 | u 0.185–0.215, v 0.11–0.40 | **u 0.252–0.302, v 0.165–0.437** |
| column L3 | u 0.245–0.275, v 0.17–0.29 | **u 0.325–0.357, v 0.240–0.300** |
| wings | rectangles | **quadrilaterals** following the sloped roof |
| cornice / plinth | v 0.44 / 0.497 | v **0.448 / 0.476** |
| bowl | rim 0.497, foot 0.615 | rim **0.478**, foot **0.607** |
| knob | 0.5, 0.69, 0.085, 0.045 | **0.4985, 0.688, 0.107, 0.040** |
| base | corners 0.905, foot 0.955 | corners **0.898**, foot **0.948** |

Structure alone now reads as one drawn elevation — passes-when item 1. Columns and wings are the
primitives I am least sure of at this resolution; they are the first things worth dragging.

The corrected preset is also loaded in Register as document **`r_chalice01`**.

### Still open

**Chalice** — a key problem, not a geometry one. At 304 px the medial pass catches the engraving as
short flicks and the spot plate blooms past the drawn shapes. A larger source would change this on its
own; nothing else will.

**Small change** — two contradictions in the brief plus one real fault:

- The red border **cannot** print. `mask.keep` is the inside of the border, so the spot plate can never
  carry it — but acceptance asks for "border + sun + trunk". Either the keep polygon grows to the sheet
  edge with a `drop` for the stipple, or that acceptance line drops the border.
- The trunk did not print either: the spot gate `sat ≥ 0.50` at band 0.20–0.80 is not catching it.
- The pine reads as blobs, not line. `tMax: 8` at 416 px turns the foliage clumps into outlined masses.

**Spark** — three faults, all on the first run:

- The spot plate is far too large: `sat ≥ 0.45` catches the salmon palms as well as the knuckles.
- The dark corners outlined, exactly as the brief predicted. They need `mask.drop` polygons or a
  luminance floor.
- **Not in the brief**: the source carries a white margin, and the inverted bright rule
  (`t 0.90 abs, satMax 0.12`) reads it as bright ink and traces it as a mass. A `mask.keep` inset fixes it.

Phase 2 — the key plates — has not started.

---

## Notes

- The **workspace key** for Register is in your browser already if you opened the bookmark link. It is
  deliberately absent from this document and from the repo; ask me for it, or read it from the
  `register_key_ok()` policy in Supabase.
- Two bugs were caught by checking the live page rather than trusting the local test: the plate
  rasteriser used `requestAnimationFrame` and stalled forever if you switched tabs mid-preview (fixed),
  and the site-wide nav chip injected into every deployed tool sat over the status bar (lifted).
- `node scripts/build-site.mjs` fails locally on `meshviz` (`tsc: command not found`) before it ever
  reaches Register. Pre-existing; CI builds and deploys fine.
