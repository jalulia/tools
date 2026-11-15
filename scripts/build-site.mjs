#!/usr/bin/env node
// Discovers every tool in tools/*, builds each, assembles the deploy folder,
// and renders the root index.html from the template.
//
// Conventions:
//   tools/<name>/package.json    required (signals "this is a tool")
//   tools/<name>/tool.json       optional metadata: { title, description, status, hidden }
//   tools/<name>/vite.config.*   should set base: '/tools/<name>/' for asset paths
//
// Output:
//   _site/                       Pages artifact root
//   _site/index.html             generated landing page
//   _site/<name>/                each built tool

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, cpSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyManifests } from './lib/manifests.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SITE_DIR = join(ROOT, '_site');
const TEMPLATE = join(__dirname, 'index-template.html');

// Tools live directly at the repo root as subfolders (e.g. meshviz/, halftone/).
// We skip well-known non-tool dirs.
const SKIP_DIRS = new Set(['.git', '.github', 'node_modules', 'scripts', 'sources', 'docs', '_site', 'dist', '.vite']);

function sh(cmd, opts = {}) {
  return execSync(cmd, { stdio: 'inherit', ...opts });
}
function shOut(cmd, opts = {}) {
  return execSync(cmd, { encoding: 'utf8', ...opts }).trim();
}

function discoverTools() {
  return readdirSync(ROOT)
    .filter((name) => {
      if (SKIP_DIRS.has(name) || name.startsWith('.')) return false;
      const p = join(ROOT, name);
      return statSync(p).isDirectory() && (existsSync(join(p, 'package.json')) || existsSync(join(p, 'index.html')));
    })
    .sort();
}

function readMeta(name) {
  const metaPath = join(ROOT, name, 'tool.json');
  let meta = { title: name, description: '', status: 'active', hidden: false, section: null, skill: null, skillLabel: 'skill' };
  if (existsSync(metaPath)) {
    try {
      meta = { ...meta, ...JSON.parse(readFileSync(metaPath, 'utf8')) };
    } catch (e) {
      console.warn(`[warn] bad tool.json for ${name}: ${e.message}`);
    }
  }
  return meta;
}

function lastTouched(name) {
  // ISO date of the most recent commit that touched this tool's folder.
  try {
    let date = shOut(`git log -1 --format=%cs -- ${name}`, { cwd: ROOT });
    if (!date) date = shOut(`git log -1 --format=%cs -- tools/${name}`, { cwd: ROOT });
    return date || null;
  } catch {
    return null;
  }
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00Z');
  const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }).toLowerCase();
  const day = d.getUTCDate();
  const year = d.getUTCFullYear();
  const thisYear = new Date().getUTCFullYear();
  return year === thisYear ? `${month} ${day}` : `${month} ${day} ${year}`;
}

function buildTool(name) {
  const cwd = join(ROOT, name);
  console.log(`\n── building ${name} ──`);
  // Prefer npm ci for reproducibility; fall back to install.
  if (existsSync(join(cwd, 'package-lock.json'))) {
    sh('npm ci', { cwd });
  } else {
    sh('npm install', { cwd });
  }
  sh('npm run build', { cwd });
  const dist = join(cwd, 'dist');
  if (!existsSync(dist)) {
    throw new Error(`${name}: expected dist/ after build, not found`);
  }
  const out = join(SITE_DIR, name);
  cpSync(dist, out, { recursive: true });
}

// Records removed in the CMS (library/_build/edits.json, state "removed") stay in the repo but are never deployed:
// their page folder and their library thumbnails are skipped. A copy is in the private repo jalulia/tools-archive.
const REMOVED = (() => {
  const f = join(ROOT, 'library/_build/edits.json'); if (!existsSync(f)) return { paths: [], accs: [] };
  const E = JSON.parse(readFileSync(f, 'utf8')), rs = Object.values(E.records || {}).filter((r) => r && r.state === 'removed');
  return { paths: rs.map((r) => r.path).filter((p) => p && p.split('/').filter(Boolean).length >= 2).map((p) => p.replace(/\/?$/, '/')), accs: rs.map((r) => r.acc).filter(Boolean) };
})();
function removedByCms(src) {
  const rel = src.slice(ROOT.length + 1) + '/';
  if (REMOVED.paths.some((p) => rel.startsWith(p))) return true;
  const m = /^library\/thumbs\/(\d{4}\.\d{4})/.exec(rel); return !!(m && REMOVED.accs.includes(m[1]));
}

// Static tools: a folder with index.html and no build step. Copy as-is.
function copyStaticTool(name) {
  const cwd = join(ROOT, name);
  console.log(`\n── copying static ${name} ──`);
  const out = join(SITE_DIR, name);
  cpSync(cwd, out, {
    recursive: true,
    filter: (src) => {
      const base = src.split('/').pop();
      // a folder holding a .private marker stays in the repo but is never deployed
      if (existsSync(join(src, '.private'))) { console.log(`   private, not deployed: ${src.slice(ROOT.length + 1)}`); return false; }
      if (removedByCms(src)) { console.log(`   removed in the CMS, not deployed: ${src.slice(ROOT.length + 1)}`); return false; }
      return !['tool.json', 'package.json', 'node_modules', '.git', 'dist', '_site'].includes(base);
    },
  });
}

