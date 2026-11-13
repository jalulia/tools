# Plate UI · Techniques & Templates

The shell every plate page uses (`shell.css`, `shell.js`, `_build/page.html`). Port any study page (TS or ST) onto these
parts; do not restyle them per page. Last revised 2026-11-12.

## Layout

```
nav     crumb: Techniques & Templates / <Section> / <Title> <CODE>          pager: ← CODE · n of N · CODE →
plate   [ notes 360 ]  [ figure, fills ]  [ panel 336 ]
```

- No brand in the nav. The pager counts entries in the section ("19 of 19"), and the arrows name the neighbor's code.
- `notes` (left): kicker (`CODE · family`), title (Archivo 600), lede (one sentence, 15 px), body (one paragraph, 2–3
  sentences), then one accordion (`<details class="acc" name="notes">`, one open at a time):
  How it is built (pass order) · Techniques (name, id, atoms, lifted module) · Reference and match (source + fidelity) ·
  Study (code, section, family, palettes, parameters, motion, spec.json) · Related · Keyboard.
- `figure` (center): the canvas. Frame, ticks, caption `FIG. n · Title · CODE`, state at top right
  (`BUILDING · 045 %`, `STILL`, `REFERENCE`, `COMPARE`, `PLAYING`, `<LIVE LABEL>`, `DRAWING…`), plate footer
  (`PLATE · ■ CODE CORE r · g · b`, palette name, `· EDITED` in accent when anything is changed).
- `panel` (right): six modules, always in this order. A module a study cannot use stays in place, marked `.none`, with a
  hint that says why. Nothing in the panel overlays the plate.

## Modules

| Module | Old label | Contents | Hint |
| --- | --- | --- | --- |
| View | Rebuild/Reference/Split, Expand | segmented Plate / Reference / Compare; Expand (F) folds the notes | what the view shows; in Compare, the match % |
| Callouts | Read, ↻ Replay, Track log | switch Show; button Replay the build; disclosure Point list (n / N) with a readout | "Numbered points mark where each technique was measured." |
| Motion | Motion, Live | Play / Pause (icon + word), the live button named by the study (`liveLabel`: Follow pointer, Use your image, Scroll version, Page version, Engine); `Still plate` when neither exists | `motionHint` + `liveHint` from the study |
| Color | Alternate · V tabs | palette list (radio rows, swatches, label, "edited" badge); Inks: every hex the render reads, each with a swatch (native color input), name, hex field, reset; Reset inks | `colorHint` if the study sets one |
| Parameters | + PARAMS n (collapsed) | always open; groups by technique (full name, limits line, count, n changed, group reset); rows: label + raw key, slider, typed value, unit, reset; Reset all · n | "Every value is editable…" |
| Export | Spec ⇥ | Copy spec, Open spec, Save PNG | what the spec holds |

## Tokens

```
ground #FFFFFF   ink #101014   ink-2 #3B3B42   grey #6B6B72   grey-2 #A1A1A8   grey-3 #C8C8CE
sunken #F4F4F6   hair #E2E2E7  hair-2 #EDEDF0  accent #F4551E (changed, live state)   blue #2F5AE6 (links, focus)
type   Archivo (title) · Inter (text, labels) · JetBrains Mono (headers, values, keys)
sizes  module header 10/.22em mono caps · hint 11.5/16 Inter · param label 12/15 · key 9/12 mono · value 11 mono tabular
rows   control 28 px · palette/ink 30 px · param ≥ 36 px · accordion summary 40 px · panel padding 16/18
widths notes 360 → 320 → 290 · panel 336 → 316 → 300 · ≤ 960 px stacks notes / figure / panel
```

No cream or warm off-white anywhere in the chrome; no oxblood. Neutral greys only.

## Rules

- Inks: `inksOf(V)` walks the variant (skips `id label sw spot P`) and collects hex strings. Editing one replaces that
  value everywhere in a copy of the variant; the copy's `id` gets a `~hash` suffix so per-variant caches in study.js
  miss. A study whose render reads colors from anywhere other than the variant must move them into the variant.
  Never give a variant a color key named `label` (the display name lives there).
