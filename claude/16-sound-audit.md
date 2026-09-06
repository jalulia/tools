# Sound-lane audit — refactor to project-mechanism shape

**Date:** 2026-09-06 · **Author:** Julia + Claude
**Trigger:** Julia, E10-review: "the current sound entries look like visual techniques, but they describe specific Pussyphus / Holy Ops sound logic. this doesn't make sense. contained mechanisms folded into one thing."
**Scope:** the sound lane only — `#/sound` list, section `sound`, all `lane: 'audio'` entries in `encyclopedia/manifest.js`. Companion to `claude/15-encyclopedia-refactor-plan.md`; this decision applies before E14's backlog retrofit.

---

## 1. The misinterpretation, named

The current sound lane was built by MIRRORING the visual archive's shape — atoms + drivers + techniques. Each sound atom is a decomposed piece of one of Julia's real sound systems, filed as if it were a stand-alone effect that could be pulled off any shelf.

But sound doesn't work like a swatch library. A ducker, a reverb, and a limiter are not three things you pick from three cabinets — they are three tuning decisions inside ONE contained mechanism (Holy Ops's layered voice system, Pussyphus's foley system, Ki's playable visualizer). Pulling them apart makes each atom read as generic when the whole point is that Julia's sound work is contained-and-authored: the mechanism IS the entry.

The current sound lane files by material, not by mechanism. That is the mistake.

---

## 2. What's there now, and where each piece came from

Six atoms + two "drivers" + two couplings. Every source is one of Julia's own repos.

| Current entry | Kind | Real source | What it actually is |
|---|---|---|---|
| `freeverb-comb` | atom · space | reliquary-synth (Holy Ops) `CathedralReverb.ts:58-84` | one comb of the 8-comb Freeverb bank inside Holy Ops's cathedral |
| `allpass-diffuser` | atom · space | reliquary-synth (Holy Ops) `CathedralReverb.ts:86-111` | the four allpass diffusers after the comb bank in the same reverb |
| `master-limiter` | atom · bus | reliquary-synth (Holy Ops) `MasterChain.ts:1-33` | Holy Ops's master chain (comp + limiter) |
| `sidechain-duck` | atom · bus | holy-ops-v2 `index.html:2318-2345` | the click-free ducker that ties Holy Ops's layered voices to the room |
| `banded-burst` | atom · voice | pussyphus `crowd.js:132-142` + `foley.js:39-55` | Pussyphus's whole percussion section — noise → bandpass → AR envelope |
| `buzz-envelope` | atom · voice | reliquary-synth (Holy Ops) `BuzzGenerator.ts` | Holy Ops's drone class |
| `master-limiter-driver` | technique | derived — appears across every sound system | abstraction over the master-chain shape |
| `banded-burst-driver` | technique | derived — appears across Pussyphus voices | abstraction over the burst-voice shape |
| `ki-soundscape-bands` | coupling | Ki-Landscapes `sonic.html` | Ki's analyser → biome-as-instrument mapping (bed synthesised in-page) |
| `crowd-and-dither-shared-cause` | coupling | mixed | crowd voice + dither share cause |

Everything in that table is TRUE. Nothing there is factually wrong. It is filed at the wrong grain.

---

## 3. The mechanism-shaped section Julia wants

One entry per contained sound mechanism, filed by the project it comes from. The mechanism entry OWNS the internals — the ducker, the reverb, the burst voice etc. become sections inside the mechanism's page and its spec block, not top-level entries.

The four mechanisms Julia named, and what each contains:

