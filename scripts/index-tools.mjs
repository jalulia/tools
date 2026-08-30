#!/usr/bin/env node
// index-tools.mjs — the optional, local half of keeping a manifest in sync.
//
//   node scripts/index-tools.mjs                 check + print a diff, change nothing
//   node scripts/index-tools.mjs --write         apply only the safe additions
//   node scripts/index-tools.mjs --shots         render missing thumb.png (needs playwright)
//   node scripts/index-tools.mjs --shots --force re-render every thumb.png
//   node scripts/index-tools.mjs --mirror        copy main.frag / *.frag into entry.js
//   node scripts/index-tools.mjs --tool components
//
// The manifest is hand-editable and hand-owned. Editorial fields — title,
// status, tags, order, source, related, critique, reference, ruling — are
// decisions, and a script must never invent or overwrite them. So this tool may
// only ever:
//
//   · ADD a folder that is not in the manifest, appended to entries[];
//   · RETIRE an entry whose folder is gone, by commenting its line out with a
//     dated note — never by deleting it;
//   · FILL a missing thumb.png (--shots);
//   · MIRROR a .frag / .js file of record into the template literal that
//     actually runs (--mirror);
//   · VALIDATE against learn/manifest.schema.json.
//
// It never reorders, never rewrites prose, and never touches a status that
// exists. A run with no --write is safe and readable: it prints a diff.

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { join, dirname, relative, basename, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadManifest, findManifests, verifyManifests } from './lib/manifests.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SCHEMA = join(ROOT, 'learn', 'manifest.schema.json');

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : null; };
const WRITE = has('--write');
const FORCE = has('--force');
const THUMB_W = 480;      // the widest a card is ever drawn, plus headroom
const ONLY = val('--tool');

const C = { dim: (s) => `\x1b[2m${s}\x1b[0m`, b: (s) => `\x1b[1m${s}\x1b[0m` };
let changed = 0, notes = 0;

const manifests = findManifests(ROOT).filter((f) =>
  !ONLY || relative(ROOT, f).startsWith(ONLY + '/'));

if (!manifests.length) {
  console.log('No manifest.js found. Nothing to do.');
  process.exit(0);
}

/* ------------------------------------------------------------------ check */
console.log(C.b('\nschema'));
const problems = verifyManifests(ROOT, {
  toolDirs: [...new Set(manifests.map((f) => relative(ROOT, f).split('/')[0]))],
  schemaFile: SCHEMA
});
if (problems.length) {
  console.log(`\n  ${problems.length} problem(s) — these fail the deploy:`);
  for (const p of problems) console.log('  ✘ ' + p);
} else {
  console.log('  no problems');
}

