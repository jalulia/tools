# Front-end nav + IA review — ck-e13+
**Date:** 2026-09-06 · **Author:** Claude
**Trigger:** Julia, mid-E13: *"the front-end / global nav system, index, and encyc/shaders/components links … don't feel intuitive. we have evolved this encyclopedia tool into something else and it needs a navigation and architecture that appropriately serves the content."*
**Purpose:** name what's confusing, propose a target IA, list the concrete changes. Julia rules on the direction; execution is a follow-up commit.

---

## 1. What the thing actually is now

At the start of this session the encyclopedia was one tool among many. After E10 → E13 it holds:

- **176 pre-existing entries** — 22 shader chapters + 30 lens studies + atoms + techniques + explorations + couplings + skills + 74 unsorted imports
- **8 technique-study plates** (E12) — canvas2d rebuilds under a new `studies` section
- **1 birefringent-ray-bench plate** (E10) — SVG plate proof
- **A plate view template** (E10) that any entry can adopt via `spec` + `points`
- **Coverage rule** (E10) that makes any plate a repeatability contract
- **A derived crossover index** (E13) that lets every plate discover every other plate that shares a technique or atom

That's not "one tool among many". That's the archive. The mast still frames it as one of three (Encyclopedia · Shaders · Components), and the tools landing at `/` still lists it alongside Register / Signature Builder / MeshViz / Ki-Landscape / Gallery as if they were peers. They aren't. Shaders and Components fold into the encyclopedia. Gallery duplicates what studies now does. Ki-Landscape is a source the sound-lane mechanisms will point at, not a peer tool.

## 2. The nav surfaces, enumerated

| # | Surface | Location | Currently shows |
|---|---|---|---|
| 1 | Tools landing | `/` (jalulia.github.io/tools/) | 5 tool cards grouped by section (JALULIA, DESIGN SYSTEMS, LEARN, GALLERY). Encyclopedia is one card under DESIGN SYSTEMS. |
| 2 | Mast brand | `.mast .brand` | "Encyclopedia" wordmark, plain text. |
| 3 | Mast crumb | `.mast .crumb` | The current entry's section-title + entry-title, or the route name ("Techniques", "Atoms"). |
| 4 | Mast position | `.mast .pos` | "184 lenses" on index; "73 / 184" on an entry. |
| 5 | Mast tool switch | `.mast .switch` | ENCYCLOPEDIA · SHADERS · COMPONENTS — from `manifest.siblings[]`. Clicking Shaders or Components lands on redirected pages that re-load the encyclopedia. |
| 6 | Mast source toggle | `.mast #edbtn` | "Source E" — opens the apparatus panel (right rail). |
| 7 | Mast help | `.mast #helpbtn` | `?` — opens a shortcuts dialog. |
| 8 | Index rail | `.rail` | Search field, five status chips (proposed / unsorted / canonical / exploration / historical / known-failure), counter (`184 lenses · 7 styles`), spine (Atoms → sections → entries within each section). |
| 9 | Index toggle | `.mast #idxbtn` | Opens/closes the rail. `/` shortcut. |
| 10 | Front-door index | `#/techniques` (default landing) | Techniques view: prose intro, `35 techniques · 124 instances · 24 atoms`, UNFILED bar, grouped by seven-layer position each acts at. |
| 11 | Section indices | `#/atoms`, `#/styles`, `#/skills`, `#/unfiled`, `#/symptoms`, `#/sound`, `#/explorations` | Distinct routes, each rendering its own kind of index. |
| 12 | Section-slug fallback | `#/section/<id>` | Falls through silently to the Techniques front door. **Dead route.** |
| 13 | Cross-tool foot pill | `.pill` at bottom-left, injected by `scripts/build-site.mjs`, on every tool page | `◃ tools · gallery · index▾ · Encyclopedia` — the parent-tool nav strip. Redundant with the mast tool switch (which points at a subset of the same tools). |
| 14 | Plate top-nav (E10) | `.plate-nav` inside `.plate-view` | Breadcrumb (Explorations / Section / Entry) + coverage badge + pager. On entry pages ONLY. Duplicates the mast's crumb + position. |
| 15 | Plate RELATED | `.plate-related` bottom-right of plate figure | Cross-plate discovery from `related[]` + `crossover.also_uses` + Shell.crossover (E13). |
| 16 | Apparatus panel | `.app` (right slide-in) | Source / Notes / Meta tabs. `E` shortcut. |
| 17 | Garden toolbox | `#gt` (top-right overlay) | The reviewer's queue (seen / archive / send-to-Claude). Personal tool, unrelated to reader nav. |
| 18 | Old-tool URL redirects | `/book-of-shaders/`, `/components/` | Redirect stubs that push the reader to `#/techniques` in the encyclopedia. |

## 3. What's actually confusing

Ordered by how much friction each causes.

