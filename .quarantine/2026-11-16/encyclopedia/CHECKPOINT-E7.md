# CHECKPOINT E7 — import the 74 unsorted rows from the corpus

## What landed

- **91 rows in `team/research/example-inventory.csv`** — 17 already
  reflected in built content (mapped by hand — see the `ALREADY_IN` table
  in `scripts/import-inventory.mjs`); **74 imported** as
  `entity: 'exploration'`, `status: 'unsorted'`.
- **Manifest count:** 168 entries (was 94 at ck-e6), 16 sections,
  6 styles, 14 skills, **74 unsorted**.
- **Thumbnail pass FIRST.** Rendered before entries were written, so
  every entry's `thumb: 'thumb.png'` reference points at a real file at
  verifyManifests time (the alternative — declare-then-render — fails
  the manifest gate for the interval).

## Thumbnail coverage — 72 of 74 (97%)

| kind of source | count | thumb rendered |
|---|---|---|
| runnable HTML page in `/home/claude/corpus` | 72 | **72 · yes** |
| code fragment (JS file, not a runnable page) | 2 | 0 · honest "no thumbnail on file" |

The two without thumbs:

- **MM-10** — `corpus/artifacts/*.html` (integer hash `h2(n)`, one line;
  the row's source cell is a *fragment inside* the four HTML files it
  appears in, not a distinct file).
- **MMR-02** — `corpus/modemode-repo/assets/mm-menu.js` (a JS module,
  not a page).

Both entry pages print **"no thumbnail on file"** honestly, per the
julia-proxy discipline (D5: the filing contract is *an id, a thumb and
where it came from* — where a thumb is impossible, say so rather than
invent one).

## The row's shape

Every imported row lands as:

    Shell.registerEntry({
      entity: 'exploration',
      id: 'mir-15',                         <- lowercased CSV id
      index: 'MIR-15',                      <- original CSV id, kept as the display index
      title: `Full-frame film-noise ShaderPass (...)`,
      section: 'unfiled',
      status: 'unsorted',                   <- never the CSV's grade
      proposed_grade: 'C · known_failure',  <- the researcher's grade + status, as a proposal
      lane: 'glsl',                         <- inferred from CSV language column
      tags: ['imported', 'unsorted'],
      source: {
        kind: 'reference-study',
        title: 'corpus/repos/mir-gallery/artifacts/harmonic-field.html:565-572',
        author: 'Julia Compton',
        note: '<CSV notes column, truncated to 500 chars>'
      },
      thumb: 'thumb.png',                   <- only when the file exists on disk
      text: `<what_it_does + notes + provenance + status paragraph>`
    });

**The CSV grade is NEVER the ruling.** It renders as a dashed chip on
the entry card labelled `PROPOSED BY RESEARCHER — awaiting julia`
(DECISION-FRAMING D5) — the same discipline the ck-e6 tool-proposed
techniques use for their own dashed rows.

The status enum's `unsorted` value already handles this. The new
`proposed_grade` field on the entry (schema added at ck-e5) is the CSV
grade string in the form "A · canonical", rendered as a chip in
`unfiledCard()` and never confused with an editorial decision.

## Route `#/unfiled` — populated

Shows all 74 imported rows in a 4-column grid, each card with:

- **Thumbnail** rendered from the corpus source (or the honest fallback)
- The CSV's `id` and full `name`
- The source file:line as the card's caption
- The dashed `PROPOSED BY RESEARCHER — awaiting julia` chip
- Dashed border on the whole card (the shell renders `status='unsorted'`
  cards with `data-proposed` styling, matching the ck-e6 proposed
  status)

Below, the **"Proposed by the tool"** section carries the 6 candidates
the ck-e6 detector wrote — same card template so the two proposal lanes
(researcher vs tool) are visibly distinct from a ruling but
consistent with each other.

Shot: `team2/build-e/shots/e7/unfiled-1440.png` (full page, 74 cards +
the 6 proposed candidates + Batch classify affordance at the top).

## Route `#/techniques` — UNFILED count updates

The UNFILED bar at the top of the front door reads:

    UNFILED · 74 imports awaiting a ruling — a number to drive down

(was 0 at ck-e6.) Every count on the page derives from entries — no
hand-typed numbers. Shot:
`team2/build-e/shots/e7/home-techniques-1440-unfiled-count.png`.

The filter chip row grows too: **UNSORTED** and **PROPOSED** join
CANONICAL / EXPLORATION / HISTORICAL / KNOWN FAILURE.

## Verification

    node scripts/build-site.mjs
      ✔ encyclopedia/manifest.js — 168 entries, 16 sections, 6 styles, 14 skills, 74 unsorted
      all manifests verified

Zero console errors on `#/unfiled`, `#/techniques`, `#/entry/mm-01`,
`#/entry/mir-15` (a known_failure carrying the CSV's `F` grade as a
proposal), and the -390 counterparts.

Shots at `team2/build-e/shots/e7/`:

- `unfiled-1440.png` · `unfiled-390.png` (both full-page)
- `home-techniques-1440-unfiled-count.png` (the "74 imports" bar)
- `entry-mm-01-1440.png` (a canonical proposal — grade A)
- `entry-mir-15-1440-knownfailure.png` (a known_failure proposal — grade C · known_failure)

## The importer, kept

`scripts/import-inventory.mjs` is idempotent (dedupes against the
manifest) and split into three passes:

- `node scripts/import-inventory.mjs` — dry-run, prints what would land
- `node scripts/import-inventory.mjs --shots` — render thumbnails to
  `content/<id>/thumb.png`; blocks network so cor pus pages that reach
  for Google Fonts do not stall the load event
- `node scripts/import-inventory.mjs --write` — write `entry.js` files
  and append ids to the manifest, only referencing `thumb.png` where
  the file exists

Order for a repeatable import: `--shots` first, `--write` second.
