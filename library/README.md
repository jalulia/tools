# Library

One catalog over every collection in this repository. Collections stay where they were made, in their
own folders, shells and order. The library adds a record per work, a number that never changes, two
authority files, a see-also table, a fixity list and an audit. It moves and edits nothing.

Open `index.html`. It runs from `file://` like every other static tool here.

## What is where

```
library/
  index.html  library.css  library.js     the front door (classic scripts, no network)
  catalog.js                              window.LIBRARY, what the page reads
  catalog.json                            the same data for anything that is not a browser
  accessions.json                         record id -> permanent number. Append-only.
  fixity.json                             sha256 of every record's source file at build time
  llms.txt                                the table of contents for an agent
  thumbs/<accession>.jpg                  access copies, 480 px. The masters stay with their records.
  _build/
    collate.mjs                           reads the collections, writes everything above
    collections.json                      one row per collection, and which reader knows its shape
    holdings.json                         hand-kept: work that is not on the deployed site
    crosswalk.json                        hand-kept: see-also links between vocabularies
    snap.mjs                              optional: photographs a plate that has no thumbnail
```

## Commands

```
node library/_build/collate.mjs            build
node library/_build/collate.mjs --thumbs   build, and remake access copies whose master changed (sips on macOS, PIL elsewhere)
node library/_build/collate.mjs --check    compare disk against fixity.json and accessions.json; writes nothing; exit 1 on a difference
node library/_build/snap.mjs               optional, needs Playwright; then run collate again
```

Run a build after adding or changing work in any collection, then commit `library/`. The deploy stays a
folder copy: `scripts/build-site.mjs` needs no change.

## The model

```json
{
  "levels": ["library", "collection", "section", "record", "technique read", "atom"],
  "record": {
    "acc": "2026.0221      permanent. Year the work first entered the repository + a running number across the library.",
    "id": "tt:ts-01-moire-ring-screens      collection prefix + the id the collection already uses",
    "call": "TS-01      the code its collection gave it. Local to the collection; two collections may reuse one.",
    "kind": "technique | atom | exploration | coupling | study | template | instrument",
    "status": "canonical | exploration | proposed | unsorted | known-failure | historical | null (the collection records none)",
    "access": "public | staged | local",
    "collection, section": "where it lives, in the collection's own order",
    "href, source, spec_href": "the plate, the file of record, the measured spec",
    "plate": "what the plate carries: spec, points, variants, motion, live, compare, modules",
    "techniques, atoms": "authority terms, each prefixed by its vocabulary",
    "rel": "instance-of | uses | produces | related links to other records",
    "provenance": "source kind, reference, author, license, and whether the reference is published or withheld",
    "dates": "accessioned = first commit of its files; modified = last",
    "fixity": "sha256 of the source file"
  },
  "authority": {
    "techniques": "one term per id per vocabulary: enc (entries), enc.read, tt, st, hld. Each lists every record that uses it, with the implementation, limits and module where the source gives them.",
    "atoms": "enc (entries) and tt (tags on reads)",
    "see_also": "hand-written links between terms and between records. by: proposed until someone rules."
  }
}
```

## Rules

1. **Read in place.** A reader never writes to a collection. To change a record, change its source and rebuild.
2. **A number is given once.** `accessions.json` only grows. A record that disappears is marked withdrawn; its number is not reused. A holding that lands in a collection keeps its number through `becomes`.
3. **Each vocabulary keeps its ids.** The encyclopedia, Techniques & Templates and Technique Studies name things differently. The library prefixes, it does not merge. Two terms are joined only by a row in `crosswalk.json`.
4. **Nothing is derived that reads as a ruling.** No status is guessed, no see-also is inferred. A blank is shown as a blank. What the tool proposes is labeled PROPOSED and used for nothing else.
5. **A `.private` marker is honored.** A folder the deploy skips is skipped here and counted, not named.
6. **Every count is counted.** No number is typed into the page, the data or this file.

## Adding things

- **A work in an existing collection:** add it the way that collection asks, then run a build. It gets the next number.
- **A collection:** add a row to `_build/collections.json`. If its files are shaped like an existing collection, name that reader. If not, write one reader function in `collate.mjs`: it returns records and touches nothing.
- **Work that is not on the site yet:** add a row to `_build/holdings.json`. Remove the row when the work lands.
- **A see-also link:** add a row to `_build/crosswalk.json` with its basis. Set `by` to a name to rule on it.

## The audit

The Audit view lists what the build found while reading: imports awaiting a ruling, proposals not yet
canonical, staged work, links not yet ruled, records with no status or thumbnail, atoms no technique
produces, technique reads with a module to lift, one id filed at two levels, call numbers two collections
share, and counts typed by hand that no longer match their source. It reports. It changes nothing.
