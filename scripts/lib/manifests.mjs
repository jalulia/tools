// Loading and verifying the learn/ shell's manifests, for build-site.mjs and
// index-tools.mjs.
//
// A manifest is a classic browser script that calls Shell.registerManifest();
// an entry is a classic script that calls Shell.registerEntry(). Neither is
// JSON and neither can be require()d, so both are run in a `vm` sandbox whose
// only global is a stub Shell that collects the objects. Nothing is generated
// and nothing is written: this is a check, so the deploy stays a folder copy.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative, basename } from 'node:path';
import vm from 'node:vm';
import { validate } from './schema.mjs';

/* --------------------------------------------------------------- loading */

export function runInSandbox(file, shell) {
  const code = readFileSync(file, 'utf8');
  const sandbox = {
    Shell: shell,
    console: { log() {}, warn() {}, error() {} }
  };
  sandbox.window = sandbox;
  vm.runInNewContext(code, vm.createContext(sandbox), { filename: file, timeout: 5000 });
}

/** Load one manifest.js plus every entry.js it names. */
export function loadManifest(manifestFile) {
  const dir = dirname(manifestFile);
  let manifest = null;
  const registered = new Map();
  const shell = {
    registerManifest(m) { manifest = m; },
    registerEntry(e) { registered.set(e && e.id, e); },
    registerAdapter() {}
  };
  runInSandbox(manifestFile, shell);
  if (!manifest) throw new Error(`${manifestFile}: no Shell.registerManifest() call`);

  const missingScripts = [];
  const roster = (manifest.entries || []).map((item) => {
    const inline = typeof item === 'string' ? { id: item } : { ...item };
    const path = inline.path || `content/${inline.id}/`;
    const file = join(dir, path, inline.entry || 'entry.js');
    if (typeof item === 'string' || existsSync(file)) {
      if (!existsSync(file)) {
        missingScripts.push(relative(dir, file));
        return { ...inline, path, __noScript: true };
      }
      runInSandbox(file, shell);
      const reg = registered.get(inline.id);
      return { ...inline, ...(reg || {}), path: reg?.path || path, __file: file };
    }
    return { ...inline, path };
  });

  return { manifest, dir, entries: roster, missingScripts };
}

/* ------------------------------------------------------------- verifying */

const NOUNS = /\b(\d{1,4})\s+(chapters?|lenses|lens|entries|entry|examples?|styles?)\b/gi;

/**
 * Verify every manifest under `root`. Returns an array of human-readable
 * problems; an empty array means the deploy may proceed.
 */
export function verifyManifests(root, { toolDirs, schemaFile, quiet = false } = {}) {
  const problems = [];
  const schema = JSON.parse(readFileSync(schemaFile ?? join(root, 'learn', 'manifest.schema.json'), 'utf8'));
  const files = toolDirs
    ? toolDirs.flatMap((d) => findManifests(join(root, d)))
    : findManifests(root);

  // Every manifest is LOADED, even when only one tool is being VERIFIED, so a
  // cross-tool `related` link still has something to resolve against.
  // `index-tools.mjs --tool components` narrows the check to one tool, and
  // before this it also narrowed the resolution table — which turned eleven
  // correct links to the Book of Shaders into eleven reported failures.
  const loaded = new Map();
  const context = new Map();
  for (const file of findManifests(root)) {
    try {
      const m = loadManifest(file);
      context.set(file, m);
      if (files.includes(file)) loaded.set(file, m);
    } catch (e) {
      if (files.includes(file)) problems.push(`${relative(root, file)}: ${e.message}`);
    }
  }

  for (const [file, m] of loaded) {
    const where = relative(root, file);
    const say = (msg) => problems.push(`${where}: ${msg}`);
    // A manifest that sits at the top of a deployed tool must be named after
    // its folder — that is the id every cross-tool `related` link uses. A
    // manifest nested deeper is a fixture and is exempt.
    const rel = relative(root, dirname(file));
    if (!rel.includes('/') && m.manifest.id !== rel) {
      say(`manifest id "${m.manifest.id}" must equal the folder name "${rel}"`);
    }
    verifyOne(m, schema, say, context, root);
    if (!quiet) {
      console.log(`  ✔ ${where} — ${m.entries.length} entries, ` +
        `${(m.manifest.sections || []).length} sections, ${(m.manifest.styles || []).length} styles`);
    }
  }
  return problems;
}