**1. The mast tool-switcher lies.**
`ENCYCLOPEDIA · SHADERS · COMPONENTS` reads like three peer tools. All three land on the encyclopedia's Techniques front door. Shaders and Components have been redirect stubs since ck-e9 but the switcher hasn't caught up. A reader clicks "Shaders" hoping to find the chapters and gets bounced to a page that looks identical to what they were just on.

**2. "Encyclopedia" as an entry point has no landing of its own.**
Clicking the "Encyclopedia" card on the tools landing lands on `#/techniques`. The word "Encyclopedia" appears in the mast brand and again in the tool-switcher, but nothing on the page says "welcome to the encyclopedia" — the H1 says "Techniques". A reader who doesn't already know the front-door decision has to infer it.

**3. `184 lenses` is a fossil.**
The archive has 176 explorations + 8 studies + atoms + techniques + skills + styles + 74 unsorted. Calling that count "lenses" (a Components-tool word) misnames what's actually being counted, and understates the archive by not saying WHAT the number is a count of.

**4. Two page-titles, one page.**
Every entry page reads "Encyclopedia · Document & system · Birefringent ray-bench" in the mast crumb AND "Explorations / Document & System / A5 · Birefringent ray-bench" in the plate breadcrumb below it. The E10 plate nav was designed for a standalone HTML; inside the shell it duplicates the mast. Two rows saying the same thing is worse than one.

**5. Fine-grained crossover links resolve to nothing.**
E13 populates the RELATED block with `SHARES KEYLINE` links to other entries. But if the reader clicks a technique CHIP directly (`keyline`), or types `#/technique/keyline`, they get the Techniques front door because `keyline` isn't a top-level technique entry — it's only a spec-block id. The crossover promise is half-kept: the aggregations exist, but the destination pages don't.

**6. `#/section/<id>` doesn't resolve.**
The rail groups entries by section, but there's no per-section index page. A user who wants "all Studies" or "all Print & reproduction" has to scroll the rail rather than land on a page.

**7. The cross-tool foot pill and the mast tool-switch are two answers to the same question.**
`◃ tools · gallery · index▾ · Encyclopedia` at the bottom-left is the build-site injected nav (added at ck-e8+). It lists every deployed tool. The mast switcher lists 3 (Encyclopedia + two redirect stubs). Which is a reader supposed to use, and why do they disagree?

**8. `Gallery` and `Studies` sit in two different tools with overlapping content.**
`Gallery` (a separate tool, `gallery/index.html`) shows "Printed Matter", "Technique Studies", etc. The encyclopedia's new `studies` section houses the same 8 ST plates as first-class entries. That's the SAME artifact filed twice — a duplication like the one E12 was meant to end.

**9. Ki-Landscape is a peer tool but sound audit §7 calls its logic Ki mechanisms inside the encyclopedia.**
`/ki-landscapes/` is on the tools landing under LEARN. The sound-lane refactor (`claude/16-sound-audit.md`) declares Ki-omnichord-in-key and Ki-circle-of-fifths as mechanism ENTRIES inside the encyclopedia's sound section. Same content, two homes.

**10. Route vocabulary is inconsistent.**
`#/techniques`, `#/atoms`, `#/styles` are section-plural. `#/technique/<id>`, `#/atom/<id>`, `#/style/<id>` are entity-singular. `#/entry/<id>` uses the neutral word "entry" for anything that isn't specifically technique / atom / style. `#/skill/<id>` uses "skill" (singular but not entity). `#/section/<id>` doesn't resolve. A reader can't guess the shape.

## 4. The target architecture

One archive. One entry point. Every surface points into or across the archive; nothing points sideways at a phantom peer.

### 4a. The tools landing tightens to two categories
`/` becomes:

    THE ARCHIVE
    01  Encyclopedia          — the practice, one book: techniques, atoms,
                                 styles, explorations, studies, sound,
                                 skills. Everything the practice contains.

    TOOLS
    01  Register              — points on a plate
    02  Email Signature Builder
    03  MeshViz

Ki-Landscape and Gallery either fold into the encyclopedia (their content becomes entries) or are archived under `_archive/`. Technique-studies (the standalone folder) already lives in the encyclopedia as of E12 — quarantine its top-level folder.

Rationale: what a reader is trying to do at `/` is either read the archive or run a small utility. Two shelves, not five.

### 4b. The encyclopedia gets a real landing
`/encyclopedia/` (root) opens on a page titled ENCYCLOPEDIA, not TECHNIQUES. The landing is one paragraph naming what the archive holds and where the doors are:

    ENCYCLOPEDIA
    One archive of the practice. Techniques with lessons; atoms with
    parameters; styles that hold them together; explorations that ran
    them; couplings that share a cause across the medium. Rulings, not
    opinions.

    [ TECHNIQUES ]  [ ATOMS ]  [ STYLES ]  [ EXPLORATIONS ]  [ STUDIES ]
    [ SOUND ]       [ SKILLS ] [ UNFILED ] [ SYMPTOMS ]

    184 entries · 35 techniques · 24 atoms · 7 styles · 74 unsorted

