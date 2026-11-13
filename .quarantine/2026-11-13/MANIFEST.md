# Quarantine · 2026-11-13

Removed from the site at Julia's request on 2026-11-13 ("delete ts-05, 07, 08, 04").
Nothing here is deployed: `scripts/build-site.mjs` skips folders that start with a dot.
Each old address keeps a one-line page that sends readers to the Techniques index.
Restore a study by moving its folder back to the path in the "from" column, putting its row back in
`techniques-templates/_shared/entries.js`, then running `node techniques-templates/_build/build.mjs`,
`node library/_build/collate.mjs --thumbs`, `node techniques-templates/_build/registry.mjs` and `reg-index.mjs`.
Accession numbers stay in `library/accessions.json`, marked withdrawn.

| What | Accession | From | Here |
|---|---|---|---|
| TS-04 Stacked card scroll | 2026.0224 | techniques-templates/techniques/ts-04-stacked-card-scroll/ | techniques-templates/techniques/ts-04-stacked-card-scroll/ |
| TS-05 Vertical line-screen type | 2026.0225 | techniques-templates/techniques/ts-05-line-screen-type/ | techniques-templates/techniques/ts-05-line-screen-type/ |
| TS-07 Gradient-mapped blur type | 2026.0227 | techniques-templates/techniques/ts-07-gradient-map-blur-type/ | techniques-templates/techniques/ts-07-gradient-map-blur-type/ |
| TS-08 Flat-color card set | 2026.0228 | techniques-templates/techniques/ts-08-flat-color-card-set/ | techniques-templates/techniques/ts-08-flat-color-card-set/ |
| Library copies of the four | 2026.0224–0228 | library/thumbs/ | library/thumbs/ |

## PL-88 · removed 2026-11-13

Removed at Julia's request on 2026-11-13 ("DELETE THIS EVERYWHERE", https://jalulia.github.io/tools/techniques-templates/plates/pl-88-possibility-field-v0-3-figure-1/index.html).
No page is left at the old address. Its row is gone from `techniques-templates/_build/plates.json`, `_shared/entries.js`,
`library/_build/works.json` (record below, kept in `library/works.removed.json`) and `editions.json`; the registry, the
All-techniques index, the library and the gallery were rebuilt without it. The old PL-20 group page no longer lists it, and
`set/moved.js` and the T&T split map no longer send PL-20 links to it. Both accession numbers stay in `library/accessions.json`,
marked withdrawn, and are not reused.

| What | Accession | From | Here |
|---|---|---|---|
| PL-88 Possibility Field v0.3 · figure 1 (plate page) | 2026.0737 | techniques-templates/plates/pl-88-possibility-field-v0-3-figure-1/ | techniques-templates/plates/pl-88-possibility-field-v0-3-figure-1/ |
| Its source page (used only by PL-88) | — | techniques-templates/plates/_src/possibility-field.html | techniques-templates/plates/_src/possibility-field.html |
| Library figure `plate:possibility-field-v0-3/00` | 2026.0389 | library/_build/works.json | library/works.removed.json |
| Library copies | 2026.0389, 2026.0737 | library/thumbs/2026.0389{,-960}.jpg, 2026.0737.jpg | library/thumbs/ |
