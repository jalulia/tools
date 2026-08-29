// Write each declared file of record from the `code` literal that actually
// runs, and report any .frag/.js in a content folder that no example declares.
// This is the inverse of `index-tools.mjs --mirror` (disk -> literal) and it
// exists so that a chapter authored in one file can produce its files of
// record without hand-copying. Run it, then run --mirror: zero changes means
// the two agree.
import { writeFileSync, readFileSync, existsSync, readdirSync, unlinkSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadManifest } from './manifests.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const tool = process.argv[2] || 'book-of-shaders';
const prune = process.argv.includes('--prune');
const m = loadManifest(join(ROOT, tool, 'manifest.js'));

let wrote = 0, orphans = [];
for (const e of m.entries) {
  const base = join(m.dir, e.path || `content/${e.id}/`);
  if (!existsSync(base)) continue;
  const declared = new Set(['entry.js']);
  for (const x of e.examples || []) {
    if (!x.file || x.code == null) continue;
    declared.add(x.file);
    const out = join(base, x.file);
    const text = x.code.replace(/^\n/, '');
    const prev = existsSync(out) ? readFileSync(out, 'utf8') : null;
    if (prev !== text) { writeFileSync(out, text); wrote++; console.log('  → ' + e.id + '/' + x.file); }
  }
  for (const f of readdirSync(base)) {
    if (!/\.(frag|vert|js)$/.test(f) || declared.has(f)) continue;
    orphans.push(join(tool, 'content', e.id, f));
    if (prune) unlinkSync(join(base, f));
  }
}
console.log(`${wrote} file(s) of record written.`);
if (orphans.length) console.log((prune ? 'pruned: ' : 'orphaned (use --prune): ') + orphans.join(', '));
