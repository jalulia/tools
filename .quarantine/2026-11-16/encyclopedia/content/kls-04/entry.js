/* KLS-04 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/repos/Ki-Landscapes/index.html:230-243
   The researcher's grade (A) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'kls-04',
  index: 'KLS-04',
  title: `Travelling colour-region field with feathered boundaries and per-region band boost`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A · canonical',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/repos/Ki-Landscapes/index.html:230-243`,
    author: 'Julia Compton',
    note: `The same field decides which colour you see AND how much that colour reacts - 'biome-as-instrument: its region lifts + saturates on its band' (238). Compound causality in fourteen lines, and it happens in OKLab so the lift is perceptual.`
  },
  thumb: 'thumb.png',
  text: `<p>One low-frequency noise field over three biome slots, biased by pow(nz,1.55) toward slot 0; the boundary between slots is smoothstep-feathered; each slot's weight also gates a lift+saturate driven by its own audio band, then everything is hazed toward the horizon colour by (1-t)^2.</p>
    <p><b>Note.</b> The same field decides which colour you see AND how much that colour reacts - 'biome-as-instrument: its region lifts + saturates on its band' (238). Compound causality in fourteen lines, and it happens in OKLab so the lift is perceptual.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/repos/Ki-Landscapes/index.html:230-243</code> · Canvas2D · 06 (colour) + 11 (noise)
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
