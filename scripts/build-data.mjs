// node scripts/build-data.mjs
// Rebuilds every generated data file, in the one order that settles: T&T pages, library catalog, registry,
// All-techniques index, gallery, then a library check. GitHub runs this on every push (deploy.yml); sessions run it
// through scripts/publish.mjs. Never run the steps by hand in another order.
import { execSync } from 'node:child_process'; import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const steps = [
  ['techniques-templates', 'node _build/build.mjs'],
  ['.', 'node library/_build/collate.mjs'],
  ['techniques-templates', 'node _build/registry.mjs'],
  ['techniques-templates', 'node _build/reg-index.mjs'],
  ['.', 'node gallery/_build/build.mjs'],
  ['.', 'node library/_build/collate.mjs --check'],
];
for (const [dir, cmd] of steps) {
  process.stdout.write(`build-data · ${dir === '.' ? '' : dir + ' · '}${cmd}\n`);
  try { execSync(cmd, { cwd: path.join(ROOT, dir), stdio: ['ignore', 'ignore', 'inherit'] }); }
  catch (e) { console.error(`build-data · FAILED: ${cmd}`); process.exit(1); }
}
console.log('build-data · done');
