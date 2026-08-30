# Encyclopedia build notes (working file, delete before PR)

Branch `encyclopedia` off `press-bench`. Do NOT push until PR-1 (press-bench) merges.

## Authority
1. Julia's decisions (2026-08-29):
   - Front door = Technique
   - 74 unsorted CSV rows in now (after a thumbnail pass; researcher grades import as "proposed", never rulings)
   - Merge press-bench first, evolve it
   - TEXTURE: still open — she was confused by the sibling framing; decide by looking at Model C's shelves in the first real materials view
2. Team specs (all in /home/claude/team2/):
   - architect/DOMAIN-MODEL.md, MODELS.md, RECOMMENDATION.md, proto/*
   - sound/INVENTORY.md, SOUND-SECTION.md, proto/audio-adapter.html
   - julia-proxy/LENS.md, JOBS-AND-HEURISTICS.md, REVIEW-*, DECISION-FRAMING.md
3. Phase-one plan (still in force): /home/claude/team/oversight/PLAN.md
4. All hard rules from BUILD-NOTES.md carry (no fetch, no CDN, force light, no contentDocument, iframe policy, verifyManifests, prefers-reduced-motion, keyboard central guard).

## The shape (locked)
- ONE tool at /encyclopedia/ (or promote to root — decide at ck-final). Book-of-shaders and components fold in as sources (their content stays, their tool boundaries dissolve).
- Entities: Technique · Atom (kinds: substrate/process/texture/colour/type/engine/field/mark/voice/space/bus) · Style · Exploration · Coupling (an exploration with a driver + consequences[]).
- Routes: /techniques (home) · /atoms · /styles · /explorations · /sound · /symptoms · /unfiled · /skills · /entry/<id> · /technique/<id> · /style/<id> · /atom/<id>
- Status enum: canonical | exploration | historical | known_failure | unsorted (+ stub boolean)
- Relations: instance_of · uses · shared-cause · sound-behind · shader-behind · ancestor-of · variant-of · overuses (for symptoms)
- Skills: all 14 tagged on entries via `governed_by[]`; only competency rungs get pages (unbuilt shown empty)
- Sound: one new lane (`audio`), one new field, one new relation. LISTENS AS / SIGNAL PATH are labels, not schema renames.

## Checkpoints
- ck-e0 · shell copy + new manifest.schema.json + router with all new routes + adapters carry over
- ck-e1 · migrate BoS entries + Components lenses to unified content/ with the new schema
- ck-e2 · atoms table (Model C's layout, but read-only entries page for each atom) — TEXTURE SHELVES REVIEW STOP
- ck-e3 · techniques index as front door + technique pages with instance strips + governed_by
- ck-e4 · styles index + style pages (from the six already built)
- ck-e5 · sound lane + audio adapter + 3-5 audio entries from the sound-proof
- ck-e6 · #/symptoms + #/unfiled + candidate-technique detector (promotion ladder)
- ck-e7 · import the 74 unsorted (thumbnail pass first)
- ck-e8 · skill pages + facets
- ck-e9 · QA matrix + PR-2

## Order of building
Ship a running v0 by ck-e3 (shell + atoms + techniques with instance strips), then layer in styles/sound/symptoms/unfiled/skills. Julia sees a real thing at ck-e2 (atoms — texture-shelves) and ck-e3 (techniques front door).
