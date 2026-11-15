# The library CMS

Version 1 (Phase 1), 2026-11-15. Page: https://jalulia.github.io/tools/library/ → **Edit** (top right).

## What it does
| Action | Effect | Undo |
|---|---|---|
| Archive | Leaves every listing (library, gallery, sets, T&T index). Shown folded under **Archived** at the foot of its project. The page keeps working at its address. | Restore from archive |
| Make private | Hidden from the public listings; shown only in a browser holding the token (**Private** on the left). | Make public |
| Remove | Copies the page folder and its library thumbnails to the private repo `jalulia/tools-archive` (`removed/<date>/<path>`, plus `records/<acc>.json`), then marks the record removed. It leaves the catalog and every listing, and `scripts/build-site.mjs` stops deploying its folder. | Restore, under **Removed** (Edit mode) |
| Move to project | Sets the record's project. | Move again |
| Title, kind, tags | Edited in the record's details (the small i on a card) while editing. | Edit again |

Every save is one commit to `main` (message names the records), so the site is updated by the next deploy, about two
minutes. Saves go one after another; a save that meets a newer file retries on top of it.

## What it does not do (yet)
- **Private is not secret.** Private records are left out of listings, but their files and catalog entries stay in this
  public repo, and their pages still deploy. Real privacy is the later Supabase phase (sign-in for private items, a
  shared password for viewers).
- **Remove does not delete.** Files stay in this repo (quarantine-only rule); only the deployed site loses them. Purging
  them from the repo is Julia's final pass. `library/_build/edits.json` keeps the id and title of what was removed.
- A record with no page folder of its own (a figure inside a page, an external site) is only hidden when removed.
- A folder shared with another live record, or a collection's root folder, is never excluded from the deploy.

## Data
- `library/_build/edits.json` (schema `tools-edits/1`): `projects` (id, title, `private`, `retiring`, note),
  `records` (by record id: `state` archived|removed, `visibility` private|public, `project`, `kind`, `title`, `tags`,
  and for removed: `path`, `acc`, `call`, `title_was`, `archive`), `log` (every save: time, op, ids, patch).
  Written by the CMS only. Edit by hand only to fix a mistake, and publish with `scripts/publish.mjs`.
- `library/_build/cms.mjs` applies it last in `collate.mjs`: every record gets `project` and `kind3`
  (technique · example · template); archived ones get `state`, private ones `visibility`; removed ones leave the
  catalog (listed in `catalog.cms.removed` for the restore list). It also writes `techniques-templates/_shared/hidden.js`.
- Default projects: from the record's collection, then a T&T plate's lifted sources (`/mindgut/` → Mindgut, and so on),
  else Studio. Desktop Bo is a private project. Encyclopedia is listed under Retiring until it is removed.
- Kinds (Julia, 2026-11-15): technique (a method), example (anything made with techniques: studies, plates,
  applications, documents, tools), template (a layout for reuse). Families are grouping tags shown on top of the cards.

## Token
A fine-grained GitHub token with Contents read and write on `jalulia/tools` and `jalulia/tools-archive`. Pasted once
into the Edit panel; kept in that browser's localStorage (`tools.token`) and sent only to api.github.com. Without
access to tools-archive, Remove is off and everything else works.

## Files
`library/cms.js` (GitHub calls), `library/library.js` (Edit UI: picking, the bar at the bottom, the details form,
Archived and Removed folds), `library/library.css`, `library/_build/cms.mjs`, `scripts/build-site.mjs` (skips removed
folders), `gallery/_build/build.mjs` and `set/index.html` (leave out archived and private), `techniques-templates/index.html`
(reads `_shared/hidden.js`).

## Changelog
- 1 · 2026-11-15 · Projects down the left (public, Private, Retiring); kinds and families on top; cards open their page
  in the same tab, details behind the small i; Edit with Archive, Make private, Remove, Restore, Move to project, tags,
  title, kind; instant saves to GitHub.
