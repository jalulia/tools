/* MMR-01 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/modemode-repo/project.html:385-401 (loadProject), 812-813 (getSlug)
   The researcher's grade (A) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'mmr-01',
  index: 'MMR-01',
  title: `Content-block schema + loadProject fallback`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A · canonical',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/modemode-repo/project.html:385-401 (loadProject), 812-813 (getSlug)`,
    author: 'Julia Compton',
    note: `Julia's own shipped data-driven pattern. The block inventory it renders (hero/text/stats/column/imagePara/image/media/cardgrid/collaborators) is documented in docs/cms-plan.md and should be reused rather than reinvented.`
  },
  thumb: 'thumb.png',
  text: `<p>Single data boundary: try the remote store, fall back to the bundled content/<slug>.json; slug comes from ?p= then #hash then a default.</p>
    <p><b>Note.</b> Julia's own shipped data-driven pattern. The block inventory it renders (hero/text/stats/column/imagePara/image/media/cardgrid/collaborators) is documented in docs/cms-plan.md and should be reused rather than reinvented.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/modemode-repo/project.html:385-401 (loadProject), 812-813 (getSlug)</code> · JS (architecture) · architecture
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
