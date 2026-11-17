# CHECKPOINT E4 — styles index + style pages

## `#/styles` — the index

Six styles as cards, each carrying:

- Name · entry-count badge
- One-sentence summary
- Palette (real swatches at their own hex)
- Type roles (display · text · mono · script), as declared
- Texture-vocabulary chips (up to 8; "+N more" for the rest); "no
  texture — declared, not missing" where the style explicitly declares
  none (technical-doc, swiss-modular in most cases)
- Engine count

The chrome stays grey, per REVIEW-ARCHITECT §2.6; the palettes carry their
own colour. A style card that looks the same as every other card would
lose the thing that distinguishes styles from atoms.

Shot: `team2/build-e/shots/e4/styles-1440.png` (also `-390.png`).

## `#/style/<id>` — the style page

Reuses the press-bench style-page template (`renderSheet(styleId)` +
`styleDeclaration()`), which already renders palette / type / texture /
engines / **RULES in Julia's words** on top of a filtered contact sheet
of the style's members. The rules block was the ck-e4 add — every style
declares `rules[]` in the manifest and the template prints them as a
two-column bulleted list under the declaration.

The pager at the foot walks between styles (`renderSheet`'s
`stylePager()`), so a style page is not a cul-de-sac.

Shot: `style-riso-1440.png` (Riso / Xerox — five press-facts rules,
eight entries, six engines, five palette hexes).

## What changed vs press-bench

Only the route. The press-bench style page was
`components/#/style/<id>`; the encyclopedia serves it at
`encyclopedia/#/style/<id>` from the folded content. No template edits
were needed — the manifest folds cleanly onto the template.

## Verification

    node scripts/build-site.mjs   → all manifests verified
    encyclopedia/manifest.js — 77 entries, 16 sections, 6 styles, 14 skills

Zero console errors at 1440 and 390.

Shots: `team2/build-e/shots/e4/{styles-1440,styles-390,style-riso-1440,
style-atmos-1440,style-editorial-1440}.png`.