function verifyOne({ manifest, dir, entries, missingScripts }, schema, say, loaded, root) {
  /* 1. schema ---------------------------------------------------------- */
  for (const e of validate(schema, manifest)) say(e);

  /* the merged entries too — an entry.js may add fields the manifest never
     saw, and those are exactly the ones nobody has validated before */
  const entrySchema = { $ref: '#/$defs/entry' };
  entries.forEach((e, i) => {
    // An entry whose script is missing has already been reported; validating
    // the empty husk it leaves behind would bury that under required-property
    // noise.
    if (e.__noScript) return;
    const clean = { ...e };
    delete clean.__file;
    for (const err of validate(entrySchema, clean, schema, `entries[${i}]`)) say(err);
  });

  /* 2. every declared script and file exists --------------------------- */
  for (const s of missingScripts) say(`entry script missing: ${s}`);
  for (const e of entries) {
    const base = join(dir, e.path || `content/${e.id}/`);
    if (!existsSync(base)) { say(`entry "${e.id}": folder ${e.path} does not exist`); continue; }
    const files = [];
    if (e.fragment || (e.lane || manifest.stage?.adapter) === 'fragment') {
      files.push(e.fragment || 'fragment.html');
    }
    const thumb = e.thumb && (typeof e.thumb === 'string' ? e.thumb : e.thumb.file);
    if (thumb) files.push(thumb);
    for (const x of e.examples || []) {
      if (x.fragment) files.push(x.fragment);
      // `file` is the file of record, not a runtime dependency, but a manifest
      // that names one and has not got one is still lying.
      if (x.file) files.push(x.file);
    }
    for (const f of files) {
      if (!existsSync(join(base, f))) say(`entry "${e.id}": declared file ${e.path}${f} does not exist`);
    }
  }

  /* 3. every content folder appears in the manifest -------------------- */
  const contentDir = join(dir, 'content');
  if (existsSync(contentDir)) {
    const declared = new Set(entries.map((e) => basename((e.path || '').replace(/\/$/, ''))));
    for (const name of readdirSync(contentDir)) {
      if (name.startsWith('_') || name.startsWith('.')) continue;   // _engines, _styles
      if (!statSync(join(contentDir, name)).isDirectory()) continue;
      if (!declared.has(name)) say(`content/${name}/ is on disk but not in the manifest`);
    }
  }

  /* 4. ids are unique and match their folder --------------------------- */
  const seen = new Set();
  for (const e of entries) {
    if (seen.has(e.id)) say(`duplicate entry id "${e.id}"`);
    seen.add(e.id);
    const folder = basename((e.path || '').replace(/\/$/, ''));
    if (folder && folder !== e.id) say(`entry "${e.id}" lives in content/${folder}/ — id and folder must match`);
  }

  /* 5. sections and styles resolve ------------------------------------- */
  const sections = new Set((manifest.sections || []).map((s) => s.id));
  const styles = new Set((manifest.styles || []).map((s) => s.id));
  for (const e of entries) {
    if (e.section && !sections.has(e.section)) say(`entry "${e.id}": unknown section "${e.section}"`);
    if (e.style && !styles.has(e.style)) say(`entry "${e.id}": unknown style "${e.style}"`);
  }
  for (const s of manifest.styles || []) {
    for (const id of s.entries || []) {
      if (!seen.has(id)) say(`style "${s.id}": lists entry "${id}", which this manifest does not have`);
    }
  }

  /* 6. every related link resolves ------------------------------------- */
  const byTool = new Map();
  for (const m of loaded.values()) byTool.set(m.manifest.id, new Set(m.entries.map((e) => e.id)));
  for (const e of entries) {
    for (const r of e.related || []) {
      const tool = r.tool || manifest.id;
      const target = byTool.get(tool);
      if (!target) { say(`entry "${e.id}": related link points at tool "${tool}", which has no manifest here`); continue; }
      if (!target.has(r.entry)) say(`entry "${e.id}": related link "${tool}/${r.entry}" does not resolve`);
    }
  }

  /* 6b. an authored crop must be a crop the card can show ---------------
     The contact-sheet preview window is one ratio for every card, 232:196.
     thumb.crop cuts [designWidth / scale] wide from row offsetY, and the card
     shows that rectangle. If the rectangle is shorter than the ratio needs —
     a plate under 929 design px tall at scale 1 — the browser trims the sides
     of the composition instead, silently, and what ships is not what was
     authored. It is invisible in the source and total in the output, which is
     the class of defect this function exists for. */
  for (const e of entries) {
    const crop = e.thumb && e.thumb.crop;
    if (!Array.isArray(crop)) continue;
    const dw = (e.frame && e.frame.designWidth) || 1100;
    const ph = (e.frame && e.frame.previewHeight) || 0;
    if (!ph) continue;                       // height: auto — nothing to check against
    const cw = Math.min(dw, Math.round(dw / (crop[0] || 1)));
    const want = Math.round(cw * 196 / 232);
    const have = ph - (crop[1] || 0);
    if ((crop[2] || 0) + cw > dw) {
      say(`entry "${e.id}": thumb.crop offsetX ${crop[2]} + ${cw} runs past the plate's ${dw} px width`);
    }
    if (have < want - 1) {
      const min = (Math.ceil(dw * 196 / 232 / Math.max(1, have) * 100) / 100).toFixed(2);
      say(`entry "${e.id}": thumb.crop ${JSON.stringify(crop)} cuts ${cw}x${have}, ` +
          `but the card is 232:196 and needs ${cw}x${want} — raise the scale to at least ${min} ` +
          `or lower offsetY, or the card trims the sides of the crop`);
    }
  }

  /* 7. the editorial gate ---------------------------------------------
     An entry cannot be presented as canonical work with a critique block that
     does not state its read, its coupling and its pass order. This is the move
     that makes these tools a tool of the practice rather than a tidier docs
     site, and it is enforced here because a gate that does not run is a note. */
  for (const e of entries) {
    if (e.status !== 'canonical' || !e.critique) continue;
    for (const field of ['reads_as', 'coupling', 'pass_order']) {
      if (!e.critique[field]) {
        say(`entry "${e.id}" is canonical and presented as a worked example but its critique block has no ${field}`);
      }
    }
  }

  /* 8. every count on the page derives from entries -------------------- */
  const derived = {
    entries: entries.length, entry: entries.length,
    chapter: entries.length, chapters: entries.length,
    lens: entries.length, lenses: entries.length,
    style: (manifest.styles || []).length, styles: (manifest.styles || []).length,
    example: entries.reduce((n, e) => n + (e.examples || []).length, 0),
    examples: entries.reduce((n, e) => n + (e.examples || []).length, 0)
  };
  for (const f of ['index.html', 'tool.json', 'README.md']) {
    const p = join(dir, f);
    if (!existsSync(p)) continue;
    const text = readFileSync(p, 'utf8');
    for (const hit of text.matchAll(NOUNS)) {
      const n = Number(hit[1]), noun = hit[2].toLowerCase();
      const want = derived[noun];
      if (want === undefined || n === want) continue;
      say(`${f} states "${hit[0]}" but the manifest has ${want} — every count must derive from entries`);
    }
  }
}

/* --------------------------------------------------------------- helpers */

export function findManifests(dir, depth = 0, out = []) {
  if (depth > 4 || !existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (['node_modules', '.git', '_site', 'dist'].includes(name)) continue;
    const p = join(dir, name);
    let st;
    try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) findManifests(p, depth + 1, out);
    else if (name === 'manifest.js') out.push(p);
  }
  return out;
}
