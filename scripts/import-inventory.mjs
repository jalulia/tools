#!/usr/bin/env node
/* ck-e7 — import the 74 unsorted rows from research/example-inventory.csv.

   Reads /home/claude/team/research/example-inventory.csv.
   Skips the ~17 rows already reflected in built content (mapped below —
   verified against encyclopedia/content/ by hand).
   Writes each remaining row as encyclopedia/content/<id>/entry.js with
   entity: 'exploration', status: 'unsorted', proposed_grade: <the CSV grade>.
   Appends every new id to encyclopedia/manifest.js entries[].
   Then runs a thumbnail pass: any row whose source is a runnable HTML page
   in /home/claude/corpus gets a 480px thumb rendered via Playwright.

   Idempotent-ish: an entry.js that already exists is not overwritten;
   the manifest is only appended-to (dupes will fail verifyManifests).

   Usage:
     node scripts/import-inventory.mjs           dry-run
     node scripts/import-inventory.mjs --write   apply
     node scripts/import-inventory.mjs --shots   render thumbs only
     node scripts/import-inventory.mjs --write --shots
*/
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CSV = '/home/claude/team/research/example-inventory.csv';
const CORPUS = '/home/claude/corpus';
const MANIFEST = join(ROOT, 'encyclopedia', 'manifest.js');
const CONTENT = join(ROOT, 'encyclopedia', 'content');

const argv = process.argv.slice(2);
const WRITE = argv.includes('--write');
const SHOTS = argv.includes('--shots');

/* ------------------------------------------------------------------ mapping */
/* IDs from the CSV already reflected in the built encyclopedia — DO NOT
   re-import. Verified by hand against encyclopedia/content/ and against
   the existing atoms & techniques in manifest.js. */
const ALREADY_IN = new Set([
  'PM-07',      // → pm07-molten folder
  'KLS-01',     // → folded into w1-seven-pass-band-chain
  'KLS-02',     // → paper-tooth atom (mean-preserving noise)
  'KI-01',      // → mulberry32 atom
  'KI-03',      // → oklab-ramp atom
  'KI-04',      // → paper-js engine (paper-grain tile)
  'PM-12',      // → paper-tooth atom / paper-js engine (paper tooth tile)
  'CMP-02',     // → halftone-js engine (dot-screen)
  'CMP-06',     // → c1-heavy-ink lens folder (heavy-ink riso)
  'CMP-05',     // → b3-wristband lens folder (Tyvek)
  'MIR-11',     // → depth-aware-dither technique + w2-depth-aware-dither
  'PM-01',      // → w2-depth-aware-dither (Bayer dither over palette)
  'PM-11',      // → e4-masonry-cards (grain-gradient belts, atmospheric style)
  'CMP-08',     // → e4-masonry-cards (belts at card scale)
  'KLS-07',     // → carries the CANON ruling in seven-pass-band-chain
  'CMP-11',     // → shell CSS architecture (not an entry per se)
  'CMP-12'      // → reference-decomposition (shell feature)
]);

/* ------------------------------------------------------------------- CSV */
function parseCsv(text) {
  const rows = [];
  let field = '', row = [], inq = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], n = text[i + 1];
    if (inq) {
      if (c === '"' && n === '"') { field += '"'; i++; }
      else if (c === '"') { inq = false; }
      else field += c;
    } else {
      if (c === '"') inq = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (c === '\r') { /* skip */ }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  const header = rows[0];
  return rows.slice(1).filter(r => r.length > 1).map(r =>
    Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])));
}

const csv = parseCsv(readFileSync(CSV, 'utf8'));
console.log(`CSV rows: ${csv.length}, already in: ${ALREADY_IN.size}, to import: ${csv.length - ALREADY_IN.size}`);

/* ---------------------------------------------------------- source resolve */
/* The CSV's source_file column uses `corpus/repos/x` and `corpus/artifacts/y`
   and `corpus/tools-repo/z` and `corpus/downloads/w` — resolve against the
   real /home/claude/corpus tree. */