/* ------------------------------------------------------------------- diff */
for (const file of manifests) {
  const m = loadManifest(file);
  const where = relative(ROOT, file);
  console.log(C.b(`\n${where}`));

  const declared = new Set(m.entries.map((e) => basename((e.path || '').replace(/\/$/, ''))));
  const contentDir = join(m.dir, 'content');
  const onDisk = existsSync(contentDir)
    ? readdirSync(contentDir).filter((n) =>
        !n.startsWith('_') && !n.startsWith('.') && statSync(join(contentDir, n)).isDirectory())
    : [];

  /* folders the manifest has never heard of */
  const added = onDisk.filter((n) => !declared.has(n));
  for (const name of added) {
    console.log(`  + content/${name}/  ${C.dim('not in the manifest')}`);
    changed++;
    if (WRITE) appendEntry(file, name);
  }

  /* entries whose folder is gone */
  const gone = m.entries.filter((e) => !existsSync(join(m.dir, e.path || '')));
  for (const e of gone) {
    console.log(`  - ${e.id}  ${C.dim('folder is gone')}`);
    changed++;
    if (WRITE) retireEntry(file, e.id);
  }

  /* example files sitting in a folder and not listed */
  for (const e of m.entries) {
    const exDir = join(m.dir, e.path || '', 'examples');
    if (!existsSync(exDir)) continue;
    const listed = new Set((e.examples || []).map((x) => x.file).filter(Boolean));
    for (const f of readdirSync(exDir)) {
      if (!/\.(frag|js|html)$/.test(f)) continue;
      if (!listed.has('examples/' + f)) {
        console.log(`  · ${e.id}: examples/${f} ${C.dim('on disk, not in examples[]')}`);
        notes++;
      }
    }
  }

  /* related links declared on one side only */
  const byId = new Map(m.entries.map((e) => [e.id, e]));
  for (const e of m.entries) {
    for (const r of e.related || []) {
      if (r.tool && r.tool !== m.manifest.id) continue;      // cross-tool: mirrored by hand
      const other = byId.get(r.entry);
      if (!other) continue;
      const back = (other.related || []).some((x) => x.entry === e.id);
      if (!back) { console.log(`  · ${other.id}: no back-link to ${e.id} ${C.dim('(' + r.relation + ')')}`); notes++; }
    }
  }

  /* missing thumbnails. A course entry does not need one — its stage is live
     the moment you open it. A catalogue card DOES: the resting state of a card
     is its thumb, and without one an unmounted card shows a placeholder. */
  for (const e of m.entries) {
    const t = e.thumb && (typeof e.thumb === 'string' ? e.thumb : e.thumb.file);
    if (!t) {
      if (m.manifest.mode === 'catalogue') {
        console.log(`  · ${e.id}: no thumb file ${C.dim('— the card has nothing at rest (--shots)')}`);
        notes++;
      }
      continue;
    }
    if (!existsSync(join(m.dir, e.path, t))) console.log(`  ✘ ${e.id}: thumb ${t} is declared and missing`);
  }

  /* --mirror: the file of record becomes the template literal that runs */
  if (has('--mirror')) mirror(m);
}

/* -------------------------------------------------------- candidate techniques
   ck-e6 · Read every exploration's uses[] and find atoms used by 2+
   explorations with no technique above them (produces[] on any technique
   in this manifest). Write a proposed-technique stub into the manifest
   with status: 'proposed'. The shell renders these with a dashed border
   and a "proposed by tool" label so nobody mistakes one for a ruling.
   Julia rules by editing the stub.

   Run always as a diff (no --write) so we can see what the detector would
   surface; --write applies. */
console.log(C.b('\ncandidate techniques (ck-e6)'));
for (const file of manifests) {
  const m = loadManifest(file);
  if (!m.manifest.styles) continue;    /* only the encyclopedia has entities */
  const usage = new Map();     /* atomId → [{entryId, params?}, ...] */
  const producedBy = new Map();/* atomId → [techniqueId, ...] */
  const proposed = new Set(
    m.entries.filter((e) => e.status === 'proposed').map((e) => e.id)
  );
  for (const e of m.entries) {
    if (e.entity === 'technique') {
      for (const aid of e.produces || []) {
        if (!producedBy.has(aid)) producedBy.set(aid, []);
        producedBy.get(aid).push(e.id);
      }
    }
    /* count uses from explorations and couplings — anything non-technique/atom */
    if (e.entity === 'atom' || e.entity === 'technique') continue;
    for (const u of e.uses || []) {
      const id = typeof u === 'string' ? u : (u && u.atom);
      if (!id) continue;
      if (!usage.has(id)) usage.set(id, []);
      usage.get(id).push(e.id);
    }
  }
  const candidates = [];
  for (const [aid, users] of usage) {
    if (users.length < 2) continue;
    if (producedBy.has(aid)) continue;                        /* already has a technique above it */
    const atom = m.entries.find((e) => e.id === aid);
    if (!atom || atom.entity !== 'atom') continue;
    /* stable id — a candidate for atom "paper-tooth" becomes technique
       "paper-tooth-driver". If already proposed, do not re-propose. */
    const propId = aid + '-driver';
    if (proposed.has(propId)) continue;
    candidates.push({ atomId: aid, atomTitle: atom.title, users, propId,
                      atomKind: atom.kind, atomLayer: atom.layer || null });
  }
  candidates.sort((a, b) => b.users.length - a.users.length);
  const where = relative(ROOT, file);
  console.log(C.dim(`  scanning ${where}`));
  if (!candidates.length) {
    console.log('  (no unpromoted atoms with 2+ uses)');
    continue;
  }
  for (const c of candidates) {
    const usersShown = c.users.slice(0, 3).join(', ') + (c.users.length > 3 ? `, +${c.users.length - 3}` : '');
    console.log(`  ${C.b('candidate')} ${c.propId}  ${C.dim(`(${c.atomKind} atom ${c.atomId} · ${c.users.length} uses: ${usersShown})`)}`);
    changed++;
    if (WRITE) writeCandidate(file, c);
  }
}

