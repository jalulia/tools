/* MIR-22 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/repos/mir-gallery/artifacts/harmonic-field.html:855-868
   The researcher's grade (A-) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'mir-22',
  index: 'MIR-22',
  title: `Blackbody colour ramp from real stellar temperature`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A- · canonical',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/repos/mir-gallery/artifacts/harmonic-field.html:855-868`,
    author: 'Julia Compton',
    note: `Colour derived from a physical cause and a real dataset rather than chosen. Pairs with MIR-21 as the two honest ways to get a palette: measure it, or tune it for the pass chain.`
  },
  thumb: 'thumb.png',
  text: `<p>Piecewise-linear Kelvin -> RGB across seven temperature bands (30000K down to 2400K), fed by the HYG catalogue's per-star temp and consumed as a per-instance colour attribute by MIR-16.</p>
    <p><b>Note.</b> Colour derived from a physical cause and a real dataset rather than chosen. Pairs with MIR-21 as the two honest ways to get a palette: measure it, or tune it for the pass chain.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/repos/mir-gallery/artifacts/harmonic-field.html:855-868</code> · JS / colour · 06 (colour)
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