// Inject a global site nav onto every deployed tool page: an always-visible bar
// (all-tools / gallery / current page) plus an "index" menu that jumps straight
// to any tool, grouped by section. Self-contained inline styles + script;
// forced-light. Not applied to the landing page itself.
function injectNav(name, meta, allTools) {
  if (meta.standalone) return; // Preserve standalone pages without cross-site navigation.
  const file = join(SITE_DIR, name, 'index.html');
  if (!existsSync(file)) return;
  const curLabel = escapeHtml(meta.title || name);
  const onGallery = name === 'gallery';

  // Jump menu = every visible tool, grouped by section (same order as the index).
  const SEC_ORDER = ['', 'design systems', 'gallery', 'learn'];
  const vis = (allTools || []).filter((t) => !t.meta.hidden);
  const groups = new Map();
  for (const t of vis) {
    const k = (t.meta.section || '').trim();
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(t);
  }
  const keys = [...groups.keys()].sort((a, b) => {
    const ia = SEC_ORDER.indexOf(a), ib = SEC_ORDER.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  let items = '';
  for (const k of keys) {
    if (k) items += `<div class="tn-sec">${escapeHtml(k)}</div>`;
    for (const t of groups.get(k)) {
      const cur = t.name === name ? ' aria-current="page"' : '';
      items += `<a href="../${encodeURIComponent(t.name)}/"${cur}>${escapeHtml(t.meta.title || t.name)}</a>`;
    }
  }

  // One small mark in the corner; hover or tap opens a start-menu list of the site (Julia, 2026-11-15).
  // The grab / cue / export bar (scripts/grabber.js) is no longer injected: it was out of date.
  const nav = `
<nav id="tn" aria-label="Site menu">
  <button id="tn-btn" type="button" aria-expanded="false" aria-controls="tn-menu" title="Site menu">ø</button>
  <div id="tn-menu" hidden>
    <div class="tn-band" aria-hidden="true">jalulia/tools</div>
    <div class="tn-list">
      <div class="tn-sec">Here: ${curLabel}</div>
      <a href="../library/"${name === 'library' ? ' aria-current="page"' : ''}>Library</a>
      <a href="../gallery/"${onGallery ? ' aria-current="page"' : ''}>Gallery</a>
      <a href="../">All tools</a>
      <div class="tn-div"></div>
      <div class="tn-scroll">${items}</div>
    </div>
  </div>
</nav>
<style>
#tn{position:fixed;left:10px;bottom:10px;z-index:2147483000;font:500 13px/1.3 'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif}
#tn-btn{width:28px;height:28px;display:grid;place-items:center;padding:0;border:1px solid #101014;background:#fff;color:#101014;font:800 15px/1 'Archivo',Helvetica,Arial,sans-serif;cursor:pointer}
#tn-btn:hover,#tn-btn[aria-expanded="true"]{background:#101014;color:#fff}
#tn-menu{position:absolute;left:0;bottom:34px;display:flex;min-width:240px;max-width:300px;background:#fff;color:#101014;border:1px solid #101014;box-shadow:4px 4px 0 rgba(16,16,20,.12)}
#tn-menu[hidden]{display:none}
#tn-menu .tn-band{writing-mode:vertical-rl;transform:rotate(180deg);background:#101014;color:#fff;padding:10px 5px;font:500 9.5px/1 'JetBrains Mono',ui-monospace,monospace;letter-spacing:.2em;text-transform:uppercase}
#tn-menu .tn-list{flex:1;min-width:0;padding:4px 0}
#tn-menu .tn-scroll{max-height:min(46vh,380px);overflow:auto}
#tn-menu .tn-sec{font:500 9.5px/1 'JetBrains Mono',ui-monospace,monospace;letter-spacing:.14em;color:#8a8a8e;text-transform:uppercase;padding:9px 12px 5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#tn-menu a{display:block;padding:7px 12px;color:#101014;text-decoration:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#tn-menu a:hover,#tn-menu a:focus-visible{background:#101014;color:#fff;outline:0}
#tn-menu a[aria-current="page"]{box-shadow:inset 3px 0 0 #101014;font-weight:600}
#tn-menu .tn-div{height:1px;background:#e2e2e4;margin:4px 0}
body.editing #tn{display:none}
@media print{#tn{display:none}}
</style>
<script>(function(){var n=document.getElementById('tn'),b=document.getElementById('tn-btn'),m=document.getElementById('tn-menu'),t;if(!n||!b||!m)return;
function set(o){clearTimeout(t);m.hidden=!o;b.setAttribute('aria-expanded',o?'true':'false');}
var hover=window.matchMedia&&matchMedia('(hover:hover)').matches;
if(hover){n.addEventListener('mouseenter',function(){set(true);});n.addEventListener('mouseleave',function(){t=setTimeout(function(){set(false);},260);});}
b.addEventListener('click',function(e){e.stopPropagation();set(hover?true:m.hidden);});
document.addEventListener('click',function(e){if(!m.hidden&&!n.contains(e.target))set(false);});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!m.hidden){set(false);b.focus();}});})();</script>`;
  let html = readFileSync(file, 'utf8');
  html = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, nav + '\n</body>') : html + nav;
  writeFileSync(file, html);
}

const DL_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<path d="M12 3v12"/><path d="M8 11l4 4 4-4"/><path d="M4 20h16"/></svg>';

function renderIndex(tools) {
  const template = readFileSync(TEMPLATE, 'utf8');
  const visible = tools.filter((t) => !t.meta.hidden);

  // Group by section. Empty/missing section = ungrouped (rendered first, no header).
  const groups = new Map();
  for (const t of visible) {
    const key = (t.meta.section || '').trim();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(t);
  }
  // Most-recently-touched first within each group.
  for (const arr of groups.values()) {
    arr.sort((a, b) => (b.lastTouched || '').localeCompare(a.lastTouched || ''));
  }
  // Ungrouped pinned first; 'gallery' pinned last; the rest ordered by their
  // most recent tool. Gallery is a standing showcase, not a working tool, so it
  // sits at the bottom of the page regardless of how recently a piece landed.
  const keys = [...groups.keys()].sort((a, b) => {
    if (a === '') return -1;
    if (b === '') return 1;
    if (a === 'gallery') return 1;
    if (b === 'gallery') return -1;
    return (groups.get(b)[0]?.lastTouched || '').localeCompare(groups.get(a)[0]?.lastTouched || '');
  });

  const blocks = [];
  for (const key of keys) {
    if (key) {
      blocks.push(
        `      <li class="sec-row"><div class="sec-inner"><span class="sec-label">${escapeHtml(key)}</span><span></span></div></li>`
      );
    }
    groups.get(key).forEach((t, i) => {
      const title = escapeHtml(t.meta.title || t.name);
      const desc = t.meta.description ? `<span class="desc">${escapeHtml(t.meta.description)}</span>` : '';
      const date = formatDate(t.lastTouched);
      const index = String(i + 1).padStart(2, '0');
      const skillHref = t.meta.skill
        ? `./${encodeURIComponent(t.name)}/${encodeURIComponent(t.meta.skill)}`
        : null;
      const skill = skillHref
        ? `<a class="skill-dl" href="${skillHref}" download title="Download ${escapeHtml(t.meta.skillLabel || 'skill')} — ${title}" aria-label="Download ${escapeHtml(t.meta.skillLabel || 'skill')} for ${title}">${DL_ICON}</a>`
        : '';
      blocks.push(`      <li data-status="${escapeHtml(t.meta.status || 'active')}">
        <a class="tool-link" href="./${encodeURIComponent(t.name)}/">
          <span class="tool-index">${index}</span>
          <span class="tool-body">
            <span class="name">${title}</span>
            ${desc}
          </span>
          <span class="date">${date}</span>
        </a>${skill}
      </li>`);
    });
  }

  const html = template.replace('<!-- TOOL_ROWS -->', blocks.join('\n'));
  writeFileSync(join(SITE_DIR, 'index.html'), html);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

// Verify every learn/-shell manifest before anything is copied. It generates
// nothing — the deploy stays a folder copy — but it fails the build on a schema
// error, a missing folder or declared file, a folder that is on disk and absent
// from the manifest, an unknown section or style, an unresolvable `related`
// link, a duplicate or mismatched id, a count stated anywhere that does not
// derive from entries, or an entry presented as canonical work whose critique
// block does not state its read, its coupling and its pass order.
//
// This is the layer that would have caught the drift that exists today: 27 lens
// sections against 26 gallery cards, and a hero, a footer and a tool.json
// giving three different counts.
function verify(names) {
  const schemaFile = join(ROOT, 'learn', 'manifest.schema.json');
  if (!existsSync(schemaFile)) return;            // no shell in this checkout yet
  console.log('\n── verifying manifests ──');
  const problems = verifyManifests(ROOT, { toolDirs: names, schemaFile });
  if (problems.length) {
    console.error(`\n✘ ${problems.length} manifest problem(s):`);
    for (const p of problems) console.error('  · ' + p);
    throw new Error('manifest verification failed');
  }
  console.log('  all manifests verified');
}

function main() {
  rmSync(SITE_DIR, { recursive: true, force: true });
  mkdirSync(SITE_DIR, { recursive: true });

  const names = discoverTools();
  console.log(`Discovered tools: ${names.join(', ') || '(none)'}`);
  verify(names);

  const tools = [];
  for (const name of names) {
    const isStatic = !existsSync(join(ROOT, name, 'package.json'));
    if (isStatic) copyStaticTool(name);
    else buildTool(name);
    tools.push({ name, meta: readMeta(name), lastTouched: lastTouched(name) });
  }

  renderIndex(tools);
  // Global cross-site nav on every tool page (not the landing).
  for (const t of tools) injectNav(t.name, t.meta, tools);
  // Prevent Jekyll processing.
  writeFileSync(join(SITE_DIR, '.nojekyll'), '');
  console.log(`\n✔ site assembled at ${SITE_DIR}`);
}

main();