function writeCandidate(file, c) {
  let s = readFileSync(file, 'utf8');
  const marker = '// CANDIDATE TECHNIQUES · appended by index-tools.mjs --write';
  if (!s.includes(marker)) {
    /* insert a marker block just before the final `]});` of entries[] */
    const close = s.lastIndexOf(']\n});');
    if (close < 0) { console.log('    ! could not find entries[] closing — add candidates by hand'); return; }
    s = s.slice(0, close) + `,\n\n    ${marker}\n` + s.slice(close);
  }
  const kindHint = c.atomKind === 'voice' || c.atomKind === 'space' || c.atomKind === 'bus'
    ? 'audio' : 'visual';
  const lane = kindHint === 'audio' ? 'audio' : 'canvas2d';
  const stub = `    { id: '${c.propId}', title: '${c.atomTitle} as driver',
      entity: 'technique', section: 'techniques', status: 'proposed',
      lane: '${lane}',
      description: 'PROPOSED BY TOOL — ${c.atomId} is used by ${c.users.length} explorations (${c.users.slice(0,4).join(', ')}) with no technique above it. The ${kindHint}-lane lesson would be about how ${c.atomId} decides X across those instances. Julia rules by editing this stub.',
      produces: ['${c.atomId}'],
      stub: true },
`;
  /* insert before the closing bracket */
  const close = s.lastIndexOf(']\n});');
  s = s.slice(0, close) + stub + s.slice(close);
  writeFileSync(file, s);
  console.log(`    → wrote proposed technique ${c.propId} into ${basename(file)}`);
}

/* ----------------------------------------------------------------- shots */
if (has('--shots')) await shots(manifests);

console.log(`\n${changed} change(s) ${WRITE ? 'applied' : 'proposed'}, ${notes} note(s).` +
  (!WRITE && changed === 0 ? '' : WRITE ? '' : '  Re-run with --write to apply.'));
process.exit(problems.length ? 1 : 0);

/* ================================================================ actions */

function appendEntry(file, name) {
  let s = readFileSync(file, 'utf8');
  // entries: [ … ] — append one line before the closing bracket. A new folder
  // arrives as a plain id; everything about it is then authored in its own
  // entry.js, which is where those decisions belong.
  const m = /entries\s*:\s*\[([\s\S]*?)\]/.exec(s);
  if (!m) { console.log('    ! could not find entries[] — add the line by hand'); return; }
  const body = m[1].replace(/\s*$/, '');
  const indent = (/\n(\s+)/.exec(m[1]) || [, '    '])[1];
  const next = body + (body.trim().endsWith(',') ? '' : ',') + `\n${indent}'${name}'\n${indent.slice(0, -2)}`;
  s = s.slice(0, m.index) + `entries: [${next}]` + s.slice(m.index + m[0].length);
  writeFileSync(file, s);
  console.log(`    → added '${name}' to entries[]`);
  scaffold(join(dirname(file), 'content', name), name);
}

