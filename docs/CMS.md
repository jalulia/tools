# The library CMS

Version 2, 2026-11-15. Page: https://jalulia.github.io/tools/library/ → **Edit** (top right).

## What it does
| Action | Effect | Undo |
|---|---|---|
| Archive | Leaves every listing (library, gallery, sets, T&T index). Shown folded under **Archived** at the foot of its project. The page keeps working at its address. | Restore from archive |
| Make private | Hidden from the public listings; shown only in a browser holding the token (**Private** on the left). | Make public |
| Remove | Copies the page folder and its library thumbnails to the private repo `jalulia/tools-archive` (`removed/<date>/<path>`, plus `records/<acc>.json`), then marks the record removed. It leaves the catalog and every listing, and `scripts/build-site.mjs` stops deploying its folder. | Restore, under **Removed** (Edit mode) |
| Move to project | Sets the record's project. | Move again |
| New project, rename, private project, delete | On the left while editing: + New project, or the pencil next to a project. A project can be deleted once it has nothing in it; a private project hides everything in it from Shared. | Edit again |
| Title, kind, tags | Edited in the record's details (the small i on a card) while editing. | Edit again |

Every save is one commit to `main` (message names the records), so the site is updated by the next deploy, about two
minutes. Saves go one after another; a save that meets a newer file retries on top of it.

## Galleries
A gallery is a tag bundle (Julia, 2026-11-13). **Galleries** in the top nav lists them; a gallery's link (`#/galleries/<id>`)
can be sent as is, and each card opens the work's own page, where its dials are. In Edit: pick cards → **Gallery…** →
an existing gallery or **New gallery…** (adds the gallery's tag to each piece); in a gallery, **×** takes a piece out;
**Rename or delete** edits the name, note and privacy (deleting leaves the tags on the pieces). Stored in
`edits.json → galleries` as `{ id, title, tag, items, note, private }`: members are every record with the tag plus any
`items` listed by hand (`R:<technique>` for a technique page, or a record id or call). Archived and private pieces leave
a gallery for anyone in Shared. Seeded with the two sets saved in Chrome (Front End Exploration, Mir Front-End Exploration).

## Mine and Shared
With a token, a switch next to Edit: **Mine** shows everything, private work included; **Shared** shows exactly what
anyone with the link sees. Edit always works in Mine. The choice is remembered in that browser (`tools.view`).

## Sharing with specific people (proposal, not built)
Built on Supabase; the public site stays on GitHub Pages. Not checked against current Supabase docs yet.
1. In Edit, **Share** on a project, a tag or picked cards → name it ("For Matt"), choose whether private work is
   included, an optional expiry and an optional passcode → a link with an unguessable code.
2. The viewer opens the library with that code; the page asks Supabase (a function that takes only the code) for the
   allowed records, and private files come from a private storage bucket as short-lived signed links. A banner names
   the share.
3. **Shares** in Edit lists every link with its last view; revoke or change it there.
Tables: `shares` (code hash, name, scope, expiry, passcode hash, revoked), `share_views`; private files in a private
bucket; row-level security so nothing is readable without a valid code or Julia's sign-in.

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
- 6 · 2026-11-16 · Galleries: a Galleries view, gallery pages with a link to send, Gallery… in Edit (new, add, take out, rename, private, delete); seeded with the two Chrome sets.
- 5 · 2026-11-16 · The Encyclopedia is retired: the 44 items kept in the CMS live in `library/items/` (same ids); the rest, with the Components and Book of Shaders shells, is in `.quarantine/2026-11-16/` (MANIFEST.md there). The Retiring project is gone.
- 4 · 2026-11-16 · Edit shows the last deploy (updating · up to date · failed, with a link to why); the Edit button is underlined in orange when it failed. Read from GitHub's public run list, no token needed.
- 3 · 2026-11-16 · Projects are edited in the CMS: new, rename, note, private, delete when empty (`projectDef` ops in `edits.json`).
- 2 · 2026-11-15 · Top nav by kind (Library · Techniques · Examples · Templates · Galleries; Ledger and Audit only while
  editing; Shelves and Atoms still open by address); one header per project with the archived count as a link;
  one Family row; Refine (type, status, build) on the left in place of More filters; Mine / Shared switch; Undo after
  archive and private; the injected site bar is one ø mark with a start menu (hover or tap), and the grab / cue / export
  bar is no longer injected; T&T page crumbs go to the library.
- 1 · 2026-11-15 · Projects down the left (public, Private, Retiring); kinds and families on top; cards open their page
  in the same tab, details behind the small i; Edit with Archive, Make private, Remove, Restore, Move to project, tags,
  title, kind; instant saves to GitHub.