function resolveSource(sourceFile) {
  if (!sourceFile) return null;
  const s = sourceFile.replace(/^corpus\//, '');
  const cand = join(CORPUS, s);
  if (existsSync(cand)) return cand;
  // some paths reference tools-repo which lives outside corpus
  const alts = [
    join('/home/claude', 'corpus', s),
    join('/home/claude', s),
    // corpus/tools-repo/components → /home/claude/tools/components (the shipped tool)
    s.startsWith('tools-repo/')
      ? join('/home/claude/tools', s.replace('tools-repo/', ''))
      : null
  ].filter(Boolean);
  for (const p of alts) if (existsSync(p)) return p;
  return null;
}
function isRenderable(path) {
  if (!path) return false;
  try { if (statSync(path).isDirectory()) return false; } catch { return false; }
  return /\.html?$/i.test(path);
}

/* --------------------------------------------------------- write entry.js */
function slugify(id) { return id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function esc(s) { return String(s).replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${'); }
function esc1(s) { return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'"); }

function inferLane(row) {
  const l = String(row.language || '').toLowerCase();
  if (l.includes('glsl')) return 'glsl';
  if (l.includes('svg')) return 'canvas2d';   // no svg lane in the shell yet
  if (l.includes('canvas')) return 'canvas2d';
  if (l.includes('css')) return 'canvas2d';
  if (l.includes('audio')) return 'audio';
  return 'canvas2d';   // default — safest, and never triggers fragment.html requirement
}

function writeEntryJs(row, hasThumb, srcPath) {
  const id = slugify(row.id);
  const dir = join(CONTENT, id);
  const file = join(dir, 'entry.js');
  if (existsSync(file)) return { id, skipped: 'entry.js exists' };
  if (WRITE) mkdirSync(dir, { recursive: true });
  const title = row.name.slice(0, 200);
  const fullTitle = row.name;
  const src = row.source_file + (row.lines ? ':' + row.lines : '');
  const notes = row.notes || '';
  const lane = inferLane(row);
  /* text: a short prose block combining what_it_does + notes + why-in-this-status */
  const body = `
    <p>${esc(row.what_it_does)}</p>
    ${notes ? '<p><b>Note.</b> ' + esc(notes) + '</p>' : ''}
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>${esc(src)}</code> · ${esc(row.language)}${row.bos_chapter ? ' · ' + esc(row.bos_chapter) : ''}
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher\'s proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>
  `.trim();

  const content = `/* ${row.id} — imported by scripts/import-inventory.mjs at ck-e7.
   Source: ${src}
   The researcher's grade (${row.grade}) and editorial_status
   (${row.editorial_status}) live in \`proposed_grade\` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: '${id}',
  index: '${row.id}',
  title: \`${esc(fullTitle)}\`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: '${esc1(row.grade + ' · ' + row.editorial_status)}',
  lane: '${lane}',
  tags: ['imported', 'unsorted'${row.language.toLowerCase().includes('svg') ? ", 'svg'" : ''}],
  source: {
    kind: 'reference-study',
    title: \`${esc(src)}\`,
    author: 'Julia Compton',
    note: \`${esc(notes.slice(0, 500))}\`
  },
  ${hasThumb ? "thumb: 'thumb.png'," : ''}
  text: \`${esc(body)}\`
});
`;
  if (WRITE) writeFileSync(file, content);
  return { id, written: true, thumb: hasThumb, srcPath };
}

/* --------------------------------------------------------- manifest append */
function appendToManifest(newIds) {
  if (!newIds.length || !WRITE) return;
  let s = readFileSync(MANIFEST, 'utf8');
  /* dedupe: if the id is already listed anywhere in entries[], skip it */
  const already = new Set();
  for (const id of newIds) {
    const rx = new RegExp("'" + id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "'");
    if (rx.test(s)) already.add(id);
  }
  const fresh = newIds.filter(id => !already.has(id));
  if (already.size) console.log(`  (${already.size} ids already in manifest, skipping)`);
  if (!fresh.length) return;
  const marker = "/* ── ck-e7 · imported unsorted rows from example-inventory.csv ───────";
  if (s.includes(marker)) {
    console.log('  (manifest already has ck-e7 marker — appending inside it)');
    /* insert new ids at the marker's tail block */
    const idx = s.indexOf(marker);
    const closeIdx = s.indexOf('*/', idx) + 2;
    const insertAt = s.indexOf('\n', closeIdx) + 1;
    /* find first content line of the block */
    const block = fresh.map(id => `    '${id}',`).join('\n') + '\n';
    s = s.slice(0, insertAt) + block + s.slice(insertAt);
  } else {
    /* insert before the CANDIDATE TECHNIQUES marker if present, else before ]}); */
    const candIdx = s.indexOf('    // CANDIDATE TECHNIQUES');
    const injectBefore = candIdx >= 0 ? s.lastIndexOf('\n', candIdx) : s.lastIndexOf(']\n});');
    const block = '\n    ' + marker + '\n' +
      '       Each row lands as entity:exploration, status:unsorted, with the\n' +
      '       researcher grade in proposed_grade. Renders on #/unfiled.\n' +
      '       ─────────────────────────────────────────────────────────────── */\n' +
      fresh.map(id => `    '${id}',`).join('\n') + '\n';
    s = s.slice(0, injectBefore) + block + s.slice(injectBefore);
  }
  writeFileSync(MANIFEST, s);
}

/* ============================================================== main pass */
const toImport = csv.filter(r => !ALREADY_IN.has(r.id));
console.log(`\nimporting ${toImport.length} rows...`);

const results = [];
for (const row of toImport) {
  const srcPath = resolveSource(row.source_file);
  const renderable = isRenderable(srcPath);
  const id = slugify(row.id);
  const dir = join(CONTENT, id);
  const thumbPath = join(dir, 'thumb.png');
  const hasThumb = existsSync(thumbPath);
  results.push({ id, csvId: row.id, srcPath, renderable, hasThumb, row });
}

/* write entries */
let newIds = [];
if (WRITE || !SHOTS) {   /* dry run also lists what WOULD be written */
  for (const r of results) {
    /* Only declare thumb: 'thumb.png' if the file already exists on disk.
       The --shots pass runs BEFORE --write; a subsequent --write picks up
       the newly rendered thumb. verifyManifests fails a manifest that
       declares a file which is not there. */
    const res = writeEntryJs(r.row, r.hasThumb, r.srcPath);
    if (res.written) { newIds.push(r.id); }
    console.log(`  ${WRITE ? (res.written ? '+' : '·') : '·'} ${r.csvId.padEnd(8)} ${r.id.padEnd(28)} ` +
      `${r.renderable ? 'renderable ' : 'code-only  '}` +
      `${r.hasThumb ? '·thumb ' : '·no-thumb '}`);
  }
  console.log(`\n${newIds.length} entries would be written (${WRITE ? 'applied' : 'dry-run'})`);
}

if (WRITE && newIds.length) appendToManifest(newIds);

/* ============================================================== thumbs pass */
if (SHOTS) {
  const pkg = await import('/home/claude/.npm-global/lib/node_modules/playwright/index.js');
  const chromium = pkg.chromium || pkg.default?.chromium;
  const b = await chromium.launch();
  let done = 0, skipped = 0, failed = 0, notRenderable = 0;
  for (const r of results) {
    const thumbPath = join(CONTENT, r.id, 'thumb.png');
    if (existsSync(thumbPath)) { skipped++; continue; }
    if (!r.renderable) { notRenderable++; continue; }
    if (!existsSync(join(CONTENT, r.id))) mkdirSync(join(CONTENT, r.id), { recursive: true });
    try {
      const ctx = await b.newContext({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 1 });
      const pg = await ctx.newPage();
      /* block network — many corpus pages fetch Google Fonts which blocks
         `load`. domcontentloaded is enough to paint the first frame. */
      await pg.route('**/*', (route) => {
        const u = route.request().url();
        if (u.startsWith('file://') || u.startsWith('data:')) return route.continue();
        return route.abort();
      });
      await pg.goto(pathToFileURL(r.srcPath).href, { waitUntil: 'domcontentloaded', timeout: 8000 });
      await pg.waitForTimeout(1600);
      const shot = await pg.screenshot({ fullPage: false });
      /* downscale to 480 px wide via a second playwright page — simpler than
         requiring sharp. Use CSS to constrain viewport. */
      const ctx2 = await b.newContext({ viewport: { width: 480, height: 310 }, deviceScaleFactor: 1 });
      const pg2 = await ctx2.newPage();
      const dataUrl = 'data:image/png;base64,' + shot.toString('base64');
      await pg2.setContent(`<!doctype html><body style="margin:0;background:#fff"><img src="${dataUrl}" style="width:100%;display:block"></body>`);
      await pg2.waitForTimeout(200);
      const small = await pg2.screenshot({ fullPage: false });
      writeFileSync(thumbPath, small);
      await ctx.close(); await ctx2.close();
      done++;
      process.stdout.write('.');
      if (done % 20 === 0) process.stdout.write(' ' + done + '\n');
    } catch (e) {
      failed++;
      process.stdout.write('x');
    }
  }
  console.log(`\nshots — rendered: ${done}, skipped(had): ${skipped}, failed: ${failed}, not-renderable: ${notRenderable}`);
  await b.close();
}

console.log('\ndone.');
