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
const GRABBER = readFileSync(join(__dirname, 'grabber.js'), 'utf8');

// Tools live directly at the repo root as subfolders (e.g. meshviz/, halftone/).
// We skip well-known non-tool dirs.
const SKIP_DIRS = new Set(['.git', '.github', 'node_modules', 'scripts', '_site', 'dist', '.vite', '_archive', 'claude']);

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

// Static tools: a folder with index.html and no build step. Copy as-is.
function copyStaticTool(name) {
  const cwd = join(ROOT, name);
  console.log(`\n── copying static ${name} ──`);
  const out = join(SITE_DIR, name);
  cpSync(cwd, out, {
    recursive: true,
    filter: (src) => {
      const base = src.split('/').pop();
      return !['tool.json', 'package.json', 'node_modules', '.git', 'dist', '_site'].includes(base);
    },
  });
}

// Inject a global site nav onto every deployed tool page: an always-visible bar
// (all-tools / gallery / current page) plus an "index" menu that jumps straight
// to any tool, grouped by section. Self-contained inline styles + script;
// forced-light. Not applied to the landing page itself.
function injectNav(name, meta, allTools) {
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

  const galleryChip = onGallery ? '' : '<a class="tn-lnk" href="../gallery/">gallery</a>';
  const nav = `
<nav id="tn" aria-label="Site navigation">
  <a class="tn-lnk tn-home" href="../" title="All tools">◂ tools</a>
  ${galleryChip}
  <button id="tn-btn" type="button" aria-expanded="false" aria-controls="tn-menu">index ▾</button>
  <span class="tn-cur" title="${curLabel}">${curLabel}</span>
</nav>
<div id="tn-menu" hidden role="menu" aria-label="Jump to tool">
  <div class="tn-mhdr">Jump to</div>
  ${items}
  <div class="tn-div"></div>
  <a class="tn-all" href="../">All tools ▸</a>
</div>
<style>
#tn{position:fixed;left:16px;bottom:16px;z-index:2147483000;display:flex;align-items:stretch;font:600 12px/1.2 -apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;background:#fff;color:#111;border:1px solid #cfcfcf;box-shadow:0 3px 14px rgba(0,0,0,.14);border-radius:3px;overflow:hidden}
#tn a,#tn button{padding:9px 12px;color:#111;text-decoration:none;background:none;border:0;border-right:1px solid #ededed;font:inherit;cursor:pointer;letter-spacing:.02em}
#tn button:hover,#tn a:hover{background:#f4f4f2}
#tn .tn-cur{padding:9px 12px;color:#8a8a8a;max-width:210px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border-right:0}
#tn-menu{position:fixed;left:16px;bottom:58px;z-index:2147483000;min-width:250px;max-width:300px;background:#fff;color:#111;border:1px solid #cfcfcf;box-shadow:0 8px 30px rgba(0,0,0,.20);border-radius:4px;padding:6px;font:500 13px/1.3 -apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif}
#tn-menu .tn-mhdr,#tn-menu .tn-sec{font:700 9.5px/1 'Space Mono',ui-monospace,monospace;letter-spacing:.16em;color:#9a9a9a;text-transform:uppercase;padding:9px 10px 5px}
#tn-menu .tn-sec{padding-top:11px}
#tn-menu a{display:flex;justify-content:space-between;gap:10px;padding:8px 10px;color:#141414;text-decoration:none;border-radius:3px}
#tn-menu a:hover{background:#f2f2f0}
#tn-menu a[aria-current="page"]{background:#111;color:#fff}
#tn-menu .tn-div{height:1px;background:#ececec;margin:8px 6px}
#tn-menu .tn-all{color:#666;font-size:12px}
@media (max-width:520px){#tn .tn-cur{display:none}}
</style>
<script>(function(){var b=document.getElementById('tn-btn'),m=document.getElementById('tn-menu');if(!b||!m)return;function set(o){m.hidden=!o;b.setAttribute('aria-expanded',o?'true':'false');}b.addEventListener('click',function(e){e.stopPropagation();set(m.hidden);});document.addEventListener('click',function(e){if(!m.hidden&&!m.contains(e.target)&&e.target!==b)set(false);});document.addEventListener('keydown',function(e){if(e.key==='Escape')set(false);});})();</script>
<script>${GRABBER}</script>`;
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
  /* Nav review §5g · retired the injected foot-pill. The mast tool-switch
     was also lying (nav review §5a). Anyone landing on a tool page reaches
     the tools index via the browser Back button or by editing the URL to
     "/", which is where every tool card is listed in one clean place. */
  // for (const t of tools) injectNav(t.name, t.meta, tools);
  // Prevent Jekyll processing.
  writeFileSync(join(SITE_DIR, '.nojekyll'), '');
  console.log(`\n✔ site assembled at ${SITE_DIR}`);
}

main();
