// node scripts/census.mjs [page-id-or-path …]
// Renders every T&T page and technique study and writes library/census.json: kind, how it is drawn, its dials, Reset, the Live toggle.
// With arguments, re-measures only those pages and keeps the rest of the census as it is.
import { listPages, measure, readCensus, writeCensus, counts } from './census-lib.mjs';
const only = process.argv.slice(2);
const pages = listPages();
const pick = only.length ? pages.filter(p => only.some(o => p.id === o || p.path.includes(o))) : pages;
const rows = await measure(pick, { log: console.log });
let all = rows;
if (only.length) { const prev = readCensus(); const by = new Map((prev ? prev.pages : []).map(r => [r.path, r])); for (const r of rows) by.set(r.path, r); all = [...by.values()].sort((a, b) => a.path.localeCompare(b.path)); }
writeCensus(all);
console.log('census', JSON.stringify(counts(all)), all.length, 'pages');
