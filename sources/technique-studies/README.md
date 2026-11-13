# Technique study engines (ST-12 to ST-39)

The editable source of the measured technique studies published at
`techniques-templates/studies/<slug>/`. Each published page carries a compiled copy of its engine; this folder
is the version people and Claude sessions edit. Reference images are not here: they belong to other people and
stay private. `refstats/` holds only the numbers measured from them.

| Path | What it is |
|---|---|
| `src/util.js` | shared kit: seeded noise, blur, the Mindgut robot (`mgRobot`, `MG_POSE`) |
| `src/p1.js` … `src/p28.js` | one engine per study (p1–p21 = ST-13…ST-33, p23–p28 = ST-34…ST-39; there is no p22) |
| `dev.html` | loads one engine for local work: `dev.html?p=pNN` |
| `make_study.py` | builds a study page from an engine and `shell/` |
| `bench.py`, `search.py`, `tune.py`, `cd.py`, `check_study.py`, `test_params.py` | the benchmark and parameter tests (they need the private reference images) |
| `AGENT_BRIEF.md` | the plate contract and rules the engines follow |
| `publish.py` | superseded: publish through `scripts/publish.mjs` at the repo root |

The scripts were written in a Claude session and still use its absolute paths (`/home/claude/plates`, `/home/claude/tools`).
Copied into the repo on 2026-11-13 so nothing lives only in a session folder.
