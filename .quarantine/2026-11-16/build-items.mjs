// One-off: rebuild the Encyclopedia items Julia kept (moved, private or archived in the CMS) as library/items/,
// a viewer on the shared learn/ shell with only those items, then the Encyclopedia folder is quarantined.
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm';
const ROOT = process.argv[2]; const SRC = path.join(ROOT, process.argv[3] || 'encyclopedia'), OUT = path.join(ROOT, 'library/items');
const E = JSON.parse(fs.readFileSync(path.join(ROOT, 'library/_build/edits.json'))).records;
const kept = Object.entries(E).filter(([id, ed]) => id.startsWith('enc:') && ed && ed.state !== 'removed' && ((ed.project && ed.project !== 'encyclopedia') || ed.visibility === 'private' || ed.state === 'archived')).map(([id]) => id.slice(4));
let M; vm.runInNewContext(fs.readFileSync(path.join(SRC, 'manifest.js'), 'utf8'), { Shell: { registerManifest: (m) => (M = m) } });
const idOf = (x) => (typeof x === 'string' ? x : x.id);
const keep = new Set(kept.filter((id) => M.entries.some((x) => idOf(x) === id)));
// what the kept items stand on (atoms they use, techniques they are instances of) comes along, hidden from the library
const entryOf = (id) => { const x = M.entries.find((y) => idOf(y) === id); if (x && typeof x !== 'string') return x; const f = path.join(SRC, 'content', id, 'entry.js'); if (!fs.existsSync(f)) return {}; let got = {}; try { vm.runInNewContext(fs.readFileSync(f, 'utf8'), { Shell: { registerEntry: (e) => (got = e) }, Comp: {}, window: {} }); } catch (err) { const s = fs.readFileSync(f, 'utf8'); const grab = (k) => ((new RegExp(k + '\\s*:\\s*\\[([^\\]]*)\\]').exec(s) || [])[1] || '').match(/[\w.-]+/g) || []; got = { uses: grab('uses'), instance_of: grab('instance_of'), produces: grab('produces') }; } return got; };
const support = new Set(); let frontier = [...keep];
while (frontier.length) { const next = []; for (const id of frontier) { const e = entryOf(id); for (const t of [...(e.uses || []), ...(e.instance_of || []), ...(e.produces || [])]) { const tid = typeof t === 'string' ? t : t && t.id; if (tid && !keep.has(tid) && !support.has(tid) && M.entries.some((y) => idOf(y) === tid)) { support.add(tid); next.push(tid); } } } frontier = next; }
const all = new Set([...keep, ...support]);
const missing = kept.filter((id) => !keep.has(id));
const trim = (arr) => (Array.isArray(arr) ? arr.filter((r) => all.has(typeof r === 'string' ? r : r && (r.id || r.ref || r.to || r.entry))) : arr);
const entries = M.entries.filter((x) => all.has(idOf(x))).map((x) => {
  if (typeof x === 'string') return x;
  const y = { ...x }; for (const k of ['uses', 'instance_of', 'produces', 'used_by', 'see_also', 'couples', 'related']) if (k in y) y[k] = trim(y[k]); return y;
});
const secs = new Set(entries.map((x) => (typeof x === 'string' ? null : x.section)).filter(Boolean));
// sections of string entries are declared in their entry.js; keep every section that may hold one
const styles = (M.styles || []).map((st) => ({ ...st, entries: (st.entries || []).filter((x) => all.has(x)) }));
const man = { ...M, styles, id: 'library-items', title: 'Library items', subtitle: 'kept from the Encyclopedia, 2026-11-16', siblings: [], redirects: {}, entries };
fs.mkdirSync(path.join(OUT, 'content'), { recursive: true });
for (const id of all) {
  const from = path.join(SRC, 'content', id); if (!fs.existsSync(from)) continue;
  fs.cpSync(from, path.join(OUT, 'content', id), { recursive: true });
}
for (const d of ['_engines', '_styles']) fs.cpSync(path.join(SRC, 'content', d), path.join(OUT, 'content', d), { recursive: true });
// one folder deeper: content/<id>/x.html reached learn/ with ../../../, now ../../../../
let rewrites = 0;
for (const id of all) {
  const d = path.join(OUT, 'content', id); if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d).filter((f) => /\.(html|js)$/.test(f))) {
    const p = path.join(d, f), s = fs.readFileSync(p, 'utf8');
    let t = s.replace(/(["'(])\.\.\/\.\.\/\.\.\/learn\//g, '$1../../../../learn/');
    // a related link to an item that was not kept is dropped
    if (f === 'entry.js') t = t.replace(/\{\s*"?entry"?\s*:\s*["']([\w.-]+)["'][^{}]*\}\s*,?/g, (m, eid) => (all.has(eid) ? m : '')).replace(/,(\s*\])/g, '$1');
    if (t !== s) { fs.writeFileSync(p, t); rewrites++; }
  }
}
fs.copyFileSync(path.join(SRC, 'swatches.js'), path.join(OUT, 'swatches.js'));
fs.writeFileSync(path.join(OUT, 'manifest.js'), `/* library/items/manifest.js · the ${keep.size} Encyclopedia items Julia kept (moved, private or archived in the library CMS), 2026-11-16.\n   Generated once from encyclopedia/manifest.js when the Encyclopedia was retired (.quarantine/2026-11-16/MANIFEST.md).\n   Links to items that were not kept are trimmed. The library (../) is the index; this page only shows one item. */\nShell.registerManifest(${JSON.stringify(man, null, 1)});\n`);
let html = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8')
  .replace(/(href|src)="\.\.\/learn\//g, '$1="../../learn/')
  .replace(/<title>[^<]*<\/title>/, '<title>Library item</title>')
  .replace(/<meta name="description"[^>]*>/, '<meta name="description" content="One item from the library, kept from the Encyclopedia.">')
  .replace(/<!-- review toolbox[\s\S]*?<script src="\.\.\/\.\.\/learn\/garden-toolbox\.js"><\/script>\n?/, '')
  .replace('<body data-mode="catalogue" data-index="open"', '<body data-mode="catalogue" data-index="closed"')
  .replace('<a class="skip" href="#view">Skip to the entry</a>', '<a class="skip" href="#view">Skip to the entry</a>\n<!-- the library is the index: no item named means back to it -->\n<script>if(!/^#\\/(entry|atom|technique|coupling|style)\\//.test(location.hash))location.replace("../");</script>\n<a class="libback" href="../" style="position:fixed;left:10px;bottom:46px;z-index:50;font:500 10px/1 \'JetBrains Mono\',ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;background:#fff;border:1px solid #101014;color:#101014;padding:7px 9px;text-decoration:none">← Library</a>');
fs.writeFileSync(path.join(OUT, 'index.html'), html);
fs.writeFileSync(path.join(OUT, 'README.md'), `# library/items\n\nThe ${keep.size} Encyclopedia items Julia kept when the Encyclopedia was retired (2026-11-16): ${[...keep].join(', ')}.\nShown on the shared learn/ shell, one item at a time; the library is the index. Record ids stay enc:<id>, so CMS edits and accession numbers carry over.\n`);
fs.writeFileSync(path.join(OUT, '.support.json'), JSON.stringify([...support]));
console.log(JSON.stringify({ kept: keep.size, support: [...support], missing, rewrites }));
