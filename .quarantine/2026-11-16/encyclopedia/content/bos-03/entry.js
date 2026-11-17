/* BOS-03 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/tools-repo/book-of-shaders/index.html:563-585
   The researcher's grade (A-) and editorial_status
   (technical_reference) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'bos-03',
  index: 'BOS-03',
  title: `Cellular / Worley noise (playground implementation)`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A- · technical_reference',
  lane: 'glsl',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/tools-repo/book-of-shaders/index.html:563-585`,
    author: 'Julia Compton',
    note: `Solid. The 'Try it' text contains a broken suggestion (\`color += step(0.06, m_dist)*0.0;\` multiplies by zero and does nothing).`
  },
  thumb: 'thumb.png',
  text: `<p>3x3 neighbourhood scan against animated feature points; minimum distance colours the cell.</p>
    <p><b>Note.</b> Solid. The 'Try it' text contains a broken suggestion (\\\`color += step(0.06, m_dist)*0.0;\\\` multiplies by zero and does nothing).</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/tools-repo/book-of-shaders/index.html:563-585</code> · GLSL · 12
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
