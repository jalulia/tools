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
