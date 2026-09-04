/* ============================================================================
   static-checks.mjs — the source rules of PLAN §2.6 and the shell's own
   invariants, as assertions over the shipped tree. No browser.

   Run:  node scripts/qa/out/static-checks.mjs [--root <repo>]
   Exit 1 on any violation.
   ============================================================================ */
import { fileURLToPath as __f } from 'node:url';
import { dirname as __d, join as __j } from 'node:path';
const __ROOT = __j(__d(__f(import.meta.url)), '..', '..');
const __OUT = __j(__ROOT, 'scripts', 'qa', 'out');
import { mkdirSync as __mk } from 'node:fs'; __mk(__OUT, { recursive: true });
import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'node:fs';
import { join, relative, basename, dirname } from 'node:path';

const argv = process.argv.slice(2);
const ROOT = argv.includes('--root') ? argv[argv.indexOf('--root') + 1] : __ROOT;
const SHIPPED = ['learn', 'encyclopedia', 'book-of-shaders', 'components'];
const REVIEW_TOOLBOX = join(ROOT, 'learn', 'garden-toolbox.js');
const fails = [];
const notes = [];
let checked = 0;
function fail(rule, file, detail) { fails.push({ rule, file: relative(ROOT, file), detail }); }

function walk(d, out = []) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    if (e.name === '.git' || e.name === 'node_modules') continue;
    const p = join(d, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
const all = SHIPPED.flatMap(s => existsSync(join(ROOT, s)) ? walk(join(ROOT, s)) : []);
const code = all.filter(f => /\.(html|js)$/.test(f));
const htmls = all.filter(f => /\.html$/.test(f));

/* ---- 1. banned transports and same-origin frame reach-in ---------------- */
const BANNED = [
  { rule: 'no fetch(',            re: /\bfetch\s*\(/ },
  { rule: 'no import()',          re: /(^|[^.\w])import\s*\(/ },
  { rule: 'no type="module"',     re: /type\s*=\s*["']module["']/ },
  { rule: 'no CDN <script src=https', re: /<script[^>]+src\s*=\s*["']https?:\/\//i },
  { rule: 'no contentDocument',   re: /\.contentDocument\b/ },
  { rule: 'no contentWindow.document', re: /contentWindow\s*\.\s*document\b/ },
  { rule: 'no srcdoc',            re: /\bsrcdoc\b/ },
  { rule: 'no XHR',               re: /\bXMLHttpRequest\b/ },
  { rule: 'no import/export stmt',re: /^\s*(import\s+[\w{*][^\n]*from\s|export\s+(default|const|function|class|\{))/m }
];
for (const f of code) {
  const src = readFileSync(f, 'utf8');
  // strip block+line comments, HTML comments and <code>/<pre> prose, so a rule
  // DESCRIBED on the colophon page is not read as a violation of itself
  const live = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
                  .replace(/<!--[\s\S]*?-->/g, '')
                  .replace(/<code\b[^>]*>[\s\S]*?<\/code>/gi, '')
                  .replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, '');
  for (const b of BANNED) {
    checked++;
    /* The review toolbox's product is GitHub-backed editorial sync. It is the
       single named network exception; fragments and the archive shell remain
       transport-free and are still checked by the general rule. */
    if (f === REVIEW_TOOLBOX && b.rule === 'no fetch(') continue;
    if (b.re.test(live)) fail(b.rule, f, (live.match(b.re) || [''])[0].trim().slice(0, 80));
  }
}

/* Keep the exception narrower than “this file may fetch anything”. */
if (existsSync(REVIEW_TOOLBOX)) {
  const toolbox = readFileSync(REVIEW_TOOLBOX, 'utf8');
  checked += 3;
  if (!/var REPO = 'jalulia\/tools'/.test(toolbox)) fail('review toolbox repo is fixed', REVIEW_TOOLBOX, 'REPO');
  if (!/BRANCH = 'main'/.test(toolbox)) fail('review toolbox branch is fixed', REVIEW_TOOLBOX, 'BRANCH');
  if (!/PATH = 'garden\/garden\.json'/.test(toolbox)) fail('review toolbox path is fixed', REVIEW_TOOLBOX, 'PATH');
}

/* ---- 2. build-site.mjs's basename filter -------------------------------- */
for (const s of SHIPPED) {
  const dir = join(ROOT, s);
  if (!existsSync(dir)) continue;
  for (const f of walk(dir)) {
    checked++;
    const b = basename(f);
    // a tool ROOT may carry tool.json; nothing below it may.
    if ((b === 'tool.json' || b === 'package.json') && dirname(f) !== dir) fail('no tool.json/package.json below a tool root', f, b);
  }
  for (const f of walk(dir)) {
    const parts = relative(dir, f).split('/');
    if (parts.some(p => p === 'dist' || p === '_site')) fail('no dist/ or _site/ folder inside a tool', f, parts.join('/'));
  }
  checked++;
  if (existsSync(join(dir, 'package.json'))) fail('no root package.json on a static tool', join(dir, 'package.json'), '');
}

/* ---- 3. every fragment links exactly one _styles/*.css ------------------ */
const fragments = htmls.filter(f => basename(f) === 'fragment.html');
for (const f of fragments) {
  checked++;
  const src = readFileSync(f, 'utf8');
  const links = [...src.matchAll(/<link[^>]+href\s*=\s*["']([^"']+\.css)["']/gi)].map(m => m[1]);
  const styles = links.filter(h => /_styles\//.test(h));
  if (styles.length !== 1) fail('fragment links exactly one _styles/*.css', f, `${styles.length}: ${styles.join(', ') || links.join(', ')}`);
  else {
    const abs = join(dirname(f), styles[0]);
    if (!existsSync(abs)) fail('fragment _styles/*.css resolves', f, styles[0]);
  }
}

/* ---- 4. every <iframe> has a title ------------------------------------- */
for (const f of code) {
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(/<iframe\b[^>]*>/gi)) {
    checked++;
    if (!/\btitle\s*=/.test(m[0])) fail('<iframe> has a title', f, m[0].slice(0, 90));
  }
  // iframes built in JS: require a .title = assignment near createElement('iframe')
  if (/createElement\(\s*['"]iframe['"]\s*\)/.test(src)) {
    checked++;
    if (!/\.title\s*=/.test(src)) fail('scripted <iframe> is titled', f, "createElement('iframe') with no .title =");
  }
}

/* ---- 5. forced light: meta + explicit html AND body background --------- */
const pages = htmls.filter(f => /(?:^|\/)(index|fragment)\.html$/.test(f));
for (const f of pages) {
  const src = readFileSync(f, 'utf8');
  const dir = dirname(f);
  // the CSS reachable from this document: its own <style> plus every local <link>
  let css = [...src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]).join('\n');
  for (const m of src.matchAll(/<link[^>]+href\s*=\s*["']([^"']+\.css)["']/gi)) {
    const abs = join(dir, m[1]);
    if (existsSync(abs)) css += '\n' + readFileSync(abs, 'utf8');
  }
  checked += 4;
  if (!/<meta[^>]+name\s*=\s*["']color-scheme["'][^>]*content\s*=\s*["']\s*light\s*["']/i.test(src))
    fail('<meta name=color-scheme content=light>', f, '');
  if (!/color-scheme\s*:\s*light/i.test(css)) fail('color-scheme: light in CSS', f, '');
  const htmlBg = /(^|[\s,}{])html\b[^{}]*\{[^}]*background(-color)?\s*:/is.test(css) ||
                 /html\s*,\s*body[^{}]*\{[^}]*background(-color)?\s*:/is.test(css) ||
                 /:root[^{}]*\{[^}]*background(-color)?\s*:/is.test(css);
  const bodyBg = /(^|[\s,}{])body\b[^{}]*\{[^}]*background(-color)?\s*:/is.test(css) ||
                 /html\s*,\s*body[^{}]*\{[^}]*background(-color)?\s*:/is.test(css);
  if (!htmlBg) fail('explicit background on html', f, '');
  if (!bodyBg) fail('explicit background on body', f, '');
}

/* ---- 6. no Google Fonts from the chrome -------------------------------- */
// The chrome = learn/ + each tool's index.html. Fragments' own style files may.
const chrome = all.filter(f => f.startsWith(join(ROOT, 'learn')) || /\/(book-of-shaders|components)\/index\.html$/.test(f));
for (const f of chrome) {
  if (!/\.(html|js|css)$/.test(f)) continue;
  checked++;
  const src = readFileSync(f, 'utf8');
  if (/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(src)) fail('no Google Fonts in the chrome', f, (src.match(/fonts\.(googleapis|gstatic)\.com[^"')\s]*/) || [''])[0]);
}
// informational: which fragment styles do reach for Google
for (const f of all.filter(f => /_styles\/.*\.css$/.test(f))) {
  const src = readFileSync(f, 'utf8');
  if (/fonts\.googleapis\.com/.test(src)) notes.push(`${relative(ROOT, f)} loads Google Fonts (allowed: fragment style file)`);
}
// the ONE named exception, checked so it cannot be forgotten: the monorepo
// landing template is outside this PR's fence (the face there is Julia's
// choice) but it is still a blocking third-party request on every load of the
// deployed site, and it logs one ERR_CONNECTION_RESET in this sandbox.
{
  const t = join(ROOT, 'scripts', 'index-template.html');
  if (existsSync(t) && /fonts\.googleapis\.com/.test(readFileSync(t, 'utf8'))) {
    notes.push('scripts/index-template.html loads Inter Tight from Google Fonts — KNOWN, out of this PR\'s fence, one blocking request per landing-page load. Self-hosting it is the same move learn/fonts/ already makes.');
  }
}

const out = { generated: new Date().toISOString(), root: ROOT, filesScanned: all.length, assertions: checked, failures: fails, notes };
writeFileSync(__j(__OUT,'static-checks.json'), JSON.stringify(out, null, 1));
console.log(`static-checks: ${all.length} files, ${checked} assertions, ${fails.length} failures`);
for (const f of fails) console.log(`  FAIL  ${f.rule}\n        ${f.file}  ${f.detail}`);
for (const n of notes) console.log(`  note  ${n}`);
process.exit(fails.length ? 1 : 0);
