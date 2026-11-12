// node _build/registry.mjs [--check] [--private]   — run from the techniques-templates root.
//
// One registry over every technique vocabulary in the repository. It reads the Library's authority file
// (library/catalog.json: tt, st, enc, enc.read and hld terms, plus exploration and study records) and the
// hand-written merges in _build/registry-map.json, and writes registry.json: one canonical entry per technique,
// with every older id kept as an alias, every plate that uses it, and its lifted modules where they exist.
//
//   --check     write nothing; exit 1 if a term is unmapped, mapped twice, or the file on disk is stale
//   --private   also read templates/t-04-effect-set/registry.private.json and write registry.full.json beside it
//               (that folder carries a .private marker, so the site build skips it)
//
// Nothing on the page reads registry.json yet. Phase 1 of claude/32-tt-audit-and-phased-plan.md.
import fs from 'node:fs'; import path from 'node:path';
const root = process.cwd();
const CHECK = process.argv.includes('--check'), PRIVATE = process.argv.includes('--private');
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const CAT = read(path.join(root, '..', 'library', 'catalog.json'));
const MAP = read(path.join(root, '_build', 'registry-map.json'));
const problems = [];

const terms = new Map(CAT.authority.techniques.map((t) => [t.key, t]));
const recById = new Map(CAT.records.map((r) => [r.id, r]));
const recByCall = new Map(); for (const r of CAT.records) if (r.call && !recByCall.has(r.call)) recByCall.set(r.call, r);
const callOf = (id) => { const r = recById.get(id); return r ? (r.call || r.title) : id; };

// lifted modules and ranges, from the T&T specs
const spec = new Map();
for (const dir of fs.readdirSync(path.join(root, 'techniques'))) {
  const f = path.join(root, 'techniques', dir, 'spec.json'); if (!fs.existsSync(f)) continue;
  const s = read(f);
  for (const t of s.techniques || []) {
    const k = 'tt:' + t.id; if (!spec.has(k)) spec.set(k, []);
    spec.get(k).push({ plate: s.code, module: t.module ? `techniques/${dir}/${t.module}` : null, ranged: JSON.stringify(t.params || {}).includes('"range"'), limits: !!t.limits });
  }
}

// every term must be claimed exactly once
const claimed = new Map();
const claim = (key, by) => { if (claimed.has(key)) problems.push(`${key} is in both "${claimed.get(key)}" and "${by}"`); else claimed.set(key, by); if (!terms.has(key)) problems.push(`${key} (in "${by}") is not a term in library/catalog.json`); };

const uses = (t) => [...new Set((t.uses || []).map((u) => callOf(u.rec)))];
const member = (key) => { const t = terms.get(key) || { name: key }; const s = spec.get(key) || []; return { alias: key, name: t.name, used_in: uses(t), modules: s.filter((x) => x.module).map((x) => x.module), ranged: s.some((x) => x.ranged) }; };

const studyUses = {}; // canonical id -> [record call]
for (const [rec, ids] of Object.entries(MAP.study_uses || {})) {
  if (!recById.has(rec)) problems.push(`study_uses: ${rec} is not a record`);
  for (const id of ids) { if (!MAP.entries[id]) problems.push(`study_uses: ${rec} names "${id}", which is not an entry`); (studyUses[id] ||= []).push(callOf(rec)); }
}

const entries = [];
for (const [id, e] of Object.entries(MAP.entries)) {
  if (!MAP.families[e.family]) problems.push(`${id}: unknown family "${e.family}"`);
  for (const k of e.members) claim(k, id);
  const members = e.members.map(member);
  const lifts = (e.lifts || []).map((c) => { const r = recByCall.get(c); if (!r) problems.push(`${id}: lift "${c}" is not a record call`); return r ? { call: c, record: r.id, title: r.title, href: r.href } : { call: c }; });
  const used = [...new Set([...members.flatMap((m) => m.used_in), ...(studyUses[id] || [])])];
  if (!members.length && !lifts.length && !used.length) problems.push(`${id}: no member, lift or use`);
  entries.push({
    id, name: e.name, family: e.family, kind: 'technique', liftable: true,
    aliases: e.members, members, lifts,
    used_in: used, proposed_uses: studyUses[id] || [],
    modules: [...new Set(members.flatMap((m) => m.modules))],
    spec: members.some((m) => m.modules.length) ? 'v2' : members.some((m) => m.alias.startsWith('tt:')) ? 'v1' : null,
    merged: e.members.length > 1, by: MAP.by, date: MAP.date, access: 'public'
  });
}
for (const k of MAP.subject_construction || []) {
  claim(k, 'subject-construction'); const m = member(k);
  entries.push({ id: 'subject-' + k.split(':')[1], name: m.name, family: 'subject-construction', kind: 'read', liftable: false, aliases: [k], members: [m], lifts: [], used_in: m.used_in, proposed_uses: [], modules: [], spec: null, merged: false, by: MAP.by, date: MAP.date, access: 'public' });
}
for (const k of terms.keys()) if (!claimed.has(k)) problems.push(`${k} is not mapped in _build/registry-map.json`);
const ids = new Set(); for (const e of entries) { if (ids.has(e.id)) problems.push(`duplicate entry id ${e.id}`); ids.add(e.id); }

