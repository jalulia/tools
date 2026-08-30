# CHECKPOINT E6 — `#/symptoms` + `#/unfiled` + candidate-technique detector

## `#/symptoms` — the anti-pattern index

Eight rows. Six are the anti-patterns named in
`composing-computational-material-systems/SKILL.md` (the vibe stack, CSS
filter as material, noise as texture, effect-first framing,
animate-the-peak-only, symmetry-as-interest). Two are the symptom
entry-points from julia-proxy JOBS §6 ("blur + bloom + grain", "busy") —
the vocabulary a reader arrives with in their mouth, not the technique's
name.

Each row carries:

- **Name** and a one-sentence **read**
- **Atoms in the family** (chips) — where the atom-side signal lives
- **Techniques whose `.overuse` clause names this** — a soft link derived
  from the technique's own tests block, so a technique that names
  "adding an eighth pass" for symmetry-as-interest lights it up
- **Known failures on file** — every entry with `status: 'known-failure'`
- **What to do instead** — one sentence, callout

The route reaches a technique's `.overuse` clause and its known_failure
entries from a symptom name in ≤2 clicks, without knowing the technique
(julia-proxy JOBS §6 heuristic THE FAILURE IS REACHABLE FROM THE SYMPTOM
passes).

Shot: `team2/build-e/shots/e6/symptoms-1440.png` (also `-390`).

## `#/unfiled` — imports awaiting a ruling

Reads `manifest.entries` filtered by `status: 'unsorted'`. Ships EMPTY at
ck-e6 — the ck-e7 import lands 74 rows here. Home page's UNFILED bar at
`#/techniques` counts unsorted; the ck-e3 header pulls this figure to the
top of the front door already.

**"Batch classify" affordance.** A blocky callout at the top: every row
is a deep link to its own entry page — that is where the ruling is made,
not in a modal. The count at the top of `#/techniques` is what you drive
down.

Below the unsorted section, a **"Proposed by the tool"** block lists
`status: 'proposed'` entries (the candidate-technique detector's output —
see below). Both sections use the same card template so the shape of "a
proposal waiting on Julia" is consistent, whether the proposer was a
researcher (unsorted + `proposed_grade`) or the tool (`proposed`).

Shot: `unfiled-1440.png` (also `-390`). Currently shows 6 proposed by the
tool and 0 unsorted; ck-e7 populates the top.

## Candidate-technique detector (`scripts/index-tools.mjs`)

New pass at the end of the tool: reads every non-technique / non-atom
entry's `uses[]`, groups by atom id, and reports any atom used by 2+
entries that no technique in the manifest produces. Each becomes a
**proposed technique**:

    { id: '<atom-id>-driver',
      title: '<Atom title> as driver',
      entity: 'technique',
      section: 'techniques',
      status: 'proposed',            <- new status enum value (schema at ck-e5)
      lane: 'audio' | 'canvas2d',    <- inferred from atom.kind
      description: 'PROPOSED BY TOOL — <atom> is used by N explorations…',
      produces: ['<atom-id>'],
      stub: true }

Written into the manifest before the closing `]});` under a marker
comment. Julia rules by editing the stub. The shell renders proposed
entries with a **dashed border and a "proposed" chip** so nobody
mistakes a candidate for a ruling.

### Verified against the current manifest — 6 candidates surfaced

    node scripts/index-tools.mjs
      candidate master-limiter-driver   (bus atom · 5 uses)
      candidate oklab-ramp-driver       (colour atom · 4 uses)
      candidate mulberry32-driver       (engine atom · 4 uses)  ← ladder case
      candidate dot-screen-20-driver    (texture atom · 4 uses)
      candidate fbm-noise-driver        (field atom · 3 uses)
      candidate banded-burst-driver     (voice atom · 3 uses)

**mulberry32 surfaces** as the task expected — it is used by 4
explorations here with no technique above it. (The corpus figure the
brief cites — "11 uses" — is across the whole corpus, of which the
encyclopedia currently lands 4; the ck-e7 import will raise the count.)
**dot-screen-20** and **oklab-ramp** surface for the same reason — atoms
that repeat with no lesson above them.

`paper-tooth` is correctly excluded: the `seven-pass-band-chain`
technique already declares `produces: ['paper-tooth']`. The detector's
promotion ladder only fires where there is nothing above the atom.

Applied with `--write`: 6 proposed technique stubs land in
`encyclopedia/manifest.js`, with content folders and stub entry.js files
so verifyManifests' folder-presence check passes.

## Schema additions (declared at ck-e5, used here)

- `status` enum grows a **`proposed`** value — distinct from `unsorted`
  (a row a researcher submitted) and from `ruling.by: 'proposed'` (a
  text the tool wrote). This is the LANE the tool can populate on its
  own.
- `proposed_grade` field for ck-e7's researcher grades.

## Vocabulary

`manifest.vocabulary.status.proposed`: "Written by the tool (ck-e6
candidate-technique detector). Julia rules by editing the stub."

## Verification

    node scripts/build-site.mjs   → all manifests verified
    encyclopedia/manifest.js — 94 entries, 16 sections, 6 styles, 14 skills
      (was 88 at ck-e5; +6 proposed technique stubs)

Zero console errors at 1440 and 390 on `#/symptoms`, `#/unfiled`, and
the six proposed-technique pages.

Shots: `team2/build-e/shots/e6/{symptoms-1440,symptoms-390,unfiled-1440,
unfiled-390,techniques-1440-proposed,tech-mulberry-driver-1440}.png`.
