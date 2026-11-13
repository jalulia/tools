# jalulia/tools

Read `docs/AGENTS.md` before changing anything. In short:
- publish only with `node scripts/publish.mjs -m "message"`;
- never hand-edit generated files (GitHub rebuilds them on every deploy);
- nothing new goes on tools without parameters, and nothing in `library/census.json` disappears without a
  quarantine manifest row (the guard blocks the deploy);
- quarantine, never delete.
