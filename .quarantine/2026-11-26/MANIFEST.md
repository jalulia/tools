# Quarantine · 2026-11-26

Superseded the same night they went up. Julia, on the first version of the split instruments: "These controls are not good."
The controls named the engine's knobs (stock bite, break-up, film split, starve, mottle, formation), and half of them did
not change the plate visibly at the size it is shown. The second version keeps the codes and titles with new controls: the
printer's decisions, with named switches for paper, roller, press and letterform, and the inks in the Color tab.
Nothing here is deployed: `scripts/build-site.mjs` skips folders that start with a dot.
Each old address keeps a one-line page that forwards to the new one.
Restore a page by moving its folder back to the path in the "from" column, putting its row back in
`techniques-templates/_shared/entries.js`, then running `node techniques-templates/_build/build.mjs`,
`node library/_build/collate.mjs --thumbs`, `node techniques-templates/_build/registry.mjs` and `reg-index.mjs`.
The engine for these pages is in git at `7e73038` (`techniques-templates/_build/engines/ap-splits.js`).
Accession numbers stay in `library/accessions.json`, marked withdrawn.

| What | Accession | From | Here | Replaced by |
|---|---|---|---|---|
| AP-35 Brand ink · roller run-out | 2026.0853 | techniques-templates/applications/ap-35-brand-ink-roller-run-out/ | techniques-templates/applications/ap-35-brand-ink-roller-run-out/ | techniques-templates/applications/ap-35-brand-ink-roller/ |
| AP-36 Brand ink · type, printed | 2026.0854 | techniques-templates/applications/ap-36-brand-ink-type-printed/ | techniques-templates/applications/ap-36-brand-ink-type-printed/ | techniques-templates/applications/ap-36-brand-ink-type/ |
| AP-37 All-day poster · roller run-out | 2026.0855 | techniques-templates/applications/ap-37-all-day-poster-roller-run-out/ | techniques-templates/applications/ap-37-all-day-poster-roller-run-out/ | techniques-templates/applications/ap-37-all-day-poster-roller/ |
| AP-38 All-day poster · type, printed | 2026.0856 | techniques-templates/applications/ap-38-all-day-poster-type-printed/ | techniques-templates/applications/ap-38-all-day-poster-type-printed/ | techniques-templates/applications/ap-38-all-day-poster-type/ |
| Library copies of the four | 2026.0853–0856 | library/thumbs/ | library/thumbs/ | |