const assignedRecs = new Set(entries.flatMap((e) => e.lifts.map((l) => l.record)));
const unassigned = CAT.records.filter((r) => r.kind === 'exploration' && !assignedRecs.has(r.id)).map((r) => ({ call: r.call, title: r.title, section: r.section_title }));

const fam = {}; for (const e of entries) (fam[e.family] ||= []).push(e.id);
const count = (f) => entries.filter(f).length;
const registry = {
  schema: 'tt-registry/1',
  note: 'One canonical entry per technique. `aliases` are the ids used on the plates and in the Library; they keep working. Merges are proposed by the tool until confirmed in _build/registry-map.json.',
  source: { library_catalog: CAT.generated, library_commit: CAT.source_commit || null, map_date: MAP.date },
  counts: {
    terms_in: terms.size, entries: entries.length, liftable: count((e) => e.liftable), subject_reads: count((e) => !e.liftable),
    merged: count((e) => e.merged), terms_folded: terms.size - entries.filter((e) => e.members.length).length,
    with_modules: count((e) => e.modules.length), spec_v1_only: count((e) => e.spec === 'v1'), no_plate_yet: count((e) => e.liftable && !e.members.length),
    explorations_assigned: assignedRecs.size, explorations_unassigned: unassigned.length
  },
  families: Object.entries(MAP.families).map(([id, blurb]) => ({ id, blurb, entries: (fam[id] || []).length })),
  entries: entries.sort((a, b) => a.family.localeCompare(b.family) || a.id.localeCompare(b.id)),
  unassigned_explorations: unassigned
};

if (problems.length) { console.error('registry · ' + problems.length + ' problem(s)\n  ' + problems.join('\n  ')); process.exit(1); }
const body = JSON.stringify(registry, null, 1) + '\n', file = path.join(root, 'registry.json');
if (CHECK) { if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== body) { console.error('registry · registry.json is stale; run node _build/registry.mjs'); process.exit(1); } }
else fs.writeFileSync(file, body);

if (PRIVATE) {
  const pdir = path.join(root, 'templates', 't-04-effect-set'), pf = path.join(pdir, 'registry.private.json');
  if (fs.existsSync(pf)) {
    const P = read(pf); const full = JSON.parse(body);
    for (const p of P.entries) {
      const hit = full.entries.find((e) => e.id === p.id);
      if (hit) { hit.aliases.push(...p.aliases); (hit.private_members ||= []).push(...p.aliases); hit.modules.push(...(p.modules || [])); }
      else full.entries.push({ ...p, kind: 'technique', liftable: true, members: [], lifts: [], used_in: p.used_in || [], proposed_uses: [], spec: 'fx', merged: false, by: P.by, date: P.date, access: 'private' });
    }
    full.counts.private_entries = full.entries.filter((e) => e.access === 'private').length; full.counts.entries = full.entries.length;
    if (!CHECK) fs.writeFileSync(path.join(pdir, 'registry.full.json'), JSON.stringify(full, null, 1) + '\n');
    console.log(`registry · private tier: ${P.entries.length} effects, ${full.counts.private_entries} new entries, ${P.entries.length - full.counts.private_entries} folded into public entries`);
  } else console.log('registry · no private file');
}
const c = registry.counts;
console.log(`registry · ${c.terms_in} terms → ${c.entries} entries (${c.liftable} liftable, ${c.subject_reads} subject reads) · ${c.merged} merged · ${c.with_modules} with modules · ${c.no_plate_yet} with no plate yet · explorations ${c.explorations_assigned} assigned, ${c.explorations_unassigned} not`);
