// library/_build/cms.mjs · applies the CMS edits file (library/_build/edits.json) to the catalog, last.
//
// The CMS in library/index.html writes edits.json straight to GitHub. Nothing else writes it.
// Every build reads it here, after the catalog is collated, so an edit always wins over a default.
//
// What a record gets here:
//   project     which piece of work it belongs to (edits.json → projects). Default from its collection and sources.
//   kind3       technique · example · template: the three kinds the library shows (Julia, 2026-11-15).
//   state       live (left out) or archived. A removed record is dropped from the catalog.
//   visibility  public (left out) or private. Private is hidden from the public listings; see docs/CMS.md for what that does and does not protect.
//   tags, title edits from the CMS. tags is the whole list; tags_add / tags_remove are also read.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const EDITS_SCHEMA = 'tools-edits/1';
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));

/** The edits file, or an empty one. */
export function readEdits(root) {
  const f = join(root, 'library/_build/edits.json');
  if (!existsSync(f)) return { schema: EDITS_SCHEMA, projects: [], galleries: [], records: {}, log: [] };
  const E = readJson(f);
  return { schema: E.schema || EDITS_SCHEMA, projects: E.projects || [], galleries: E.galleries || [], records: E.records || {}, log: E.log || [] };
}

// A collection that is one piece of work names its project. Everything else is Studio unless its sources say otherwise.
const BY_COLLECTION = { massive: 'massive', 'mad-money': 'mad-money', 'desktop-bo': 'desktop-bo', 'mode-mode': 'mode-mode', reliquary: 'reliquary', garden: 'garden', 'printed-matter': 'printed-matter', encyclopedia: 'studio' }; // the Encyclopedia was retired 2026-11-16; what was kept is Studio unless moved
// read from a T&T plate's lifted sources or an entry's text
const BY_SOURCE = [[/\/mindgut\/|\bmindgut\b|\bhelix\b/i, 'mindgut'], [/massive/i, 'massive'], [/desktop[-_ ]?bo\b/i, 'desktop-bo'], [/\/garden\b/i, 'garden'], [/mad[-_ ]?money/i, 'mad-money']];

function kind3(r) {
  if (r.kind === 'template') return 'template';
  if (r.kind === 'technique' || r.kind === 'atom' || (r.collection === 'techniques-templates' && r.section === 'techniques')) return 'technique';
  return 'example';
}