function scaffold(dir, id) {
  const f = join(dir, 'entry.js');
  if (existsSync(f)) return;
  const today = new Date().toISOString().slice(0, 10);
  const title = id.replace(/^[0-9]+-/, '').replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());
  writeFileSync(f,
`/* Added by scripts/index-tools.mjs on ${today}. Everything here is a decision
   waiting to be made; the script only ever guesses the title and the status. */
Shell.registerEntry({
  id: '${id}',
  title: '${title}',
  section: '',
  status: 'exploration',
  stub: true,
  text: \`<p>…</p>\`
});
`);
  console.log(`    → scaffolded content/${id}/entry.js`);
}

function retireEntry(file, id) {
  let s = readFileSync(file, 'utf8');
  const today = new Date().toISOString().slice(0, 10);
  const re = new RegExp(`^(\\s*)(['"])${id}\\2\\s*,?\\s*$`, 'm');
  if (!re.test(s)) { console.log('    ! could not find the line — retire it by hand'); return; }
  // Comment out, never delete: a retired entry is part of the record.
  s = s.replace(re, (line, indent) => `${indent}// '${id}',   // folder removed ${today}`);
  writeFileSync(file, s);
  console.log(`    → commented '${id}' out with a dated note`);
}

/* --mirror: replace the `code:` template literal of an example whose `file`
   exists on disk. It only rewrites a literal it can find unambiguously; if the
   shape is not what it expects it says so and changes nothing. */
function mirror(m) {
  for (const e of m.entries) {
    if (!e.__file) continue;
    let src = readFileSync(e.__file, 'utf8');
    let touched = false;
    for (const x of e.examples || []) {
      if (!x.file) continue;
      const onDisk = join(m.dir, e.path, x.file);
      if (!existsSync(onDisk)) continue;
      const text = readFileSync(onDisk, 'utf8').replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
      const at = findCodeLiteral(src, x.id);
      if (!at) { console.log(`  ! ${e.id}/${x.id}: no single \`code:\` literal to mirror into`); continue; }
      if (src.slice(at.start, at.end) === text) continue;
      console.log(`  ~ ${e.id}/${x.id} ← ${x.file}  ${C.dim(text.length + ' bytes')}`);
      if (WRITE) { src = src.slice(0, at.start) + text + src.slice(at.end); touched = true; changed++; }
      else changed++;
    }
    if (touched) writeFileSync(e.__file, src);
  }
}

/** Find the template literal of `code:` inside the object that declares id: '<exId>'. */
function findCodeLiteral(src, exId) {
  const idRe = new RegExp(`["']?id["']?\\s*:\\s*["']${exId}["']`);
  const m = idRe.exec(src);
  if (!m) return null;
  const codeAt = src.indexOf('code:', m.index);
  if (codeAt < 0) return null;
  const tick = src.indexOf('`', codeAt);
  if (tick < 0 || tick - codeAt > 40) return null;   // `code:` not followed by a literal
  let i = tick + 1;
  while (i < src.length) {
    if (src[i] === '\\') { i += 2; continue; }
    if (src[i] === '`') return { start: tick + 1, end: i };
    i++;
  }
  return null;
}

/* --shots: render a thumbnail for anything that has not got one. Playwright is
   a local dev dependency, never a deploy one — build-site.mjs must keep
   running with no install step at all. */
