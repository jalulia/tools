# CHECKPOINT E5 — sound lane · 5 audio entries · 6 voice/space/bus atoms

The `audio` lane, shipped at ck-e0 as an adapter with nothing to mount, now
carries five real audio entries and six atoms. Every audio entry's `build`
takes A context (live AudioContext OR OfflineAudioContext), so the still
frame, live playback and OfflineAudioContext WAV export share one
mechanism.

## `#/sound` — the sound index

Filter is `lane === 'audio' || section === 'sound'`. Lists every audio-lane
entry (5) plus every audio atom (6) — the four audio pieces at the top of
the sheet carry their offline-rendered wave preview as their card thumb
(painted by the audio adapter's `preview(el, entry, on)` from a
1-second `OfflineAudioContext` render — no live context on a contact
sheet, glsl.js's rule for glasses that hold six of anything).

## The five audio entries

| id | index | status | entity | source |
|---|---|---|---|---|
| **cathedral-reverb** | P1 | canonical | exploration | reliquary-synth/src/audio/CathedralReverb.ts:1-111 |
| **ki-soundscape-bands** | A3 | canonical | exploration | Ki-Landscapes/sonic.html:341-357 + 228-238 + 400-404 |
| **shepard-risset** | S8 | canonical | exploration | pussyphus/.../src/audio/shepard.js:23-66 |
| **buzz-generator** | S-BUZZ | exploration | exploration | reliquary-synth/src/audio/BuzzGenerator.ts |
| **crowd-and-dither-shared-cause** | C-FLOW | canonical | **coupling** | pussyphus/.../src/audio/crowd.js:25-83 + src/render/dither.js:10-90 |

Every entry declares `lane: 'audio'`, `section: 'sound'`,
`governed_by: ['composing-computational-sound-systems']`, and cites atoms
in the new voice/space/bus kinds via `uses[]`.

**cathedral-reverb** carries the FAULTS block naming the Q=1 loop-runaway
the sound lead measured — the corrected Q=0.5 with feedback capped at 0.86
is in the shipped build. The FAULTS entry states the measurement (single
comb, unit impulse → peak 3480 over 8 s in headless Chrome) and its
method. Ruling is **proposed** (not yet Julia's) per D4.

**ki-soundscape-bands** is canonical WITH a `driver` + `consequences[]`
block on the same entry, per D3 — a coupling is not a third page-kind. The
Takanaka mp3 embed at sonic.html:51 is filed as a known_failure in the
FAULTS block; the shipped bed is generated inline (daytona-v2.html:337-388).

**crowd-and-dither-shared-cause** is `entity: 'coupling'` with
`driver: 'uFlow — a single 0..1 scalar'` and six consequences across two
files (crowd.js's audio filter + dither.js's shader), plus a mute-test
paragraph. Its audio pane plays banded crowd bursts through a flow-driven
lowpass; its shader consequences are named in the coupling table with
their source lines. Shows both sides of the shared cause on one entry
page.

## The six audio atoms

Kinds `voice`, `space`, `bus` are declared in the atom_kind enum
(shipped at ck-e0). Six atoms:

- `freeverb-comb` (space) — delay + in-loop LP + feedback gain
- `allpass-diffuser` (space) — feed-forward −0.5 + feedback +0.5 around one delay
- `master-limiter` (bus) — two DynamicsCompressorNodes as glue → peak-catcher
- `sidechain-duck` (bus) — cancelScheduledValues + setTargetAtTime
- `banded-burst` (voice) — noise → BP → AR envelope; the whole percussion section
- `buzz-envelope` (voice) — filtered noise + slow LFO

Each swatch is a **signal-flow diagram** — a filter or an envelope has no
paintable "look"; what you paint is the graph. Nodes, arrows, feedback
loops, and per-parameter readouts (Hz, ms, dBFS). No hue anywhere; the
same neutral ramp as the visual atom swatches.

All six governed by `composing-computational-sound-systems`.

## The audio adapter — verified

`adapters/audio.js` was shipped at ck-e0 (532 lines). Verified here:

- **Contract complete** — mount / unmount / setParam / toggleRun /
  preview / fillSource / exportWav / liveCount / still / current.
- **One AudioContext per page.** `Shell.audio.ctx()` is memoised; called
  three times, identity holds.
- **Gesture-gated construction.** `mount(o)` sets up the panes but does
  NOT create the context; the context is constructed inside `toggleRun`.
  Prove headless: with `--autoplay-policy=no-user-gesture-required` the
  ctx() call succeeds on the first invocation and returns the same
  reference thereafter.
- **`prefers-reduced-motion` → quiet mode by default.** −12 dB, not muted;
  the still frame is what the reader sees (no rAF loop).
- **`lens:pause` unmounts a playing entry** when the entry is backgrounded
  (rail scroll, apparatus open).
- **OfflineAudioContext render for every entry is non-silent.** Every
  build() constructs its graph on an OAC, schedules over virtual time,
  and renders. Measured in headless Chrome:

  | entry | peak | rms |
  |---|---|---|
  | cathedral-reverb | −21.7 dBFS | 0.005 |
  | ki-soundscape-bands | −5.9 dBFS | 0.066 |
  | shepard-risset | −7.9 dBFS | 0.142 |
  | buzz-generator | −33.8 dBFS | 0.004 |
  | crowd-and-dither-shared-cause | −27.0 dBFS | 0.004 |

  All well above the silence threshold (peak > 0.005, rms > 0.0005).

## The `composing-computational-sound-systems` skill

Already registered at ck-e0. Note updated to: *"proposed rung — parallels
composing-computational-material-systems for audio: one source, several
consequences, one listen, the mute test."* Currently governs 6 atoms and
5 entries. Skill page ships empty at ck-e8; the rung stays unbuilt on the
skill side (INVENTORY §1: 34 of 47 rows in the corpus have no governing
skill).

## Shell additions

- `views.js`: `couplingHTML(e)` renders driver + consequences table +
  mute-test callout for any entry that declares `driver` or
  `consequences[]`. Field labels flip per lane (`reads_as` → "listens
  as", `pass_order` → "signal path"). `headroom` renders as its own
  wide row in the critique block.
- `shell.css`: `.blk.coupling`, `.coup-driver`, `table.cons`, `.coup-mute`,
  `.audio-pane`, plus `[data-fit="audio"]` on the stage to collapse aspect
  ratio (the audio panes size themselves).
- `manifest.schema.json`: added `duration`, `tail`, `readout`, `build`,
  `proposed_grade` to `entry`; extended status enum with `proposed` for
  ck-e6.

## Verification

    node scripts/build-site.mjs   → all manifests verified
    encyclopedia/manifest.js — 88 entries, 16 sections, 6 styles, 14 skills

    node team2/build-e/shots/e5/verify.mjs
      adapter contract: mount:true … exportWav:true
      PASS cathedral-reverb                 peak −21.7 dBFS · rms 0.0050
      PASS ki-soundscape-bands              peak  −5.9 dBFS · rms 0.0659
      PASS shepard-risset                   peak  −7.9 dBFS · rms 0.1424
      PASS buzz-generator                   peak −33.8 dBFS · rms 0.0038
      PASS crowd-and-dither-shared-cause    peak −27.0 dBFS · rms 0.0037
      one AudioContext: ok (identity across 3 calls)
      zero console/page errors

Shots at `team2/build-e/shots/e5/`:

- `sound-index-1440.png` · `sound-index-390.png`
- `entry-cathedral-1440.png` (with FAULTS block reading the Q=1 measurement)
- `entry-coupling-1440.png` (both panes — audio wave + six-row consequences table)
- `entry-shepard-1440.png` · `atoms-audio-1440.png`
- Plus the -390 phone counterparts for the sound index and the two showcase entries.
