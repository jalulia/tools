# Build notes — press-bench branch (working file, delete before PR)

Authority, in order: Julia's decisions (below) → /home/claude/team/oversight/PLAN.md (the spec; its section 5 calls
override the leads) → /home/claude/team/design/ (direction.md, tokens.css, comps/ — lift the CSS, apply PLAN §5
corrections 6–11) → /home/claude/team/ux/ (01-shell-ia.md, 02-manifest-schema.md, schema/, proto/shell.js as the
router/keyboard base) → /home/claude/team/research/ (audits, inventory CSV, 04-content-critique for chapter anatomy).
Brief: /home/claude/corpus/BRIEF.md. Corpus: /home/claude/corpus.

## Julia's decisions (2026-08-29)
- Build phase one as planned. Checkpoints 3 and 5 are review stops (render + show her).
- Type: Source Serif 4 + Commit Mono, self-hosted; a comparison render vs Newsreader/Literata before fonts are committed.
- Catalogue entry: 1:1 and scroll, with a `fit` toggle in the drawdown strip.
- Editorial: everything canonical by default; e3-bento-grid historical; "19 Other effects" exploration. Keep the BoS
  title; change its one-line claim to name the adaptation + the four original chapters. Six Components sections
  (Print & reproduction · Type & specimen · Document & system · Motion & kinetic · Layout systems · In situ) + six styles.

## Hard rules (from PLAN §2.6 + Julia's design philosophy)
- No fetch / import() / type=module in shipped code. Classic self-registering scripts only. Must open by double-click.
- Never name a content file tool.json or package.json; never a folder dist/ or _site/ (build-site.mjs drops them).
- No CDN scripts. Vendored only.
- Nothing touches iframe.contentDocument / contentWindow.document. postMessage only.
- Force light: color-scheme:light on :root, <meta name=color-scheme content=light>, explicit background on html AND body.
  No theme toggle. The stage/specimen declares its own ground explicitly.
- No accent hue in the chrome; no glass/blur/shadow; chrome never adopts a lens colour. Failure = the FAULTS hatch.
- The register is CUT. --col-max 1148 (mat interior 1100 with rail closed). Stage height budget
  min(58vh, 620px, 100vh − furniture − 3 lines). Masthead condenses in CSS, never separate markup.
- Iframes: src= never srcdoc; entry route mounts 1; sheet mounts on approach + unmounts on exit; cap 4 desktop / 2 < 840px.
- Keyboard: one central guard (INPUT/TEXTAREA/contentEditable + modifiers). Esc leaves the editor. ? dialog traps focus.
- prefers-reduced-motion: chrome transitions off; adapters render one frame and stop.
- Every count on any page derives from manifest entries.length. verifyManifests() in build-site.mjs fails the deploy otherwise.
- Google Fonts are blocked in this sandbox; fallback in shots is expected. Fonts must have real fallback stacks.

## Conventions
- Work in /home/claude/tools on branch press-bench. Commit per checkpoint with a clear message. Don't push (Julia's Mac pushes).
- Render everything you touch headless (Playwright, chromium at /opt/pw-browsers) at 390 and 1440, over file:// AND
  http (python3 -m http.server), and look at the shots before calling anything done. Shots → /home/claude/team/build/shots/<checkpoint>/.
- Keep a CHECKPOINT-N.md in /home/claude/team/build/ per checkpoint: what was done, what was measured, what's open.