async function shots(files) {
  let chromium;
  try { ({ chromium } = await import('playwright')); }
  catch {
    console.log('\n--shots needs playwright locally: npm i -g playwright && npx playwright install chromium');
    return;
  }
  // Optional second local dependency. A thumbnail rendered at the plate's own
  // design width is 1100 px wide and 400-1600 KB of full-colour PNG; 27 of
  // those is 16 MB in the repository for pictures that are never shown above
  // 354 px. Print plates full of halftone and grain compress badly, so the
  // saving is in the palette: 480 px and 192 colours is 1.9 MB for the set and
  // is indistinguishable at card size. If sharp is not installed the shot is
  // still correct, just large, and the run says so rather than failing.
  let sharp = null;
  try { ({ default: sharp } = await import('sharp')); }
  catch { console.log(C.dim('  (no sharp: thumbs are written at full size — npm i sharp to shrink them)')); }

  const browser = await chromium.launch();
  for (const file of files) {
    const m = loadManifest(file);
    for (const e of m.entries) {
      const declared = e.thumb && (typeof e.thumb === 'string' ? e.thumb : e.thumb.file);
      // Only render what a page will actually use: a declared-but-missing
      // thumb, or a catalogue card, whose resting state IS its thumb. A course
      // entry has a live stage the moment you open it.
      if (!declared && m.manifest.mode !== 'catalogue') continue;
      const out = join(m.dir, e.path, declared || 'thumb.png');
      if (existsSync(out) && !FORCE) continue;
      const lane = e.lane || m.manifest.stage?.adapter;
      const dw = (e.frame && e.frame.designWidth) || 1100;
      const asp = String((e.frame && e.frame.aspect) || '3/2').split('/');
      const dh = Math.round(dw * (+asp[1] || 2) / (+asp[0] || 3));
      const ctx = await browser.newContext({ viewport: { width: dw, height: dh }, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      try {
        if (lane === 'fragment') {
          await page.goto(pathToFileURL(join(m.dir, e.path, e.fragment || 'fragment.html')).href,
            { waitUntil: 'load' });
        } else {
          await page.goto(pathToFileURL(join(m.dir, 'index.html')).href + '#/' + e.id, { waitUntil: 'load' });
        }
        // SETTLE. It was 1,200 ms, and 1,200 ms is not long enough: D2's marker
        // circles fade in on a staggered per-mark delay that reaches ~1.4 s, so
        // the shot caught a printed tile with no hand layer on it and nothing
        // said so — the first D2 thumbnail shipped wrong (CHECKPOINT-5 §7.1).
        // 2,600 ms clears the slowest authored delay in the library (D2 at
        // 1.4 s) with room, and clears scene.js's own 2,500 ms fonts.ready
        // backstop, so a face that never loads still cannot be photographed
        // mid-swap. This is the value team/build/thumbs-5.mjs was using; it now
        // lives in the shipped script and thumbs-5.mjs is retired.
        await page.waitForTimeout(2600);
        mkdirSync(dirname(out), { recursive: true });
        // Bake the authored crop into the file, so a card at rest and a card
        // with a live frame in it show the same composition. The card aspect is
        // the grid minimum, 232 x 196; object-fit: cover takes it from there.
        const crop = e.thumb && e.thumb.crop;
        let clip = null;
        if (lane === 'fragment' && crop) {
          const cw = Math.min(dw, Math.round(dw / crop[0]));
          const ox = Math.min(crop[2] || 0, dw - cw);
          const ch = Math.min(dh - (crop[1] || 0), Math.round(cw * 196 / 232));
          if (ch > 20) clip = { x: ox, y: crop[1] || 0, width: cw, height: ch };
        }
        const target = lane === 'fragment' ? page : await page.$('.stage');
        const shot = await (target ?? page).screenshot(clip ? { clip } : {});
        if (sharp) {
          await sharp(shot).resize({ width: THUMB_W, withoutEnlargement: true })
                           .png({ palette: true, colours: 192, effort: 8 }).toFile(out);
        } else {
          writeFileSync(out, shot);
        }
        const kb = (statSync(out).size / 1024) | 0;
        console.log(`  ▣ ${relative(ROOT, out)}  ${C.dim((clip ? 'crop baked in · ' : '') + kb + ' KB')}`);
        changed++;
      } catch (err) {
        console.log(`  ! ${e.id}: ${err.message}`);
      }
      await ctx.close();
    }
  }
  await browser.close();
}
