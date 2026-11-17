/* GAL-01 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/repos/mir-gallery/index.html:1065-1187 (REFERENCES x119), 1188-1219 (ARTIFACTS x21), 1241 (getArtifactsForRef), 877-880 (search + tag pills + archive), 1059 (sandboxed iframe viewer), 1386/1445/2044 (hash routing), 1220-1233 (localStorage)
   The researcher's grade (A) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'gal-01',
  index: 'GAL-01',
  title: `The living-library shell: tagged reference manifest + artifact manifest with status and back-links`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A · canonical',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/repos/mir-gallery/index.html:1065-1187 (REFERENCES x119), 1188-1219 (ARTIFACTS x21), 1241 (getArtifactsForRef), 877-880 (search + tag pills + archive), 1059 (sandboxed iframe viewer), 1386/1445/2044 (hash routing), 1220-1233 (localStorage)`,
    author: 'Julia Compton',
    note: `The single most important find for the tools overhaul. It is already the thing 05-example-inventory.md section 6 says should be assembled: a manifest with an EDITORIAL STATUS field, a REFERENCES-USED field that resolves both ways (getArtifactsForRef, 1241), search + tag filtering that scales past 100 entries with no build step, and per-example isolation by iframe. It answers the Components audit's 'three hand-maintained indexes that have drifted' directly - here there is one array and every inde`
  },
  thumb: 'thumb.png',
  text: `<p>Two literal arrays are the whole data layer. A reference is {file,name,tags[]}; an artifact is {file,title,desc,tags[],status,date,refs[]} where status is 'wip' or 'draft' (12/9) and refs[] lists the reference images it was built from. One text input filters both by name/tag/description, tag pills filter by tag, an archive toggle hides retired entries, and each artifact opens in a sandboxed iframe under a hash route.</p>
    <p><b>Note.</b> The single most important find for the tools overhaul. It is already the thing 05-example-inventory.md section 6 says should be assembled: a manifest with an EDITORIAL STATUS field, a REFERENCES-USED field that resolves both ways (getArtifactsForRef, 1241), search + tag filtering that scales past 100 entries with no build step, and per-example isolation by iframe. It answers the Components audit's 'three hand-maintained indexes that have drifted' directly - here there is one array and every index is derived. Adopt this schema; add lane ('glsl'|'canvas2d'|'svg'), grade and chapter fields.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/repos/mir-gallery/index.html:1065-1187 (REFERENCES x119), 1188-1219 (ARTIFACTS x21), 1241 (getArtifactsForRef), 877-880 (search + tag pills + archive), 1059 (sandboxed iframe viewer), 1386/1445/2044 (hash routing), 1220-1233 (localStorage)</code> · HTML/JS architecture · n/a - architecture
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
