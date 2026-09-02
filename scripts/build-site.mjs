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
const SKIP_DIRS = new Set(['.git', '.github', 'node_modules', 'scripts', '_site', 'dist', '.vite']);

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
  // Prevent Jekyll processing.
  writeFileSync(join(SITE_DIR, '.nojekyll'), '');
  console.log(`\n✔ site assembled at ${SITE_DIR}`);
}

main();
