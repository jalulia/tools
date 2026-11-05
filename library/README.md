# Library

A catalog of every collection in this repository. Each work gets one record and a permanent
accession number. The collections are read where they are; the build writes only inside `library/`.

Open `index.html`. It runs from `file://`.

## Files

```
library/
  index.html  library.css  library.js     the page (classic scripts, no network)
  catalog.js                              window.LIBRARY, read by the page
  catalog.json                            the same data for other readers
  accessions.json                         record id -> accession number, append-only
  fixity.json                             sha256 of each record's source file
  llms.txt                                index for agents
  thumbs/<accession>.jpg                  access copy, 480 px on the long edge
  thumbs/<accession>-960.jpg              larger copy, snapshots only
  thumbs/index.json                       size, origin and master hash of each copy
  _build/
    collate.mjs                           reads the collections, writes the files above
    thumb.py                              makes the access copies (Pillow)
    snap.mjs                              optional: photographs plates that have no thumbnail
    collections.json                      one row per collection
    holdings.json                         work that is not on the deployed site
    crosswalk.json                        see-also links
```

## Commands

```
node library/_build/collate.mjs            build
node library/_build/collate.mjs --thumbs   build, and remake access copies whose master changed
node library/_build/collate.mjs --check    compare disk against the last build; exit 1 on a difference
node library/_build/snap.mjs               optional; needs Playwright and Pillow; then build again
```

Build after adding or changing work in any collection, then commit `library/`.
`scripts/build-site.mjs` needs no change.

## Record

```json
{
  "acc": "2026.0221",
  "id": "tt:ts-01-moire-ring-screens",
  "call": "TS-01",
  "kind": "technique | atom | exploration | coupling | study | template | instrument",
  "status": "canonical | exploration | proposed | unsorted | known-failure | historical | null",
  "access": "public | staged | local",
  "collection": "techniques-templates",
  "section": "techniques",
  "href": "../techniques-templates/techniques/ts-01-moire-ring-screens/",
  "source": "techniques-templates/techniques/ts-01-moire-ring-screens/study.js",
  "spec_href": "…/spec.json",
  "plate": { "spec": true, "points": 10, "variants": 3, "modules": 5 },
  "techniques": ["tt:moire-product"],
  "atoms": ["tt:grating"],
  "rel": [{ "type": "instance-of | uses | produces | related", "to": "<record id>" }],
  "provenance": { "kind": "reference-study", "rights": "reference-withheld" },
  "dates": { "accessioned": "2026-09-15", "modified": "2026-10-24" },
  "fixity": "<sha256, first 16>",
  "thumb": "thumbs/2026.0221.jpg", "thumb_w": 369, "thumb_h": 480,
  "thumb_2x": "<the master, or thumbs/<acc>-960.jpg for a snapshot>", "thumb_2x_w": 615,
  "pic_group": "<accession of the first record that shows the same picture>"
}
```

- `acc`: the year the work entered the repository, then a running number across the library.
- `call`: the code its collection gave it. Two collections may use the same one.
- `status`: `null` when the collection records none.
- `dates`: first and last commit that touched the record's files.
- `techniques`, `atoms`: terms, each prefixed by its vocabulary (`enc`, `enc.read`, `tt`, `st`, `hld`).
  `catalog.json` lists every term under `authority`, with the records that use it.

## Rules

1. A reader does not write to a collection. To change a record, change its source and rebuild.
2. An accession number is given once. `accessions.json` only grows; a record that disappears is
   marked withdrawn. A holding that lands in a collection keeps its number through `becomes`.
3. Vocabularies are prefixed, not merged. Two terms are joined only by a row in `crosswalk.json`.
4. Status and see-also links are not inferred. A link written by the tool is labeled PROPOSED.
5. A folder with a `.private` marker is skipped and not named.
6. Counts are computed at build time.

## Pictures

A picture is shown whole and is not drawn larger than its pixels. The page lays pictures out by
their own shape, so `thumbs/index.json` records each copy's size.

- A record with a thumbnail in its collection gets a 480 px copy. The collection's file is the master
  and serves as the larger size.
- A public record with no thumbnail can be photographed by `snap.mjs`. The catalog marks the result
  as a snapshot. `no_snapshot` in `collections.json` lists records to leave out, with the reason.
- Records that show the same picture are grouped (`pic_group`). The sheet draws a group once.

## Adding

- A work in an existing collection: add it the way that collection asks, then build.
- A collection: add a row to `_build/collections.json`. Name an existing reader if the files have
  the same shape; otherwise add a reader function to `collate.mjs`.
- Work that is not on the site: add a row to `_build/holdings.json`. Remove it when the work lands.
- A see-also link: add a row to `_build/crosswalk.json` with its basis. Set `by` to a name to confirm it.

## Audit

The Audit view lists what the build found: items to rule on, gaps, drift between two places that
should agree, and notes. The build does not act on any of them.
