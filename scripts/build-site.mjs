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

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TOOLS_DIR = join(ROOT, 'tools');
const SITE_DIR = join(ROOT, '_site');
const TEMPLATE = join(__dirname, 'index-template.html');

function sh(cmd, opts = {}) {
  return execSync(cmd, { stdio: 'inherit', ...opts });
}
function shOut(cmd, opts = {}) {
  return execSync(cmd, { encoding: 'utf8', ...opts }).trim();
}

function discoverTools() {
  if (!existsSync(TOOLS_DIR)) return [];
  return readdirSync(TOOLS_DIR)
    .filter((name) => {
      const p = join(TOOLS_DIR, name);
      return statSync(p).isDirectory() && existsSync(join(p, 'package.json'));
    })
    .sort();
}

function readMeta(name) {
  const metaPath = join(TOOLS_DIR, name, 'tool.json');
  let meta = { title: name, description: '', status: 'active', hidden: false };
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
    const date = shOut(`git log -1 --format=%cs -- tools/${name}`, { cwd: ROOT });
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
  const cwd = join(TOOLS_DIR, name);
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

function renderIndex(tools) {
  const template = readFileSync(TEMPLATE, 'utf8');
  // Sort: most recently touched first.
  const visible = tools.filter((t) => !t.meta.hidden);
  visible.sort((a, b) => (b.lastTouched || '').localeCompare(a.lastTouched || ''));

  const rows = visible
    .map((t) => {
      const title = escapeHtml(t.meta.title || t.name);
      const desc = t.meta.description ? `<span class="desc">${escapeHtml(t.meta.description)}</span>` : '';
      const date = formatDate(t.lastTouched);
      // Status is intentionally embedded as a data attribute only — not rendered yet.
      return `      <li data-status="${escapeHtml(t.meta.status || 'active')}">
        <a href="./${encodeURIComponent(t.name)}/">
          <span class="name">${title}</span>
          ${desc}
          <span class="date">${date}</span>
        </a>
      </li>`;
    })
    .join('\n');

  const html = template.replace('<!-- TOOL_ROWS -->', rows);
  writeFileSync(join(SITE_DIR, 'index.html'), html);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function main() {
  rmSync(SITE_DIR, { recursive: true, force: true });
  mkdirSync(SITE_DIR, { recursive: true });

  const names = discoverTools();
  console.log(`Discovered tools: ${names.join(', ') || '(none)'}`);

  const tools = [];
  for (const name of names) {
    buildTool(name);
    tools.push({ name, meta: readMeta(name), lastTouched: lastTouched(name) });
  }

  renderIndex(tools);
  // Prevent Jekyll processing.
  writeFileSync(join(SITE_DIR, '.nojekyll'), '');
  console.log(`\n✔ site assembled at ${SITE_DIR}`);
}

main();