### 3a. `pussyphus-crowd-and-foley` (new · mechanism)
- **What it is:** the whole Pussyphus percussion + crowd system — one primitive (noise → bandpass → AR envelope) tuned six ways to carry the game's entire foley section, with the click-free exponential-decay + setValueAtTime(0) trailing zero.
- **Sources:** `pussyphus/crowd.js:132-142`, `pussyphus/foley.js:39-55`
- **Absorbs:** `banded-burst` (as one section of the mechanism, not a separate atom) · `banded-burst-driver` (folds in as the mechanism's central shape)
- **Section:** `sound`  · **layer:** OUTPUT  · **status:** canonical (Julia's own repo, working code)

### 3b. `holy-ops-additive-relics-kit` (new · mechanism)
- **What it is:** Julia's core Holy Ops sound design — "sound as an additive kit based implementation; the relics build tracks." Each of 14 relics is a voice; votives make the cathedral room; a sidechain ducker keeps the heavy voices from stepping on the ambience; a master chain lands them all at one ceiling. The mechanism is the layered-voice + additive-composition + click-free ducking system, taken as one unit.
- **Sources:** `holy-ops-v2/index.html:2318-2345` (ducker), `reliquary-synth/CathedralReverb.ts` (room), `reliquary-synth/MasterChain.ts` (master), `reliquary-synth/BuzzGenerator.ts` (drone class)
- **Absorbs:** `sidechain-duck` · `freeverb-comb` · `allpass-diffuser` · `master-limiter` · `buzz-envelope` (all as internal parts, not top-level atoms) · `master-limiter-driver` (survives as an abstraction the mechanism uses — see §4)
- **Section:** `sound` · **layer:** OUTPUT · **status:** canonical (Julia's own live instrument at jalulia.github.io/reliquary)

### 3c. `ki-omnichord-in-key` (new · mechanism)  ← source from Impossible Outcomes repo/project
- **What it is:** Ki's playable visualizer where anything the user plays stays in key — the note-quantizing + omnichord-strum logic that makes it impossible to hit a wrong note.
- **Sources (Julia's ruling):** Impossible Outcomes GitHub repo and/or the Impossible Outcomes Claude Project. If the code exists there, port; if it doesn't yet, ship as `status: 'stub'` with the mechanism named but no working plate.
- **Section:** `sound` · **layer:** STRUCTURE

### 3d. `ki-circle-of-fifths` (new · mechanism)  ← source from Impossible Outcomes repo/project
- **What it is:** Ki's circle-of-fifths logic — a harmonic navigation surface, likely tied to the visualizer or a Ki brand tool.
- **Sources (Julia's ruling):** same as 3c.
- **Section:** `sound` · **layer:** STRUCTURE

### 3e. `ki-soundscape-bands` (existing · keep as a mechanism)
- **What it is:** the Ki analyser → biome-as-instrument mapping — one analyser read drives five visual jobs.
- **Ruling:** already mechanism-shaped (it's a coupling with an audio driver + visual consequences) and files correctly. **Keep as-is**, but promote from coupling to explicit "mechanism" framing when the mechanism template is written.
- **Source:** `Ki-Landscapes/sonic.html:341-357, 228-238, 400-404`

---

## 4. Techniques that survive as abstractions

Not every driver/technique in the current section should die — some genuinely appear across mechanisms and belong as abstractions.

- `master-limiter-driver` — the "one master ceiling for a multi-source composition" shape is used by Holy Ops, Pussyphus, AND Ki. Keep as a technique (`entity: technique`) with `layer: STRUCTURE`. Mechanisms cite it via `instance_of[]`. The five-tests block already written for it stands.
- `banded-burst-driver` — the noise → band-pass → gain-envelope voice shape appears in Pussyphus foley AND could appear in other mechanisms. Keep as a technique for the same reason. Mechanisms cite it.

Everything else in the current sound lane retires or folds into a mechanism (§3).

---

## 5. What a mechanism entry looks like in the plate template

Same plate template as any other entry (per `claude/15-encyclopedia-refactor-plan.md`), with these emphases:

- **Notes column body:** narrates the mechanism as one system — what it does, why it's contained the way it is, what the shared cause is that binds its parts. Not a list of parts.
- **`spec.techniques[]`:** the mechanism's internal parts DO get technique blocks (one per part), because the LLM-readable spec should still be able to regenerate the mechanism from parameters. But every block cites `parent_mechanism: <this-entry-id>` and is described as a section of the whole, not a stand-alone atom. On the plate, the technique chips read as internal labels, not as separate entries.
- **`points[]` coverage rule:** every internal part gets a point on the plate's schematic (signal-flow diagram or DAG), so the coverage rule still enforces "every technique is provable from the picture." For a mechanism plate, the picture is the DAG.
- **Related block:** other mechanisms sharing a driver, or the driver's own technique entry, land here.

---

## 6. Migration plan

Ordered, so nothing breaks. Runs at E14 per the plan.

1. **Draft** the four mechanism entries above (§3a, 3b, 3c, 3d). Julia's ruling for 3c/3d: source from Impossible Outcomes GitHub repo + Claude Project; if the code doesn't exist yet, ship as `status: 'stub'`.
2. **Absorb** the six sound atoms + two `-driver` techniques into their parent mechanisms' `spec.techniques[]` blocks. Every atom keeps its params and note; it just moves into a mechanism instead of standing alone.
3. **Quarantine** the six atom `content/<slug>/` folders to `encyclopedia/content/_archive/sound-atoms-2026-09-06/` with a `manifest.txt` naming what moved where. Never delete outright (Julia's file-organization rule).
4. **Retire** `crowd-and-dither-shared-cause` if it survives only because both `crowd` and `dither` used to be atoms. Re-express it as a `related[]` link between the Pussyphus mechanism and whichever visual entry the "shared cause" side of the coupling belongs to.
5. **Keep** `ki-soundscape-bands` and `master-limiter-driver` and `banded-burst-driver` per §3e / §4.
6. **Update** `encyclopedia/CHECKPOINT-E5.md` (the sound-lane checkpoint) with this rulings block so the record of the change stays in-repo.

Nothing on the visual side of the archive touches. The plate template refactor from `15-encyclopedia-refactor-plan.md` still runs in parallel; this audit tells us WHAT lives in the sound lane, that plan tells us HOW it's displayed.

---

## 7. Open questions for Julia

1. **Ki source in Impossible Outcomes:** Julia ruled at plate-review that Ki omnichord + circle-of-fifths source is the Impossible Outcomes GitHub repo and/or the Impossible Outcomes Claude Project. Claude Code needs the specific repo URL and any relevant file paths within it. If the code doesn't exist yet in either place, ship as `status: 'stub'`.
2. **The Ki soundscape-bands entry (§3e):** does it stay filed as a coupling, or does it get re-authored as a first-class mechanism entry the way §3a/§3b will be? Coupling framing puts it "between" the visual and audio lanes; mechanism framing files it under Ki. Recommend: promote to mechanism at E14, add the coupling relation as `related[]` to the visual side.

Ready to author 3a and 3b at E14 as first mechanism entries, and to file the six atoms + `crowd-and-dither-shared-cause` into quarantine.
