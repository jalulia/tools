# Quarantine · 2026-11-12

Removed from the site at Julia's request on 2026-11-12 ("Delete 16, 17, 18", "Delete: form 3 block, drawing the garden 2").
Nothing here is deployed: `scripts/build-site.mjs` skips folders that start with a dot.
Restore a file by moving it back to the path in the "from" column, then run `node library/_build/collate.mjs` and
`node techniques-templates/_build/reg-index.mjs`. Accession numbers are kept in `library/accessions.json`, marked withdrawn.

| What | Accession | From | Here |
|---|---|---|---|
| ST-16 Highlight bar (technique study) | 2026.0550 | technique-studies/st-16-highlight-bar.html | technique-studies/st-16-highlight-bar.html |
| ST-17 Charted stitch (technique study) | 2026.0555 | technique-studies/st-17-charted-stitch.html | technique-studies/st-17-charted-stitch.html |
| PM ST.16 Glassdoor (builder) | 2026.0191 | printed-matter-studies/index.html, lines 1824–1861 of the 2026-11-12 file | printed-matter-studies/index.html.st16-st18-builders.js |
| PM ST.17 We Miss You (builder) | 2026.0192 | printed-matter-studies/index.html, lines 1862–2097 | same file |
| PM ST.18 Design Chair Stickers (builder) | 2026.0193 | printed-matter-studies/index.html, lines 2098–2312 | same file |
| PM ST.16–18 library copies | 2026.0191–0193 | library/thumbs/2026.019{1,2,3}{,-960}.jpg | library/thumbs/ |
| Plate · Drawing the garden · 2 | 2026.0475 | library/_build/works.json record `plate:garden-ink-study/01` | library/works.removed.json |
| Plate · Form · three block roughs from the same renderer · 2 | 2026.0483 | library/_build/works.json record `plate:reference-010-rebuild/18` | library/works.removed.json |
| Plate copies | 2026.0475, 2026.0483 | library/thumbs/2026.04{75,83}{,-960}.jpg | library/thumbs/ |

Hidden, not removed: ST-08 Two-ink monoline saint keeps its page. `library/_build/collections.json` → `hidden`
keeps it out of the T&T index, the library sheet and the gallery.
