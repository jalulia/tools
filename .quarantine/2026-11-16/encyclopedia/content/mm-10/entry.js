/* MM-10 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/artifacts/*.html (all four):iso-field:93, the-field:97, visual:268, five-ways:414
   The researcher's grade (A) and editorial_status
   (technical_reference) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'mm-10',
  index: 'MM-10',
  title: `Integer hash h2(n)`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A · technical_reference',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/artifacts/*.html (all four):iso-field:93, the-field:97, visual:268, five-ways:414`,
    author: 'Julia Compton',
    note: `Duplicated verbatim in all four artifacts. Shared-primitive candidate.`
  },
  
  text: `<p>Bit-mixed integer hash returning 0..1 — deterministic per-index randomness with no state.</p>
    <p><b>Note.</b> Duplicated verbatim in all four artifacts. Shared-primitive candidate.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/artifacts/*.html (all four):iso-field:93, the-field:97, visual:268, five-ways:414</code> · Canvas2D · 10 (random)
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