/** The folder a record's page lives in, inside this repo ('' when it has none of its own). */
export function folderOf(r) {
  const h = r.href || '';
  if (!h || /^https?:/.test(h)) return '';
  const p = h.replace(/^(\.\.\/)+/, '').replace(/[?#].*$/, '').replace(/index\.html$/, '');
  return p.split('/').filter(Boolean).length >= 2 ? p.replace(/\/?$/, '/') : '';
}

/**
 * records: the public catalog's records. Returns { records, cms } where cms goes into the catalog as `cms`.
 * plates: techniques-templates/_build/plates.json plates (for the sources of T&T plates), optional.
 */
export function applyEdits(records, root, plates = []) {
  const E = readEdits(root);
  const PROJ = new Map(E.projects.map((p) => [p.id, p]));
  const byId = new Map(records.map((r) => [r.id, r]));
  const plateBy = new Map(plates.map((p) => [p.slug, p]));
  const fromSources = (text) => { for (const [re, id] of BY_SOURCE) if (re.test(text)) return id; return ''; };

  for (const r of records) {
    let project = BY_COLLECTION[r.collection] || '';
    if (!project && r.collection === 'techniques-templates' && r.section !== 'techniques') {
      const slug = r.id.replace(/^tt:/, ''), p = plateBy.get(slug);
      const panelCols = p ? (p.panels || []).map((id) => byId.get(id)?.collection).filter(Boolean) : [];
      project = panelCols.map((c) => BY_COLLECTION[c]).find((x) => x && x !== 'encyclopedia') || fromSources(JSON.stringify(p || {}) + ' ' + r.title + ' ' + (r.sub || ''));
    }
    if (!project && r.work && byId.get(r.work)) project = BY_COLLECTION[byId.get(r.work).collection] || '';
    r.project = project && PROJ.has(project) ? project : 'studio';
    r.kind3 = kind3(r);
  }
  // a part or version follows the work it belongs to
  for (const r of records) if (r.work && byId.get(r.work)) r.project = byId.get(r.work).project;

  const removed = [], archived = [], priv = [];
  for (const [id, ed] of Object.entries(E.records)) {
    const r = byId.get(id); if (!r || !ed) continue;
    if (ed.project && PROJ.has(ed.project)) r.project = ed.project;
    if (ed.kind && ['technique', 'example', 'template'].includes(ed.kind)) r.kind3 = ed.kind;
    if (ed.title) r.title = ed.title;
    if (Array.isArray(ed.tags)) { if (ed.tags.length) r.tags = [...new Set(ed.tags)]; else delete r.tags; }
    else if (ed.tags_add || ed.tags_remove) {
      const t = new Set(r.tags || []); (ed.tags_add || []).forEach((x) => t.add(x)); (ed.tags_remove || []).forEach((x) => t.delete(x));
      if (t.size) r.tags = [...t]; else delete r.tags;
    }
    if (ed.state === 'archived') { r.state = 'archived'; if (ed.at) r.state_at = ed.at; archived.push(id); }
    if (ed.state === 'removed') removed.push(id);
    if (ed.visibility === 'private') { r.visibility = 'private'; priv.push(id); }
  }
  // a whole project can be private: Desktop Bo (Julia, 2026-11-15)
  // unless the record was made public on its own ("visibility": "public")
  for (const r of records) if (PROJ.get(r.project)?.private && r.visibility !== 'private' && E.records[r.id]?.visibility !== 'public') { r.visibility = 'private'; priv.push(r.id); }

  const gone = new Set(removed);
  for (const r of records) if (r.work && gone.has(r.work)) gone.add(r.id); // its parts and versions go with it
  const kept = records.filter((r) => !gone.has(r.id));
  for (const r of kept) {
    for (const k of ['versions', 'parts']) if (r[k]) { r[k] = r[k].filter((x) => !gone.has(x)); if (!r[k].length) delete r[k]; }
    if (r.rel) r.rel = r.rel.filter((x) => !gone.has(x.to));
  }
  const cms = {
    schema: E.schema,
    note: 'From library/_build/edits.json, written by the CMS. Removed records are left out of this catalog; the list below is what the CMS needs to restore them.',
    projects: E.projects,
    galleries: E.galleries, // { id, title, tag?, items?: ['R:<technique>' | record id | call], note?, private? }
    removed: removed.map((id) => { const ed = E.records[id]; return { id, acc: ed.acc || byId.get(id)?.acc || '', call: ed.call || byId.get(id)?.call || '', title: ed.title_was || byId.get(id)?.title || id, project: byId.get(id)?.project || '', path: ed.path || '', at: ed.at || '', archive: ed.archive || '' }; }),
    // call numbers of every record that left the catalog (removed ones and their parts), so links to them can be dropped
    gone_calls: [...gone].map((id) => byId.get(id)?.call).filter(Boolean).sort(),
    counts: { archived: archived.length, removed: removed.length, private: new Set(priv).size },
    edits: E.log.length
  };
  return { records: kept, cms, edits: E };
}

/** T&T entry slug → state, for the pages that read techniques-templates/_shared/entries.js (index, set). */
export function hiddenMap(records, cms) {
  const m = {};
  for (const r of records) if (r.id.startsWith('tt:') && (r.state === 'archived' || r.visibility === 'private')) m[r.id.slice(3)] = r.state === 'archived' ? 'archived' : 'private';
  for (const x of cms.removed) if (x.id.startsWith('tt:')) m[x.id.slice(3)] = 'removed';
  return m;
}