Techniques stays the "front door for building" (per BUILD-NOTES-ENCYC §Authority.1); it just isn't the *default landing*. The default landing is the doorway itself.

### 4c. The mast simplifies
Three changes:

- **Retire the tool-switcher** (`.mast .switch`). The three chips lie. Delete `manifest.siblings[]` from every manifest and remove the `switch` element from the shell.
- **Rename "lenses" to "entries"** on the position and counter. `184 entries` reads honestly whether the reader is looking at an atom, a technique, a study or a chapter.
- **Change the source toggle to "Source"** — drop the `E` keyboard hint from the label; the `?` help dialog already lists it.

The mast becomes: `INDEX / | Encyclopedia | <crumb> | <pos> | Source | ?`

### 4d. The plate-nav collapses into the mast
The plate view's own breadcrumb + coverage + pager (E10) was designed for a standalone HTML. Inside the shell, the mast is the identity row and the pager belongs there. Move:

- **Coverage badge** → into the mast, right of the crumb. Renders on plate views; hidden on index / atom / technique pages.
- **Pager** (`← prev · INDEX · next →`) → into the mast, replacing the current `pos` display on entry pages.
- **Delete `.plate-nav`** from the plate template.

The plate then has TWO regions (notes column + figure column), not three, and identity is asserted once.

### 4e. Fine-grained crossover gets destination pages
Every id in `Shell.crossover.techniques` and `.atoms` gets a resolvable page.

- `#/technique/<id>` — if `<id>` is a top-level manifest entry with `entity: technique`, render the current rich page. If it's ONLY a spec-block id, render a small "aggregation" page: the technique name, layer, and the list of entries that reference it (from the crossover index). That's the minimum viable page — the reader clicks a chip and gets somewhere.
- `#/atom/<name>` — same rule for atoms.

### 4f. `#/section/<id>` resolves
Route handler for `#/section/<id>` renders a filtered contact sheet: title = section.title, body = every entry with `section === <id>` grouped by status. Julia's E12 verify test ("`#/studies` lists 8 entries") starts passing.

### 4g. Route vocabulary
Standardise on **plural for indices, singular for entity pages**:

    #/techniques           — index      #/technique/<id>       — one technique
    #/atoms                — index      #/atom/<name>          — one atom
    #/styles               — index      #/style/<id>           — one style
    #/explorations         — index      #/entry/<id>           — one exploration
    #/studies              — index      (studies are entries; #/entry/<id> resolves)
    #/sound                — index      (sound entries are entries; #/entry/<id>)
    #/skills               — index      #/skill/<id>           — one skill
    #/couplings            — index      #/coupling/<id>        — one coupling
    #/unfiled              — index      (unfiled are entries; #/entry/<id>)
    #/symptoms             — index      (symptoms link out; no entity page)
    #/section/<id>         — filtered contact sheet by section

The five names that are *categories* (techniques, atoms, styles, skills, couplings) point at rich per-page templates. The rest (studies, sound, unfiled, section-scoped views) are FILTERS over `#/entry/<id>`. That distinction is the reader's mental model already; the routes should match.

### 4h. The foot pill retires
The cross-tool nav at `.pill` (build-site injected) becomes redundant once (4a) collapses the tools landing to two categories. Remove `scripts/build-site.mjs injectNav`, delete the `.pill` selector from `learn/shell.css`.

### 4i. Book-of-shaders and components redirect the honest way
The two folders keep their redirect stubs (someone might have a bookmark), but their `siblings[]` entries drop out of every manifest. The redirect stubs land on the encyclopedia's TECHNIQUES route (chapters live there), not on the default landing. Add a small banner on the redirect target: "Book of Shaders content is now under Techniques."

## 5. Implementation checklist

Order matters: 5a is small and unlocks 5b; 5b unlocks 5c; 5c can happen any time.

### 5a. Retire the tool-switcher (small, high-impact)
- [ ] `encyclopedia/manifest.js`, `book-of-shaders/manifest.js`, `components/manifest.js`: delete `siblings[]`.
- [ ] `learn/shell.js`: `buildChrome()` removes the `#switch` element regardless of manifest content (or leaves it hidden). Simpler: delete the `<nav class="switch">` line from `encyclopedia/index.html` and every other tool's index.html that has one.
- [ ] `learn/shell.css`: keep the `.switch` rule as dead-code (removable) or delete outright.

### 5b. Rename "lenses" and clarify counters
- [ ] `learn/views.js position()`: replace `noun = ... 'lenses'` with `'entries'`. The shell's `pos` also gets `entries` on the front door.
- [ ] `learn/views.js` — every string containing "lenses" for a general count, replace with "entries".
- [ ] Chip filter row: unchanged (statuses).

