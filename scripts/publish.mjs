// node scripts/publish.mjs -m "commit message"
// The one way any Claude session (or person) publishes to main. It:
//  1. commits what is in the working tree with your message;
//  2. fetches main and rebases onto it. Conflicts in generated files are settled by taking main's copy and rebuilding;
//     a conflict in any other file stops here, with nothing pushed;
//  3. rebuilds every generated file in the one settled order (scripts/build-data.mjs);
//  4. runs the guard (scripts/guard.mjs): nothing lost, nothing new without dials;
//  5. re-measures changed or new pages into library/census.json;
//  6. refuses if any changed file holds conflict markers;
//  7. commits the rebuilt files and pushes; if main moved meanwhile, goes round again (twice at most).
import { execSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path';
import { ROOT, listPages, fingerprint, readCensus } from './census-lib.mjs';

const args = process.argv.slice(2); const mi = args.indexOf('-m'); const MSG = mi >= 0 ? args[mi + 1] : null;
if (!MSG) { console.error('usage: node scripts/publish.mjs -m "what changed"'); process.exit(2); }
const sh = (c, o = {}) => execSync(c, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...o }).trim();
const run = (c) => execSync(c, { cwd: ROOT, stdio: 'inherit' });
const trailers = MSG.split('\n').filter(l => /^(Co-Authored-By|Claude-Session):/i.test(l)).join('\n');
const GITDIR = sh('git rev-parse --absolute-git-dir'); // a worktree's .git is a file, so ask git
const commit = (m) => { const f = path.join(GITDIR, 'PUBLISH_MSG'); fs.writeFileSync(f, m); sh(`git commit -q -F "${f}"`); };

const GENERATED = [
  /^library\/(catalog\.js|catalog\.json|fixity\.json|index\.html|llms\.txt|accessions\.json|census\.json|thumbs\/index\.json)$/,
  /^library\/_build\/editions\.json$/,
  /^techniques-templates\/(registry\.json|techniques\.json|atoms\.json)$/,
  /^techniques-templates\/_shared\/(reg-index\.js|vocab\.js)$/,
  /^techniques-templates\/(techniques|plates|applications|templates)\/[^/]+\/index\.html$/,
  /^gallery\/index\.html$/,
];
const generated = (f) => GENERATED.some(r => r.test(f));

if (fs.existsSync(path.join(GITDIR, 'rebase-merge')) || fs.existsSync(path.join(GITDIR, 'MERGE_HEAD'))) { console.error('publish · a rebase or merge is in progress; finish or abort it first'); process.exit(1); }
if (sh('git status --porcelain')) { sh('git add -A'); commit(MSG); console.log('publish · committed your changes'); }

for (let round = 1; round <= 3; round++) {
  sh('git fetch -q origin main');
  if (sh('git rev-list --count HEAD..origin/main') !== '0') {
    try { sh('git rebase -q origin/main'); }
    catch {
      for (;;) {
        const conflicted = sh('git diff --name-only --diff-filter=U').split('\n').filter(Boolean);
        if (!conflicted.length) break;
        const hard = conflicted.filter(f => !generated(f));
        if (hard.length) { sh('git rebase --abort'); console.error('publish · STOPPED: these files conflict with main and are not generated; settle them by hand:\n- ' + hard.join('\n- ')); process.exit(1); }
        for (const f of conflicted) sh(`git checkout --ours -- "${f}" && git add -- "${f}"`);
        try { sh('git -c core.editor=true rebase --continue'); break; } catch { /* next commit in the rebase may conflict too */ }
      }
    }
  }
  run('node scripts/build-data.mjs');
  try { run('node scripts/guard.mjs'); }
  catch (e) { if (e.status === 3) console.error('publish · install Playwright (npm i --no-save playwright) to measure new or changed pages'); console.error('publish · nothing was pushed'); process.exit(1); }
  const C = readCensus(); const census = new Map((C ? C.pages : []).map(r => [r.path, r]));
  const todo = listPages().filter(p => { const r = census.get(p.path); return !r || r.fingerprint !== fingerprint(p.path); }).map(p => p.path);
  if (todo.length) run(`node scripts/census.mjs ${todo.map(t => `"${t}"`).join(' ')}`);
  const changed = sh('git diff --name-only origin/main').split('\n').concat(sh('git ls-files -o --exclude-standard').split('\n')).filter(Boolean);
  const marked = changed.filter(f => { try { return /^(<{7}|>{7}|={7})( |$)/m.test(fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch { return false; } });
  if (marked.length) { console.error('publish · STOPPED: conflict markers in\n- ' + marked.join('\n- ')); process.exit(1); }
  // a rebuild that only moved build stamps is not a change: GitHub rebuilds on deploy anyway
  const STAMP = [[/([?&]v=)\d{8,14}/g, '$1'], [/"(source_commit|library_commit)":\s*"[0-9a-f]{7,40}"/g, '"$1":""'], [/Built \d{4}-\d{2}-\d{2} from [0-9a-f]{7,40}/g, 'Built'], [/"generated":\s*"[^"]*"/g, '"generated":""']];
  const norm = (s) => STAMP.reduce((a, [r, w]) => a.replace(r, w), s);
  for (const f of sh('git diff --name-only').split('\n').filter(Boolean)) {
    if (!generated(f)) continue; let before; try { before = sh(`git show HEAD:"${f}"`, { maxBuffer: 1 << 28 }); } catch { continue; }
    if (norm(before) === norm(fs.readFileSync(path.join(ROOT, f), 'utf8'))) sh(`git checkout -- "${f}"`);
  }
  if (sh('git status --porcelain')) { sh('git add -A'); commit('Rebuild generated files and census' + (trailers ? '\n\n' + trailers : '')); }
  try { sh('git -c push.negotiate=true push -q origin HEAD:main'); console.log('publish · pushed ' + sh('git log --oneline -1')); process.exit(0); }
  catch { console.log(`publish · main moved while publishing; round ${round + 1}`); }
}
console.error('publish · gave up after 3 rounds; nothing more was pushed'); process.exit(1);
