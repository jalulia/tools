// node scripts/guard.mjs
// Blocks a deploy when work would be lost or a page without dials would go up. Compares the tree with library/census.json:
//  1. every census page still exists, unless a .quarantine/*/MANIFEST.md names it or the CMS archived or removed it;
//  2. pages that are new, or whose defining files changed (build stamps ignored), are rendered and recounted:
//     a new page with no dials fails; a page whose dials dropped below its census count fails.
// Exit 0 = pass, 1 = fail, 3 = needs a browser (install playwright and run again).
import fs from 'node:fs'; import path from 'node:path';
import { ROOT, listPages, fingerprint, measure, readCensus, allowedGone } from './census-lib.mjs';
const C = readCensus(); if (!C) { console.log('guard · no library/census.json yet; nothing to compare'); process.exit(0); }
const now = new Map(listPages().map(p => [p.path, p])); const gone = allowedGone(); const fails = [];
for (const r of C.pages) {
  if (r.status === 'redirect') continue;
  const there = fs.existsSync(path.join(ROOT, r.path, 'index.html'));
  if (!there || !now.has(r.path)) { const slug = r.path.split('/').filter(Boolean).pop(); if (!gone.has(slug) && !gone.has(r.id)) fails.push(`${r.code} ${r.title}: gone from ${r.path} with no quarantine manifest row and no CMS archive or removal`); }
}
const census = new Map(C.pages.map(r => [r.path, r]));
const todo = [...now.values()].filter(p => { const r = census.get(p.path); return !r || r.fingerprint !== fingerprint(p.path); });
if (todo.length) {
  let rows; try { rows = await measure(todo); } catch (e) { if (e.code === 'NO_BROWSER') { console.log(`guard · ${todo.length} page(s) changed or new; a browser is needed to count their dials`); process.exit(3); } throw e; }
  for (const r of rows) { const was = census.get(r.path);
    if (r.status === 'error') fails.push(`${r.code} ${r.title}: page failed to load (${r.error})`);
    else if (!was && (r.status === 'no-dials')) fails.push(`${r.code} ${r.title}: new page with no dials (rule: nothing goes on tools without parameters)`);
    else if (was && was.dial_kind === 'technique' && (r.dials || 0) < (was.dials || 0)) fails.push(`${r.code} ${r.title}: dials dropped from ${was.dials} to ${r.dials || 0}`);
  }
  console.log(`guard · re-measured ${rows.length} changed or new page(s)`);
}
if (fails.length) { console.error('guard · FAILED\n- ' + fails.join('\n- ')); process.exit(1); }
console.log(`guard · passed (${C.pages.length} census pages, ${todo.length} re-measured)`);
