/* BOS-04 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/tools-repo/book-of-shaders/index.html:637-655
   The researcher's grade (A) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'bos-04',
  index: 'BOS-04',
  title: `Julia set escape-time fractal`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A · canonical',
  lane: 'glsl',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/tools-repo/book-of-shaders/index.html:637-655`,
    author: 'Julia Compton',
    note: `An invention, not a condensation, and a good one. The cosine palette (0.5+0.5*cos(TAU*(t+phase))) is worth teaching explicitly.`
  },
  thumb: 'thumb.png',
  text: `<p>96-iteration escape test with c walking a circle; cosine palette on the normalised iteration count.</p>
    <p><b>Note.</b> An invention, not a condensation, and a good one. The cosine palette (0.5+0.5*cos(TAU*(t+phase))) is worth teaching explicitly.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/tools-repo/book-of-shaders/index.html:637-655</code> · GLSL · 14 — which the original book leaves as 'Coming soon'
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