### 5c. Add an encyclopedia landing at `#/`
- [ ] `learn/shell.js` routing: `#/` (empty hash) resolves to a new `renderEncyclopediaLanding()` in `views.js`, not to `#/techniques`. The old default is preserved by keeping the `#/techniques` route.
- [ ] `views.js renderEncyclopediaLanding()`: one-paragraph orientation + a doorway strip + live counts.

### 5d. Collapse plate-nav into the mast
- [ ] `learn/views/entry-plate.js`: remove `.plate-nav` from the assembled HTML.
- [ ] Instead, inside the plate render, mutate the mast: paint the coverage badge into a new mast slot (`#mast-cov`), paint the pager buttons into `#pos` region.
- [ ] Restore the mast to its normal state when navigating away from a plate (in `renderEntry` fall-through / `renderTechniquesIndex` etc.).
- [ ] `learn/entry-plate.css`: strip `.plate-nav` rules; keep coverage / pager rules but scope them to mast selectors.

### 5e. Give spec-only technique / atom ids a page
- [ ] `learn/views.js`: extend `renderTechniquePage(t)` to accept `t` as a **spec-only** id (looked up in `Shell.crossover.techniques`) — render a minimal aggregation page (name, layer, appears-in list).
- [ ] `learn/shell.js` routing: if `#/technique/<id>` doesn't resolve to a manifest entry, still call `renderTechniquePage(fakeEntry)` when the id exists in the crossover.
- [ ] Same for `#/atom/<name>`.
- [ ] Verify: `#/technique/keyline` shows ST-01 + ST-03 + ST-04 as aggregating rows.

### 5f. Add `#/section/<id>` route
- [ ] `learn/shell.js`: handle `#/section/<id>` — resolve to a new `renderSectionIndex(sectionId)` in `views.js`.
- [ ] `renderSectionIndex()`: contact sheet filtered by `section === <id>`, headed by section.title + section.note.
- [ ] Verify: `#/section/studies` shows 8 entries; `#/section/document-system` shows the technical-doc plates.

### 5g. Retire the cross-tool foot pill
- [ ] `scripts/build-site.mjs`: remove or disable `injectNav()`. Keep a small "back to /" chip if anything.
- [ ] `learn/shell.css`: delete `.pill` styles.

### 5h. Fold Gallery + Ki-Landscape (later; needs Julia)
- [ ] Requires a triage: which Gallery studies already exist as encyclopedia entries (ST-01…08 do), which don't. Import or link.
- [ ] Ki-Landscape: E14 sound-lane migration already plans this. The tools landing card for Ki-Landscape retires when its content lives in the encyclopedia.

### 5i. Tools landing — reshape to two shelves
- [ ] `scripts/build-site.mjs renderIndex()`: change the section grouping from `section` field on each tool.json to two: THE ARCHIVE (encyclopedia only) + TOOLS (Register, Signature Builder, MeshViz). Gallery + Ki-Landscape either move to ARCHIVE (as fold-ins) or move to `_archive/`.

## 6. What NOT to do (guardrails)

- Do not build a fancy "meta" navigation of the archive above the archive itself — Julia's editorial voice is: the archive IS the navigation.
- Do not add hue to the mast or the plate-nav to distinguish views. The chrome no-hue rule holds.
- Do not add breadcrumbs deeper than three levels (`Encyclopedia / <section> / <entry>` is the ceiling).
- Do not remove the reviewer's `#gt` garden toolbox — it's Julia's personal review queue, not reader nav.
- Do not break existing hash URLs. `#/techniques`, `#/atoms`, `#/entry/<id>` etc. must keep working.

## 7. Open questions for Julia

1. **Encyclopedia landing text (§4b).** Is the orientation paragraph right, or does the archive want a different opening sentence? Julia's voice, not mine.
2. **Gallery + Ki-Landscape (§4a, §5h).** Fold in as encyclopedia entries, archive under `_archive/`, or leave as separate tools with a "see also →" chip on the encyclopedia landing?
3. **Book-of-shaders + components redirect banner (§4i).** Show a small "content moved" banner on those redirect targets, or silent redirect?
4. **Spec-only technique aggregation page (§5e).** Is the minimum viable "name + appearances" enough, or should it also render a small representative point from one of the appearing entries?
5. **Should `#/` open on the landing (§4c) or continue to open on Techniques?** The plan §Authority.1 says "Front door = Technique" — a landing at `#/` DOESN'T contradict that, but it does add one click before the reader reaches the techniques index. Julia's call.

None of §7 blocks §5a-§5g. Recommend: I execute §5a-§5g as a single commit, ship the review + screenshots to Julia, then she rules on §7 and §5h-§5i.