- Parameters: every leaf `{value, range}` in `spec.techniques[].params` gets a row. Step = 1 for seeds, counts and
  explicit integer steps; otherwise the finer of the leaf's own step and a nice number near span / 1000. The typed value
  accepts any precision, clamps to the range (flashes accent when clamped), Enter commits, Escape reverts, ↑/↓ step,
  Shift ×10, Alt ×0.1. Values print at the measured precision and grow digits only when needed.
- Rendering: art is drawn at `min(3, devicePixelRatio)` and blitted 1:1 with smoothing off. Grain and speck cells are
  one device pixel by default; stipple dots under 2.4 px radius are pixel-quantized discs, not squares and not
  anti-aliased blobs. Grain amounts sit at the subtle end (mono 2–4 %, color ≤ 7 %).
- Copy: US English. Lede one sentence; body 2–3 sentences with the measured numbers; hints say what a control does,
  in the second person only where it names the user's action. No "Read", "Live", "Params", "Held" in the UI.
- Accessibility: every control is a button, radio, switch or input with a label; focus ring 1.5 px blue; the canvas
  points are reachable from the Point list; keyboard map in the Keyboard accordion.

## Study fields the shell reads (beyond the v2 contract)

`lede`, `body[]`, `motionHint`, `liveLabel`, `liveHint`, `colorHint`, `refHint` (the View hint when there is no published reference),
`onPoints(P)` (called once with the live point array) and `relayPoints(overrides)` (called before every draw, so a study
whose layout follows its parameters can move its points), and `family` on the manifest entry
(`_shared/entries.js`).

## Study pages (studies/, ST-01 on)

The Technique Studies run on this shell too. Each `studies/st-NN-slug/index.html` keeps its own inline scripts (the
engine, `window.STUDY`, and from ST-13 the measured-plate bridge `window.__MP`) and loads `entries.js`, `vocab.js`,
`art.js`, `studies.js`, `st-adapter.js`, `shell.js`. `node _build/studies.mjs` writes the page around those scripts
(head, body from `_build/page.html`, static read, spec.json) and `_shared/studies.js` (the Studies manifest; hidden
studies such as ST-08 stay at their address and drop out of the pager). Run it again after editing a study.

`st-adapter.js` files the study under the section "Studies" and fills `S.ui`, which the shell reads in place of the TS
contract:

| `S.ui` | What it maps |
| --- | --- |
| `params[]` | the study's own values: `{id,label,group,why,type:'range'/'text'/'choice',min,max,step,value,unit,get(),set(v,quick),commit()}`; rows look and behave like TS rows, grouped by the study's group names |
| `actions[]`, `presets[]` | New seed, Shuffle, Grain, MIDI…; the plate's presets as chips. Both sit at the top of Parameters |
| `palettes` | the study's palettes (`list`, `current()`, `set(i)`) and the inks of the one in use (`inks()`, `setInk(key,hex)`, `resetInks()`). None: the Color module says why (`S.colorHint`) |
| `motion`, `interactive` | Play and the study's drag or draw mode (`on()`, `set(on)`, label); `pointerHint` when the plate always takes the pointer |
| `view[]` | display switches under View (ST-10 Handles) |
| `status()`, `message()` | the readout under View; a short message flashes in the plate's caption |
| `bench()` | the measured-plate benchmark, drawn into Reference and match |
| `spec()`, `save()` | the spec as it stands now; the study's own full-size PNG |
| `engineFirst` | ST-09…11: the instrument takes keys first; the shell keeps R, S, F, space, Escape, / |

Shell rules that came with the port: the left column shows at most three sentences of description; anything longer
opens the "How it is built" section. Pass-order lines split on " · " or on a leading "name:". An ink whose name is only
a number takes a color name ("Ink 3" → "Amber"). Group limits are sentence-cased at render.
